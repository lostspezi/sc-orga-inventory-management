import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

type AccountDocument = {
    userId: ObjectId;
    provider: string;
    providerAccountId: string;
};

type UserDocument = {
    _id: ObjectId;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    rsiHandle?: string | null;
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

export async function getUserByDiscordAccountId(discordAccountId: string) {
    const db = await getDb();

    const account = await db.collection<AccountDocument>("accounts").findOne({
        provider: "discord",
        providerAccountId: discordAccountId,
    });

    if (!account) {
        return null;
    }

    const user = await db.collection<UserDocument>("users").findOne({
        _id: new ObjectId(account.userId),
    });

    if (!user) {
        return null;
    }

    return {
        id: user._id.toString(),
        name: user.name ?? null,
        email: user.email ?? null,
        rsiHandle: user.rsiHandle ?? null,
    };
}