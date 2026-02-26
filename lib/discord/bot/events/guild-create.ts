import type { Client } from "discord.js";

export function registerGuildCreateEvent(client: Client) {
    client.on("guildCreate", async (guild) => {
        try {
            console.log("[discord-bot] Joined guild", {
                guildId: guild.id,
                guildName: guild.name,
                memberCount: guild.memberCount,
            });

            // Optional später:
            // - owner informieren
            // - setup channel suchen
            // - pending install flow vervollständigen
        } catch (error) {
            console.error("[discord-bot] guildCreate handler failed", {
                guildId: guild.id,
                error,
            });
        }
    });
}