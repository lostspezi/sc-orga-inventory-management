import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type { AuecTransactionDocument, AuecTransactionView } from "@/lib/types/auec-transaction";

const COLLECTION = "organization_auec_transactions";

function toView(doc: AuecTransactionDocument): AuecTransactionView {
    return {
        _id: doc._id.toString(),
        organizationId: doc.organizationId.toString(),
        organizationSlug: doc.organizationSlug,
        memberId: doc.memberId,
        memberUsername: doc.memberUsername,
        direction: doc.direction,
        auecAmount: doc.auecAmount,
        status: doc.status,
        note: doc.note,
        memberConfirmed: doc.memberConfirmed,
        adminConfirmed: doc.adminConfirmed,
        adminConfirmedByUsername: doc.adminConfirmedByUsername,
        discordChannelId: doc.discordChannelId,
        discordMessageId: doc.discordMessageId,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}

export async function createAuecTransaction(
    input: Omit<AuecTransactionDocument, "_id" | "createdAt" | "updatedAt">
): Promise<AuecTransactionView> {
    const db = await getDb();
    const now = new Date();

    const doc: Omit<AuecTransactionDocument, "_id"> = {
        ...input,
        createdAt: now,
        updatedAt: now,
    };

    const result = await db
        .collection<Omit<AuecTransactionDocument, "_id">>(COLLECTION)
        .insertOne(doc);

    return toView({ _id: result.insertedId, ...doc });
}

export async function getAuecTransactionById(
    id: string
): Promise<AuecTransactionDocument | null> {
    if (!ObjectId.isValid(id)) return null;

    const db = await getDb();

    return db
        .collection<AuecTransactionDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(id) });
}

export async function getAuecTransactionViewById(
    id: string
): Promise<AuecTransactionView | null> {
    const doc = await getAuecTransactionById(id);
    if (!doc) return null;
    return toView(doc);
}

export async function getAuecTransactionsByOrg(
    orgId: ObjectId,
    memberId?: string
): Promise<AuecTransactionView[]> {
    const db = await getDb();

    const filter: Record<string, unknown> = { organizationId: orgId };
    if (memberId) filter.memberId = memberId;

    const docs = await db
        .collection<AuecTransactionDocument>(COLLECTION)
        .find(filter)
        .sort({ createdAt: -1 })
        .toArray();

    return docs.map(toView);
}

export async function updateAuecTransactionStatus(
    id: string,
    patch: Partial<Pick<AuecTransactionDocument, "status" | "memberConfirmed" | "adminConfirmed" | "adminConfirmedByUsername">>
): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;

    const db = await getDb();

    const result = await db
        .collection<AuecTransactionDocument>(COLLECTION)
        .updateOne(
            { _id: new ObjectId(id) },
            { $set: { ...patch, updatedAt: new Date() } }
        );

    return result.modifiedCount > 0;
}

export async function setAuecTransactionDiscordMessage(
    id: string,
    channelId: string,
    messageId: string
): Promise<void> {
    if (!ObjectId.isValid(id)) return;

    const db = await getDb();

    await db
        .collection<AuecTransactionDocument>(COLLECTION)
        .updateOne(
            { _id: new ObjectId(id) },
            { $set: { discordChannelId: channelId, discordMessageId: messageId, updatedAt: new Date() } }
        );
}
