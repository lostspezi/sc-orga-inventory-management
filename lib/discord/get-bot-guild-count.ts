import { REST, Routes } from "discord.js";

export async function getBotGuildCount(): Promise<number | null> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) return null;

    try {
        const rest = new REST({ version: "10" }).setToken(token);
        const guilds = await rest.get(Routes.userGuilds()) as unknown[];
        return guilds.length;
    } catch {
        return null;
    }
}
