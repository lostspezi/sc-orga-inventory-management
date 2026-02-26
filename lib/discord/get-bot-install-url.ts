export function getDiscordBotInstallUrl(orgSlug: string) {
    const clientId = process.env.AUTH_DISCORD_ID;
    const redirectUri = process.env.DISCORD_BOT_INSTALL_REDIRECT_URI;

    if (!clientId) {
        throw new Error("Missing DISCORD_CLIENT_ID");
    }

    if (!redirectUri) {
        throw new Error("Missing DISCORD_BOT_INSTALL_REDIRECT_URI");
    }

    // VIEW_CHANNEL + SEND_MESSAGES + READ_MESSAGE_HISTORY
    const permissions = "68608";

    const params = new URLSearchParams({
        client_id: clientId,
        scope: "bot applications.commands",
        permissions,
        redirect_uri: redirectUri,
        response_type: "code",
        state: orgSlug,
    });

    return `https://discord.com/oauth2/authorize?${params.toString()}`;
}