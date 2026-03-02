import { EmbedBuilder } from "discord.js";
import { getDiscordBotClient } from "@/lib/discord/bot/client";

export async function sendLowStockAlert(
    channelId: string,
    itemName: string,
    currentQuantity: number,
    minStock: number
): Promise<void> {
    const client = getDiscordBotClient();

    let channel;
    try {
        channel = await client.channels.fetch(channelId);
    } catch {
        return;
    }

    if (!channel?.isTextBased() || !("send" in channel)) return;

    const embed = new EmbedBuilder()
        .setColor(0xfaa61a) // gold / warning
        .setTitle("⚠️ Low Stock Alert")
        .addFields(
            { name: "Item",     value: itemName,                  inline: false },
            { name: "Current",  value: currentQuantity.toString(), inline: true  },
            { name: "Minimum",  value: minStock.toString(),        inline: true  },
        )
        .setDescription("Stock has fallen below the configured minimum.")
        .setTimestamp();

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (channel as any).send({ embeds: [embed] });
    } catch {
        // best-effort
    }
}
