import { AutocompleteInteraction, ChatInputCommandInteraction, MessageFlagsBitField } from "discord.js";
import { getOrganizationByDiscordGuildId } from "@/lib/repositories/organization-repository";
import { getUserByDiscordAccountId } from "@/lib/repositories/auth-account-repository";
import {
    getOrganizationInventoryItemViewsByOrganizationId,
    getOrganizationInventoryItemDocumentById,
} from "@/lib/repositories/organization-inventory-item-repository";
import {
    createOrganizationTransaction,
    setTransactionDiscordMessage,
} from "@/lib/repositories/organization-transaction-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { getDb } from "@/lib/db";
import type { ItemDocument } from "@/lib/types/item";
import { sendTransactionEmbed } from "@/lib/discord/send-transaction-embed";
import { ObjectId } from "mongodb";

export async function handleTradeAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
    if (!interaction.guildId) {
        await interaction.respond([]);
        return;
    }

    const org = await getOrganizationByDiscordGuildId(interaction.guildId);
    if (!org) {
        await interaction.respond([]);
        return;
    }

    const items = await getOrganizationInventoryItemViewsByOrganizationId(org._id);
    const focused = interaction.options.getFocused().toLowerCase();

    const filtered = items
        .filter((item) => item.name.toLowerCase().includes(focused))
        .slice(0, 25)
        .map((item) => ({
            name: item.name,
            value: item.inventoryItemId.toString(),
        }));

    await interaction.respond(filtered);
}

export async function handleTradeSlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) {
        await interaction.reply({
            content: "This command can only be used inside a Discord server.",
            flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
    }

    const org = await getOrganizationByDiscordGuildId(interaction.guildId);
    if (!org) {
        await interaction.reply({
            content: "No organization is linked to this Discord server.",
            flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
    }

    const appUser = await getUserByDiscordAccountId(interaction.user.id);
    if (!appUser) {
        await interaction.reply({
            content: "Your Discord account is not linked to an application user.",
            flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
    }

    const member = org.members.find((m) => m.userId === appUser.id);
    if (!member) {
        await interaction.reply({
            content: "You are not a member of this organization.",
            flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
    }

    const inventoryItemId = interaction.options.getString("item", true);
    const quantity = interaction.options.getInteger("quantity", true);
    const pricePerUnit = interaction.options.getInteger("price", true);
    const note = interaction.options.getString("note") ?? undefined;

    if (!ObjectId.isValid(inventoryItemId)) {
        await interaction.reply({
            content: "Invalid item selected.",
            flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
    }

    const invDoc = await getOrganizationInventoryItemDocumentById(inventoryItemId);
    if (!invDoc || !invDoc.organizationId.equals(org._id)) {
        await interaction.reply({
            content: "That item was not found in this organization's inventory.",
            flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
    }

    const db = await getDb();
    const itemDoc = await db.collection<ItemDocument>("items").findOne({ _id: invDoc.itemId });
    const itemName = itemDoc?.name ?? "Unknown Item";

    const direction = interaction.commandName === "sell" ? "member_to_org" : "org_to_member";
    const totalPrice = quantity * pricePerUnit;

    const transaction = await createOrganizationTransaction({
        organizationId: org._id,
        organizationSlug: org.slug,
        inventoryItemId: invDoc._id,
        itemId: invDoc.itemId,
        itemName,
        direction,
        initiatedBy: member.role === "member" ? "member" : "admin",
        memberId: appUser.id,
        memberUsername: appUser.name ?? interaction.user.username,
        quantity,
        pricePerUnit,
        totalPrice,
        status: "requested",
        memberConfirmed: false,
        adminConfirmed: false,
        note,
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: appUser.id,
        actorUsername: appUser.name ?? interaction.user.username,
        action: "transaction.requested",
        entityType: "transaction",
        entityId: transaction._id,
        message: `Transaction requested via Discord /${interaction.commandName}: ${direction === "member_to_org" ? "sell" : "buy"} ${quantity}x "${itemName}" at ${pricePerUnit} aUEC/unit.`,
        metadata: {
            direction,
            quantity,
            pricePerUnit,
            totalPrice,
            source: "slash_command",
            commandName: interaction.commandName,
        },
    });

    if (org.discordTransactionChannelId) {
        const embedResult = await sendTransactionEmbed(org.discordTransactionChannelId, transaction);
        if (embedResult) {
            await setTransactionDiscordMessage(transaction._id, embedResult.channelId, embedResult.messageId);
        }
    }

    const verb = interaction.commandName === "sell" ? "sell" : "buy";
    await interaction.reply({
        content: `Transaction request submitted: ${verb} ${quantity}x "${itemName}" at ${pricePerUnit} aUEC/unit (total: ${totalPrice} aUEC).`,
        flags: MessageFlagsBitField.Flags.Ephemeral,
    });
}
