import type { Metadata } from "next";
import { getOrCreateLegalSettings } from "@/lib/repositories/legal-settings-repository";

export const metadata: Metadata = {
    title: "Cookie Information — SC Orga Manager",
    robots: { index: true },
};

const COOKIES = [
    {
        name: "authjs.session-token",
        setBy: "SC Orga Manager",
        purpose: "Keeps you logged in by storing your session token.",
        duration: "Session (max 30 days)",
        type: "Strictly necessary",
    },
    {
        name: "authjs.csrf-token",
        setBy: "SC Orga Manager",
        purpose: "Prevents cross-site request forgery attacks.",
        duration: "Session",
        type: "Strictly necessary",
    },
    {
        name: "authjs.callback-url",
        setBy: "SC Orga Manager",
        purpose: "Returns you to the correct page after login.",
        duration: "Session",
        type: "Strictly necessary",
    },
    {
        name: "NEXT_LOCALE",
        setBy: "SC Orga Manager",
        purpose: "Remembers your language preference (en / de / fr).",
        duration: "1 year",
        type: "Functional",
    },
    {
        name: "sc_consent",
        setBy: "SC Orga Manager",
        purpose: "Records that you have acknowledged the cookie notice.",
        duration: "1 year",
        type: "Functional",
    },
];

function fmt(dateStr: string) {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    });
}

export default async function CookiesPage() {
    const settings = await getOrCreateLegalSettings();
    const lastUpdated = fmt(settings.documents.cookies.lastUpdated);

    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    ePrivacy &amp; GDPR
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Cookie Information
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Last updated: {lastUpdated}
                </p>
            </header>

            <section className="hud-panel p-5 text-sm leading-relaxed"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                <p>
                    SC Orga Manager uses{" "}
                    <strong style={{ color: "rgba(200,220,232,0.85)" }}>only strictly necessary and functional cookies</strong>.
                    No consent banner is required because we do not use analytics, advertising, or third-party
                    tracking cookies.
                </p>
                <p className="mt-3">
                    This page provides the cookie information required by the ePrivacy Directive Art. 5(3)
                    and GDPR Art. 13.
                </p>
            </section>

            <section className="space-y-3">
                <h2 className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                    Cookies We Use
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(79,195,220,0.15)" }}>
                                {["Cookie", "Set by", "Purpose", "Duration", "Category"].map((h) => (
                                    <th key={h} className="pb-2 pr-4 text-left text-[10px] uppercase tracking-[0.2em]"
                                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {COOKIES.map((c) => (
                                <tr key={c.name} style={{ borderBottom: "1px solid rgba(79,195,220,0.07)" }}>
                                    <td className="py-3 pr-4 font-mono" style={{ color: "rgba(200,220,232,0.85)" }}>{c.name}</td>
                                    <td className="py-3 pr-4" style={{ color: "rgba(200,220,232,0.65)" }}>{c.setBy}</td>
                                    <td className="py-3 pr-4" style={{ color: "rgba(200,220,232,0.65)" }}>{c.purpose}</td>
                                    <td className="py-3 pr-4 whitespace-nowrap" style={{ color: "rgba(200,220,232,0.65)" }}>{c.duration}</td>
                                    <td className="py-3">
                                        <span className="inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]"
                                            style={{
                                                background: c.type === "Strictly necessary" ? "rgba(79,195,220,0.08)" : "rgba(200,220,232,0.06)",
                                                color: c.type === "Strictly necessary" ? "rgba(79,195,220,0.7)" : "rgba(200,220,232,0.45)",
                                                fontFamily: "var(--font-mono)",
                                            }}>
                                            {c.type}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                    Third-Party Services
                </h2>
                <div className="hud-panel p-5 text-sm leading-relaxed space-y-3"
                    style={{ background: "rgba(8,16,24,0.45)" }}>
                    <p>
                        <strong style={{ color: "rgba(200,220,232,0.85)" }}>Stripe (payments):</strong>{" "}
                        Payment processing is handled server-side. If you visit stripe.com during checkout,
                        Stripe may set its own cookies governed by their{" "}
                        <a href="https://stripe.com/cookie-settings" target="_blank" rel="noopener noreferrer"
                            style={{ color: "var(--accent-primary)" }}>Cookie Policy</a>.
                        We do not load any Stripe JavaScript on our own pages.
                    </p>
                    <p>
                        <strong style={{ color: "rgba(200,220,232,0.85)" }}>Discord (authentication):</strong>{" "}
                        When you click &quot;Login with Discord&quot;, you are redirected to discord.com.
                        Discord&apos;s own cookies apply on their site. We only receive the OAuth token after you approve access.
                    </p>
                    <p>
                        <strong style={{ color: "rgba(200,220,232,0.85)" }}>Google Fonts:</strong>{" "}
                        Fonts are self-hosted at build time — no requests are made to Google servers at runtime.
                    </p>
                    <p>
                        <strong style={{ color: "rgba(200,220,232,0.85)" }}>Analytics &amp; tracking:</strong>{" "}
                        None. We do not use Google Analytics, Meta Pixel, Hotjar, or any other tracking service.
                    </p>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                    Managing Cookies
                </h2>
                <div className="hud-panel p-5 text-sm leading-relaxed"
                    style={{ background: "rgba(8,16,24,0.45)" }}>
                    <p>
                        You can delete or block cookies in your browser settings at any time. Blocking the
                        strictly necessary cookies listed above will prevent you from logging in to SC Orga Manager.
                    </p>
                </div>
            </section>

            <section className="space-y-3">
                <h2 className="text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                    Contact
                </h2>
                <div className="hud-panel p-5 text-sm" style={{ background: "rgba(8,16,24,0.45)" }}>
                    <p>
                        Questions about our cookie usage? Email us at{" "}
                        <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                            marcell.dechant@proton.me
                        </a>
                    </p>
                </div>
            </section>
        </article>
    );
}
