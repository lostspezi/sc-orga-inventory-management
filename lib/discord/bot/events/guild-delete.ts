import type { Client } from "discord.js";
import { clearOrganizationDiscordGuildId } from "@/lib/repositories/organization-repository";

export function registerGuildDeleteEvent(client: Client) {
    client.on("guildDelete", async (guild) => {
        try {
            console.log("[discord-bot] Removed from guild", {
                guildId: guild.id,
                guildName: guild.name,
            });

            const clearedCount = await clearOrganizationDiscordGuildId(guild.id);

            console.log("[discord-bot] Cleared organization guild bindings", {
                guildId: guild.id,
                clearedCount,
            });
        } catch (error) {
            console.error("[discord-bot] guildDelete handler failed", {
                guildId: guild.id,
                error,
            });
        }
    });
}