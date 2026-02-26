import Link from "next/link";
import { Bot, ExternalLink } from "lucide-react";
import { getDiscordBotInstallUrl } from "@/lib/discord/get-bot-install-url";

type Props = {
    organizationSlug: string;
};

export default function ConnectDiscordServerCard({ organizationSlug }: Props) {
    const installUrl = getDiscordBotInstallUrl(organizationSlug);

    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(240,165,0,0.18)",
                background: "rgba(20,14,6,0.14)",
            }}
        >
            <div className="mb-4 flex items-start gap-3">
                <div
                    className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border"
                    style={{
                        borderColor: "rgba(240,165,0,0.2)",
                        color: "rgba(240,165,0,0.85)",
                        background: "rgba(240,165,0,0.05)",
                    }}
                >
                    <Bot size={18} />
                </div>

                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(240,165,0,0.75)", fontFamily: "var(--font-mono)" }}
                    >
                        Discord Integration
                    </p>
                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                    >
                        Connect a Discord Server
                    </h3>
                    <p
                        className="mt-2 text-xs sm:text-sm"
                        style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Add the bot to the server used by this organization. After authorization,
                        the selected server will be linked automatically.
                    </p>
                </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Link
                    href={installUrl}
                    target="_self"
                    className="sc-btn inline-flex items-center justify-center gap-2"
                >
                    <Bot size={16} />
                    Add Bot to Server
                    <ExternalLink size={14} />
                </Link>
            </div>
        </div>
    );
}