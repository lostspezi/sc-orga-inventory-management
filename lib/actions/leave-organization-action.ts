"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    getOrganizationBySlug,
    removeMemberFromOrganizationInDb,
    deleteOrganizationAndAllData,
} from "@/lib/repositories/organization-repository";
import { getDb } from "@/lib/db";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type Result = { success: boolean; message: string; orgDeleted?: boolean };

export async function leaveOrganizationAction(orgSlug: string): Promise<Result> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const userId = session.user.id;
    const org = await getOrganizationBySlug(orgSlug);

    if (!org) {
        return { success: false, message: "Organization not found." };
    }

    const self = org.members.find((m) => m.userId === userId);

    if (!self) {
        return { success: false, message: "You are not a member of this organization." };
    }

    const others = org.members.filter((m) => m.userId !== userId);

    if (self.role === "owner") {
        if (others.length === 0) {
            // Sole member — delete the entire org
            await deleteOrganizationAndAllData(org._id);
            revalidatePath("/terminal");
            revalidatePath("/terminal/settings");
            return { success: true, message: "Organization deleted.", orgDeleted: true };
        }

        // Auto-promote next most-senior member before leaving
        const nextOwner =
            others.find((m) => m.role === "admin") ?? others[0];

        const db = await getDb();
        await db.collection("organizations").updateOne(
            { _id: org._id, "members.userId": nextOwner.userId },
            { $set: { "members.$.role": "owner", updatedAt: new Date() } }
        );

        await createOrganizationAuditLog({
            organizationId: org._id,
            organizationSlug: org.slug,
            actorUserId: userId,
            actorUsername: session.user.name ?? "Unknown",
            action: "member.role_changed",
            entityType: "member",
            entityId: nextOwner.userId,
            message: `Ownership transferred to ${nextOwner.userId} because previous owner left.`,
            metadata: { previousOwnerId: userId, newOwnerId: nextOwner.userId },
        });
    }

    await removeMemberFromOrganizationInDb(org._id.toString(), userId);

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: userId,
        actorUsername: session.user.name ?? "Unknown",
        action: "member.removed",
        entityType: "member",
        entityId: userId,
        message: `Member left the organization.`,
    });

    revalidatePath("/terminal");
    revalidatePath("/terminal/settings");

    return { success: true, message: "You have left the organization." };
}
