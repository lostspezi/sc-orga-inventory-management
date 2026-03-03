import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import {
    ImportJobDocument,
    ImportJobView,
    ImportRowInput,
    ImportRowResult,
} from "@/lib/types/import-job";

const COLLECTION = "organization_import_jobs";

export function toImportJobView(doc: ImportJobDocument): ImportJobView {
    return {
        id: doc._id.toString(),
        organizationSlug: doc.organizationSlug,
        initiatedByUsername: doc.initiatedByUsername,
        status: doc.status,
        totalRows: doc.totalRows,
        processedRows: doc.processedRows,
        rows: doc.rows,
        results: doc.results,
        createdAt: doc.createdAt.toISOString(),
        completedAt: doc.completedAt?.toISOString(),
    };
}

export async function createImportJob(input: {
    organizationId: ObjectId;
    organizationSlug: string;
    initiatedByUserId: string;
    initiatedByUsername: string;
    rows: ImportRowInput[];
}): Promise<ImportJobDocument> {
    const db = await getDb();
    const now = new Date();

    const doc: Omit<ImportJobDocument, "_id"> = {
        organizationId: input.organizationId,
        organizationSlug: input.organizationSlug,
        initiatedByUserId: input.initiatedByUserId,
        initiatedByUsername: input.initiatedByUsername,
        status: "pending",
        totalRows: input.rows.length,
        processedRows: 0,
        rows: input.rows,
        results: [],
        createdAt: now,
    };

    const result = await db
        .collection<Omit<ImportJobDocument, "_id">>(COLLECTION)
        .insertOne(doc);

    return { _id: result.insertedId, ...doc };
}

export async function getImportJobById(id: string): Promise<ImportJobDocument | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await getDb();
    return db
        .collection<ImportJobDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(id) });
}

export async function updateImportJobProgress(
    id: ObjectId,
    processedRows: number,
    results: ImportRowResult[]
): Promise<void> {
    const db = await getDb();
    await db.collection<ImportJobDocument>(COLLECTION).updateOne(
        { _id: id },
        { $set: { status: "processing", processedRows, results } }
    );
}

export async function completeImportJob(
    id: ObjectId,
    results: ImportRowResult[]
): Promise<void> {
    const db = await getDb();
    await db.collection<ImportJobDocument>(COLLECTION).updateOne(
        { _id: id },
        {
            $set: {
                status: "completed",
                processedRows: results.length,
                results,
                completedAt: new Date(),
            },
        }
    );
}

export async function failImportJob(id: ObjectId): Promise<void> {
    const db = await getDb();
    await db.collection<ImportJobDocument>(COLLECTION).updateOne(
        { _id: id },
        { $set: { status: "failed", completedAt: new Date() } }
    );
}

export async function getImportJobsByOrg(
    organizationId: ObjectId,
    limit = 20
): Promise<ImportJobDocument[]> {
    const db = await getDb();
    return db
        .collection<ImportJobDocument>(COLLECTION)
        .find({ organizationId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}
