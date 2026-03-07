"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { OrganizationInviteDocument } from "@/lib/types/organization";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type State = { success: boolean; message: string };

export async function revokeOrgInviteAction(
    _prev: State,
    formData: FormData
): Promise<State> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const inviteId = String(formData.get("inviteId") ?? "").trim();

    if (!inviteId || !ObjectId.isValid(inviteId)) {
        return { success: false, message: "Invalid invite ID." };
    }

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin"].includes(actor.role)) {
        return { success: false, message: "Not authorized." };
    }

    const db = await getDb();
    const result = await db
        .collection<OrganizationInviteDocument>("organization_invites")
        .updateOne(
            {
                _id: new ObjectId(inviteId),
                organizationId: org._id,
                status: "pending",
            },
            { $set: { status: "revoked", updatedAt: new Date() } }
        );

    if (result.modifiedCount === 0) {
        return { success: false, message: "Invite not found or already closed." };
    }

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "member.permanent_invite_revoked",
        entityType: "member",
        entityId: inviteId,
        message: "Invite revoked.",
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);
    return { success: true, message: "Invite revoked." };
}
