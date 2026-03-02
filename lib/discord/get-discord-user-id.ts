import { getDiscordAccountByUserId } from "@/lib/repositories/auth-account-repository";

export async function getDiscordUserId(userId: string): Promise<string | null> {
    const account = await getDiscordAccountByUserId(userId);
    return account?.providerAccountId ?? null;
}
