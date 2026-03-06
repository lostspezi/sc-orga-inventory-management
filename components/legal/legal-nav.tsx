"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

const LEGAL_LINKS = [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Imprint", href: "/legal/imprint" },
    { label: "Cookies", href: "/legal/cookies" },
] as const;

const BACK_TARGETS: Record<string, { href: string; label: string }> = {
    login: { href: "/login", label: "Back to Login" },
    terminal: { href: "/terminal", label: "Back to Terminal" },
};

export function LegalBackButton() {
    const params = useSearchParams();
    const from = params.get("from") ?? "";
    const { href, label } = BACK_TARGETS[from] ?? { href: "/", label: "Back to Home" };

    return (
        <Link
            href={href}
            className="flex items-center gap-2 text-[11px] uppercase tracking-[0.25em] transition-colors hover:text-cyan-400"
            style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
        >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            {label}
        </Link>
    );
}

export function LegalInternalFooter() {
    const params = useSearchParams();
    const from = params.get("from");
    const suffix = from ? `?from=${from}` : "";

    return (
        <footer
            className="flex items-center justify-center gap-6 px-8 py-4 text-[10px] uppercase tracking-[0.2em]"
            style={{
                borderTop: "1px solid rgba(79,195,220,0.08)",
                color: "rgba(79,195,220,0.2)",
                fontFamily: "var(--font-mono)",
            }}
        >
            {LEGAL_LINKS.map(({ label, href }, i) => (
                <span key={href} className="flex items-center gap-6">
                    <Link href={`${href}${suffix}`} className="transition-colors hover:text-cyan-400">
                        {label}
                    </Link>
                    {i < LEGAL_LINKS.length - 1 && <span style={{ color: "rgba(79,195,220,0.1)" }}>·</span>}
                </span>
            ))}
        </footer>
    );
}
