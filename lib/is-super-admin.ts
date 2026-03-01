import { getDiscordAccountByUserId } from "@/lib/repositories/auth-account-repository";

export async function isSuperAdmin(userId: string): Promise<boolean> {
    const superAdminDiscordId = process.env.SUPER_ADMIN_DISCORD_USER_ID;
    if (!superAdminDiscordId) return false;

    const account = await getDiscordAccountByUserId(userId);
    return account?.providerAccountId === superAdminDiscordId;
}
