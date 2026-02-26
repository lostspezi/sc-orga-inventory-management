import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug, setOrganizationDiscordGuildId } from "@/lib/repositories/organization-repository";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    const { searchParams } = new URL(req.url);

    const orgSlug = searchParams.get("state")?.trim() ?? "";
    const guildId = searchParams.get("guild_id")?.trim() ?? "";

    if (!orgSlug) {
        return NextResponse.redirect(
            new URL("/terminal?discordInstall=missing_state", req.url)
        );
    }

    if (!guildId) {
        return NextResponse.redirect(
            new URL(`/terminal/orgs/${orgSlug}/members?discordInstall=missing_guild`, req.url)
        );
    }

    const org = await getOrganizationBySlug(orgSlug);

    if (!org) {
        return NextResponse.redirect(new URL("/terminal?discordInstall=org_not_found", req.url));
    }

    const currentMember = org.members.find((m) => m.userId === session.user!.id);

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        return NextResponse.redirect(
            new URL(`/terminal/orgs/${orgSlug}/members?discordInstall=forbidden`, req.url)
        );
    }

    await setOrganizationDiscordGuildId(orgSlug, guildId);

    return NextResponse.redirect(
        new URL(`/terminal/orgs/${orgSlug}/members?discordInstall=success`, req.url)
    );
}