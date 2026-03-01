import { SlashCommandBuilder } from "discord.js";

export const inventoryCommand = new SlashCommandBuilder()
    .setName("inventory")
    .setDescription("View the organization's inventory")
    .addStringOption((option) =>
        option
            .setName("search")
            .setDescription("Filter items by name (optional)")
            .setRequired(false)
    );
