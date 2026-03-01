import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { NotificationDocument } from "@/lib/types/notification";

const COLLECTION = "notifications";

export async function createNotificationInDb(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string
): Promise<void> {
    const db = await getDb();
    const doc: Omit<NotificationDocument, "_id"> = {
        userId,
        type,
        title,
        message,
        link,
        read: false,
        createdAt: new Date(),
    };
    await db.collection<Omit<NotificationDocument, "_id">>(COLLECTION).insertOne(doc);
}

export async function getNotificationsForUser(
    userId: string,
    limit = 50
): Promise<NotificationDocument[]> {
    const db = await getDb();
    return db
        .collection<NotificationDocument>(COLLECTION)
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
}

export async function getUnreadCountForUser(userId: string): Promise<number> {
    const db = await getDb();
    return db
        .collection<NotificationDocument>(COLLECTION)
        .countDocuments({ userId, read: false });
}

export async function getNotificationsCreatedSince(
    userId: string,
    since: Date
): Promise<NotificationDocument[]> {
    const db = await getDb();
    return db
        .collection<NotificationDocument>(COLLECTION)
        .find({ userId, createdAt: { $gt: since } })
        .sort({ createdAt: -1 })
        .toArray();
}

export async function markNotificationReadInDb(
    id: string,
    userId: string
): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    const db = await getDb();
    await db.collection<NotificationDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(id), userId },
        { $set: { read: true } }
    );
}

export async function markAllNotificationsReadInDb(userId: string): Promise<void> {
    const db = await getDb();
    await db
        .collection<NotificationDocument>(COLLECTION)
        .updateMany({ userId, read: false }, { $set: { read: true } });
}
