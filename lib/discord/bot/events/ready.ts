import type { Client } from "discord.js";

export function registerReadyEvent(client: Client) {
    client.once("ready", (readyClient) => {
        console.log("[discord-bot] Ready", {
            userTag: readyClient.user.tag,
            guildCount: readyClient.guilds.cache.size,
        });
    });
}