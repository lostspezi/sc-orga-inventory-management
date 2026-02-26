import { ObjectId, Filter } from "mongodb";
import { getDb } from "@/lib/db";
import type { OrganizationAuditLogDocument } from "@/lib/types/organization";

const COLLECTION = "organization_audit_logs";

type CreateOrganizationAuditLogInput = Omit<OrganizationAuditLogDocument, "_id" | "createdAt">;

export async function createOrganizationAuditLog(
    input: CreateOrganizationAuditLogInput
): Promise<ObjectId> {
    const db = await getDb();

    const doc: Omit<OrganizationAuditLogDocument, "_id"> = {
        ...input,
        createdAt: new Date(),
    };

    const result = await db
        .collection<Omit<OrganizationAuditLogDocument, "_id">>(COLLECTION)
        .insertOne(doc);

    return result.insertedId;
}

export async function getOrganizationAuditLogs(
    organizationId: string,
    limit = 50
): Promise<OrganizationAuditLogDocument[]> {
    if (!ObjectId.isValid(organizationId)) return [];

    const db = await getDb();

    return db
        .collection<OrganizationAuditLogDocument>(COLLECTION)
        .find({ organizationId: new ObjectId(organizationId) })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

export async function getOrganizationAuditLogsByOrganizationId(
    organizationId: string,
    search?: string,
    limit = 100
): Promise<OrganizationAuditLogDocument[]> {
    if (!ObjectId.isValid(organizationId)) return [];

    const db = await getDb();
    const orgObjectId = new ObjectId(organizationId);

    const filter: Filter<OrganizationAuditLogDocument> = {
        organizationId: orgObjectId,
    };

    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
        const regex = new RegExp(escapeRegex(trimmedSearch), "i");

        filter.$or = [
            { message: regex },
            { action: regex },
            { actorUsername: regex },
            { actorUserId: regex },
            { entityType: regex },
            { entityId: regex },
        ];
    }

    return db
        .collection<OrganizationAuditLogDocument>(COLLECTION)
        .find(filter)
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

function escapeRegex(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}