const DISCORD_API_BASE = "https://discord.com/api/v10";

type DiscordUser = {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
};

type DiscordGuildMember = {
    user: DiscordUser;
    nick?: string | null;
};

export type DiscordGuildMemberOption = {
    userId: string;
    username: string;
    globalName?: string;
    nickname?: string;
    displayLabel: string;
    avatarUrl?: string;
};

async function discordApi<T>(path: string, init?: RequestInit): Promise<T> {
    const token = process.env.DISCORD_BOT_TOKEN;

    if (!token) {
        throw new Error("Missing DISCORD_BOT_TOKEN");
    }

    const res = await fetch(`${DISCORD_API_BASE}${path}`, {
        ...init,
        headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
            ...(init?.headers ?? {}),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();

        console.error("[discordApi] Request failed", {
            path,
            method: init?.method ?? "GET",
            status: res.status,
            response: text,
        });

        throw new Error(`Discord API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
}

function buildAvatarUrl(user: DiscordUser) {
    if (!user.avatar) return undefined;
    return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
}

function buildDisplayLabel(member: DiscordGuildMember) {
    const primary = member.nick || member.user.global_name || member.user.username;
    const secondary = member.user.username;

    if (primary === secondary) return primary;
    return `${primary} (${secondary})`;
}

export async function searchGuildMembers(
    guildId: string,
    query: string,
    limit = 10
): Promise<DiscordGuildMemberOption[]> {
    const trimmed = query.trim();

    if (!guildId || !trimmed) {
        return [];
    }

    // Discord supports a search query and a limit up to 1000;
    // we intentionally keep it at max 10 for the UI.
    const params = new URLSearchParams({
        query: trimmed,
        limit: String(Math.min(Math.max(limit, 1), 10)),
    });

    const members = await discordApi<DiscordGuildMember[]>(
        `/guilds/${guildId}/members/search?${params.toString()}`
    );

    return members.slice(0, 10).map((member) => ({
        userId: member.user.id,
        username: member.user.username,
        globalName: member.user.global_name ?? undefined,
        nickname: member.nick ?? undefined,
        displayLabel: buildDisplayLabel(member),
        avatarUrl: buildAvatarUrl(member.user),
    }));
}