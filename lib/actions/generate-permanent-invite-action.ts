"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    generateRawInviteToken,
    revokeActivePermanentInvitesByOrgId,
} from "@/lib/repositories/organization-invite-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { getDb } from "@/lib/db";
import type { OrganizationInviteDocument } from "@/lib/types/organization";

const COLLECTION = "organization_invites";

export type GeneratePermanentInviteState = {
    success: boolean;
    message: string;
};

export async function generatePermanentInviteAction(
    _prevState: GeneratePermanentInviteState,
    formData: FormData
): Promise<GeneratePermanentInviteState> {
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

    const rawToken = generateRawInviteToken();
    const hashedToken = createHash("sha256").update(rawToken).digest("hex");
    const now = new Date();

    const doc: Omit<OrganizationInviteDocument, "_id"> = {
        organizationId: org._id,
        organizationSlug: org.slug,
        invitedByUserId: session.user.id,
        invitedByUsername: session.user.name ?? undefined,
        targetRole: "member",
        deliveryMethod: "permanent_link",
        inviteToken: hashedToken,
        isPermanent: true,
        permanentRawToken: rawToken,
        status: "pending",
        expiresAt: new Date("2099-01-01"),
        createdAt: now,
        updatedAt: now,
    };

    const db = await getDb();
    await db.collection<Omit<OrganizationInviteDocument, "_id">>(COLLECTION).insertOne(doc);

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "member.permanent_invite_created",
        entityType: "organization",
        entityId: org._id.toString(),
        message: "Permanent invite link generated.",
    });

    revalidatePath(`/terminal/orgs/${organizationSlug}/settings`);

    return { success: true, message: "Permanent invite link generated." };
}
