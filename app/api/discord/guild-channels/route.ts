import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getDiscordBotClient } from "@/lib/discord/bot/client";
import { ChannelType } from "discord.js";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get("orgSlug")?.trim() ?? "";

    if (!orgSlug) {
        return NextResponse.json({ message: "Missing orgSlug" }, { status: 400 });
    }

    const org = await getOrganizationBySlug(orgSlug);

    if (!org) {
        return NextResponse.json({ message: "Organization not found" }, { status: 404 });
    }

    const currentMember = org.members.find((m) => m.userId === session.user!.id);

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    if (!org.discordGuildId) {
        return NextResponse.json(
            { message: "No Discord server connected to this organization." },
            { status: 400 }
        );
    }

    try {
        const client = getDiscordBotClient();
        const guild = await client.guilds.fetch(org.discordGuildId);
        const channels = await guild.channels.fetch();

        const textChannels = channels
            .filter((ch) => ch !== null && ch.type === ChannelType.GuildText)
            .map((ch) => ({ id: ch!.id, name: ch!.name }))
            .sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json({ channels: textChannels }, { status: 200 });
    } catch (error) {
        console.error("[discord guild-channels] failed to fetch channels", {
            orgSlug,
            guildId: org.discordGuildId,
            error,
        });

        return NextResponse.json(
            { message: "Failed to load Discord channels. Make sure the bot is in the server." },
            { status: 500 }
        );
    }
}
