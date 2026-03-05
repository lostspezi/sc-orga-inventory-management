import { GridFSBucket, ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { Readable } from "stream";

const BUCKET_NAME = "report_pdfs";

/**
 * Upload a PDF buffer to GridFS.
 * Returns the GridFS file ObjectId as a string.
 */
export async function uploadReportPdf(
    orgId: string,
    weekLabel: string,
    version: number,
    buffer: Buffer
): Promise<string> {
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
    const filename = `${orgId}-${weekLabel}-v${version}.pdf`;

    return new Promise<string>((resolve, reject) => {
        const uploadStream = bucket.openUploadStream(filename, {
            contentType: "application/pdf",
            metadata: { orgId, weekLabel, version },
        });

        uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
        uploadStream.on("error", reject);

        // Write buffer in one chunk
        const readable = Readable.from(buffer);
        readable.pipe(uploadStream);
    });
}

/**
 * Open a download stream for a GridFS file by its ID string.
 * Caller is responsible for piping this to the HTTP response.
 */
export async function openReportDownloadStream(
    fileId: string
): Promise<ReturnType<GridFSBucket["openDownloadStream"]>> {
    if (!ObjectId.isValid(fileId)) {
        throw new Error("Invalid fileId");
    }
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
    return bucket.openDownloadStream(new ObjectId(fileId));
}

/**
 * Delete a GridFS file by its ID string (used when regenerating to clean up old file).
 */
export async function deleteReportPdf(fileId: string): Promise<void> {
    if (!ObjectId.isValid(fileId)) return;
    const db = await getDb();
    const bucket = new GridFSBucket(db, { bucketName: BUCKET_NAME });
    try {
        await bucket.delete(new ObjectId(fileId));
    } catch {
        // Ignore if file not found
    }
}
