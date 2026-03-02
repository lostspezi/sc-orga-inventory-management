import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
    getOrganizationBySlug,
    getOrganizationByDiscordGuildId,
    setOrganizationDiscordGuildId,
} from "@/lib/repositories/organization-repository";

export const runtime = "nodejs";

function redirectTo(path: string, req: Request) {
    const baseUrl =
        process.env.AUTH_URL ||
        process.env.NEXTAUTH_URL ||
        process.env.NEXT_PUBLIC_APP_URL ||
        (() => {
            const proto = req.headers.get("x-forwarded-proto") ?? "https";
            const host =
                req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "scoim.io";
            return `${proto}://${host}`;
        })();

    return NextResponse.redirect(new URL(path, baseUrl));
}

export async function GET(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return redirectTo("/login", req);
    }

    const { searchParams } = new URL(req.url);
    const orgSlug = searchParams.get("state")?.trim() ?? "";
    const guildId = searchParams.get("guild_id")?.trim() ?? "";

    if (!orgSlug) {
        return redirectTo("/terminal?discordInstall=missing_state", req);
    }

    if (!guildId) {
        return redirectTo(`/terminal/orgs/${orgSlug}/settings?discordInstall=missing_guild`, req);
    }

    const org = await getOrganizationBySlug(orgSlug);

    if (!org) {
        return redirectTo("/terminal?discordInstall=org_not_found", req);
    }

    const currentMember = org.members.find((m) => m.userId === session.user!.id);

    if (!currentMember || !["owner", "admin"].includes(currentMember.role)) {
        return redirectTo(`/terminal/orgs/${orgSlug}/settings?discordInstall=forbidden`, req);
    }

    const existingOrg = await getOrganizationByDiscordGuildId(guildId);
    if (existingOrg && existingOrg.slug !== orgSlug) {
        return redirectTo(`/terminal/orgs/${orgSlug}/settings?discordInstall=guild_already_connected`, req);
    }

    await setOrganizationDiscordGuildId(orgSlug, guildId);

    return redirectTo(`/terminal/orgs/${orgSlug}/settings?discordInstall=success`, req);
}