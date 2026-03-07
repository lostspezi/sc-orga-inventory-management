import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import {
    getOrCreateNewsSettings,
    recordNewsSettingsTest,
    toNewsSettingsView,
} from "@/lib/repositories/app-news-settings-repository";
import { EmbedBuilder } from "discord.js";
import { getDiscordBotClient } from "@/lib/discord/bot/client";

const TEST_COOLDOWN_MS = 30_000;

async function guardSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    if (!(await isSuperAdmin(session.user.id))) return null;
    return session;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(_req: NextRequest) {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const settings = await getOrCreateNewsSettings();

    if (!settings.discordChannelId || !settings.discordGuildId) {
        return NextResponse.json({ error: "Discord not configured" }, { status: 400 });
    }

    // Rate limit: 1 test per 30 seconds
    if (settings.lastTestPostedAt) {
        const elapsed = Date.now() - settings.lastTestPostedAt.getTime();
        if (elapsed < TEST_COOLDOWN_MS) {
            const remaining = Math.ceil((TEST_COOLDOWN_MS - elapsed) / 1000);
            return NextResponse.json({ error: `Rate limited. Try again in ${remaining}s.` }, { status: 429 });
        }
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scoim.io";

    try {
        const client = getDiscordBotClient();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const channel: any = await client.channels.fetch(settings.discordChannelId);
        if (!channel?.isTextBased?.()) throw new Error("Channel is not text-based");

        const embed = new EmbedBuilder()
            .setColor(0x4fc3dc)
            .setAuthor({ name: "SCOIM.io News", iconURL: `${appUrl}/favicon.ico` })
            .setTitle("Test Embed — Discord Integration Working ✅")
            .setDescription("This is a test message sent from the SCOIM.io News admin panel.\n\nIf you see this, your Discord channel is correctly configured.")
            .setFooter({ text: "SCOIM.io · News System Test" })
            .setTimestamp(new Date());

        await channel.send({ embeds: [embed] });
        await recordNewsSettingsTest("success");
    } catch (err) {
        const error = err instanceof Error ? err.message : "Unknown error";
        await recordNewsSettingsTest("failure", error);
        const doc = await getOrCreateNewsSettings();
        return NextResponse.json({ error, settings: toNewsSettingsView(doc) }, { status: 500 });
    }

    const doc = await getOrCreateNewsSettings();
    return NextResponse.json({ success: true, settings: toNewsSettingsView(doc) });
}
