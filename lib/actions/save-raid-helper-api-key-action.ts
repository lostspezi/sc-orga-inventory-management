"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug, setOrganizationRaidHelperApiKey } from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

export type SaveRaidHelperApiKeyState = {
    success: boolean;
    message: string;
};

export async function saveRaidHelperApiKeyAction(
    _prevState: SaveRaidHelperApiKeyState,
    formData: FormData
): Promise<SaveRaidHelperApiKeyState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const apiKey = String(formData.get("apiKey") ?? "").trim() || null;

    if (!organizationSlug) {
        return { success: false, message: "Missing organization." };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return { success: false, message: "Organization not found." };
    }

    const member = org.members.find((m) => m.userId === session.user!.id);

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return { success: false, message: "Only admins and owners can manage integrations." };
    }

    await setOrganizationRaidHelperApiKey(organizationSlug, apiKey);

    const action = apiKey ? "integration.raidhelper_connected" : "integration.raidhelper_disconnected";
    const message = apiKey ? "Raid Helper API key configured." : "Raid Helper API key removed.";

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action,
        entityType: "organization",
        entityId: org._id.toString(),
        message,
    });

    revalidatePath(`/terminal/orgs/${organizationSlug}/settings`);

    return { success: true, message };
}
