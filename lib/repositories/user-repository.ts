import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

type UserDocument = {
    _id: ObjectId;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rsiHandle?: string | null;
};

export async function getUserById(userId: string): Promise<UserDocument | null> {
    if (!ObjectId.isValid(userId)) return null;

    const db = await getDb();

    return db.collection<UserDocument>("users").findOne({ _id: new ObjectId(userId) });
}

export async function saveRsiHandle(userId: string, rsiHandle: string): Promise<boolean> {
    if (!ObjectId.isValid(userId)) return false;

    const db = await getDb();

    const result = await db.collection<UserDocument>("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { rsiHandle: rsiHandle.trim() } }
    );

    return result.matchedCount > 0;
}
