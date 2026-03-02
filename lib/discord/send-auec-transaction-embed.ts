import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
} from "discord.js";
import { getDiscordBotClient } from "@/lib/discord/bot/client";
import type { AuecTransactionView } from "@/lib/types/auec-transaction";

// ── Custom ID helpers ───────────────────────────────────────────────────────

export const AUEC_TX_BUTTON_PREFIX = "auec_";

export function makeAuecTxButtonId(action: "approve" | "reject" | "confirm" | "cancel", txId: string) {
    return `auec_${action}_${txId}`;
}

export function parseAuecTxButtonId(customId: string): { action: string; txId: string } | null {
    if (!customId.startsWith(AUEC_TX_BUTTON_PREFIX)) return null;
    const rest = customId.slice(AUEC_TX_BUTTON_PREFIX.length); // "approve_<id>"
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

function buildEmbed(tx: AuecTransactionView): EmbedBuilder {
    const isSell = tx.direction === "member_to_org";
    const directionLabel = isSell ? "Sell aUEC (member → org)" : "Buy aUEC (org → member)";
    const color = STATUS_COLORS[tx.status] ?? 0x95a5a6;

    const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle("aUEC Cash Desk Request")
        .addFields(
            { name: "Direction",     value: directionLabel,                               inline: false },
            { name: "aUEC Amount",   value: tx.auecAmount.toLocaleString(),               inline: true  },
            { name: "Total DKP",     value: tx.totalDkp.toLocaleString(),                 inline: true  },
            { name: "Requested by",  value: tx.memberUsername,                            inline: true  },
            { name: "Status",        value: STATUS_LABELS[tx.status] ?? tx.status,        inline: false },
        )
        .setTimestamp(new Date(tx.createdAt));

    if (tx.status === "approved" || tx.status === "completed") {
        embed.addFields(
            { name: "Member confirmed", value: tx.memberConfirmed ? "✅ Yes" : "⬜ Pending", inline: true },
            { name: "Admin confirmed",  value: tx.adminConfirmed  ? "✅ Yes" : "⬜ Pending", inline: true },
        );
    }

    if (tx.note) {
        embed.addFields({ name: "Note", value: tx.note, inline: false });
    }

    return embed;
}

function buildComponents(tx: AuecTransactionView): ActionRowBuilder<ButtonBuilder>[] {
    const id = tx._id;

    if (tx.status === "requested") {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(makeAuecTxButtonId("approve", id))
                .setLabel("Approve")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(makeAuecTxButtonId("reject", id))
                .setLabel("Reject")
                .setStyle(ButtonStyle.Danger),
            new ButtonBuilder()
                .setCustomId(makeAuecTxButtonId("cancel", id))
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Secondary),
        );
        return [row];
    }

    if (tx.status === "approved") {
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setCustomId(makeAuecTxButtonId("confirm", id))
                .setLabel("Confirm Trade")
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId(makeAuecTxButtonId("cancel", id))
                .setLabel("Cancel")
                .setStyle(ButtonStyle.Secondary),
        );
        return [row];
    }

    return []; // terminal states: no buttons
}

export function buildAuecTransactionMessagePayload(tx: AuecTransactionView) {
    return {
        embeds: [buildEmbed(tx)],
        components: buildComponents(tx),
    };
}

// ── Send / update ───────────────────────────────────────────────────────────

export async function sendAuecTransactionEmbed(
    channelId: string,
    tx: AuecTransactionView
): Promise<{ messageId: string; channelId: string } | null> {
    const client = getDiscordBotClient();

    let channel;
    try {
        channel = await client.channels.fetch(channelId);
    } catch {
        return null;
    }

    if (!channel?.isTextBased() || !("send" in channel)) return null;

    try {
        const payload = buildAuecTransactionMessagePayload(tx);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = await (channel as any).send(payload);
        return { messageId: message.id, channelId };
    } catch {
        return null;
    }
}

export async function updateAuecTransactionEmbed(
    channelId: string,
    messageId: string,
    tx: AuecTransactionView
): Promise<void> {
    const client = getDiscordBotClient();

    try {
        const channel = await client.channels.fetch(channelId);
        if (!channel?.isTextBased() || !("messages" in channel)) return;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = await (channel as any).messages.fetch(messageId);
        await message.edit(buildAuecTransactionMessagePayload(tx));
    } catch {
        // Silent fail — embed update is best-effort
    }
}
