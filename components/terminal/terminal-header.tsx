import Link from "next/link";
import UserDropdown from "@/components/terminal/user-dropdown";
import TerminalNav from "@/components/terminal/terminal-nav";
import NotificationBell from "@/components/terminal/notification-bell";
import LanguageSwitcher from "@/components/ui/language-switcher";
import { getTranslations } from "next-intl/server";

type Props = {
    userName: string;
    userImage: string | null;
};

export default async function TerminalHeader({ userName, userImage }: Props) {
    const t = await getTranslations("header");

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
                    <NotificationBell />
                    <UserDropdown userName={userName} userImage={userImage} />
                </div>
            </div>
        </header>
    );
}
