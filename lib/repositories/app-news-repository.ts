import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { AppNewsDocument } from "@/lib/types/app-news";

const COLLECTION = "app_news";

export async function getAllAppNews(): Promise<AppNewsDocument[]> {
    const db = await getDb();
    return db
        .collection<AppNewsDocument>(COLLECTION)
        .find()
        .sort({ publishedAt: -1 })
        .toArray();
}

export async function getLatestAppNews(limit: number): Promise<AppNewsDocument[]> {
    const db = await getDb();
    return db
        .collection<AppNewsDocument>(COLLECTION)
        .find()
        .sort({ publishedAt: -1 })
        .limit(limit)
        .toArray();
}

export async function createAppNewsInDb(title: string, body: string): Promise<void> {
    const db = await getDb();
    const now = new Date();
    const doc: Omit<AppNewsDocument, "_id"> = {
        title,
        body,
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
    };
    await db.collection<Omit<AppNewsDocument, "_id">>(COLLECTION).insertOne(doc);
}

export async function updateAppNewsInDb(id: string, title: string, body: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const db = await getDb();
    const result = await db.collection<AppNewsDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: { title, body, updatedAt: new Date() } }
    );
    return result.modifiedCount > 0;
}

export async function deleteAppNewsInDb(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const db = await getDb();
    const result = await db.collection<AppNewsDocument>(COLLECTION).deleteOne({
        _id: new ObjectId(id),
    });
    return result.deletedCount > 0;
}
