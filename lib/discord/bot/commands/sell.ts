import { SlashCommandBuilder } from "discord.js";

export const sellCommand = new SlashCommandBuilder()
    .setName("sell")
    .setDescription("Request to sell an item to the organization")
    .addStringOption((option) =>
        option
            .setName("item")
            .setDescription("The inventory item to sell")
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("quantity")
            .setDescription("How many units to sell")
            .setRequired(true)
            .setMinValue(1)
    )
    .addStringOption((option) =>
        option
            .setName("note")
            .setDescription("Optional note for this transaction")
            .setRequired(false)
    );
