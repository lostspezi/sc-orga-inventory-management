"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
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
import { notifyMany } from "@/lib/notify";
import { getDiscordUserId } from "@/lib/discord/get-discord-user-id";
import { getMemberDkp } from "@/lib/raid-helper/get-member-dkp";

export type CreateTransactionActionState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        inventoryItemId?: string;
        direction?: string;
        quantity?: string;
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

    if (direction === "org_to_member" && quantityRaw > invItem.quantity) {
        const t = await getTranslations("transactions");
        return {
            ...initialState,
            message: t("insufficientStock", { requested: quantityRaw, available: invItem.quantity }),
            fieldErrors: { quantity: t("onlyInStock", { count: invItem.quantity }) },
        };
    }

    const db = await getDb();
    const itemDoc = await db.collection<ItemDocument>("items").findOne({ _id: invItem.itemId });
    const itemName = itemDoc?.name ?? "Unknown Item";

    const pricePerUnit = direction === "member_to_org" ? invItem.sellPrice : invItem.buyPrice;
    const totalPrice = quantityRaw * pricePerUnit;

    // For buy transactions, check the member has enough DKP
    if (direction === "org_to_member" && org.raidHelperApiKey && org.discordGuildId) {
        const discordId = await getDiscordUserId(session.user.id);
        if (discordId) {
            const currentDkp = await getMemberDkp(org.discordGuildId, discordId, org.raidHelperApiKey);
            if (currentDkp !== null && totalPrice > currentDkp) {
                return {
                    ...initialState,
                    message: `Insufficient DKP. Required: ${totalPrice.toLocaleString()}, available: ${currentDkp.toLocaleString()}.`,
                };
            }
        }
    }

    const transaction = await createOrganizationTransaction({
        organizationId: org._id,
        organizationSlug: org.slug,
        inventoryItemId: invItem._id,
        itemId: invItem.itemId,
        itemName,
        direction: direction as "member_to_org" | "org_to_member",
        initiatedBy: member.role === "member" ? "member" : "admin",
        memberId: session.user.id,
        memberUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
        quantity: quantityRaw,
        pricePerUnit: pricePerUnit,
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
        actorUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
        action: "transaction.requested",
        entityType: "transaction",
        entityId: transaction._id,
        message: `Transaction requested: ${direction === "member_to_org" ? "sell" : "buy"} ${quantityRaw}x "${itemName}" at ${pricePerUnit} DKP/unit.`,
        metadata: { direction, quantity: quantityRaw, pricePerUnit: pricePerUnit, totalPrice },
    });

    // Notify relevant org members
    const txLink = `/terminal/orgs/${org.slug}/transactions`;
    const directionLabel = direction === "member_to_org" ? "sell" : "buy";
    if (member.role === "member") {
        // Member initiated → notify all admins/owners
        const adminIds = org.members
            .filter((m) => (m.role === "admin" || m.role === "owner") && m.userId !== session?.user?.id)
            .map((m) => m.userId);
        await notifyMany(
            adminIds,
            "trade.requested",
            "New Trade Request",
            `${session.user.rsiHandle ?? session.user.name ?? "A member"} wants to ${directionLabel} ${quantityRaw}x ${itemName}.`,
            txLink
        );
    } else {
        // Admin initiated → notify the member (themselves here, so skip — no self-notifications needed)
    }

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
