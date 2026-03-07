"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    changeRoleForOrgMemberInDb,
    getOrganizationBySlug,
} from "@/lib/repositories/organization-repository";
import { updateOrgMemberRole } from "@/lib/repositories/org-member-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type ChangeOrgMemberRoleState = {
    success: boolean;
    message: string;
};

export async function changeOrgMemberRoleAction(
    _prevState: ChangeOrgMemberRoleState,
    formData: FormData
): Promise<ChangeOrgMemberRoleState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const targetUserId = String(formData.get("targetUserId") ?? "").trim();
    const newRole = String(formData.get("newRole") ?? "").trim() as "admin" | "hr" | "member";

    if (!organizationSlug || !targetUserId || !newRole) {
        return {
            success: false,
            message: "Missing organization or target user or new role.",
        };
    }

    if (!["admin", "hr", "member"].includes(newRole)) {
        return { success: false, message: "Invalid role." };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return {
            success: false,
            message: "Organization not found.",
        };
    }

    const actor = org.members.find((m) => m.userId === session?.user?.id);
    const target = org.members.find((m) => m.userId === targetUserId);

    if (!actor) {
        return {
            success: false,
            message: "You are not a member of this organization.",
        };
    }

    if (!target) {
        return {
            success: false,
            message: "Target member not found.",
        };
    }

    if (target.role === newRole) {
        return {
            success: false,
            message: "Target member already has the requested role.",
        };
    }

    if (!["owner", "admin"].includes(actor.role)) {
        return {
            success: false,
            message: "You are not allowed to change member roles.",
        };
    }

    // Admin cannot promote to owner-level or manage other admins
    if (actor.role === "admin" && target.role === "admin") {
        return {
            success: false,
            message: "Admins cannot change another admin's role.",
        };
    }

    if (target.role === "owner") {
        return {
            success: false,
            message: "Cannot change the owner's role. Use ownership transfer instead.",
        };
    }

    const changed = await changeRoleForOrgMemberInDb(
        org._id.toString(),
        target.userId,
        newRole
    );

    if (!changed) {
        return {
            success: false,
            message: "Member role change failed.",
        };
    }

    // Also update the rich org_members document
    await updateOrgMemberRole(org._id, target.userId, newRole, {
        fromRole: target.role,
        toRole: newRole,
        changedBy: session.user.id,
        changedByUsername: session.user.name ?? "Unknown",
        changedAt: new Date(),
    }).catch(() => {
        // Best-effort — org_members doc may not exist for legacy members
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown User",
        action: "member.role_changed",
        entityType: "member",
        entityId: target.userId,
        message: `Member role changed from ${target.role} to ${newRole}.`,
        metadata: {
            oldRole: target.role,
            newRole,
        },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);

    return {
        success: true,
        message: "Member role changed successfully.",
    };
}
