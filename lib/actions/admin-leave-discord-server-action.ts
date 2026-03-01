"use server";

import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { REST, Routes } from "discord.js";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { clearOrganizationDiscordGuildId } from "@/lib/repositories/organization-repository";

type Result = { success: boolean; message: string };

export async function adminLeaveDiscordServerAction(guildId: string): Promise<Result> {
    const session = await auth();

    if (!session?.user?.id || !(await isSuperAdmin(session.user.id))) {
        notFound();
    }

    if (!guildId) {
        return { success: false, message: "Missing guild ID." };
    }

    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
        return { success: false, message: "Bot token not configured." };
    }

    const rest = new REST({ version: "10" }).setToken(token);

    try {
        await rest.delete(Routes.userGuild(guildId));
    } catch {
        return { success: false, message: "Failed to leave server. The bot may have already left." };
    }

    // Clean up any org associations with this Discord server
    await clearOrganizationDiscordGuildId(guildId);

    revalidatePath("/terminal/admin/discord-servers");

    return { success: true, message: "Bot left the server successfully." };
}
