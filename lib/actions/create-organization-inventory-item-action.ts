"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { createItemInDb, getItemById } from "@/lib/repositories/item-repository";
import { createOrganizationInventoryItemInDb } from "@/lib/repositories/organization-inventory-item-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import {ItemDocument} from "@/lib/types/item";

export type CreateOrganizationInventoryItemActionState = {
    success: boolean;
    message: string;
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

    const buyPrice = parseNumber(formData.get("buyPrice"));
    const sellPrice = parseNumber(formData.get("sellPrice"));
    const quantity = parseNumber(formData.get("quantity"));

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
        return {
            ...initialState,
            message: "Buy price must be 0 or higher.",
            fieldErrors: { buyPrice: "Buy price must be 0 or higher." },
        };
    }

    if (Number.isNaN(sellPrice) || sellPrice < 0) {
        return {
            ...initialState,
            message: "Sell price must be 0 or higher.",
            fieldErrors: { sellPrice: "Sell price must be 0 or higher." },
        };
    }

    if (!Number.isInteger(quantity) || quantity < 0) {
        return {
            ...initialState,
            message: "Quantity must be a whole number and 0 or higher.",
            fieldErrors: { quantity: "Quantity must be a whole number and 0 or higher." },
        };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return { ...initialState, message: "Organization not found." };
    }

    const actor = org.members.find((m) => m.userId === session?.user?.id);

    if (!actor) {
        return { ...initialState, message: "You are not a member of this organization." };
    }

    if (!["owner", "admin"].includes(actor.role)) {
        return { ...initialState, message: "Only owners or admins can manage inventory." };
    }

    let item: ItemDocument | null;
    let itemWasNew = false;

    if (existingItemId) {
        item = await getItemById(existingItemId);

        if (!item) {
            return { ...initialState, message: "Selected item could not be found." };
        }
    } else {
        item = await createItemInDb({
            name: itemName,
            category,
            description,
        });
        itemWasNew = true;
    }

    const createdInventoryItem = await createOrganizationInventoryItemInDb({
        organizationId: org._id,
        organizationSlug: org.slug,
        itemId: item._id,
        buyPrice,
        sellPrice,
        quantity,
    });

    if (createdInventoryItem.alreadyExists) {
        return {
            ...initialState,
            message: "This item is already part of the organization inventory.",
        };
    }

    if (!createdInventoryItem.document) {
        return {
            ...initialState,
            message: "Failed to add inventory item.",
        };
    }

    if (itemWasNew) {
        await createOrganizationAuditLog({
            organizationId: org._id,
            organizationSlug: org.slug,
            actorUserId: session.user.id,
            actorUsername: session.user.name ?? "Unknown User",
            action: "item.created",
            entityType: "item",
            entityId: item._id.toString(),
            message: `Item "${item.name}" was created.`,
            metadata: {
                itemId: item._id.toString(),
                itemName: item.name,
                category: item.category,
            },
        });
    }

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown User",
        action: "inventory.item_added",
        entityType: "inventory_item",
        entityId: createdInventoryItem.document._id.toString(),
        message: `Item "${item.name}" was added to the organization inventory.`,
        metadata: {
            inventoryItemId: createdInventoryItem.document._id.toString(),
            itemId: item._id.toString(),
            itemName: item.name,
            buyPrice,
            sellPrice,
            quantity,
        },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/items`);

    return {
        success: true,
        message: `Item "${item.name}" added successfully.`,
        fieldErrors: {},
    };
}