import type { Metadata } from "next";
import { getOrCreateLegalSettings } from "@/lib/repositories/legal-settings-repository";

export const metadata: Metadata = {
    title: "Terms & Conditions — SC Orga Manager",
    robots: { index: true },
};

function fmt(dateStr: string) {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    });
}

export default async function TermsPage() {
    const settings = await getOrCreateLegalSettings();
    const lastUpdated = fmt(settings.documents.terms.lastUpdated);

    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    Service Agreement
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Terms &amp; Conditions
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Last updated: {lastUpdated} · Effective: {lastUpdated}
                </p>
            </header>

            <Section label="1. Operator">
                <p>
                    SC Orga Manager (&quot;the Service&quot;) is operated by Marcell Dechant,
                    Löttringhauser Str. 4, 44225 Dortmund, Germany (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
                    Contact:{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="2. Scope">
                <p>
                    These Terms govern your use of scoim.io, including the free and PRO subscription tiers.
                    By creating an account or using the Service, you agree to these Terms. If you do not agree,
                    you must not use the Service.
                </p>
            </Section>

            <Section label="3. Eligibility">
                <p>
                    You must be at least 16 years old to use the Service.
                    The Service is intended for players of Star Citizen® by Cloud Imperium Games.
                </p>
            </Section>

            <Section label="4. Account">
                <ul className="space-y-2">
                    {[
                        "Accounts are created via Discord OAuth. You are responsible for maintaining the security of your account.",
                        "You may not share accounts with or create accounts on behalf of others without their explicit consent.",
                        "You must provide accurate information and keep it up to date.",
                        "We may suspend or terminate accounts that violate these Terms, with or without notice depending on severity.",
                    ].map((item, i) => (
                        <li key={i} className="flex gap-2">
                            <span style={{ color: "var(--accent-primary)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>▸</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section label="5. Free Tier">
                <p>
                    The Free tier is provided as-is, without uptime guarantees or SLA commitments. We may
                    modify, limit, or discontinue Free tier features at any time with reasonable notice.
                </p>
            </Section>

            <Section label="6. PRO Subscription">
                <ul className="space-y-2">
                    {[
                        "Billed at €4.99/month via Stripe. Prices include applicable VAT.",
                        "Subscriptions auto-renew at the end of each billing period until cancelled.",
                        "Cancel anytime via Settings → Billing. Your PRO access remains active until the end of the current billing period.",
                        "No refunds for partial billing periods. EU consumers may have a 14-day right of withdrawal for digital services under Directive 2011/83/EU.",
                        "We may change pricing with at least 30 days' advance notice.",
                    ].map((item, i) => (
                        <li key={i} className="flex gap-2">
                            <span style={{ color: "var(--accent-primary)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>▸</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section label="7. Acceptable Use">
                <p className="mb-2">You may not use the Service to:</p>
                <ul className="space-y-2">
                    {[
                        "Violate any applicable law or regulation.",
                        "Harass, abuse, threaten, or harm other users.",
                        "Attempt to gain unauthorized access to any part of the Service or other users' data.",
                        "Scrape, reverse-engineer, or exploit the Service in ways not intended by its design.",
                        "Upload malicious content or interfere with the Service's operation.",
                    ].map((item, i) => (
                        <li key={i} className="flex gap-2">
                            <span style={{ color: "rgba(220,80,80,0.6)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>✕</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section label="8. Intellectual Property">
                <p>
                    SC Orga Manager is not affiliated with Cloud Imperium Games Corporation or Roberts Space
                    Industries Corp. Star Citizen® and related marks are trademarks of Cloud Imperium Games Corp.
                    All Star Citizen assets belong to their respective owners.
                </p>
                <p className="mt-2">
                    The Service&apos;s own code, design, and content are the intellectual property of Marcell Dechant
                    and may not be reproduced or redistributed without permission.
                </p>
            </Section>

            <Section label="9. Liability Limitation">
                <p>
                    To the maximum extent permitted by applicable law, the operator is not liable for:
                </p>
                <ul className="mt-2 space-y-1">
                    {[
                        "Loss of data or revenue arising from your use of the Service.",
                        "Service interruptions, outages, or bugs.",
                        "Content created or actions taken by other users.",
                        "Third-party service failures (Discord, Stripe, Render, etc.).",
                    ].map((item, i) => (
                        <li key={i} className="flex gap-2">
                            <span style={{ color: "var(--accent-primary)", flexShrink: 0, fontFamily: "var(--font-mono)" }}>▸</span>
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section label="10. Governing Law &amp; Disputes">
                <p>
                    These Terms are governed by the laws of Germany. EU consumers retain the right to sue
                    in their country of residence under applicable mandatory consumer protection provisions.
                    For unresolved disputes, the competent courts of Dortmund, Germany have jurisdiction.
                </p>
            </Section>

            <Section label="11. Changes to These Terms">
                <p>
                    We will notify users of material changes via in-app dialog at least 30 days in advance.
                    Continued use of the Service after the notice period constitutes acceptance of the revised Terms.
                    If you do not agree, you may delete your account before the changes take effect.
                </p>
            </Section>

            <Section label="12. Contact">
                <p>
                    For questions about these Terms, contact us at{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>{" "}
                    or via Discord:{" "}
                    <a href="https://discord.gg/tuKg67Kutu" target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)" }}>
                        discord.gg/tuKg67Kutu
                    </a>
                </p>
            </Section>
        </article>
    );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.2em]"
                style={{ color: "rgba(79,195,220,0.7)", fontFamily: "var(--font-display)" }}>
                {label}
            </h2>
            <div className="hud-panel p-5 text-sm leading-relaxed"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                {children}
            </div>
        </section>
    );
}
