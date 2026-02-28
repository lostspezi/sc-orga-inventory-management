"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getOrganizationInventoryItemDocumentById } from "@/lib/repositories/organization-inventory-item-repository";
import { getDb } from "@/lib/db";
import {
    createOrganizationTransaction,
    setTransactionDiscordMessage,
} from "@/lib/repositories/organization-transaction-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import type { ItemDocument } from "@/lib/types/item";
import { sendTransactionEmbed } from "@/lib/discord/send-transaction-embed";

export type CreateTransactionActionState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        inventoryItemId?: string;
        direction?: string;
        quantity?: string;
        pricePerUnit?: string;
    };
};

const initialState: CreateTransactionActionState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export async function createTransactionAction(
    _prevState: CreateTransactionActionState,
    formData: FormData
): Promise<CreateTransactionActionState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const inventoryItemId = String(formData.get("inventoryItemId") ?? "").trim();
    const direction = String(formData.get("direction") ?? "").trim();
    const quantityRaw = Number(formData.get("quantity"));
    const pricePerUnitRaw = Number(formData.get("pricePerUnit"));
    const note = String(formData.get("note") ?? "").trim() || undefined;

    if (!organizationSlug) {
        return { ...initialState, message: "Missing organization." };
    }

    if (!inventoryItemId || !ObjectId.isValid(inventoryItemId)) {
        return { ...initialState, message: "Please select an inventory item.", fieldErrors: { inventoryItemId: "Required." } };
    }

    if (direction !== "member_to_org" && direction !== "org_to_member") {
        return { ...initialState, message: "Please select a valid direction.", fieldErrors: { direction: "Required." } };
    }

    if (!Number.isInteger(quantityRaw) || quantityRaw < 1) {
        return { ...initialState, message: "Quantity must be a whole number greater than 0.", fieldErrors: { quantity: "Must be at least 1." } };
    }

    if (isNaN(pricePerUnitRaw) || pricePerUnitRaw < 0) {
        return { ...initialState, message: "Price per unit must be 0 or greater.", fieldErrors: { pricePerUnit: "Must be 0 or greater." } };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return { ...initialState, message: "Organization not found." };
    }

    const member = org.members.find((m) => m.userId === session.user!.id);

    if (!member) {
        return { ...initialState, message: "You are not a member of this organization." };
    }

    const invItem = await getOrganizationInventoryItemDocumentById(inventoryItemId);

    if (!invItem || !invItem.organizationId.equals(org._id)) {
        return { ...initialState, message: "Inventory item not found.", fieldErrors: { inventoryItemId: "Item not found." } };
    }

    const db = await getDb();
    const itemDoc = await db.collection<ItemDocument>("items").findOne({ _id: invItem.itemId });
    const itemName = itemDoc?.name ?? "Unknown Item";

    const totalPrice = quantityRaw * pricePerUnitRaw;

    const transaction = await createOrganizationTransaction({
        organizationId: org._id,
        organizationSlug: org.slug,
        inventoryItemId: invItem._id,
        itemId: invItem.itemId,
        itemName,
        direction: direction as "member_to_org" | "org_to_member",
        initiatedBy: member.role === "member" ? "member" : "admin",
        memberId: session.user.id,
        memberUsername: session.user.name ?? "Unknown",
        quantity: quantityRaw,
        pricePerUnit: pricePerUnitRaw,
        totalPrice,
        status: "requested",
        memberConfirmed: false,
        adminConfirmed: false,
        note,
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "transaction.requested",
        entityType: "transaction",
        entityId: transaction._id,
        message: `Transaction requested: ${direction === "member_to_org" ? "sell" : "buy"} ${quantityRaw}x "${itemName}" at ${pricePerUnitRaw} aUEC/unit.`,
        metadata: { direction, quantity: quantityRaw, pricePerUnit: pricePerUnitRaw, totalPrice },
    });

    if (org.discordTransactionChannelId) {
        const embedResult = await sendTransactionEmbed(org.discordTransactionChannelId, transaction);
        if (embedResult) {
            await setTransactionDiscordMessage(transaction._id, embedResult.channelId, embedResult.messageId);
        }
    }

    revalidatePath(`/terminal/orgs/${org.slug}/transactions`);
    revalidatePath(`/terminal/orgs/${org.slug}/inventory`);

    return { success: true, message: "Transaction request submitted." };
}
