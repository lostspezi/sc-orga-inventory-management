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
