import { getDiscordBotClient } from "@/lib/discord/bot/client";
import { registerCoreDiscordBotEvents } from "@/lib/discord/bot/register-core-events";
import {registerSlashCommands} from "@/lib/discord/bot/register-slash-commands";
import { startReportingCron } from "@/lib/reporting/cron";

declare global {
     
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
        await registerSlashCommands();
    }

    global.__discordBotStarted = true;

    // Start weekly report cron (Monday 02:00 UTC)
    startReportingCron();
}