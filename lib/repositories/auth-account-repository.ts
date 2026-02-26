import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

type AccountDocument = {
    userId: ObjectId;
    provider: string;
    providerAccountId: string;
};

export async function getDiscordAccountByUserId(userId: string): Promise<AccountDocument | null> {
    if (!ObjectId.isValid(userId)) {
        return null;
    }

    const db = await getDb();

    return db.collection<AccountDocument>("accounts").findOne({
        userId: new ObjectId(userId),
        provider: "discord",
    });
}

export async function getDiscordAccountsByUserIds(userIds: string[]): Promise<AccountDocument[]> {
    const validObjectIds = userIds
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

    if (validObjectIds.length === 0) {
        return [];
    }

    const db = await getDb();

    return db.collection<AccountDocument>("accounts")
        .find({
            userId: { $in: validObjectIds },
            provider: "discord",
        })
        .toArray();
}