"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { revokeActivePermanentInvitesByOrgId } from "@/lib/repositories/organization-invite-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

export type RevokePermanentInviteState = {
    success: boolean;
    message: string;
};

export async function revokePermanentInviteAction(
    _prevState: RevokePermanentInviteState,
    formData: FormData
): Promise<RevokePermanentInviteState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();

    if (!organizationSlug) {
        return { success: false, message: "Missing organization." };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return { success: false, message: "Organization not found." };
    }

    const member = org.members.find((m) => m.userId === session.user!.id);

    if (!member || (member.role !== "owner" && member.role !== "admin")) {
        return { success: false, message: "Only admins and owners can manage invite links." };
    }

    await revokeActivePermanentInvitesByOrgId(org._id);

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "member.permanent_invite_revoked",
        entityType: "organization",
        entityId: org._id.toString(),
        message: "Permanent invite link revoked.",
    });

    revalidatePath(`/terminal/orgs/${organizationSlug}/settings`);

    return { success: true, message: "Permanent invite link revoked." };
}
