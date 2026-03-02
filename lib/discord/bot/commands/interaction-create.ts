import type { Client } from "discord.js";
import { handleInviteSlashCommand } from "@/lib/discord/bot/slash-handlers/handle-invite-slash-command";
import {
    handleTradeAutocomplete,
    handleTradeSlashCommand,
} from "@/lib/discord/bot/slash-handlers/handle-trade-slash-command";
import { handleTransactionButton } from "@/lib/discord/bot/slash-handlers/handle-transaction-button";
import { handleInventorySlashCommand } from "@/lib/discord/bot/slash-handlers/handle-inventory-slash-command";
import { TX_BUTTON_PREFIX } from "@/lib/discord/send-transaction-embed";

export function registerInteractionCreateEvent(client: Client) {
    // Prevent duplicate listeners — can happen when Next.js hot-reloads the
    // layout module and the global flag falls out of sync with the client.
    if (client.listenerCount("interactionCreate") > 0) return;

    client.on("interactionCreate", async (interaction) => {
        try {
            if (interaction.isButton()) {
                if (interaction.customId.startsWith(TX_BUTTON_PREFIX)) {
                    await handleTransactionButton(interaction);
                }
                return;
            }

            if (interaction.isAutocomplete()) {
                if (["sell", "buy"].includes(interaction.commandName)) {
                    await handleTradeAutocomplete(interaction);
                }
                return;
            }

            if (!interaction.isChatInputCommand()) {
                return;
            }

            if (interaction.commandName === "invite") {
                await handleInviteSlashCommand(interaction);
            } else if (interaction.commandName === "sell" || interaction.commandName === "buy") {
                await handleTradeSlashCommand(interaction);
            } else if (interaction.commandName === "inventory") {
                await handleInventorySlashCommand(interaction);
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