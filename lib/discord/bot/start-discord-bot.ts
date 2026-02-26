import { getDiscordBotClient } from "@/lib/discord/bot/client";
import { registerCoreDiscordBotEvents } from "@/lib/discord/bot/register-core-events";

declare global {
    // eslint-disable-next-line no-var
    var __discordBotStarted: boolean | undefined;
}

export async function startDiscordBot() {
    if (global.__discordBotStarted) {
        return;
    }

    const token = process.env.DISCORD_BOT_TOKEN;

    if (!token) {
        console.warn("[discord-bot] DISCORD_BOT_TOKEN missing, bot not started");
        return;
    }

    const client = getDiscordBotClient();

    registerCoreDiscordBotEvents(client);

    if (!client.isReady()) {
        await client.login(token);
    }

    global.__discordBotStarted = true;
}