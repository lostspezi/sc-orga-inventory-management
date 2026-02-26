import { DiscordAPIError } from "discord.js";
import { getDiscordBotClient } from "@/lib/discord/bot/client";

export async function sendDiscordDm(discordUserId: string, content: string) {
    try {
        const client = getDiscordBotClient();
        const user = await client.users.fetch(discordUserId);
        await user.send(content);
    } catch (error) {
        if (error instanceof DiscordAPIError) {
            console.error("[sendDiscordDm] Discord API error", {
                discordUserId,
                code: error.code,
                status: error.status,
                message: error.message,
            });
        } else {
            console.error("[sendDiscordDm] Unknown error", {
                discordUserId,
                error,
            });
        }

        throw error;
    }
}