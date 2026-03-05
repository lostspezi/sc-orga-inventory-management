"use server";

import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    setOrgGoogleSheetId,
    clearOrgGoogleSheetId,
} from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { revalidatePath } from "next/cache";

function extractSheetId(input: string): string {
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : input.trim();
}

export async function saveGoogleSheetAction(
    orgSlug: string,
    _prevState: { success: boolean; error?: string } | null,
    formData: FormData
): Promise<{ success: boolean; error?: string }> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, error: "Not authenticated." };

    const org = await getOrganizationBySlug(orgSlug);
    if (!org) return { success: false, error: "Organization not found." };

    const member = org.members.find((m) => m.userId === session.user!.id);
    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return { success: false, error: "Insufficient permissions." };
    }

    const raw = (formData.get("sheetUrl") as string | null)?.trim() ?? "";

    if (!raw) {
        // Clear
        await clearOrgGoogleSheetId(org._id);
        await createOrganizationAuditLog({
            organizationId: org._id,
            organizationSlug: org.slug,
            actorUserId: session.user.id,
            actorUsername: session.user.name ?? "Unknown",
            action: "integration.google_sheet_disconnected",
            entityType: "organization",
            entityId: org._id.toString(),
            message: "Google Sheet disconnected.",
        });
        revalidatePath(`/terminal/orgs/${orgSlug}/settings`);
        return { success: true };
    }

    const sheetId = extractSheetId(raw);
    if (!sheetId) return { success: false, error: "Invalid Google Sheet URL or ID." };

    await setOrgGoogleSheetId(org._id, sheetId);
    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "integration.google_sheet_connected",
        entityType: "organization",
        entityId: org._id.toString(),
        message: "Google Sheet connected.",
        metadata: { sheetId },
    });

    revalidatePath(`/terminal/orgs/${orgSlug}/settings`);

    return { success: true };
}
