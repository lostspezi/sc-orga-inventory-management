import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { OrganizationInventoryItemDocument, OrganizationInventoryItemView } from "@/lib/types/organization";
import { type ItemQualityGrade, getQualityGradeDefinition } from "@/lib/utils/item-quality";

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

function normalizeItemName(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function toView(doc: OrganizationInventoryItemDocument): OrganizationInventoryItemView {
    return {
        inventoryItemId: doc._id,
        name: doc.name,
        normalizedName: doc.normalizedName,
        category: doc.category,
        scWikiUuid: doc.scWikiUuid,
        unit: doc.unit,
        buyPrice: doc.buyPrice,
        sellPrice: doc.sellPrice,
        quantity: doc.quantity,
        quality: doc.quality,
        minStock: doc.minStock,
        maxStock: doc.maxStock,
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
    };
}

const COLLECTION = "organization_inventory_items";

export async function createOrganizationInventoryItemInDb(input: {
    organizationId: ObjectId;
    organizationSlug: string;
    name: string;
    normalizedName?: string;
    category?: string;
    scWikiUuid?: string;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
    quality?: number;
    minStock?: number;
    maxStock?: number;
    unit?: string;
}): Promise<{ created: boolean; alreadyExists: boolean; document?: OrganizationInventoryItemDocument }> {
    const db = await getDb();
    const normalizedName = input.normalizedName ?? normalizeItemName(input.name);

    const existing = await db.collection<OrganizationInventoryItemDocument>(COLLECTION).findOne({
        organizationId: input.organizationId,
        normalizedName,
    });

    if (existing) {
        return { created: false, alreadyExists: true, document: existing };
    }

    const now = new Date();

    const doc: Omit<OrganizationInventoryItemDocument, "_id"> = {
        organizationId: input.organizationId,
        organizationSlug: input.organizationSlug,
        name: input.name,
        normalizedName,
        category: input.category,
        scWikiUuid: input.scWikiUuid,
        buyPrice: input.buyPrice,
        sellPrice: input.sellPrice,
        quantity: input.quantity,
        ...(input.quality !== undefined && { quality: input.quality }),
        ...(input.minStock !== undefined && { minStock: input.minStock }),
        ...(input.maxStock !== undefined && { maxStock: input.maxStock }),
        ...(input.unit !== undefined && { unit: input.unit }),
        createdAt: now,
        updatedAt: now,
    };

    const result = await db.collection<Omit<OrganizationInventoryItemDocument, "_id">>(COLLECTION).insertOne(doc);

    return {
        created: true,
        alreadyExists: false,
        document: { _id: result.insertedId, ...doc },
    };
}

export async function deleteAllOrganizationInventoryItemsInDb(
    organizationId: ObjectId
): Promise<number> {
    const db = await getDb();
    const result = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .deleteMany({ organizationId });
    return result.deletedCount;
}

export async function getOrganizationInventoryItemViewsByOrganizationId(
    organizationId: ObjectId
): Promise<OrganizationInventoryItemView[]> {
    const db = await getDb();

    const docs = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .find({ organizationId })
        .sort({ createdAt: -1 })
        .toArray();

    return docs.map(toView);
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
    quality?: number | undefined;
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

    if (input.quality !== undefined) {
        setData.quality = input.quality;
    } else {
        unsetData.quality = "";
    }

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

    const doc = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .findOne({ _id: new ObjectId(inventoryItemId) });

    if (!doc) return null;

    return toView(doc);
}

export async function getOrganizationInventoryItemViewsPaginated(
    organizationId: ObjectId,
    options: { page: number; pageSize: number; search?: string; category?: string; qualityGrade?: ItemQualityGrade | "ungraded" }
): Promise<PaginatedInventoryResult> {
    const db = await getDb();
    const { page, pageSize, search, category, qualityGrade } = options;
    const offset = (page - 1) * pageSize;

    const match: Record<string, unknown> = { organizationId };

    if (search) {
        match.name = new RegExp(escapeRegex(search), "i");
    }
    if (category) {
        match.category = new RegExp(`^${escapeRegex(category)}$`, "i");
    }
    if (qualityGrade === "ungraded") {
        match.quality = { $exists: false };
    } else if (qualityGrade) {
        const def = getQualityGradeDefinition(qualityGrade);
        match.quality = { $gte: def.min, $lte: def.max };
    }

    const pipeline: object[] = [
        { $match: match },
        { $sort: { createdAt: -1 } },
        {
            $facet: {
                metadata: [{ $count: "total" }],
                data: [{ $skip: offset }, { $limit: pageSize }],
            },
        },
    ];

    type FacetResult = {
        metadata: { total: number }[];
        data: OrganizationInventoryItemDocument[];
    };

    const [result] = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .aggregate<FacetResult>(pipeline)
        .toArray();

    const totalCount = result?.metadata[0]?.total ?? 0;
    const totalPages = totalCount === 0 ? 1 : Math.ceil(totalCount / pageSize);

    const items = (result?.data ?? []).map(toView);

    return { items, totalCount, totalPages, page, pageSize };
}

export async function getDistinctInventoryCategories(
    organizationId: ObjectId
): Promise<string[]> {
    const db = await getDb();

    const result = await db
        .collection<OrganizationInventoryItemDocument>(COLLECTION)
        .aggregate<{ _id: string }>([
            { $match: { organizationId, category: { $exists: true, $ne: null } } },
            { $group: { _id: "$category" } },
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
