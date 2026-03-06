import Link from "next/link";
import UserDropdown from "@/components/terminal/user-dropdown";
import TerminalNav from "@/components/terminal/terminal-nav";
import NotificationBell from "@/components/terminal/notification-bell";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { getTranslations } from "next-intl/server";
import { getOrCreateSocialSettings, toSocialSettingsView } from "@/lib/repositories/social-settings-repository";

type Props = {
    rsiHandle: string | null;
    discordName: string;
    userImage: string | null;
};

export default async function TerminalHeader({ rsiHandle, discordName, userImage }: Props) {
    const [t, socialDoc] = await Promise.all([
        getTranslations("header"),
        getOrCreateSocialSettings(),
    ]);
    const social = toSocialSettingsView(socialDoc);

    return (
        <header
            className="sticky top-0 z-40 border-b px-4 py-3 sm:px-6"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(6,12,18,0.92)",
                backdropFilter: "blur(10px)",
            }}
        >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
                {/* Brand */}
                <div className="min-w-0">
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("tagline")}
                    </p>
                    <Link
                        href="/terminal"
                        className="text-sm font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {t("title")}
                    </Link>
                </div>

                {/* Nav */}
                <TerminalNav />

                {/* Right side */}
                <div className="flex items-center gap-2">
                    <LanguageSwitcher />
                    {social.discord && (
                        <Link
                            href={social.discord}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Join Discord"
                            title="Join Discord"
                            className="hidden sm:flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-[10px] uppercase tracking-[0.12em] transition-all hover:opacity-90"
                            style={{
                                borderColor: "rgba(88,101,242,0.35)",
                                color: "rgba(88,101,242,0.85)",
                                background: "rgba(88,101,242,0.08)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.043.033.055a19.963 19.963 0 0 0 6.011 3.037.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.037.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                            </svg>
                            Discord
                        </Link>
                    )}
                    <NotificationBell />
                    <UserDropdown rsiHandle={rsiHandle} discordName={discordName} userImage={userImage} />
                </div>
            </div>
        </header>
    );
}
