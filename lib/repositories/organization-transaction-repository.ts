import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { OrganizationTransactionDocument, OrganizationTransactionView } from "@/lib/types/transaction";

const COLLECTION = "organization_transactions";

function toView(doc: OrganizationTransactionDocument): OrganizationTransactionView {
    return {
        _id: doc._id.toString(),
        organizationId: doc.organizationId.toString(),
        organizationSlug: doc.organizationSlug,
        inventoryItemId: doc.inventoryItemId.toString(),
        itemId: doc.itemId.toString(),
        itemName: doc.itemName,
        direction: doc.direction,
        initiatedBy: doc.initiatedBy,
        memberId: doc.memberId,
        memberUsername: doc.memberUsername,
        quantity: doc.quantity,
        pricePerUnit: doc.pricePerUnit,
        totalPrice: doc.totalPrice,
        status: doc.status,
        memberConfirmed: doc.memberConfirmed,
        adminConfirmed: doc.adminConfirmed,
        note: doc.note,
        discordChannelId: doc.discordChannelId,
        discordMessageId: doc.discordMessageId,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}

export async function createOrganizationTransaction(
    data: Omit<OrganizationTransactionDocument, "_id" | "createdAt" | "updatedAt">
): Promise<OrganizationTransactionView> {
    const db = await getDb();
    const now = new Date();

    const doc: Omit<OrganizationTransactionDocument, "_id"> = {
        ...data,
        createdAt: now,
        updatedAt: now,
    };

    const result = await db
        .collection<Omit<OrganizationTransactionDocument, "_id">>(COLLECTION)
        .insertOne(doc);

    return toView({ _id: result.insertedId, ...doc });
}

export async function getTransactionsByOrganizationId(
    organizationId: ObjectId
): Promise<OrganizationTransactionView[]> {
    const db = await getDb();

    const docs = await db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .find({ organizationId })
        .sort({ createdAt: -1 })
        .toArray();

    return docs.map(toView);
}

export async function getTransactionsByMember(
    organizationId: ObjectId,
    memberId: string
): Promise<OrganizationTransactionView[]> {
    const db = await getDb();

    const docs = await db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .find({ organizationId, memberId })
        .sort({ createdAt: -1 })
        .toArray();

    return docs.map(toView);
}

export async function getTransactionsByInventoryItemId(
    inventoryItemId: ObjectId
): Promise<OrganizationTransactionView[]> {
    const db = await getDb();

    const docs = await db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .find({ inventoryItemId })
        .sort({ createdAt: -1 })
        .toArray();

    return docs.map(toView);
}

export async function getTransactionById(
    transactionId: string
): Promise<OrganizationTransactionDocument | null> {
    if (!ObjectId.isValid(transactionId)) return null;

    const db = await getDb();

    return db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(transactionId) });
}

export async function getTransactionViewById(
    transactionId: string
): Promise<OrganizationTransactionView | null> {
    const doc = await getTransactionById(transactionId);
    if (!doc) return null;
    return toView(doc);
}

export async function setTransactionDiscordMessage(
    transactionId: string,
    channelId: string,
    messageId: string
): Promise<void> {
    if (!ObjectId.isValid(transactionId)) return;

    const db = await getDb();

    await db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .updateOne(
            { _id: new ObjectId(transactionId) },
            { $set: { discordChannelId: channelId, discordMessageId: messageId, updatedAt: new Date() } }
        );
}

export async function updateTransactionStatus(
    transactionId: string,
    patch: Partial<Pick<OrganizationTransactionDocument, "status" | "memberConfirmed" | "adminConfirmed">>
): Promise<boolean> {
    if (!ObjectId.isValid(transactionId)) return false;

    const db = await getDb();

    const result = await db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .updateOne(
            { _id: new ObjectId(transactionId) },
            { $set: { ...patch, updatedAt: new Date() } }
        );

    return result.modifiedCount > 0;
}

export async function getTransactionsUpdatedSince(
    organizationId: ObjectId,
    since: Date
): Promise<OrganizationTransactionView[]> {
    const db = await getDb();

    const docs = await db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .find({ organizationId, updatedAt: { $gt: since } })
        .sort({ updatedAt: -1 })
        .toArray();

    return docs.map(toView);
}

export async function getRecentCompletedTransactions(
    organizationId: ObjectId,
    limit = 10
): Promise<OrganizationTransactionView[]> {
    const db = await getDb();

    const docs = await db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .find({ organizationId, status: "completed" })
        .sort({ updatedAt: -1 })
        .limit(limit)
        .toArray();

    return docs.map(toView);
}

export type DashboardStats = {
    activeRequests: number;
    completedThisMonth: number;
    revenueThisMonth: number;
};

export async function getDashboardStats(organizationId: ObjectId): Promise<DashboardStats> {
    const db = await getDb();

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [activeRequests, completedThisMonth, revenueResult] = await Promise.all([
        db.collection<OrganizationTransactionDocument>(COLLECTION).countDocuments({
            organizationId,
            status: { $in: ["requested", "approved"] },
        }),
        db.collection<OrganizationTransactionDocument>(COLLECTION).countDocuments({
            organizationId,
            status: "completed",
            updatedAt: { $gte: startOfMonth },
        }),
        db.collection<OrganizationTransactionDocument>(COLLECTION).aggregate([
            { $match: { organizationId, status: "completed", updatedAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$totalPrice" } } },
        ]).toArray(),
    ]);

    return {
        activeRequests,
        completedThisMonth,
        revenueThisMonth: (revenueResult[0]?.total as number | undefined) ?? 0,
    };
}

export type DailyStats = {
    date: string;
    revenue: number;
    sellCount: number;
    buyCount: number;
};

export async function getDailyTransactionStats(
    organizationId: ObjectId,
    days = 30
): Promise<DailyStats[]> {
    const db = await getDb();

    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);

    const docs = await db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .find({ organizationId, createdAt: { $gte: since } })
        .toArray();

    // Pre-fill every day with zeros
    const map = new Map<string, DailyStats>();
    for (let i = 0; i < days; i++) {
        const d = new Date(since);
        d.setDate(d.getDate() + i);
        map.set(d.toISOString().slice(0, 10), { date: d.toISOString().slice(0, 10), revenue: 0, sellCount: 0, buyCount: 0 });
    }

    for (const doc of docs) {
        const key = doc.createdAt.toISOString().slice(0, 10);
        const entry = map.get(key);
        if (!entry) continue;

        if (doc.status === "completed") entry.revenue += doc.totalPrice;
        if (doc.direction === "member_to_org") entry.sellCount++;
        else entry.buyCount++;
    }

    return Array.from(map.values());
}

export type TopItem = { itemName: string; revenue: number; count: number };

export async function getTopItemsByRevenue(
    organizationId: ObjectId,
    limit = 5
): Promise<TopItem[]> {
    const db = await getDb();

    const results = await db
        .collection<OrganizationTransactionDocument>(COLLECTION)
        .aggregate([
            { $match: { organizationId, status: "completed" } },
            { $group: { _id: "$itemName", revenue: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
            { $sort: { revenue: -1 } },
            { $limit: limit },
        ])
        .toArray();

    return results.map((r) => ({
        itemName: r._id as string,
        revenue: r.revenue as number,
        count: r.count as number,
    }));
}
