import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import {
    getAppNewsById,
    setAppNewsStatus,
    setAppNewsDiscord,
    setAppNewsDiscordFailure,
    toAppNewsView,
} from "@/lib/repositories/app-news-repository";
import { getOrCreateNewsSettings } from "@/lib/repositories/app-news-settings-repository";
import { sendOrUpdateNewsEmbed } from "@/lib/discord/send-news-embed";

async function guardSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    if (!(await isSuperAdmin(session.user.id))) return null;
    return session;
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const doc = await getAppNewsById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (doc.status === "published") {
        return NextResponse.json({ error: "Already published" }, { status: 409 });
    }

    const body = await req.json().catch(() => ({})) as { postToDiscord?: boolean };

    const now = new Date();
    await setAppNewsStatus(id, "published", { publishedAt: doc.publishedAt ?? now });

    const settings = await getOrCreateNewsSettings();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scoim.io";

    let discordWarning: string | undefined;

    if (body.postToDiscord && settings.discordChannelId && settings.discordGuildId) {
        try {
            const publishedDoc = await getAppNewsById(id);
            const view = toAppNewsView(publishedDoc!);
            // Override publishedAt in view for embed
            const embedView = { ...view, publishedAt: now.toISOString() };
            const result = await sendOrUpdateNewsEmbed(embedView, settings, appUrl);
            await setAppNewsDiscord(id, result);
        } catch (err) {
            const reason = err instanceof Error ? err.message : "Unknown error";
            await setAppNewsDiscordFailure(id, reason);
            discordWarning = reason;
        }
    }

    const updated = await getAppNewsById(id);
    return NextResponse.json({ ...toAppNewsView(updated!), discordWarning });
}
