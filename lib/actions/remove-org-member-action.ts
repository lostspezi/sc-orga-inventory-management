"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    getOrganizationBySlug,
    removeMemberFromOrganizationInDb,
} from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type RemoveOrgMemberState = {
    success: boolean;
    message: string;
};

export async function removeOrgMemberAction(
    _prevState: RemoveOrgMemberState,
    formData: FormData
): Promise<RemoveOrgMemberState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const targetUserId = String(formData.get("targetUserId") ?? "").trim();

    if (!organizationSlug || !targetUserId) {
        return {
            success: false,
            message: "Missing organization or target user.",
        };
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

    if (!["owner", "admin"].includes(actor.role)) {
        return {
            success: false,
            message: "You are not allowed to remove members.",
        };
    }

    if (target.role === "owner" && actor.role !== "owner") {
        return {
            success: false,
            message: "Only the owner can remove another owner.",
        };
    }

    if (target.userId === session.user.id) {
        return {
            success: false,
            message: "You cannot remove yourself.",
        };
    }

    const removed = await removeMemberFromOrganizationInDb(
        org._id.toString(),
        target.userId
    );

    if (!removed) {
        return {
            success: false,
            message: "Member could not be removed.",
        };
    }

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown User",
        action: "member.removed",
        entityType: "member",
        entityId: target.userId,
        message: `Member removed from organization.`,
        metadata: {
            removedUserId: target.userId,
            removedRole: target.role,
        },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);

    return {
        success: true,
        message: "Member removed successfully.",
    };
}