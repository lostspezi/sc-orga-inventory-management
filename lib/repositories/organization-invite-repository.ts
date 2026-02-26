import { ObjectId } from "mongodb";
import { createHash, randomBytes } from "crypto";
import { getDb } from "@/lib/db";
import type { OrganizationInviteDocument } from "@/lib/types/organization";

const COLLECTION = "organization_invites";

type CreateOrganizationInviteInput = {
    organizationId: ObjectId;
    organizationSlug: string;
    invitedByUserId: string;
    invitedByUsername?: string;
    targetRole: "admin" | "member";
    deliveryMethod: "email" | "discord_dm" | "in_app";
    email?: string;
    discordUserId?: string;
    targetUserId?: string;
    expiresAt: Date;
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
        inviteToken: hashedToken,
        email: input.email,
        discordUserId: input.discordUserId,
        targetUserId: input.targetUserId,
        status: "pending",
        expiresAt: input.expiresAt,
        createdAt: now,
        updatedAt: now,
    };

    const result = await db
        .collection<Omit<OrganizationInviteDocument, "_id">>(COLLECTION)
        .insertOne(doc);

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