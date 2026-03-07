import { ObjectId } from "mongodb";
import { createHash, randomBytes } from "crypto";
import { getDb } from "@/lib/db";
import type { OrganizationInviteDocument } from "@/lib/types/organization";
import {createOrganizationAuditLog} from "@/lib/repositories/organization-audit-log-repository";

const COLLECTION = "organization_invites";

type CreateOrganizationInviteInput = {
    organizationId: ObjectId;
    organizationSlug: string;
    invitedByUserId: string;
    invitedByUsername?: string;
    targetRole: "admin" | "hr" | "member";
    deliveryMethod: "email" | "discord_dm" | "in_app";
    email?: string;
    token?: string;
    discordUserId?: string;
    targetUserId?: string;
    status?: "pending" | "accepted" | "declined" | "expired";
    expiresAt: Date;
    maxUses?: number;
};

function hashInviteToken(rawToken: string) {
    return createHash("sha256").update(rawToken).digest("hex");
}

export function generateRawInviteToken() {
    return randomBytes(32).toString("hex");
}

export async function createOrganizationInvite(
    input: CreateOrganizationInviteInput
): Promise<{ inviteId: ObjectId; rawToken: string }> {
    const db = await getDb();
    const now = new Date();

    const rawToken = generateRawInviteToken();
    const hashedToken = hashInviteToken(rawToken);

    const doc: Omit<OrganizationInviteDocument, "_id"> = {
        organizationId: input.organizationId,
        organizationSlug: input.organizationSlug,
        invitedByUserId: input.invitedByUserId,
        invitedByUsername: input.invitedByUsername,
        targetRole: input.targetRole,
        deliveryMethod: input.deliveryMethod,
        inviteToken: input.token ?? hashedToken,
        email: input.email,
        discordUserId: input.discordUserId,
        targetUserId: input.targetUserId,
        status: input.status ?? "pending",
        expiresAt: input.expiresAt,
        maxUses: input.maxUses,
        useCount: 0,
        createdAt: now,
        updatedAt: now,
    };

    const result = await db
        .collection<Omit<OrganizationInviteDocument, "_id">>(COLLECTION)
        .insertOne(doc);

    await createOrganizationAuditLog({
        organizationId: input.organizationId,
        organizationSlug: input.organizationSlug,
        actorUserId: input.invitedByUserId,
        actorUsername: input.invitedByUsername ?? "Unknown User",
        action: "member.invited_discord",
        entityType: "member",
        entityId: result.insertedId.toString(),
        message: "Member invited to Organization via Discord DM.",
        metadata: {
            discordUserId: input.discordUserId,
            targetUserId: input.targetUserId,
        },
    });

    return {
        inviteId: result.insertedId,
        rawToken,
    };
}

export async function getOrganizationInviteByRawToken(
    rawToken: string
): Promise<OrganizationInviteDocument | null> {
    const db = await getDb();
    const hashedToken = hashInviteToken(rawToken);

    return db
        .collection<OrganizationInviteDocument>(COLLECTION)
        .findOne({ inviteToken: hashedToken });
}

export async function markOrganizationInviteAccepted(
    inviteId: ObjectId
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection<OrganizationInviteDocument>(COLLECTION).updateOne(
        { _id: inviteId, status: "pending" },
        {
            $set: {
                status: "accepted",
                acceptedAt: new Date(),
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

export async function markOrganizationInviteDeclined(
    inviteId: ObjectId
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection<OrganizationInviteDocument>(COLLECTION).updateOne(
        { _id: inviteId, status: "pending" },
        {
            $set: {
                status: "declined",
                declinedAt: new Date(),
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

export async function getPendingOrganizationInvitesByOrganizationId(
    organizationId: ObjectId
): Promise<OrganizationInviteDocument[]> {
    const db = await getDb();

    return db
        .collection<OrganizationInviteDocument>(COLLECTION)
        .find({
            organizationId,
            status: "pending",
            expiresAt: { $gt: new Date() },
        })
        .sort({ createdAt: -1 })
        .toArray();
}

export async function expireOrganizationInvite(
    inviteId: ObjectId
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection<OrganizationInviteDocument>(COLLECTION).updateOne(
        { _id: inviteId, status: "pending" },
        {
            $set: {
                status: "expired",
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

export async function getActivePermanentInviteByOrgId(
    orgId: ObjectId
): Promise<OrganizationInviteDocument | null> {
    const db = await getDb();

    return db.collection<OrganizationInviteDocument>(COLLECTION).findOne({
        organizationId: orgId,
        isPermanent: true,
        status: "pending",
    });
}

export async function revokeActivePermanentInvitesByOrgId(
    orgId: ObjectId
): Promise<void> {
    const db = await getDb();

    await db.collection<OrganizationInviteDocument>(COLLECTION).updateMany(
        { organizationId: orgId, isPermanent: true, status: "pending" },
        { $set: { status: "revoked", updatedAt: new Date() } }
    );
}

export async function incrementInviteUseCount(inviteId: ObjectId): Promise<void> {
    const db = await getDb();
    await db.collection<OrganizationInviteDocument>("organization_invites").updateOne(
        { _id: inviteId },
        { $inc: { useCount: 1 }, $set: { updatedAt: new Date() } }
    );
}

export async function hasPendingDiscordInviteForOrganization(
    organizationId: ObjectId,
    discordUserId: string
): Promise<boolean> {
    const db = await getDb();

    const existing = await db.collection<OrganizationInviteDocument>(COLLECTION).findOne({
        organizationId,
        discordUserId,
        deliveryMethod: "discord_dm",
        status: "pending",
        expiresAt: { $gt: new Date() },
    });

    return Boolean(existing);
}