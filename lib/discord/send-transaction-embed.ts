import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { getDiscordBotClient } from "@/lib/discord/bot/client";
import type { OrganizationTransactionView } from "@/lib/types/transaction";

// ── Custom ID helpers ───────────────────────────────────────────────────────

export const TX_BUTTON_PREFIX = "tx_";

export function makeTxButtonId(action: "approve" | "reject" | "confirm" | "cancel", txId: string) {
    return `tx_${action}_${txId}`;
}

export function parseTxButtonId(customId: string): { action: string; txId: string } | null {
    if (!customId.startsWith(TX_BUTTON_PREFIX)) return null;
    const rest = customId.slice(TX_BUTTON_PREFIX.length); // "approve_<id>"
    const sep = rest.indexOf("_");
    if (sep === -1) return null;
    return { action: rest.slice(0, sep), txId: rest.slice(sep + 1) };
}

// ── Embed / component builders ──────────────────────────────────────────────

const STATUS_COLORS: Record<string, number> = {
    requested:  0xfaa61a, // gold
    approved:   0x5865f2, // blurple
    completed:  0x57f287, // green
    rejected:   0xed4245, // red
    cancelled:  0x95a5a6, // grey
};

const STATUS_LABELS: Record<string, string> = {
    requested:  "🟡 Requested",
    approved:   "🔵 Approved — awaiting confirmations",
    completed:  "✅ Completed",
    rejected:   "❌ Rejected",
    cancelled:  "⛔ Cancelled",
};

function buildEmbed(tx: OrganizationTransactionView): EmbedBuilder {
    const isSell = tx.direction === "member_to_org";
    const directionLabel = isSell ? "Sell (member → org)" : "Buy (org → member)";
    const color = STATUS_COLORS[tx.status] ?? 0x95a5a6;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle("Transaction Request")
        .addFields(
            { name: "Item",       value: tx.itemName,                          inline: false },
            { name: "Direction",  value: directionLabel,                       inline: true  },
            { name: "Quantity",   value: tx.quantity.toString(),               inline: true  },
            { name: "Price/Unit", value: `${tx.pricePerUnit.toLocaleString()} aUEC`, inline: true  },
            { name: "Total",      value: `${tx.totalPrice.toLocaleString()} aUEC`,  inline: true  },
            { name: "Requested by", value: tx.memberUsername,                  inline: true  },
            { name: "Status",     value: STATUS_LABELS[tx.status] ?? tx.status, inline: false },
        )
        .setTimestamp(new Date(tx.createdAt));

    if (tx.status === "approved" || tx.status === "completed") {
        embed.addFields(
            { name: "Member confirmed",  value: tx.memberConfirmed ? "✅ Yes" : "⬜ Pending", inline: true },
            { name: "Admin confirmed",   value: tx.adminConfirmed  ? "✅ Yes" : "⬜ Pending", inline: true },
        );
    }

    if (tx.note) {
        embed.addFields({ name: "Note", value: tx.note, inline: false });
    }

    return embed;
}

function buildComponents(tx: OrganizationTransactionView): ActionRowBuilder<ButtonBuilder>[] {
    const id = tx._id;

    if (tx.status === "requested") {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(makeTxButtonId("approve", id))
                .setLabel("Approve")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(makeTxButtonId("reject", id))
                .setLabel("Reject")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(makeTxButtonId("cancel", id))
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Secondary),
        );
        return [row];
    }

    if (tx.status === "approved") {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(makeTxButtonId("confirm", id))
                .setLabel("Confirm Trade")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(makeTxButtonId("cancel", id))
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Secondary),
        );
        return [row];
    }

    return []; // terminal states: no buttons
}

export function buildTransactionMessagePayload(tx: OrganizationTransactionView) {
    return {
        embeds: [buildEmbed(tx)],
        components: buildComponents(tx),
    };
}

// ── Send / update ───────────────────────────────────────────────────────────

export async function sendTransactionEmbed(
    channelId: string,
    tx: OrganizationTransactionView
): Promise<{ messageId: string; channelId: string } | null> {
    const client = getDiscordBotClient();

    let channel;
    try {
        channel = await client.channels.fetch(channelId);
    } catch {
        return null;
    }

    if (!channel?.isTextBased()) return null;

    try {
        const payload = buildTransactionMessagePayload(tx);
        const message = await channel.send(payload);
        return { messageId: message.id, channelId };
    } catch {
        return null;
    }
}

export async function updateTransactionEmbed(
    channelId: string,
    messageId: string,
    tx: OrganizationTransactionView
): Promise<void> {
    const client = getDiscordBotClient();

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel?.isTextBased()) return;

        const message = await channel.messages.fetch(messageId);
        await message.edit(buildTransactionMessagePayload(tx));
    } catch {
        // Silent fail — embed update is best-effort
    }
}
