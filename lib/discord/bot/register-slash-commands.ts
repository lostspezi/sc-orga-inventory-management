import { REST, Routes } from "discord.js";
import { inviteCommand } from "@/lib/discord/bot/commands/invite";
import { sellCommand } from "@/lib/discord/bot/commands/sell";
import { buyCommand } from "@/lib/discord/bot/commands/buy";

export async function registerSlashCommands() {
    const token = process.env.DISCORD_BOT_TOKEN;
    const clientId = process.env.AUTH_DISCORD_ID;

    if (!token) {
        throw new Error("Missing DISCORD_BOT_TOKEN");
    }

    if (!clientId) {
        throw new Error("Missing AUTH_DISCORD_ID");
    }

    const commands = [
        inviteCommand.toJSON(),
        sellCommand.toJSON(),
        buyCommand.toJSON(),
    ];

    const rest = new REST({ version: "10" }).setToken(token);

    await rest.put(
        Routes.applicationCommands(clientId),
        { body: commands }
    );

    console.log("[discord-bot] Registered slash commands", {
        count: commands.length,
    });
}