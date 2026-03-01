"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
    { label: "Overview", href: "/terminal/admin" },
    { label: "Organizations", href: "/terminal/admin/organizations" },
    { label: "Discord Servers", href: "/terminal/admin/discord-servers" },
];

export default function AdminNav() {
    const pathname = usePathname();

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
