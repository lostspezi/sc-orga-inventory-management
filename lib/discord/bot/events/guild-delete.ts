import type {Client} from "discord.js";
import {
    clearOrganizationDiscordGuildId,
    getOrganizationsByDiscordGuildId,
} from "@/lib/repositories/organization-repository";
import {createOrganizationAuditLog} from "@/lib/repositories/organization-audit-log-repository";

export function registerGuildDeleteEvent(client: Client) {
    client.on("guildDelete", async (guild) => {
        try {
            console.log("[discord-bot] Removed from guild", {
                guildId: guild.id,
                guildName: guild.name,
            });

            const affectedOrganizations = await getOrganizationsByDiscordGuildId(guild.id);

            const clearedCount = await clearOrganizationDiscordGuildId(guild.id);

            for (const org of affectedOrganizations) {
                try {
                    await createOrganizationAuditLog({
                        organizationId: org._id,
                        organizationSlug: org.slug,
                        actorUserId: "system",
                        actorUsername: "Discord Bot",
                        action: "integration.discord_disconnected",
                        entityType: "organization",
                        entityId: org._id.toString(),
                        message: `Discord server connection was removed because the bot left or was removed from guild "${guild.name}".`,
                        metadata: {
                            discordGuildId: guild.id,
                            discordGuildName: guild.name,
                            reason: "guild_delete_event",
                        },
                    });
                } catch (error) {
                    console.error("[discord-bot] Failed to create audit log", {
                        organizationSlug: org.slug,
                        guildId: guild.id,
                        error,
                    });
                }
            }

            console.log("[discord-bot] Cleared organization guild bindings", {
                guildId: guild.id,
                clearedCount,
                affectedOrganizations: affectedOrganizations.length,
            });
        } catch (error) {
            console.error("[discord-bot] guildDelete handler failed", {
                guildId: guild.id,
                error,
            });
        }
    });
}