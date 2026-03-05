"use server";

import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { createImportJob } from "@/lib/repositories/import-job-repository";
import { processImportJob } from "@/lib/inventory-import/process-import-job";
import { readInventoryFromSheet } from "@/lib/google-sheets/read-inventory-from-sheet";
import { syncInventoryToSheet } from "@/lib/google-sheets/sync-inventory-to-sheet";
import { isProOrg } from "@/lib/billing/is-pro";

export type ImportFromSheetState = {
    success: boolean;
    jobId?: string;    // set → redirect to import results
    pushed?: boolean;  // set → org was pushed to sheet (sheet was empty)
    error?: string;
};

export async function importFromGoogleSheetAction(
    orgSlug: string,
): Promise<ImportFromSheetState> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated." };

    const org = await getOrganizationBySlug(orgSlug);
    if (!org) return { success: false, error: "Organization not found." };

    const member = org.members.find((m) => m.userId === session.user!.id);
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return { success: false, error: "Insufficient permissions." };
    }

    if (!isProOrg(org)) {
        return { success: false, error: "PRO_REQUIRED" };
    }

    if (!org.googleSheetId) return { success: false, error: "No Google Sheet configured." };

    let rows;
    try {
        rows = await readInventoryFromSheet(org.googleSheetId);
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        return { success: false, error: message };
    }

    // Sheet is empty → push org inventory to sheet (org is source of truth)
    if (rows.length === 0) {
        try {
            await syncInventoryToSheet(org._id, org.googleSheetId);
            return { success: true, pushed: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            return { success: false, error: message };
        }
    }

    if (rows.length > 500) {
        return { success: false, error: "Sheet has more than 500 rows — reduce it and try again." };
    }

    // Sheet has rows → import them into org, then push final state back to sheet
    const job = await createImportJob({
        organizationId: org._id,
        organizationSlug: org.slug,
        initiatedByUserId: session.user.id,
        initiatedByUsername: session.user.name ?? "Unknown",
        rows,
    });

    processImportJob(
        job._id,
        rows,
        org,
        session.user.id,
        session.user.name ?? "Unknown"
    ).catch((err) => {
        console.error("[import-from-sheet] Background job failed", err);
    });

    return { success: true, jobId: job._id.toString() };
}
