"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { label: "Home", href: "/" },
    { label: "Hub", href: "/terminal" },
];

export default function TerminalNav() {
    const pathname = usePathname();

    return (
        <nav className="flex items-center gap-1">
            {links.map(({ label, href }) => {
                const isActive =
                    href === "/"
                        ? pathname === "/"
                        : pathname === href || pathname.startsWith(href + "/");

                return (
                    <Link
                        key={href}
                        href={href}
                        className="relative px-3 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors"
                        style={{
                            fontFamily: "var(--font-mono)",
                            color: isActive
                                ? "rgba(79,195,220,0.9)"
                                : "rgba(200,220,232,0.35)",
                        }}
                    >
                        {label}
                        {isActive && (
                            <span
                                className="absolute bottom-0 left-0 right-0 h-px"
                                style={{
                                    background:
                                        "linear-gradient(90deg, transparent, rgba(79,195,220,0.6), transparent)",
                                }}
                            />
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
