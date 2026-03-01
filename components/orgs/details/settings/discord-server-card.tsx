import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { getDiscordBotInstallUrl } from "@/lib/discord/get-bot-install-url";
import { disconnectDiscordAction } from "@/lib/actions/disconnect-discord-action";
import { getDiscordBotClient } from "@/lib/discord/bot/client";

type Props = {
    organizationSlug: string;
    discordGuildId?: string;
};

async function tryGetGuildName(guildId: string): Promise<string | null> {
    try {
        const guild = await getDiscordBotClient().guilds.fetch(guildId);
        return guild.name;
    } catch {
        return null;
    }
}

export default async function DiscordServerCard({ organizationSlug, discordGuildId }: Props) {
    const t = await getTranslations("orgSettings");
    const isConnected = !!discordGuildId;
    const guildName = isConnected ? await tryGetGuildName(discordGuildId!) : null;
    const installUrl = !isConnected ? getDiscordBotInstallUrl(organizationSlug) : null;

    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: isConnected ? "rgba(87,242,135,0.18)" : "rgba(240,165,0,0.18)",
                background: isConnected ? "rgba(6,20,14,0.18)" : "rgba(20,14,6,0.14)",
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                        borderColor: isConnected ? "rgba(87,242,135,0.2)" : "rgba(240,165,0,0.2)",
                        color: isConnected ? "rgba(87,242,135,0.85)" : "rgba(240,165,0,0.85)",
                        background: isConnected ? "rgba(87,242,135,0.06)" : "rgba(240,165,0,0.05)",
                    }}
                >
                    <Bot size={18} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: isConnected ? "rgba(87,242,135,0.6)" : "rgba(240,165,0,0.75)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("discordServerLabel")}
                        </p>
                        <span
                            className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                            style={{
                                borderColor: isConnected ? "rgba(87,242,135,0.25)" : "rgba(240,165,0,0.25)",
                                color: isConnected ? "rgba(87,242,135,0.85)" : "rgba(240,165,0,0.8)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {isConnected ? t("connected") : t("notConnected")}
                        </span>
                    </div>

                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{
                            color: isConnected ? "rgba(87,242,135,0.9)" : "rgba(240,165,0,0.9)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        {isConnected ? (guildName ?? t("connectedFallback")) : t("connectTitle")}
                    </h3>

                    {isConnected ? (
                        <p
                            className="mt-1 text-xs"
                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                        >
                            Guild ID: {discordGuildId}
                        </p>
                    ) : (
                        <p
                            className="mt-2 text-xs sm:text-sm"
                            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("connectDesc")}
                        </p>
                    )}
                </div>
            </div>

            <div className="mt-4 flex justify-end">
                {isConnected ? (
                    <form action={disconnectDiscordAction}>
                        <input type="hidden" name="organizationSlug" value={organizationSlug} />
                        <button
                            type="submit"
                            className="cursor-pointer rounded-md border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors"
                            style={{
                                borderColor: "rgba(240,100,100,0.3)",
                                color: "rgba(240,100,100,0.75)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {t("disconnect")}
                        </button>
                    </form>
                ) : (
                    <Link
                        href={installUrl!}
                        target="_self"
                        className="sc-btn inline-flex items-center justify-center gap-2"
                    >
                        <Bot size={16} />
                        {t("addBot")}
                        <ExternalLink size={14} />
                    </Link>
                )}
            </div>
        </div>
    );
}
