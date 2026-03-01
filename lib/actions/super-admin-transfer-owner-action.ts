"use server";

import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    getOrganizationBySlug,
    transferOrganizationOwnership,
} from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { isSuperAdmin } from "@/lib/is-super-admin";

type Result = { success: boolean; message: string };

export async function superAdminTransferOwnerAction(
    orgSlug: string,
    targetUserId: string
): Promise<Result> {
    const session = await auth();

    if (!session?.user?.id || !(await isSuperAdmin(session.user.id))) {
        notFound();
    }

    if (!orgSlug || !targetUserId) {
        return { success: false, message: "Missing required fields." };
    }

    const org = await getOrganizationBySlug(orgSlug);

    if (!org) {
        return { success: false, message: "Organization not found." };
    }

    const target = org.members.find((m) => m.userId === targetUserId);

    if (!target) {
        return { success: false, message: "Target user is not a member of this organization." };
    }

    if (target.role === "owner") {
        return { success: false, message: "Target user is already the owner." };
    }

    const currentOwner = org.members.find((m) => m.role === "owner");

    const transferred = await transferOrganizationOwnership(org._id.toString(), targetUserId);

    if (!transferred) {
        return { success: false, message: "Transfer failed. Database did not update." };
    }

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Super Admin",
        action: "member.role_changed",
        entityType: "member",
        entityId: targetUserId,
        message: `Ownership transferred from ${currentOwner?.userId ?? "unknown"} to ${targetUserId} by super-admin.`,
        metadata: {
            previousOwnerId: currentOwner?.userId,
            newOwnerId: targetUserId,
            source: "super_admin",
        },
    });

    revalidatePath("/terminal/admin");

    return { success: true, message: "Ownership transferred successfully." };
}
