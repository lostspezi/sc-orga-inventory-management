import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type {
    OrganizationDocument,
    OrganizationMember,
    OrganizationMemberView,
    OrganizationView
} from "@/lib/types/organization";
import {createOrganizationAuditLog} from "@/lib/repositories/organization-audit-log-repository";
import {auth} from "@/auth";

type UserDocument = {
    _id: ObjectId;
    name?: string | null;
    email?: string | null;
    image?: string | null;
};

const COLLECTION = "organizations";

type CreateOrganizationInput = {
    name: string;
    slug: string;
    starCitizenOrganizationUrl: string;
    createdByUserId: string;
};

export async function createOrganizationInDb(
    input: CreateOrganizationInput
): Promise<ObjectId> {
    const db = await getDb();
    const now = new Date();

    const ownerMember: OrganizationMember = {
        userId: input.createdByUserId,
        role: "owner",
        joinedAt: now,
    };

    const doc: Omit<OrganizationDocument, "_id"> = {
        name: input.name,
        slug: input.slug,
        starCitizenOrganizationUrl: input.starCitizenOrganizationUrl,
        createdByUserId: input.createdByUserId,
        members: [ownerMember],
        createdAt: now,
        updatedAt: now,
    };

    const result = await db.collection<Omit<OrganizationDocument, "_id">>(COLLECTION).insertOne(doc);

    const session = await auth();

    await createOrganizationAuditLog({
        organizationId: result.insertedId,
        organizationSlug: input.slug,
        actorUserId: input.createdByUserId,
        actorUsername: session?.user?.name ?? "Unknown User",
        action: "organization.created",
        entityType: "organization",
        entityId: result.insertedId.toString(),
        message: "Organization created.",
        metadata: {
            name: input.name,
            slug: input.slug,
        },
    });

    return result.insertedId;
}

export async function getOrganizationViewsByUserId(
    userId: string
): Promise<OrganizationView[]> {
    const db = await getDb();

    const orgs = await db
        .collection<OrganizationDocument>(COLLECTION)
        .find({ "members.userId": userId })
        .sort({ createdAt: -1 })
        .toArray();

    return Promise.all(orgs.map((org) => mapOrganizationToView(db, org)));
}

export async function getOrganizationById(id: string): Promise<OrganizationDocument | null> {
    if (!ObjectId.isValid(id)) return null;

    const db = await getDb();

    return db
        .collection<OrganizationDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(id) });
}

export async function getOrganizationBySlug(slug: string): Promise<OrganizationDocument | null> {
    const db = await getDb();

    return db
        .collection<OrganizationDocument>(COLLECTION)
        .findOne({ slug });
}

export async function getOrganizationViewBySlug(
    slug: string
): Promise<OrganizationView | null> {
    const db = await getDb();

    const org = await db
        .collection<OrganizationDocument>(COLLECTION)
        .findOne({ slug });

    if (!org) {
        return null;
    }

    return mapOrganizationToView(db, org);
}

export async function updateOrganizationInDb(
    id: string,
    updates: Partial<Pick<OrganizationDocument, "name" | "slug" | "starCitizenOrganizationUrl">>
): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;

    const db = await getDb();

    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                ...updates,
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

export async function deleteOrganizationInDb(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;

    const db = await getDb();

    const result = await db
        .collection<OrganizationDocument>(COLLECTION)
        .deleteOne({ _id: new ObjectId(id) });

    return result.deletedCount > 0;
}

export async function addMemberToOrganizationInDb(
    organizationId: string,
    member: OrganizationMember
): Promise<boolean> {
    if (!ObjectId.isValid(organizationId)) return false;

    const db = await getDb();

    // Verhindert doppelte Members mit gleicher userId nicht vollständig bei Objektvergleich,
    // darum besser über Filter sicherstellen:
    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        {
            _id: new ObjectId(organizationId),
            "members.userId": { $ne: member.userId },
        },
        {
            $push: { members: member },
            $set: { updatedAt: new Date() },
        }
    );

    return result.modifiedCount > 0;
}

export async function setOrganizationDiscordGuildId(
    slug: string,
    discordGuildId: string
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { slug },
        {
            $set: {
                discordGuildId,
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

async function mapOrganizationToView(
    db: Awaited<ReturnType<typeof getDb>>,
    org: OrganizationDocument
): Promise<OrganizationView> {
    const allUserIds = Array.from(
        new Set([
            org.createdByUserId,
            ...org.members.map((m) => m.userId),
        ])
    );

    const objectIds = allUserIds
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

    const users = objectIds.length
        ? await db
            .collection<UserDocument>("users")
            .find({ _id: { $in: objectIds } })
            .project({ _id: 1, name: 1 })
            .toArray()
        : [];

    const usernameByUserId = new Map(
        users.map((u) => [u._id.toString(), u.name ?? undefined])
    );

    return {
        _id: org._id,
        name: org.name,
        slug: org.slug,
        starCitizenOrganizationUrl: org.starCitizenOrganizationUrl,
        createdByUsername: usernameByUserId.get(org.createdByUserId),
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        members: org.members.map<OrganizationMemberView>((m): OrganizationMemberView => ({
            userId: m.userId,
            username: usernameByUserId.get(m.userId),
            role: m.role,
            joinedAt: m.joinedAt,
        })),
    };
}