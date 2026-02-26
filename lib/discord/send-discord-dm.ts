const DISCORD_API_BASE = "https://discord.com/api/v10";

async function discordApi<T>(path: string, init: RequestInit): Promise<T> {
    const token = process.env.DISCORD_BOT_TOKEN;

    if (!token) {
        throw new Error("Missing DISCORD_BOT_TOKEN");
    }

    const res = await fetch(`${DISCORD_API_BASE}${path}`, {
        ...init,
        headers: {
            Authorization: `Bot ${token}`,
            "Content-Type": "application/json",
            ...(init.headers ?? {}),
        },
        cache: "no-store",
    });

    if (!res.ok) {
        const text = await res.text();

        console.error("[discordApi] Request failed", {
            path,
            method: init.method ?? "GET",
            status: res.status,
            response: text,
        });

        throw new Error(`Discord API error ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
}

type CreateDmChannelResponse = {
    id: string;
};

export async function sendDiscordDm(discordUserId: string, content: string) {
    // Step 1: Open / get DM channel with the user
    const channel = await discordApi<CreateDmChannelResponse>("/users/@me/channels", {
        method: "POST",
        body: JSON.stringify({
            recipient_id: discordUserId,
        }),
    });

    // Step 2: Send message into that DM channel
    await discordApi(`/channels/${channel.id}/messages`, {
        method: "POST",
        body: JSON.stringify({
            content,
        }),
    });
}