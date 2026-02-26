import type { Client } from "discord.js";
import { handleInviteSlashCommand } from "@/lib/discord/bot/slash-handlers/handle-invite-slash-command";

export function registerInteractionCreateEvent(client: Client) {
    client.on("interactionCreate", async (interaction) => {
        try {
            if (!interaction.isChatInputCommand()) {
                return;
            }

            if (interaction.commandName === "invite") {
                await handleInviteSlashCommand(interaction);
            }
        } catch (error) {
            console.error("[discord-bot] interactionCreate handler failed", {
                commandName: interaction.isChatInputCommand() ? interaction.commandName : undefined,
                error,
            });

            if (interaction.isRepliable() && !interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: "An unexpected error occurred while processing this command.",
                    ephemeral: true,
                });
            }
        }
    });
}