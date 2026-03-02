export async function updateMemberDkp(
    guildId: string,
    entityId: string,
    apiKey: string,
    operation: "add" | "subtract",
    value: number,
    description: string
): Promise<boolean> {
    try {
        const res = await fetch(
            `https://raid-helper.dev/api/v2/servers/${guildId}/entities/${entityId}/dkp`,
            {
                method: "PATCH",
                headers: {
                    Authorization: apiKey,
                    "Content-Type": "application/json; charset=utf-8",
                },
                body: JSON.stringify({ operation, value: String(value), description }),
            }
        );

        if (!res.ok) {
            console.error(`[RaidHelper] updateMemberDkp failed: ${res.status} ${res.statusText}`);
            return false;
        }

        return true;
    } catch (err) {
        console.error("[RaidHelper] updateMemberDkp error:", err);
        return false;
    }
}
