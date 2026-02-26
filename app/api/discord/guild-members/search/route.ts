import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { searchGuildMembers } from "@/lib/discord/get-guild-members";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json(
            { message: "Unauthorized" },
            { status: 401 }
        );
    }

    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get("orgSlug")?.trim() ?? "";
    const query = searchParams.get("q")?.trim() ?? "";

    if (!orgSlug) {
        return NextResponse.json(
            { message: "Missing orgSlug" },
            { status: 400 }
        );
    }

    if (!query) {
        return NextResponse.json({ results: [] }, { status: 200 });
    }

    const org = await getOrganizationBySlug(orgSlug);

    if (!org) {
        return NextResponse.json(
            { message: "Organization not found" },
            { status: 404 }
        );
    }

    const currentMember = org.members.find((m) => m.userId === session.user!.id);

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        return NextResponse.json(
            { message: "Forbidden" },
            { status: 403 }
        );
    }

    if (!org.discordGuildId?.trim()) {
        return NextResponse.json(
            {
                message:
                    "Discord invites are only available after the bot has been connected to a Discord server for this organization.",
                results: [],
            },
            { status: 400 }
        );
    }

    try {
        const results = await searchGuildMembers(org.discordGuildId, query, 10);

        return NextResponse.json({ results }, { status: 200 });
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        console.error("[discord guild member search] failed", {
            orgSlug,
            guildId: org.discordGuildId,
            query,
            errorMessage,
            error,
        });

        return NextResponse.json(
            {
                message:
                    "Failed to load Discord members. Make sure the bot is in the server and the GUILD_MEMBERS intent is enabled.",
                results: [],
            },
            { status: 500 }
        );
    }
}