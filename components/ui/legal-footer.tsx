import Link from "next/link";

const LINKS = [
    { label: "Privacy Policy", href: "/legal/privacy" },
    { label: "Terms", href: "/legal/terms" },
    { label: "Imprint", href: "/legal/imprint" },
    { label: "Cookies", href: "/legal/cookies" },
] as const;

export default function LegalFooter({ from }: { from: "login" | "terminal" }) {
    return (
        <footer
            className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-6 py-3"
            style={{ borderTop: "1px solid rgba(79,195,220,0.07)" }}
        >
            {LINKS.map(({ label, href }, i) => (
                <span key={href} className="flex items-center gap-4">
                    <Link
                        href={`${href}?from=${from}`}
                        className="text-[10px] uppercase tracking-[0.2em] transition-colors hover:text-cyan-400"
                        style={{ color: "rgba(79,195,220,0.25)", fontFamily: "var(--font-mono)" }}
                    >
                        {label}
                    </Link>
                    {i < LINKS.length - 1 && (
                        <span style={{ color: "rgba(79,195,220,0.1)" }}>·</span>
                    )}
                </span>
            ))}
        </footer>
    );
}
