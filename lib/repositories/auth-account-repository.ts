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