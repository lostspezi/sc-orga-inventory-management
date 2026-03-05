import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { ExportJobDocument } from "@/lib/types/export-job";

const COLLECTION = "organization_export_jobs";

export async function createExportJob(input: {
    organizationId: ObjectId;
    organizationSlug: string;
    initiatedByUserId: string;
    initiatedByUsername: string;
}): Promise<ExportJobDocument> {
    const db = await getDb();
    const now = new Date();

    const doc: Omit<ExportJobDocument, "_id"> = {
        organizationId: input.organizationId,
        organizationSlug: input.organizationSlug,
        initiatedByUserId: input.initiatedByUserId,
        initiatedByUsername: input.initiatedByUsername,
        status: "pending",
        createdAt: now,
    };

    const result = await db
        .collection<Omit<ExportJobDocument, "_id">>(COLLECTION)
        .insertOne(doc);

    return { _id: result.insertedId, ...doc };
}

export async function getExportJobById(id: string): Promise<ExportJobDocument | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await getDb();
    return db
        .collection<ExportJobDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(id) });
}

export async function completeExportJob(
    id: ObjectId,
    itemCount: number,
    csvContent: string
): Promise<void> {
    const db = await getDb();
    await db.collection<ExportJobDocument>(COLLECTION).updateOne(
        { _id: id },
        {
            $set: {
                status: "completed",
                itemCount,
                csvContent,
                completedAt: new Date(),
            },
        }
    );
}

export async function failExportJob(id: ObjectId): Promise<void> {
    const db = await getDb();
    await db.collection<ExportJobDocument>(COLLECTION).updateOne(
        { _id: id },
        { $set: { status: "failed", completedAt: new Date() } }
    );
}
