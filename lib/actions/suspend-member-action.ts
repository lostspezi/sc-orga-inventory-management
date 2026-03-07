"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug, updateMemberStatusInOrg } from "@/lib/repositories/organization-repository";
import { updateOrgMemberStatus } from "@/lib/repositories/org-member-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type State = { success: boolean; message: string };

export async function suspendMemberAction(
    _prev: State,
    formData: FormData
): Promise<State> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const targetUserId = String(formData.get("targetUserId") ?? "").trim();

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin"].includes(actor.role)) {
        return { success: false, message: "Not authorized." };
    }

    const target = org.members.find((m) => m.userId === targetUserId);
    if (!target) return { success: false, message: "Target member not found." };

    if (target.userId === session.user.id) {
        return { success: false, message: "You cannot suspend yourself." };
    }

    if (target.role === "owner") {
        return { success: false, message: "Cannot suspend the organization owner." };
    }

    await updateOrgMemberStatus(org._id, targetUserId, "suspended");
    await updateMemberStatusInOrg(org._id.toString(), targetUserId, "suspended");

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "member.suspended",
        entityType: "member",
        entityId: targetUserId,
        message: "Member suspended.",
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);
    return { success: true, message: "Member suspended." };
}
