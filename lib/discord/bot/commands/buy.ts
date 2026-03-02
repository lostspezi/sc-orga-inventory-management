import { SlashCommandBuilder } from "discord.js";

export const buyCommand = new SlashCommandBuilder()
    .setName("buy")
    .setDescription("Request to buy an item from the organization")
    .addStringOption((option) =>
        option
            .setName("item")
            .setDescription("The inventory item to buy")
            .setRequired(true)
            .setAutocomplete(true)
    )
    .addIntegerOption((option) =>
        option
            .setName("quantity")
            .setDescription("How many units to buy")
            .setRequired(true)
            .setMinValue(1)
    )
    .addStringOption((option) =>
        option
            .setName("note")
            .setDescription("Optional note for this transaction")
            .setRequired(false)
    );
