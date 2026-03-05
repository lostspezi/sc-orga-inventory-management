"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    getTransactionById,
    getTransactionViewById,
    updateTransactionStatus,
} from "@/lib/repositories/organization-transaction-repository";
import { adjustOrganizationInventoryItemQuantity } from "@/lib/repositories/organization-inventory-item-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { updateTransactionEmbed } from "@/lib/discord/send-transaction-embed";
import { notify, notifyMany } from "@/lib/notify";
import { adjustUserAuecBalance } from "@/lib/repositories/user-repository";
import { adjustOrgAuecBalance } from "@/lib/repositories/organization-repository";
import { sendLowStockAlert } from "@/lib/discord/send-low-stock-alert";

export async function confirmTransactionAction(formData: FormData): Promise<void> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const transactionId = String(formData.get("transactionId") ?? "").trim();

    if (!transactionId) return;

    const tx = await getTransactionById(transactionId);

    if (!tx || tx.status !== "approved") return;

    const org = await getOrganizationBySlug(tx.organizationSlug);

    if (!org) return;

    const actor = org.members.find((m) => m.userId === session.user!.id);

    if (!actor) return;

    const isAdminOrOwner = actor.role === "owner" || actor.role === "admin";
    const isMemberParty = tx.memberId === session.user!.id;

    if (!isAdminOrOwner && !isMemberParty) return;

    const patch: { memberConfirmed?: boolean; adminConfirmed?: boolean; adminConfirmedByUsername?: string } = {};

    if (isAdminOrOwner && !tx.adminConfirmed) {
        patch.adminConfirmed = true;
        patch.adminConfirmedByUsername = session.user.rsiHandle ?? session.user.name ?? "Admin";
    } else if (isMemberParty && !tx.memberConfirmed) {
        patch.memberConfirmed = true;
    } else {
        return; // already confirmed by this side
    }

    const updatedMemberConfirmed = patch.memberConfirmed ?? tx.memberConfirmed;
    const updatedAdminConfirmed = patch.adminConfirmed ?? tx.adminConfirmed;

    if (updatedMemberConfirmed && updatedAdminConfirmed) {
        await updateTransactionStatus(transactionId, { ...patch, status: "completed" });

        // Adjust inventory: member_to_org = org gains stock; org_to_member = org loses stock
        const delta = tx.direction === "member_to_org" ? tx.quantity : -tx.quantity;
        const adjustment = await adjustOrganizationInventoryItemQuantity(tx.inventoryItemId, delta);

        // Low stock notification
        if (adjustment && adjustment.minStock != null && adjustment.newQuantity < adjustment.minStock) {
            const adminIds = org.members
                .filter((m) => m.role === "admin" || m.role === "owner")
                .map((m) => m.userId);
            await notifyMany(
                adminIds,
                "inventory.low_stock",
                "Low Stock Alert",
                `${tx.itemName} is below minimum stock (${adjustment.newQuantity}/${adjustment.minStock}).`,
                `/terminal/orgs/${tx.organizationSlug}/inventory`
            );
            if (org.discordTransactionChannelId) {
                await sendLowStockAlert(
                    org.discordTransactionChannelId,
                    tx.itemName,
                    adjustment.newQuantity,
                    adjustment.minStock
                );
            }
        }

        await createOrganizationAuditLog({
            organizationId: tx.organizationId,
            organizationSlug: tx.organizationSlug,
            actorUserId: session.user.id,
            actorUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
            action: "transaction.completed",
            entityType: "transaction",
            entityId: transactionId,
            message: `Transaction for "${tx.itemName}" completed. Inventory adjusted by ${delta > 0 ? "+" : ""}${delta}.`,
            metadata: { delta, direction: tx.direction, quantity: tx.quantity },
        });

        // Adjust member aUEC balance
        const auecDelta = tx.direction === "member_to_org" ? tx.totalPrice : -tx.totalPrice;
        await adjustUserAuecBalance(tx.memberId, auecDelta);
        // Adjust org aUEC pool (opposite direction)
        await adjustOrgAuecBalance(org._id, -auecDelta);
    } else {
        await updateTransactionStatus(transactionId, patch);

        await createOrganizationAuditLog({
            organizationId: tx.organizationId,
            organizationSlug: tx.organizationSlug,
            actorUserId: session.user.id,
            actorUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
            action: "transaction.confirmed",
            entityType: "transaction",
            entityId: transactionId,
            message: `${isAdminOrOwner ? "Admin" : "Member"} confirmed in-game trade for "${tx.itemName}". Waiting for other party.`,
        });
    }

    // Send notifications
    const txLink = `/terminal/orgs/${tx.organizationSlug}/transactions`;
    if (updatedMemberConfirmed && updatedAdminConfirmed) {
        // Trade completed — notify the member
        await notify(
            tx.memberId,
            "trade.completed",
            "Trade Completed",
            `Your trade for ${tx.itemName} is complete. Inventory has been updated.`,
            txLink
        );
    } else if (isAdminOrOwner) {
        // Admin confirmed, waiting for member
        if (tx.memberId !== session.user!.id) {
            await notify(
                tx.memberId,
                "trade.confirmed",
                "Admin Confirmed Trade",
                `An admin confirmed the in-game delivery for ${tx.itemName}. Awaiting your confirmation.`,
                txLink
            );
        }
    } else {
        // Member confirmed, waiting for admin
        const adminIds = org.members
            .filter((m) => (m.role === "admin" || m.role === "owner") && m.userId !== session.user!.id)
            .map((m) => m.userId);
        await notifyMany(
            adminIds,
            "trade.confirmed",
            "Member Confirmed Trade",
            `${session.user!.rsiHandle ?? session.user!.name ?? "A member"} confirmed in-game delivery for ${tx.itemName}. Awaiting admin confirmation.`,
            txLink
        );
    }

    if (tx.discordChannelId && tx.discordMessageId) {
        const updatedView = await getTransactionViewById(transactionId);
        if (updatedView) {
            await updateTransactionEmbed(tx.discordChannelId, tx.discordMessageId, updatedView);
        }
    }

    revalidatePath(`/terminal/orgs/${tx.organizationSlug}/transactions`);
    revalidatePath(`/terminal/orgs/${tx.organizationSlug}/inventory`);
}
