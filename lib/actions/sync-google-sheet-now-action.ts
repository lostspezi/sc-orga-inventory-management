"use server";

import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { syncInventoryToSheet } from "@/lib/google-sheets/sync-inventory-to-sheet";

export async function syncGoogleSheetNowAction(
    orgSlug: string,
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated." };

    const org = await getOrganizationBySlug(orgSlug);
    if (!org) return { success: false, error: "Organization not found." };

    const member = org.members.find((m) => m.userId === session.user!.id);
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return { success: false, error: "Insufficient permissions." };
    }

    if (!org.googleSheetId) return { success: false, error: "No Google Sheet configured." };

    try {
        await syncInventoryToSheet(org._id, org.googleSheetId);
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[GoogleSheets] manual sync failed", message);
        return { success: false, error: message };
    }
}
