"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function AdminNav() {
    const pathname = usePathname();
    const t = useTranslations("adminNav");

    const tabs = [
        { label: t("overview"), href: "/terminal/admin" },
        { label: t("organizations"), href: "/terminal/admin/organizations" },
        { label: t("discordServers"), href: "/terminal/admin/discord-servers" },
        { label: t("news"), href: "/terminal/admin/news" },
        { label: t("legal"), href: "/terminal/admin/legal" },
    ];

    return (
        <nav
            className="border-b"
            style={{ borderColor: "rgba(240,165,0,0.15)" }}
        >
            <div className="mx-auto flex max-w-7xl gap-1 px-4 sm:px-6">
                {tabs.map((tab) => {
                    const isActive =
                        tab.href === "/terminal/admin"
                            ? pathname === tab.href
                            : pathname.startsWith(tab.href);

                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className="relative px-4 py-3 text-xs uppercase tracking-[0.2em] transition-colors"
                            style={{
                                fontFamily: "var(--font-mono)",
                                color: isActive
                                    ? "rgba(240,165,0,0.9)"
                                    : "rgba(200,220,232,0.4)",
                            }}
                        >
                            {tab.label}
                            {isActive && (
                                <span
                                    className="absolute bottom-0 left-0 right-0 h-px"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, transparent, rgba(240,165,0,0.7), transparent)",
                                    }}
                                />
                            )}
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
