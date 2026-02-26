import { SlashCommandBuilder } from "discord.js";

export const inviteCommand = new SlashCommandBuilder()
    .setName("invite")
    .setDescription("Invite a user to this organization")
    .addUserOption((option) =>
        option
            .setName("user")
            .setDescription("The Discord user to invite")
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName("role")
            .setDescription("The organization role to assign")
            .setRequired(false)
            .addChoices(
                { name: "Member", value: "member" },
                { name: "Admin", value: "admin" }
            )
    );