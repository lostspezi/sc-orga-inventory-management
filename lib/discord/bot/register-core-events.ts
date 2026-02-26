import type { Client } from "discord.js";
import { registerReadyEvent } from "@/lib/discord/bot/events/ready";
import { registerGuildCreateEvent } from "@/lib/discord/bot/events/guild-create";
import { registerGuildDeleteEvent } from "@/lib/discord/bot/events/guild-delete";
import {registerInteractionCreateEvent} from "@/lib/discord/bot/commands/interaction-create";

declare global {
    // eslint-disable-next-line no-var
    var __discordBotEventsRegistered: boolean | undefined;
}

export function registerCoreDiscordBotEvents(client: Client) {
    if (global.__discordBotEventsRegistered) {
        return;
    }

    registerReadyEvent(client);
    registerGuildCreateEvent(client);
    registerGuildDeleteEvent(client);
    registerInteractionCreateEvent(client);

    global.__discordBotEventsRegistered = true;
}