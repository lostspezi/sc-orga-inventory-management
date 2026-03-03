import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { OrganizationInventoryItemDocument } from "@/lib/types/organization";
import { ItemDocument } from "@/lib/types/item";
import { OrganizationInventoryItemView } from "@/lib/types/organization";

export type PaginatedInventoryResult = {
    items: OrganizationInventoryItemView[];
    totalCount: number;
    totalPages: number;
    page: number;
    pageSize: number;
};

function escapeRegex(s: string): string {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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
                itemClass: item.itemClass,
                grade: item.grade,
                size: item.size,
                buyPrice: entry.buyPrice,
                sellPrice: entry.sellPrice,
                quantity: entry.quantity,
                minStock: entry.minStock,
                maxStock: entry.maxStock,
                createdAt: entry.createdAt,
                updatedAt: entry.updatedAt,
            };
        })
        .filter((entry): entry is OrganizationInventoryItemView => entry !== null);
}

export async function deleteOrganizationInventoryItemInDb(
    inventoryItemId: string,
    organizationId: ObjectId
): Promise<OrganizationInventoryItemDocument | null> {
    if (!ObjectId.isValid(inventoryItemId)) {
        return null;
    }

    const db = await getDb();

    const result = await db.collection<OrganizationInventoryItemDocument>(COLLECTION).findOneAndDelete({
        _id: new ObjectId(inventoryItemId),
        organizationId,
    });

    return result ?? null;
}

export async function updateOrganizationInventoryItemInDb(input: {
    inventoryItemId: string;
    organizationId: ObjectId;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
    minStock: number | undefined;
    maxStock: number | undefined;
}): Promise<boolean> {
    if (!ObjectId.isValid(input.inventoryItemId)) {
        return false;
    }

    const db = await getDb();

    const setData: Record<string, unknown> = {
        buyPrice: input.buyPrice,
        sellPrice: input.sellPrice,
        quantity: input.quantity,
        updatedAt: new Date(),
    };
    const unsetData: Record<string, string> = {};

    if (input.minStock !== undefined) {
        setData.minStock = input.minStock;
    } else {
        unsetData.minStock = "";
    }

    if (input.maxStock !== undefined) {
        setData.maxStock = input.maxStock;
    } else {
        unsetData.maxStock = "";
    }

    const updateOp: Record<string, unknown> = { $set: setData };
    if (Object.keys(unsetData).length > 0) {
        updateOp.$unset = unsetData;
    }

    const result = await db.collection<OrganizationInventoryItemDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(input.inventoryItemId), organizationId: input.organizationId },
        updateOp
    );

    return result.modifiedCount > 0;
}

export async function getOrganizationInventoryItemDocumentById(
    inventoryItemId: string
): Promise<OrganizationInventoryItemDocument | null> {
    if (!ObjectId.isValid(inventoryItemId)) return null;

    const db = await getDb();

    return db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(inventoryItemId) });
}

export async function getOrganizationInventoryItemViewById(
    inventoryItemId: string
): Promise<OrganizationInventoryItemView | null> {
    if (!ObjectId.isValid(inventoryItemId)) return null;

    const db = await getDb();

    const entry = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(inventoryItemId) });

    if (!entry) return null;

    const item = await db
        .collection<ItemDocument>("items")
        .findOne({ _id: entry.itemId });

    if (!item) return null;

    return {
        inventoryItemId: entry._id,
        itemId: item._id,
        name: item.name,
        normalizedName: item.normalizedName,
        description: item.description,
        category: item.category,
        itemClass: item.itemClass,
        grade: item.grade,
        size: item.size,
        buyPrice: entry.buyPrice,
        sellPrice: entry.sellPrice,
        quantity: entry.quantity,
        minStock: entry.minStock,
        maxStock: entry.maxStock,
        createdAt: entry.createdAt,
        updatedAt: entry.updatedAt,
    };
}

export async function getOrganizationInventoryItemViewsPaginated(
    organizationId: ObjectId,
    options: { page: number; pageSize: number; search?: string; category?: string }
): Promise<PaginatedInventoryResult> {
    const db = await getDb();
    const { page, pageSize, search, category } = options;
    const offset = (page - 1) * pageSize;

    const postLookupMatch: Record<string, unknown> = {};
    if (search) {
        const re = new RegExp(escapeRegex(search), "i");
        postLookupMatch.$or = [
            { "itemDoc.name": re },
            { "itemDoc.description": re },
        ];
    }
    if (category) {
        postLookupMatch["itemDoc.category"] = new RegExp(`^${escapeRegex(category)}$`, "i");
    }

    const pipeline: object[] = [
        { $match: { organizationId } },
        {
            $lookup: {
                from: "items",
                localField: "itemId",
                foreignField: "_id",
                as: "itemDoc",
            },
        },
        { $unwind: { path: "$itemDoc", preserveNullAndEmptyArrays: false } },
    ];

    if (Object.keys(postLookupMatch).length > 0) {
        pipeline.push({ $match: postLookupMatch });
    }

    pipeline.push({ $sort: { createdAt: -1 } });

    pipeline.push({
        $facet: {
            metadata: [{ $count: "total" }],
            data: [{ $skip: offset }, { $limit: pageSize }],
        },
    });

    type FacetResult = {
        metadata: { total: number }[];
        data: (OrganizationInventoryItemDocument & { itemDoc: ItemDocument })[];
    };

    const [result] = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .aggregate<FacetResult>(pipeline)
        .toArray();

    const totalCount = result?.metadata[0]?.total ?? 0;
    const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize);

    const items: OrganizationInventoryItemView[] = (result?.data ?? []).map((row) => ({
        inventoryItemId: row._id,
        itemId: row.itemDoc._id,
        name: row.itemDoc.name,
        normalizedName: row.itemDoc.normalizedName,
        description: row.itemDoc.description,
        category: row.itemDoc.category,
        itemClass: row.itemDoc.itemClass,
        grade: row.itemDoc.grade,
        size: row.itemDoc.size,
        buyPrice: row.buyPrice,
        sellPrice: row.sellPrice,
        quantity: row.quantity,
        minStock: row.minStock,
        maxStock: row.maxStock,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    }));

    return { items, totalCount, totalPages, page, pageSize };
}

export async function getDistinctInventoryCategories(
    organizationId: ObjectId
): Promise<string[]> {
    const db = await getDb();

    const result = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .aggregate<{ _id: string }>([
            { $match: { organizationId } },
            {
                $lookup: {
                    from: "items",
                    localField: "itemId",
                    foreignField: "_id",
                    as: "itemDoc",
                },
            },
            { $unwind: "$itemDoc" },
            { $match: { "itemDoc.category": { $exists: true, $ne: null } } },
            { $group: { _id: "$itemDoc.category" } },
            { $sort: { _id: 1 } },
        ])
        .toArray();

    return result.map((r) => r._id);
}

export async function adjustOrganizationInventoryItemQuantity(
    inventoryItemId: ObjectId,
    delta: number
): Promise<{ newQuantity: number; minStock?: number } | null> {
    const db = await getDb();

    const updated = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .findOneAndUpdate(
            { _id: inventoryItemId },
            { $inc: { quantity: delta }, $set: { updatedAt: new Date() } },
            { returnDocument: "after" }
        );

    if (!updated) return null;

    return { newQuantity: updated.quantity, minStock: updated.minStock };
}