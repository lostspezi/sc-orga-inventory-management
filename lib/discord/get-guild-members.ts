import { getDiscordBotClient } from "@/lib/discord/bot/client";

type DiscordUser = {
    id: string;
    username: string;
    globalName?: string;
    avatarUrl?: string;
};

export type DiscordGuildMemberOption = {
    userId: string;
    username: string;
    globalName?: string;
    nickname?: string;
    displayLabel: string;
    avatarUrl?: string;
};

function buildDisplayLabel(input: {
    username: string;
    globalName?: string;
    nickname?: string;
}) {
    const primary = input.nickname || input.globalName || input.username;
    const secondary = input.username;

    if (primary === secondary) return primary;
    return `${primary} (${secondary})`;
}

function mapUser(user: {
    id: string;
    username: string;
    globalName?: string | null;
    displayAvatarURL: (options?: { extension?: "png" | "jpg" | "jpeg" | "webp" | "gif"; size?: number }) => string;
}): DiscordUser {
    return {
        id: user.id,
        username: user.username,
        globalName: user.globalName ?? undefined,
        avatarUrl: user.displayAvatarURL({ extension: "png", size: 128 }),
    };
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

    const client = getDiscordBotClient();

    const guild = await client.guilds.fetch(guildId);

    const members = await guild.members.search({
        query: trimmed,
        limit: Math.min(Math.max(limit, 1), 10),
    });

    return members.map((member) => {
        const user = mapUser(member.user);

        return {
            userId: user.id,
            username: user.username,
            globalName: user.globalName,
            nickname: member.nickname ?? undefined,
            displayLabel: buildDisplayLabel({
                username: user.username,
                globalName: user.globalName,
                nickname: member.nickname ?? undefined,
            }),
            avatarUrl: user.avatarUrl,
        };
    });
}