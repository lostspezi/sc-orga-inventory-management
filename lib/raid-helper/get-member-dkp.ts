export async function getMemberDkp(
    guildId: string,
    entityId: string,
    apiKey: string
): Promise<number | null> {
    try {
        const res = await fetch(
            `https://raid-helper.dev/api/v2/servers/${guildId}/entities/${entityId}/dkp`,
            {
                headers: {
                    Authorization: apiKey,
                    "Content-Type": "application/json; charset=utf-8",
                },
                next: { revalidate: 180 },
            }
        );

        if (!res.ok) {
            console.error(`[RaidHelper] getMemberDkp failed: ${res.status} ${res.statusText}`);
            return null;
        }

        const data = await res.json() as { result: { name: string; id: string; dkp: number }[] };
        return data.result?.[0]?.dkp ?? null;
    } catch (err) {
        console.error("[RaidHelper] getMemberDkp error:", err);
        return null;
    }
}
