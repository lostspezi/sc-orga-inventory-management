"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { createItemInDb, getItemById } from "@/lib/repositories/item-repository";
import { createOrganizationInventoryItemInDb } from "@/lib/repositories/organization-inventory-item-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { ItemDocument } from "@/lib/types/item";

export type CreateOrganizationInventoryItemActionState = {
    success: boolean;
    message: string;
    createdCount?: number;
    fieldErrors?: {
        itemName?: string;
        buyPrice?: string;
        sellPrice?: string;
        quantity?: string;
    };
};

const initialState: CreateOrganizationInventoryItemActionState = {
    success: false,
    message: "",
    fieldErrors: {},
};

function parseNumber(value: FormDataEntryValue | null) {
    if (typeof value !== "string") return NaN;
    return Number(value);
}

type VariantInput = {
    uuid?: string;
    name: string;
    type?: string;
    description?: string;
    manufacturer?: string;
};

export async function createOrganizationInventoryItemAction(
    _prevState: CreateOrganizationInventoryItemActionState,
    formData: FormData
): Promise<CreateOrganizationInventoryItemActionState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const itemName = String(formData.get("itemName") ?? "").trim();
    const existingItemId = String(formData.get("existingItemId") ?? "").trim();
    const category = String(formData.get("category") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim();
    const itemClass = String(formData.get("itemClass") ?? "").trim() || undefined;
    const grade = String(formData.get("grade") ?? "").trim() || undefined;
    const size = String(formData.get("size") ?? "").trim() || undefined;

    const buyPrice = parseNumber(formData.get("buyPrice"));
    const sellPrice = parseNumber(formData.get("sellPrice"));
    const quantity = parseNumber(formData.get("quantity"));

    // Variants JSON (optional) – array of { name, type, description, manufacturer }
    const variantsJson = formData.get("variantsJson");
    const variants: VariantInput[] = variantsJson
        ? JSON.parse(String(variantsJson))
        : [];

    // --- Validation ---
    if (!organizationSlug) {
        return { ...initialState, message: "Missing organization." };
    }
    if (!itemName) {
        return {
            ...initialState,
            message: "Item name is required.",
            fieldErrors: { itemName: "Item name is required." },
        };
    }
    if (Number.isNaN(buyPrice) || buyPrice < 0) {
        return { ...initialState, message: "Buy price must be 0 or higher.", fieldErrors: { buyPrice: "Buy price must be 0 or higher." } };
    }
    if (Number.isNaN(sellPrice) || sellPrice < 0) {
        return { ...initialState, message: "Sell price must be 0 or higher.", fieldErrors: { sellPrice: "Sell price must be 0 or higher." } };
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
        return { ...initialState, message: "Quantity must be a whole number and 0 or higher.", fieldErrors: { quantity: "Quantity must be a whole number and 0 or higher." } };
    }

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { ...initialState, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session?.user?.id);
    if (!actor) return { ...initialState, message: "You are not a member of this organization." };
    if (!["owner", "admin"].includes(actor.role)) return { ...initialState, message: "Only owners or admins can manage inventory." };

    // --- Resolve base item ---
    let baseItem: ItemDocument | null;

    if (existingItemId) {
        baseItem = await getItemById(existingItemId);
        if (!baseItem) return { ...initialState, message: "Selected item could not be found." };
    } else {
        baseItem = await createItemInDb({ name: itemName, category, description, itemClass, grade, size });
    }

    // --- Build list of items to add: base + variants ---
    type ItemToAdd = {
        name: string;
        category?: string;
        description?: string;
        existingId?: string;
    };

    const itemsToAdd: ItemToAdd[] = [
        {
            name: baseItem.name,
            category: baseItem.category,
            description: baseItem.description,
            existingId: baseItem._id.toString(),
        },
        ...variants.map((v) => ({
            name: v.name,
            category: v.type ?? category,
            description: v.description,
        })),
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const itemInput of itemsToAdd) {
        let item: ItemDocument;

        if (itemInput.existingId) {
            item = baseItem; // already resolved
        } else {
            item = await createItemInDb({
                name: itemInput.name,
                category: itemInput.category,
                description: itemInput.description,
            });
        }

        const result = await createOrganizationInventoryItemInDb({
            organizationId: org._id,
            organizationSlug: org.slug,
            itemId: item._id,
            buyPrice,
            sellPrice,
            quantity,
        });

        if (result.alreadyExists) {
            skippedCount++;
            continue;
        }

        if (!result.document) continue;

        addedCount++;

        await createOrganizationAuditLog({
            organizationId: org._id,
            organizationSlug: org.slug,
            actorUserId: session.user.id,
            actorUsername: session.user.name ?? "Unknown User",
            action: "inventory.item_added",
            entityType: "inventory_item",
            entityId: result.document._id.toString(),
            message: `Item "${item.name}" was added to the organization inventory.`,
            metadata: {
                inventoryItemId: result.document._id.toString(),
                itemId: item._id.toString(),
                itemName: item.name,
                buyPrice,
                sellPrice,
                quantity,
            },
        });
    }

    revalidatePath(`/terminal/orgs/${org.slug}/items`);

    if (addedCount === 0 && skippedCount > 0) {
        return {
            success: false,
            message: `All ${skippedCount} item(s) are already in the inventory.`,
        };
    }

    const variantNote = variants.length > 0
        ? ` (${addedCount} added${skippedCount > 0 ? `, ${skippedCount} already existed` : ""})`
        : "";

    return {
        success: true,
        message: `"${baseItem.name}" added successfully.${variantNote}`,
        createdCount: addedCount,
    };
}