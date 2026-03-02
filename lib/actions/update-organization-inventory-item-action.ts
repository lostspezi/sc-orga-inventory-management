"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { updateOrganizationInventoryItemInDb } from "@/lib/repositories/organization-inventory-item-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

export type UpdateOrganizationInventoryItemActionState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        buyPrice?: string;
        sellPrice?: string;
        quantity?: string;
    };
};

const initialState: UpdateOrganizationInventoryItemActionState = {
    success: false,
    message: "",
    fieldErrors: {},
};

function parseNumber(value: FormDataEntryValue | null) {
    if (typeof value !== "string") return NaN;
    return Number(value);
}

function parseOptionalInt(value: FormDataEntryValue | null): number | undefined {
    if (!value || String(value).trim() === "") return undefined;
    const n = Math.round(Number(String(value).trim()));
    return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export async function updateOrganizationInventoryItemAction(
    _prevState: UpdateOrganizationInventoryItemActionState,
    formData: FormData
): Promise<UpdateOrganizationInventoryItemActionState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const inventoryItemId = String(formData.get("inventoryItemId") ?? "").trim();
    const itemName = String(formData.get("itemName") ?? "").trim();

    const buyPrice = parseNumber(formData.get("buyPrice"));
    const sellPrice = parseNumber(formData.get("sellPrice"));
    const quantity = parseNumber(formData.get("quantity"));
    const minStock = parseOptionalInt(formData.get("minStock"));
    const maxStock = parseOptionalInt(formData.get("maxStock"));

    if (!organizationSlug || !inventoryItemId) {
        return { ...initialState, message: "Missing organization or inventory item." };
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

    if (minStock !== undefined && maxStock !== undefined && minStock > maxStock) {
        return { ...initialState, message: "Min stock cannot be greater than max stock." };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return { ...initialState, message: "Organization not found." };
    }

    const actor = org.members.find((m) => m.userId === session.user!.id);

    if (!actor || !["owner", "admin"].includes(actor.role)) {
        return { ...initialState, message: "Only owners or admins can edit inventory items." };
    }

    const updated = await updateOrganizationInventoryItemInDb({
        inventoryItemId,
        organizationId: org._id,
        buyPrice,
        sellPrice,
        quantity,
        minStock,
        maxStock,
    });

    if (!updated) {
        return { ...initialState, message: "No changes were saved." };
    }

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown User",
        action: "inventory.item_updated" as never,
        entityType: "inventory_item",
        entityId: inventoryItemId,
        message: `Inventory values for "${itemName}" were updated.`,
        metadata: {
            buyPrice,
            sellPrice,
            quantity,
        },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/inventory`);

    return {
        success: true,
        message: "Inventory item updated successfully.",
        fieldErrors: {},
    };
}