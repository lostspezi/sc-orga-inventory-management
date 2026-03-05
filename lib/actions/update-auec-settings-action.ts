"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug, updateOrgAuecSettings } from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

export type UpdateAuecSettingsState = {
    success: boolean;
    message: string;
};

export async function updateAuecSettingsAction(
    _prevState: UpdateAuecSettingsState,
    formData: FormData
): Promise<UpdateAuecSettingsState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const auecBalanceRaw = formData.get("auecBalance");

    if (!organizationSlug) {
        return { success: false, message: "Missing organization." };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return { success: false, message: "Organization not found." };
    }

    const member = org.members.find((m) => m.userId === session.user!.id);

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return { success: false, message: "Only admins and owners can update aUEC settings." };
    }

    const patch: { auecBalance?: number } = {};

    if (auecBalanceRaw !== null && auecBalanceRaw !== "") {
        const val = Number(auecBalanceRaw);
        if (!Number.isFinite(val) || val < 0) {
            return { success: false, message: "Invalid aUEC balance." };
        }
        patch.auecBalance = Math.round(val);
    }

    await updateOrgAuecSettings(org._id, patch);

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
        action: "auec.settings_updated",
        entityType: "organization",
        entityId: org._id.toString(),
        message: "aUEC cash desk settings updated.",
        metadata: patch,
    });

    revalidatePath(`/terminal/orgs/${organizationSlug}/inventory`);

    return { success: true, message: "aUEC settings saved." };
}
