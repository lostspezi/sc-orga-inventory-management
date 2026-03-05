import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { OrgReportDocument, OrgReportView, KpiSnapshot, ReportStatus } from "@/lib/types/report";

const COLLECTION = "organization_reports";

function toView(doc: OrgReportDocument): OrgReportView {
    return {
        reportId: doc._id.toString(),
        organizationId: doc.organizationId.toString(),
        weekStart: doc.weekStart.toISOString(),
        weekEnd: doc.weekEnd.toISOString(),
        weekLabel: doc.weekLabel,
        timezone: doc.timezone,
        status: doc.status,
        version: doc.version,
        createdAt: doc.createdAt.toISOString(),
        createdBy: doc.createdBy,
        generatedAt: doc.generatedAt?.toISOString() ?? null,
        fileSize: doc.fileSize,
        kpiSnapshot: doc.kpiSnapshot,
        errorMessage: doc.errorMessage,
        retryCount: doc.retryCount,
    };
}

export async function createReportDoc(input: {
    organizationId: ObjectId;
    organizationSlug: string;
    weekStart: Date;
    weekEnd: Date;
    weekLabel: string;
    timezone: string;
    createdBy: string;
}): Promise<string> {
    const db = await getDb();
    const doc: Omit<OrgReportDocument, "_id"> = {
        ...input,
        status: "pending",
        version: 1,
        createdAt: new Date(),
        generatedAt: null,
        fileId: null,
        fileSize: null,
        checksum: null,
        kpiSnapshot: null,
        errorMessage: null,
        retryCount: 0,
    };
    const result = await db
        .collection<Omit<OrgReportDocument, "_id">>(COLLECTION)
        .insertOne(doc);
    return result.insertedId.toString();
}

export async function getReportById(reportId: string): Promise<OrgReportDocument | null> {
    if (!ObjectId.isValid(reportId)) return null;
    const db = await getDb();
    return db
        .collection<OrgReportDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(reportId) });
}

export async function getReportByWeekLabel(
    organizationId: ObjectId,
    weekLabel: string
): Promise<OrgReportDocument | null> {
    const db = await getDb();
    return db
        .collection<OrgReportDocument>(COLLECTION)
        .findOne({ organizationId, weekLabel });
}

export async function getReportsByOrg(
    organizationId: ObjectId,
    page = 1,
    limit = 20
): Promise<{ reports: OrgReportView[]; total: number }> {
    const db = await getDb();
    const col = db.collection<OrgReportDocument>(COLLECTION);
    const filter = { organizationId };
    const [docs, total] = await Promise.all([
        col
            .find(filter)
            .sort({ weekStart: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .toArray(),
        col.countDocuments(filter),
    ]);
    return { reports: docs.map(toView), total };
}

export async function getPreviousWeekReport(
    organizationId: ObjectId,
    currentWeekStart: Date
): Promise<OrgReportDocument | null> {
    const db = await getDb();
    return db
        .collection<OrgReportDocument>(COLLECTION)
        .findOne(
            { organizationId, weekStart: { $lt: currentWeekStart }, status: "ready" },
            { sort: { weekStart: -1 } }
        );
}

export async function updateReportStatus(
    reportId: string,
    status: ReportStatus
): Promise<boolean> {
    if (!ObjectId.isValid(reportId)) return false;
    const db = await getDb();
    const result = await db
        .collection<OrgReportDocument>(COLLECTION)
        .updateOne({ _id: new ObjectId(reportId) }, { $set: { status } });
    return result.modifiedCount > 0;
}

/** Atomically claim "pending" → "generating" (guards against double-processing). */
export async function claimReportForProcessing(reportId: string): Promise<boolean> {
    if (!ObjectId.isValid(reportId)) return false;
    const db = await getDb();
    const result = await db
        .collection<OrgReportDocument>(COLLECTION)
        .updateOne(
            { _id: new ObjectId(reportId), status: "pending" },
            { $set: { status: "generating" } }
        );
    return result.modifiedCount > 0;
}

export async function completeReport(
    reportId: string,
    data: {
        fileId: string;
        fileSize: number;
        checksum: string;
        kpiSnapshot: KpiSnapshot;
    }
): Promise<void> {
    if (!ObjectId.isValid(reportId)) return;
    const db = await getDb();
    await db.collection<OrgReportDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(reportId) },
        {
            $set: {
                status: "ready",
                generatedAt: new Date(),
                fileId: data.fileId,
                fileSize: data.fileSize,
                checksum: data.checksum,
                kpiSnapshot: data.kpiSnapshot,
                errorMessage: null,
            },
        }
    );
}

export async function failReport(reportId: string, errorMessage: string): Promise<void> {
    if (!ObjectId.isValid(reportId)) return;
    const db = await getDb();
    await db.collection<OrgReportDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(reportId) },
        {
            $set: { status: "failed", errorMessage },
            $inc: { retryCount: 1 },
        }
    );
}

export async function resetReportForRegeneration(reportId: string): Promise<boolean> {
    if (!ObjectId.isValid(reportId)) return false;
    const db = await getDb();
    const result = await db
        .collection<OrgReportDocument>(COLLECTION)
        .updateOne(
            { _id: new ObjectId(reportId), status: { $in: ["ready", "failed"] } },
            {
                $set: {
                    status: "pending",
                    errorMessage: null,
                    retryCount: 0,
                    fileId: null,
                    fileSize: null,
                    checksum: null,
                    kpiSnapshot: null,
                    generatedAt: null,
                },
                $inc: { version: 1 },
            }
        );
    return result.modifiedCount > 0;
}

/** Used by the scheduler to find PRO orgs' failed reports eligible for auto-retry. */
export async function getFailedReportsForRetry(): Promise<OrgReportDocument[]> {
    const db = await getDb();
    return db
        .collection<OrgReportDocument>(COLLECTION)
        .find({ status: "failed", retryCount: { $lt: 3 } })
        .sort({ createdAt: -1 })
        .limit(50)
        .toArray();
}

export { toView as toReportView };
