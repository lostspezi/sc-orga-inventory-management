import { ButtonInteraction, MessageFlagsBitField } from "discord.js";
import { parseTxButtonId, buildTransactionMessagePayload, updateTransactionEmbed } from "@/lib/discord/send-transaction-embed";
import { getOrganizationByDiscordGuildId } from "@/lib/repositories/organization-repository";
import { getUserByDiscordAccountId } from "@/lib/repositories/auth-account-repository";
import {
    getTransactionById,
    getTransactionViewById,
    updateTransactionStatus,
    setTransactionDiscordMessage,
} from "@/lib/repositories/organization-transaction-repository";
import { adjustOrganizationInventoryItemQuantity } from "@/lib/repositories/organization-inventory-item-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

export async function handleTransactionButton(interaction: ButtonInteraction): Promise<void> {
    // Acknowledge immediately — must happen within 3 s
    await interaction.deferUpdate();

    const parsed = parseTxButtonId(interaction.customId);
    if (!parsed) return;
    const { action, txId } = parsed;

    if (!interaction.guildId) {
        await interaction.followUp({ content: "This button can only be used inside a Discord server.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const org = await getOrganizationByDiscordGuildId(interaction.guildId);
    if (!org) {
        await interaction.followUp({ content: "No organization is linked to this Discord server.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const appUser = await getUserByDiscordAccountId(interaction.user.id);
    if (!appUser) {
        await interaction.followUp({ content: "Your Discord account is not linked to an application user.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const member = org.members.find((m) => m.userId === appUser.id);
    if (!member) {
        await interaction.followUp({ content: "You are not a member of this organization.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const tx = await getTransactionById(txId);
    if (!tx || !tx.organizationId.equals(org._id)) {
        await interaction.followUp({ content: "Transaction not found.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const isAdminOrOwner = member.role === "owner" || member.role === "admin";
    const isMemberParty = tx.memberId === appUser.id;

    // ── approve ──────────────────────────────────────────────────────────────
    if (action === "approve") {
        if (!isAdminOrOwner) {
            await interaction.followUp({ content: "Only admins and owners can approve transactions.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }
        if (tx.status !== "requested") {
            await interaction.followUp({ content: "This transaction can no longer be approved.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        await updateTransactionStatus(txId, { status: "approved" });

        await createOrganizationAuditLog({
            organizationId: tx.organizationId,
            organizationSlug: tx.organizationSlug,
            actorUserId: appUser.id,
            actorUsername: appUser.name ?? interaction.user.username,
            action: "transaction.approved",
            entityType: "transaction",
            entityId: txId,
            message: `Transaction for "${tx.itemName}" approved via Discord.`,
        });

        await refreshEmbed(interaction, txId);
        await interaction.followUp({ content: `Transaction approved: ${tx.itemName}.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    // ── reject ───────────────────────────────────────────────────────────────
    if (action === "reject") {
        if (!isAdminOrOwner) {
            await interaction.followUp({ content: "Only admins and owners can reject transactions.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }
        if (tx.status !== "requested") {
            await interaction.followUp({ content: "This transaction can no longer be rejected.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        await updateTransactionStatus(txId, { status: "rejected" });

        await createOrganizationAuditLog({
            organizationId: tx.organizationId,
            organizationSlug: tx.organizationSlug,
            actorUserId: appUser.id,
            actorUsername: appUser.name ?? interaction.user.username,
            action: "transaction.rejected",
            entityType: "transaction",
            entityId: txId,
            message: `Transaction for "${tx.itemName}" rejected via Discord.`,
        });

        await refreshEmbed(interaction, txId);
        await interaction.followUp({ content: `Transaction rejected: ${tx.itemName}.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    // ── cancel ───────────────────────────────────────────────────────────────
    if (action === "cancel") {
        if (!isAdminOrOwner && !isMemberParty) {
            await interaction.followUp({ content: "You do not have permission to cancel this transaction.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }
        if (tx.status !== "requested" && tx.status !== "approved") {
            await interaction.followUp({ content: "This transaction can no longer be cancelled.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        await updateTransactionStatus(txId, { status: "cancelled" });

        await createOrganizationAuditLog({
            organizationId: tx.organizationId,
            organizationSlug: tx.organizationSlug,
            actorUserId: appUser.id,
            actorUsername: appUser.name ?? interaction.user.username,
            action: "transaction.cancelled",
            entityType: "transaction",
            entityId: txId,
            message: `Transaction for "${tx.itemName}" cancelled via Discord by ${isAdminOrOwner ? "admin" : "member"}.`,
        });

        await refreshEmbed(interaction, txId);
        await interaction.followUp({ content: `Transaction cancelled: ${tx.itemName}.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    // ── confirm ──────────────────────────────────────────────────────────────
    if (action === "confirm") {
        if (!isAdminOrOwner && !isMemberParty) {
            await interaction.followUp({ content: "You are not a party to this transaction.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }
        if (tx.status !== "approved") {
            await interaction.followUp({ content: "This transaction must be approved before it can be confirmed.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        const patch: { memberConfirmed?: boolean; adminConfirmed?: boolean } = {};

        if (isAdminOrOwner && !tx.adminConfirmed) {
            patch.adminConfirmed = true;
        } else if (isMemberParty && !tx.memberConfirmed) {
            patch.memberConfirmed = true;
        } else {
            await interaction.followUp({ content: "You have already confirmed this transaction.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        const updatedMemberConfirmed = patch.memberConfirmed ?? tx.memberConfirmed;
        const updatedAdminConfirmed  = patch.adminConfirmed  ?? tx.adminConfirmed;

        if (updatedMemberConfirmed && updatedAdminConfirmed) {
            await updateTransactionStatus(txId, { ...patch, status: "completed" });

            const delta = tx.direction === "member_to_org" ? tx.quantity : -tx.quantity;
            await adjustOrganizationInventoryItemQuantity(tx.inventoryItemId, delta);

            await createOrganizationAuditLog({
                organizationId: tx.organizationId,
                organizationSlug: tx.organizationSlug,
                actorUserId: appUser.id,
                actorUsername: appUser.name ?? interaction.user.username,
                action: "transaction.completed",
                entityType: "transaction",
                entityId: txId,
                message: `Transaction for "${tx.itemName}" completed via Discord. Inventory adjusted by ${delta > 0 ? "+" : ""}${delta}.`,
                metadata: { delta, direction: tx.direction, quantity: tx.quantity },
            });

            await refreshEmbed(interaction, txId);
            await interaction.followUp({ content: `Transaction completed: ${tx.itemName}. Inventory updated.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        } else {
            await updateTransactionStatus(txId, patch);

            await createOrganizationAuditLog({
                organizationId: tx.organizationId,
                organizationSlug: tx.organizationSlug,
                actorUserId: appUser.id,
                actorUsername: appUser.name ?? interaction.user.username,
                action: "transaction.confirmed",
                entityType: "transaction",
                entityId: txId,
                message: `${isAdminOrOwner ? "Admin" : "Member"} confirmed in-game trade for "${tx.itemName}" via Discord. Waiting for other party.`,
            });

            await refreshEmbed(interaction, txId);
            await interaction.followUp({ content: `Confirmed. Waiting for the other party to confirm.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        }
        return;
    }
}

// Fetches the updated transaction view and edits the button interaction's original message.
async function refreshEmbed(interaction: ButtonInteraction, txId: string): Promise<void> {
    const updatedView = await getTransactionViewById(txId);
    if (!updatedView) return;

    const payload = buildTransactionMessagePayload(updatedView);
    try {
        await interaction.editReply({ embeds: payload.embeds, components: payload.components });
    } catch {
        // If editing the reply fails (e.g. message deleted), try updating via channel
        if (updatedView.discordChannelId && updatedView.discordMessageId) {
            await updateTransactionEmbed(updatedView.discordChannelId, updatedView.discordMessageId, updatedView);
        }
    }

    // Also save message coordinates if not already stored (shouldn't be needed but as safety)
    if (!updatedView.discordMessageId && interaction.message) {
        await setTransactionDiscordMessage(txId, interaction.channelId, interaction.message.id);
    }
}
