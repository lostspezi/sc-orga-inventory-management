import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

type UserDocument = {
    _id: ObjectId;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rsiHandle?: string | null;
    auecBalance?: number;
    legalAcceptedVersion?: string | null;
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

export async function getUserAuecBalance(userId: string): Promise<number | null> {
    if (!ObjectId.isValid(userId)) return null;

    const db = await getDb();
    const doc = await db.collection<UserDocument>("users").findOne(
        { _id: new ObjectId(userId) },
        { projection: { auecBalance: 1 } }
    );

    return doc?.auecBalance ?? null;
}

export async function setUserAuecBalance(userId: string, balance: number): Promise<boolean> {
    if (!ObjectId.isValid(userId)) return false;

    const db = await getDb();
    const result = await db.collection<UserDocument>("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { auecBalance: balance } }
    );

    return result.matchedCount > 0;
}

export async function adjustUserAuecBalance(userId: string, delta: number): Promise<void> {
    if (!ObjectId.isValid(userId)) return;

    const db = await getDb();
    await db.collection<UserDocument>("users").updateOne(
        { _id: new ObjectId(userId) },
        { $inc: { auecBalance: delta } },
        { upsert: false }
    );
}

export async function getUserLegalAcceptedVersion(userId: string): Promise<string | null> {
    if (!ObjectId.isValid(userId)) return null;

    const db = await getDb();
    const doc = await db.collection<UserDocument>("users").findOne(
        { _id: new ObjectId(userId) },
        { projection: { legalAcceptedVersion: 1 } }
    );
    return doc?.legalAcceptedVersion ?? null;
}

export async function setUserLegalAcceptedVersion(userId: string, version: string): Promise<void> {
    if (!ObjectId.isValid(userId)) return;

    const db = await getDb();
    await db.collection<UserDocument>("users").updateOne(
        { _id: new ObjectId(userId) },
        { $set: { legalAcceptedVersion: version } }
    );
}

export async function getUsersByIds(userIds: string[]): Promise<UserDocument[]> {
    const validIds = userIds.filter((id) => ObjectId.isValid(id)).map((id) => new ObjectId(id));
    if (validIds.length === 0) return [];

    const db = await getDb();
    return db.collection<UserDocument>("users").find({ _id: { $in: validIds } }).toArray();
}
