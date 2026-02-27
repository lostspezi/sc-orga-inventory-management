import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { ItemDocument } from "@/lib/types/item";

const COLLECTION = "items";

export function normalizeItemName(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export async function getItemById(id: string): Promise<ItemDocument | null> {
    if (!ObjectId.isValid(id)) return null;

    const db = await getDb();

    return db
        .collection<ItemDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(id) });
}

export async function getItemByNormalizedName(normalizedName: string): Promise<ItemDocument | null> {
    const db = await getDb();

    return db
        .collection<ItemDocument>(COLLECTION)
        .findOne({ normalizedName });
}

export async function createItemInDb(input: {
    name: string;
    description?: string;
    category?: string;
}): Promise<ItemDocument> {
    const db = await getDb();

    const normalizedName = normalizeItemName(input.name);
    const existing = await getItemByNormalizedName(normalizedName);

    if (existing) {
        return existing;
    }

    const now = new Date();

    const doc: Omit<ItemDocument, "_id"> = {
        name: input.name.trim(),
        normalizedName,
        description: input.description?.trim() || undefined,
        category: input.category?.trim() || undefined,
        createdAt: now,
        updatedAt: now,
    };

    try {
        const result = await db.collection<Omit<ItemDocument, "_id">>(COLLECTION).insertOne(doc);

        return {
            _id: result.insertedId,
            ...doc,
        };
    } catch {
        const createdMeanwhile = await getItemByNormalizedName(normalizedName);

        if (!createdMeanwhile) {
            throw new Error("Failed to create item.");
        }

        return createdMeanwhile;
    }
}

export async function searchItemsByName(query: string): Promise<ItemDocument[]> {
    const db = await getDb();

    const normalizedQuery = normalizeItemName(query);

    if (!normalizedQuery) {
        return [];
    }

    return db
        .collection<ItemDocument>(COLLECTION)
        .find({
            normalizedName: {
                $regex: `^${normalizedQuery.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`,
                $options: "i",
            },
        })
        .sort({ name: 1 })
        .limit(10)
        .toArray();
}