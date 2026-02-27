import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { OrganizationInventoryItemDocument } from "@/lib/types/organization";
import { ItemDocument } from "@/lib/types/item";
import { OrganizationInventoryItemView } from "@/lib/types/organization";

const COLLECTION = "organization_inventory_items";

export async function createOrganizationInventoryItemInDb(input: {
    organizationId: ObjectId;
    organizationSlug: string;
    itemId: ObjectId;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
}): Promise<{ created: boolean; alreadyExists: boolean; document?: OrganizationInventoryItemDocument }> {
    const db = await getDb();

    const existing = await db.collection<OrganizationInventoryItemDocument>(COLLECTION).findOne({
        organizationId: input.organizationId,
        itemId: input.itemId,
    });

    if (existing) {
        return {
            created: false,
            alreadyExists: true,
            document: existing,
        };
    }

    const now = new Date();

    const doc: Omit<OrganizationInventoryItemDocument, "_id"> = {
        organizationId: input.organizationId,
        organizationSlug: input.organizationSlug,
        itemId: input.itemId,
        buyPrice: input.buyPrice,
        sellPrice: input.sellPrice,
        quantity: input.quantity,
        createdAt: now,
        updatedAt: now,
    };

    const result = await db.collection<Omit<OrganizationInventoryItemDocument, "_id">>(COLLECTION).insertOne(doc);

    return {
        created: true,
        alreadyExists: false,
        document: {
            _id: result.insertedId,
            ...doc,
        },
    };
}

export async function getOrganizationInventoryItemViewsByOrganizationId(
    organizationId: ObjectId
): Promise<OrganizationInventoryItemView[]> {
    const db = await getDb();

    const inventoryItems = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .find({ organizationId })
        .sort({ createdAt: -1 })
        .toArray();

    if (!inventoryItems.length) {
        return [];
    }

    const itemIds = inventoryItems.map((entry) => entry.itemId);

    const items = await db
        .collection<ItemDocument>("items")
        .find({ _id: { $in: itemIds } })
        .toArray();

    const itemById = new Map(items.map((item) => [item._id.toString(), item]));

    return inventoryItems
        .map<OrganizationInventoryItemView | null>((entry) => {
            const item = itemById.get(entry.itemId.toString());

            if (!item) {
                return null;
            }

            return {
                inventoryItemId: entry._id,
                itemId: item._id,
                name: item.name,
                normalizedName: item.normalizedName,
                description: item.description,
                category: item.category,
                buyPrice: entry.buyPrice,
                sellPrice: entry.sellPrice,
                quantity: entry.quantity,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
            };
        })
        .filter((entry): entry is OrganizationInventoryItemView => entry !== null);
}