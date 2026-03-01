import { REST, Routes } from "discord.js";

type PartialGuild = {
    id: string;
    name: string;
    icon: string | null;
    approximate_member_count?: number;
};

type GuildDetail = {
    id: string;
    owner_id: string;
    approximate_member_count?: number;
};

type DiscordUser = {
    id: string;
    username: string;
    global_name?: string | null;
};

export type BotGuildInfo = {
    id: string;
    name: string;
    iconUrl: string | null;
    memberCount: number | null;
    ownerId: string | null;
    ownerName: string | null;
};

export async function getBotGuilds(): Promise<BotGuildInfo[]> {
    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) return [];

    const rest = new REST({ version: "10" }).setToken(token);

    try {
        // 1. Get all guilds the bot is in, with approximate member counts
        const partialGuilds = await rest.get(Routes.userGuilds(), {
            query: new URLSearchParams({ with_counts: "true" }),
        }) as PartialGuild[];

        if (partialGuilds.length === 0) return [];

        // 2. Fetch guild details in parallel to get owner_id
        const guildDetails = await Promise.all(
            partialGuilds.map((g) =>
                (rest.get(Routes.guild(g.id)) as Promise<GuildDetail>).catch(() => null)
            )
        );

        // 3. Collect unique owner IDs and resolve usernames
        const ownerIds = [...new Set(
            guildDetails
                .filter((g): g is GuildDetail => g !== null)
                .map((g) => g.owner_id)
        )];

        const ownerUsers = await Promise.all(
            ownerIds.map((id) =>
                (rest.get(Routes.user(id)) as Promise<DiscordUser>).catch(() => null)
            )
        );

        const ownerNameById = new Map(
            ownerUsers
                .filter((u): u is DiscordUser => u !== null)
                .map((u) => [u.id, u.global_name ?? u.username])
        );

        return partialGuilds.map((partial, i) => {
            const detail = guildDetails[i];
            const iconUrl = partial.icon
                ? `https://cdn.discordapp.com/icons/${partial.id}/${partial.icon}.png`
                : null;

            return {
                id: partial.id,
                name: partial.name,
                iconUrl,
                memberCount: detail?.approximate_member_count ?? partial.approximate_member_count ?? null,
                ownerId: detail?.owner_id ?? null,
                ownerName: detail ? (ownerNameById.get(detail.owner_id) ?? null) : null,
            };
        });
    } catch {
        return [];
    }
}
