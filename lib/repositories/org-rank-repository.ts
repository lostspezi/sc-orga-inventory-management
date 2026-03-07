import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { OrgRankDocument, OrgRankView } from "@/lib/types/org-rank";
import { countMembersWithRank } from "@/lib/repositories/org-member-repository";

const COLLECTION = "organization_ranks";

type CreateOrgRankInput = {
    organizationId: ObjectId;
    organizationSlug: string;
    name: string;
    description?: string;
    order: number;
    color?: string;
    isDefault?: boolean;
    createdBy: string;
};

export async function createOrgRank(input: CreateOrgRankInput): Promise<OrgRankDocument> {
    const db = await getDb();
    const now = new Date();

    if (input.isDefault) {
        // Clear other defaults
        await db
            .collection<OrgRankDocument>(COLLECTION)
            .updateMany(
                { organizationId: input.organizationId, isDefault: true },
                { $set: { isDefault: false, updatedAt: now } }
            );
    }

    const doc: Omit<OrgRankDocument, "_id"> = {
        organizationId: input.organizationId,
        organizationSlug: input.organizationSlug,
        name: input.name,
        description: input.description,
        order: input.order,
        color: input.color,
        isDefault: input.isDefault ?? false,
        createdBy: input.createdBy,
        createdAt: now,
        updatedAt: now,
    };

    const result = await db
        .collection<Omit<OrgRankDocument, "_id">>(COLLECTION)
        .insertOne(doc);

    return { _id: result.insertedId, ...doc } as OrgRankDocument;
}

export async function getOrgRanksByOrganizationId(
    organizationId: ObjectId
): Promise<OrgRankDocument[]> {
    const db = await getDb();
    return db
        .collection<OrgRankDocument>(COLLECTION)
        .find({ organizationId })
        .sort({ order: 1 })
        .toArray();
}

export async function getOrgRankById(rankId: string): Promise<OrgRankDocument | null> {
    if (!ObjectId.isValid(rankId)) return null;
    const db = await getDb();
    return db
        .collection<OrgRankDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(rankId) });
}

export async function getDefaultOrgRank(
    organizationId: ObjectId
): Promise<OrgRankDocument | null> {
    const db = await getDb();
    return db
        .collection<OrgRankDocument>(COLLECTION)
        .findOne({ organizationId, isDefault: true });
}

export async function updateOrgRank(
    rankId: string,
    updates: Partial<Pick<OrgRankDocument, "name" | "description" | "order" | "color" | "isDefault">>,
    organizationId: ObjectId
): Promise<boolean> {
    if (!ObjectId.isValid(rankId)) return false;
    const db = await getDb();
    const now = new Date();

    if (updates.isDefault) {
        // Clear other defaults in same org
        await db
            .collection<OrgRankDocument>(COLLECTION)
            .updateMany(
                { organizationId, isDefault: true, _id: { $ne: new ObjectId(rankId) } },
                { $set: { isDefault: false, updatedAt: now } }
            );
    }

    const result = await db.collection<OrgRankDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(rankId) },
        { $set: { ...updates, updatedAt: now } }
    );

    return result.modifiedCount > 0;
}

export async function deleteOrgRank(
    rankId: string,
    organizationId: ObjectId
): Promise<{ success: boolean; memberCount?: number }> {
    if (!ObjectId.isValid(rankId)) return { success: false };

    const memberCount = await countMembersWithRank(organizationId, rankId);
    if (memberCount > 0) {
        return { success: false, memberCount };
    }

    const db = await getDb();
    const result = await db
        .collection<OrgRankDocument>(COLLECTION)
        .deleteOne({ _id: new ObjectId(rankId), organizationId });

    return { success: result.deletedCount > 0 };
}

export async function setDefaultRank(
    organizationId: ObjectId,
    rankId: string
): Promise<boolean> {
    if (!ObjectId.isValid(rankId)) return false;
    const db = await getDb();
    const now = new Date();

    await db
        .collection<OrgRankDocument>(COLLECTION)
        .updateMany(
            { organizationId, isDefault: true },
            { $set: { isDefault: false, updatedAt: now } }
        );

    const result = await db.collection<OrgRankDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(rankId), organizationId },
        { $set: { isDefault: true, updatedAt: now } }
    );

    return result.modifiedCount > 0;
}

export async function bulkUpdateRankOrder(
    updates: { rankId: string; order: number }[]
): Promise<void> {
    if (updates.length === 0) return;
    const db = await getDb();
    const now = new Date();
    await db.collection<OrgRankDocument>(COLLECTION).bulkWrite(
        updates.map(({ rankId, order }) => ({
            updateOne: {
                filter: { _id: new ObjectId(rankId) },
                update: { $set: { order, updatedAt: now } },
            },
        }))
    );
}

export function toOrgRankView(doc: OrgRankDocument): OrgRankView {
    return {
        _id: doc._id.toString(),
        organizationId: doc.organizationId.toString(),
        name: doc.name,
        description: doc.description,
        order: doc.order,
        color: doc.color,
        isDefault: doc.isDefault,
        createdBy: doc.createdBy,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}
