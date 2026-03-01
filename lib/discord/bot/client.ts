import { Client, GatewayIntentBits } from "discord.js";

declare global {
     
    var __discordBotClient: Client | undefined;
}

export function getDiscordBotClient() {
    if (!global.__discordBotClient) {
        global.__discordBotClient = new Client({
            intents: [
                GatewayIntentBits.Guilds,
            ],
        });
    }

    return global.__discordBotClient;
}