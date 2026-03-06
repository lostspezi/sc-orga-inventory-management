import type { Metadata } from "next";
import { getOrCreateLegalSettings } from "@/lib/repositories/legal-settings-repository";

export const metadata: Metadata = {
    title: "Privacy Policy — SC Orga Manager",
    robots: { index: true },
};

function fmt(dateStr: string) {
    return new Date(dateStr + "T00:00:00Z").toLocaleDateString("en-US", {
        month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
    });
}

export default async function PrivacyPolicyPage() {
    const settings = await getOrCreateLegalSettings();
    const lastUpdated = fmt(settings.documents.privacy.lastUpdated);

    return (
        <article className="space-y-10">
            <header>
                <p className="mb-2 text-[10px] uppercase tracking-[0.35em]"
                    style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                    GDPR Compliance
                </p>
                <h1 className="text-3xl font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Privacy Policy
                </h1>
                <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    Last updated: {lastUpdated} · Applies to scoim.io
                </p>
            </header>

            <Section label="1. Controller">
                <p>The controller responsible for data processing on this website is:</p>
                <p className="mt-2">
                    Marcell Dechant<br />
                    Löttringhauser Str. 4, 44225 Dortmund, Germany<br />
                    Email:{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="2. Data Protection Officer">
                <p>
                    No Data Protection Officer has been appointed. For a small SaaS operated by a private
                    individual, appointment is typically not required under GDPR Art. 37.
                    For privacy-related enquiries, contact:{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                </p>
            </Section>

            <Section label="3. What data we collect and why">
                <SubSection label="3.1 Account &amp; Authentication">
                    <p>
                        When you log in via Discord OAuth, we receive and store: Discord user ID, display name,
                        email address, and avatar URL.
                    </p>
                    <DataRow
                        basis="GDPR Art. 6(1)(b) — performance of contract"
                        retention="Until account deletion or 2 years of inactivity"
                    />
                </SubSection>

                <SubSection label="3.2 Organization Data">
                    <p>
                        We store organization names, member lists (Discord user IDs + roles), inventory items,
                        transaction records, cargo logs, and audit logs that you and your organization create.
                    </p>
                    <DataRow
                        basis="GDPR Art. 6(1)(b) — performance of contract"
                        retention="Until the organization is deleted or 2 years after last activity"
                    />
                </SubSection>

                <SubSection label="3.3 Payment Data (PRO subscribers)">
                    <p>
                        We use Stripe for payment processing. We store: Stripe customer ID, subscription ID,
                        subscription status, and billing period. We do NOT store full card numbers — these are
                        handled entirely by Stripe.
                    </p>
                    <DataRow
                        basis="GDPR Art. 6(1)(b) — performance of contract; Art. 6(1)(c) — legal obligation (invoicing)"
                        retention="10 years (legal requirement for financial records)"
                    />
                </SubSection>

                <SubSection label="3.4 Email Communications">
                    <p>
                        We send transactional emails (welcome email, invoices) via Resend. We do NOT send
                        marketing emails or newsletters without separate explicit consent.
                    </p>
                    <DataRow
                        basis="GDPR Art. 6(1)(b) — performance of contract"
                        retention="Email logs held by Resend per their retention policy"
                    />
                </SubSection>

                <SubSection label="3.5 Server Logs">
                    <p>
                        Our hosting provider (Render.com) may log IP addresses and request metadata for
                        security and stability purposes.
                    </p>
                    <DataRow
                        basis="GDPR Art. 6(1)(f) — legitimate interest (security and stability)"
                        retention="Approx. 30 days — managed by Render.com"
                    />
                </SubSection>

                <SubSection label="3.6 Cookies and Local Storage">
                    <p>
                        We use only strictly necessary and functional cookies. No analytics, advertising, or
                        tracking cookies are used. See our{" "}
                        <a href="/legal/cookies" style={{ color: "var(--accent-primary)" }}>
                            Cookie Information page
                        </a>{" "}
                        for details.
                    </p>
                </SubSection>
            </Section>

            <Section label="4. Data Processors (Third Parties)">
                <p className="mb-3">
                    We share personal data with the following processors strictly as necessary to provide the service:
                </p>
                <div className="overflow-x-auto">
                    <table className="w-full text-xs" style={{ borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(79,195,220,0.15)" }}>
                                {["Processor", "Purpose", "Location", "DPA"].map((h) => (
                                    <th key={h} className="pb-2 pr-4 text-left text-[10px] uppercase tracking-[0.2em]"
                                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody style={{ color: "rgba(200,220,232,0.65)" }}>
                            <ProcessorRow p="Stripe Inc." purpose="Payment processing" loc="USA (SCC)" dpa="stripe.com/legal/dpa" />
                            <ProcessorRow p="Resend Inc." purpose="Transactional email" loc="USA (SCC)" dpa="resend.com/legal/dpa" />
                            <ProcessorRow p="Render.com" purpose="App hosting + MongoDB" loc="USA (SCC)" dpa="render.com/privacy" />
                            <ProcessorRow p="Discord Inc." purpose="Authentication (OAuth)" loc="USA (SCC)" dpa="discord.com/privacy" />
                            <ProcessorRow p="Google LLC" purpose="Sheets sync (optional, admin opt-in)" loc="USA (SCC)" dpa="workspace.google.com/intl/en/terms/dpa" />
                        </tbody>
                    </table>
                </div>
            </Section>

            <Section label="5. International Transfers">
                <p>
                    Several processors are based in the United States. Transfers are protected by Standard
                    Contractual Clauses (SCCs) pursuant to GDPR Art. 46(2)(c) and/or the EU–US Data Privacy
                    Framework where applicable.
                </p>
            </Section>

            <Section label="6. Your Rights (GDPR Chapter III)">
                <p className="mb-3">You have the following rights regarding your personal data:</p>
                <ul className="space-y-2">
                    {[
                        ["Art. 15 — Access", "Request a copy of your personal data."],
                        ["Art. 16 — Rectification", "Correct inaccurate data we hold about you."],
                        ["Art. 17 — Erasure", "Delete your account and associated personal data."],
                        ["Art. 18 — Restriction", "Limit how we process your data in certain circumstances."],
                        ["Art. 20 — Portability", "Receive your data in machine-readable format."],
                        ["Art. 21 — Object", "Object to processing based on legitimate interest."],
                    ].map(([right, desc]) => (
                        <li key={right} className="flex gap-2">
                            <span style={{ color: "var(--accent-primary)", flexShrink: 0, fontFamily: "var(--font-mono)", fontSize: "0.7rem" }}>▸</span>
                            <span><strong style={{ color: "rgba(200,220,232,0.85)" }}>{right}:</strong> {desc}</span>
                        </li>
                    ))}
                </ul>
                <p className="mt-4">
                    To exercise these rights: go to{" "}
                    <a href="/terminal/settings" style={{ color: "var(--accent-primary)" }}>
                        Settings → Data &amp; Privacy
                    </a>
                    , or email{" "}
                    <a href="mailto:marcell.dechant@proton.me" style={{ color: "var(--accent-primary)" }}>
                        marcell.dechant@proton.me
                    </a>
                    . We respond within 30 days.
                </p>
            </Section>

            <Section label="7. Right to Lodge a Complaint">
                <p>
                    You may lodge a complaint with your national data protection authority. In Germany:
                    Landesbeauftragte für Datenschutz und Informationsfreiheit Nordrhein-Westfalen (LDI NRW),{" "}
                    <a href="https://www.ldi.nrw.de" target="_blank" rel="noopener noreferrer"
                        style={{ color: "var(--accent-primary)" }}>
                        www.ldi.nrw.de
                    </a>
                    . If you reside in another EU country, contact your local supervisory authority.
                </p>
            </Section>

            <Section label="8. Changes to This Policy">
                <p>
                    We will update the &quot;Last updated&quot; date at the top of this page when we make changes.
                    For material changes, we will notify you via in-app dialog requiring your acknowledgement.
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
            <div className="hud-panel p-5 text-sm leading-relaxed space-y-3"
                style={{ background: "rgba(8,16,24,0.45)" }}>
                {children}
            </div>
        </section>
    );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-2 pt-3 first:pt-0"
            style={{ borderTop: "1px solid rgba(79,195,220,0.07)" }}>
            <h3 className="text-[11px] uppercase tracking-[0.2em]"
                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                {label}
            </h3>
            {children}
        </div>
    );
}

function DataRow({ basis, retention }: { basis: string; retention: string }) {
    return (
        <div className="mt-2 text-xs space-y-1"
            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}>
            <p><span style={{ color: "rgba(79,195,220,0.4)" }}>Legal basis:</span> {basis}</p>
            <p><span style={{ color: "rgba(79,195,220,0.4)" }}>Retention:</span> {retention}</p>
        </div>
    );
}

function ProcessorRow({ p, purpose, loc, dpa }: { p: string; purpose: string; loc: string; dpa: string }) {
    return (
        <tr style={{ borderBottom: "1px solid rgba(79,195,220,0.07)" }}>
            <td className="py-2 pr-4 font-medium" style={{ color: "rgba(200,220,232,0.85)" }}>{p}</td>
            <td className="py-2 pr-4">{purpose}</td>
            <td className="py-2 pr-4">{loc}</td>
            <td className="py-2">{dpa}</td>
        </tr>
    );
}
