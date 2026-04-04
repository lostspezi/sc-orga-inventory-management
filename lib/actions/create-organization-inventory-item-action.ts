"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { createOrganizationInventoryItemInDb } from "@/lib/repositories/organization-inventory-item-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { triggerGoogleSheetSync } from "@/lib/google-sheets/trigger-sync";

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
    const scWikiUuid = String(formData.get("scWikiUuid") ?? "").trim() || undefined;
    const category = String(formData.get("category") ?? "").trim() || undefined;
    const unit = String(formData.get("unit") ?? "").trim() || undefined;

    const buyPrice = parseNumber(formData.get("buyPrice"));
    const sellPrice = parseNumber(formData.get("sellPrice"));
    const quantity = parseNumber(formData.get("quantity"));

    const qualityRaw = formData.get("quality");
    const quality = qualityRaw ? parseInt(String(qualityRaw), 10) : undefined;

    const minStockRaw = formData.get("minStock");
    const maxStockRaw = formData.get("maxStock");
    const minStock = minStockRaw ? parseInt(String(minStockRaw), 10) : undefined;
    const maxStock = maxStockRaw ? parseInt(String(maxStockRaw), 10) : undefined;

    // Variants JSON (optional) – array of { name, type, uuid }
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

    // --- Build list of items to add: base + variants ---
    type ItemToAdd = {
        name: string;
        category?: string;
        scWikiUuid?: string;
    };

    const itemsToAdd: ItemToAdd[] = [
        { name: itemName, category, scWikiUuid },
        ...variants.map((v) => ({
            name: v.name,
            category: v.type || undefined,
            scWikiUuid: v.uuid,
        })),
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const itemInput of itemsToAdd) {
        const result = await createOrganizationInventoryItemInDb({
            organizationId: org._id,
            organizationSlug: org.slug,
            name: itemInput.name,
            category: itemInput.category,
            scWikiUuid: itemInput.scWikiUuid,
            buyPrice,
            sellPrice,
            quantity,
            quality,
            minStock,
            maxStock,
            unit,
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
            message: `Item "${itemInput.name}" was added to the organization inventory.`,
            metadata: {
                inventoryItemId: result.document._id.toString(),
                itemName: itemInput.name,
                buyPrice,
                sellPrice,
                quantity,
            },
        });
    }

    revalidatePath(`/terminal/orgs/${org.slug}/items`);

    if (addedCount > 0 && org.googleSheetId) {
        triggerGoogleSheetSync(org._id, org.googleSheetId);
    }

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
        message: `"${itemName}" added successfully.${variantNote}`,
        createdCount: addedCount,
    };
}
