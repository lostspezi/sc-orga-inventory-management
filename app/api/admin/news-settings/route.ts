import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import {
    getOrCreateNewsSettings,
    saveNewsSettings,
    toNewsSettingsView,
} from "@/lib/repositories/app-news-settings-repository";

async function guardSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    if (!(await isSuperAdmin(session.user.id))) return null;
    return session;
}

export async function GET() {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const doc = await getOrCreateNewsSettings();
    return NextResponse.json(toNewsSettingsView(doc));
}

export async function POST(req: NextRequest) {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json() as {
        discordGuildId?: string;
        discordChannelId?: string;
        autoPostOnPublish?: boolean;
    };

    await saveNewsSettings({
        discordGuildId: body.discordGuildId ?? "",
        discordChannelId: body.discordChannelId ?? "",
        autoPostOnPublish: body.autoPostOnPublish ?? false,
    });

    const doc = await getOrCreateNewsSettings();
    return NextResponse.json(toNewsSettingsView(doc));
}
