import {
    LayoutDashboard,
    PackageOpen,
    ArrowLeftRight,
    Users,
    Bot,
    Settings2,
    Zap,
    CheckCircle,
    XCircle,
    Terminal,
    ShieldCheck,
    CreditCard,
    Coins,
    Ship,
    BarChart3,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

// ─── Primitives ───────────────────────────────────────────────────────────────

function Section({
    icon: Icon,
    title,
    subtitle,
    children,
}: {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-3">
            <div className="flex items-center gap-3">
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                        borderColor: "rgba(79,195,220,0.2)",
                        color: "rgba(79,195,220,0.85)",
                        background: "rgba(79,195,220,0.06)",
                    }}
                >
                    <Icon size={16} />
                </div>
                <div>
                    <h3
                        className="text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {title}
                    </h3>
                    {subtitle && (
                        <p
                            className="text-[11px]"
                            style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            <div className="ml-12 space-y-2">{children}</div>
        </section>
    );
}

function Q({ q, children }: { q: string; children: React.ReactNode }) {
    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.08)",
                background: "rgba(4,12,20,0.5)",
            }}
        >
            <p
                className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: "rgba(79,195,220,0.7)", fontFamily: "var(--font-mono)" }}
            >
                ▸ {q}
            </p>
            <div
                className="space-y-1.5 text-[13px] leading-relaxed"
                style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)" }}
            >
                {children}
            </div>
        </div>
    );
}

function P({ children }: { children: React.ReactNode }) {
    return <p>{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
    return (
        <code
            className="rounded px-1.5 py-0.5 text-[11px]"
            style={{
                background: "rgba(79,195,220,0.1)",
                color: "rgba(79,195,220,0.9)",
                border: "1px solid rgba(79,195,220,0.15)",
            }}
        >
            {children}
        </code>
    );
}

function Highlight({ children }: { children: React.ReactNode }) {
    return (
        <span style={{ color: "var(--accent-primary)" }}>{children}</span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, { color: string; bg: string; border: string }> = {
        requested: { color: "rgba(240,165,0,0.9)",   bg: "rgba(240,165,0,0.07)",   border: "rgba(240,165,0,0.2)"   },
        approved:  { color: "rgba(79,195,220,0.9)",  bg: "rgba(79,195,220,0.07)",  border: "rgba(79,195,220,0.2)"  },
        completed: { color: "rgba(80,210,120,0.9)",  bg: "rgba(80,210,120,0.07)",  border: "rgba(80,210,120,0.2)"  },
        rejected:  { color: "rgba(220,80,80,0.9)",   bg: "rgba(220,80,80,0.07)",   border: "rgba(220,80,80,0.2)"   },
        cancelled: { color: "rgba(140,140,160,0.7)", bg: "rgba(140,140,160,0.05)", border: "rgba(140,140,160,0.15)" },
    };
    const c = colors[status] ?? colors.cancelled;
    return (
        <span
            className="inline-block rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]"
            style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}
        >
            {status}
        </span>
    );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                    background: "rgba(79,195,220,0.12)",
                    border: "1px solid rgba(79,195,220,0.2)",
                    color: "rgba(79,195,220,0.8)",
                    fontFamily: "var(--font-mono)",
                }}
            >
                {n}
            </span>
            <span style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                {children}
            </span>
        </div>
    );
}

function CommandBlock({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div
            className="rounded border p-3"
            style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(79,195,220,0.04)" }}
        >
            <p className="mb-1" style={{ color: "rgba(79,195,220,0.9)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                {label}
            </p>
            {children}
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FaqPage() {
    const t = await getTranslations("faq");

    const h = (chunks: ReactNode) => <Highlight>{chunks}</Highlight>;
    const c = (chunks: ReactNode) => <Code>{chunks}</Code>;
    const rich = { h, c };

    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("eyebrow")}
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    {t("title")}
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                >
                    {t("description")}
                </p>
            </div>

            {/* ── Dashboard ── */}
            <Section icon={LayoutDashboard} title={t("dashboard.title")} subtitle={t("dashboard.subtitle")}>
                <Q q={t("dashboard.q1")}>
                    <P>{t("dashboard.q1Intro")}</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>{t.rich("dashboard.q1Li1", rich)}</li>
                        <li>{t.rich("dashboard.q1Li2", rich)}</li>
                        <li>{t.rich("dashboard.q1Li3", rich)}</li>
                        <li>{t.rich("dashboard.q1Li4", rich)}</li>
                    </ul>
                    <P>{t("dashboard.q1Outro")}</P>
                </Q>
                <Q q={t("dashboard.q2")}>
                    <P>{t("dashboard.q2Intro")}</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>{t.rich("dashboard.q2Li1", rich)}</li>
                        <li>{t.rich("dashboard.q2Li2", rich)}</li>
                        <li>{t("dashboard.q2Li3")}</li>
                    </ul>
                    <P>{t.rich("dashboard.q2Outro", rich)}</P>
                </Q>
            </Section>

            {/* ── Inventory ── */}
            <Section icon={PackageOpen} title={t("inventorySection.title")} subtitle={t("inventorySection.subtitle")}>
                <Q q={t("inventorySection.q1")}>
                    <P>{t("inventorySection.q1Body")}</P>
                </Q>
                <Q q={t("inventorySection.q2")}>
                    <P>{t.rich("inventorySection.q2Intro", rich)}</P>
                    <P>{t.rich("inventorySection.q2Admin", rich)}</P>
                </Q>
                <Q q={t("inventorySection.q3")}>
                    <P>{t("inventorySection.q3Intro")}</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>{t.rich("inventorySection.q3Li1", rich)}</li>
                        <li>{t.rich("inventorySection.q3Li2", rich)}</li>
                    </ul>
                </Q>
            </Section>

            {/* ── Cargo Tab ── */}
            <Section icon={Ship} title={t("cargoSection.title")} subtitle={t("cargoSection.subtitle")}>
                <Q q={t("cargoSection.q1")}>
                    <P>{t("cargoSection.q1Body")}</P>
                </Q>
                <Q q={t("cargoSection.q2")}>
                    <P>{t.rich("cargoSection.q2Intro", rich)}</P>
                    <P>{t.rich("cargoSection.q2Pricing", rich)}</P>
                </Q>
                <Q q={t("cargoSection.q3")}>
                    <P>{t("cargoSection.q3Body")}</P>
                </Q>
            </Section>

            {/* ── aUEC Cash Desk ── */}
            <Section icon={Coins} title={t("auecSection.title")} subtitle={t("auecSection.subtitle")}>
                <Q q={t("auecSection.q1")}>
                    <P>{t("auecSection.q1Body")}</P>
                </Q>
                <Q q={t("auecSection.q2")}>
                    <P>{t.rich("auecSection.q2Intro", rich)}</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>{t("auecSection.q2Li1")}</li>
                        <li>{t("auecSection.q2Li2")}</li>
                        <li>{t("auecSection.q2Li3")}</li>
                        <li>{t("auecSection.q2Li4")}</li>
                    </ul>
                </Q>
                <Q q={t("auecSection.q3")}>
                    <P>{t.rich("auecSection.q3Body", rich)}</P>
                </Q>
            </Section>

            {/* ── PRO Plan ── */}
            <Section icon={CreditCard} title={t("proSection.title")} subtitle={t("proSection.subtitle")}>
                <Q q={t("proSection.q1")}>
                    <P>{t("proSection.q1Body")}</P>
                </Q>
                <Q q={t("proSection.q2")}>
                    <P>{t("proSection.q2Intro")}</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>{t.rich("proSection.q2Li1", rich)}</li>
                        <li>{t.rich("proSection.q2Li2", rich)}</li>
                        <li>{t.rich("proSection.q2Li3", rich)}</li>
                        <li>{t.rich("proSection.q2Li4", rich)}</li>
                        <li>{t.rich("proSection.q2Li5", rich)}</li>
                    </ul>
                </Q>
                <Q q={t("proSection.q3")}>
                    <P>{t.rich("proSection.q3Body", rich)}</P>
                </Q>
                <Q q={t("proSection.q4")}>
                    <P>{t.rich("proSection.q4Body", rich)}</P>
                </Q>
                <Q q={t("proSection.q5")}>
                    <P>{t.rich("proSection.q5Intro", rich)}</P>
                    <div className="space-y-2">
                        <Step n={1}>{t.rich("proSection.q5Step1", rich)}</Step>
                        <Step n={2}>{t.rich("proSection.q5Step2", rich)}</Step>
                        <Step n={3}>{t.rich("proSection.q5Step3", rich)}</Step>
                    </div>
                    <P>{t("proSection.q5Outro")}</P>
                </Q>
                <Q q={t("proSection.q6")}>
                    <P>{t.rich("proSection.q6Intro", rich)}</P>
                    <div className="space-y-2">
                        <Step n={1}>{t.rich("proSection.q6Step1", rich)}</Step>
                        <Step n={2}>{t("proSection.q6Step2")}</Step>
                        <Step n={3}>{t("proSection.q6Step3")}</Step>
                        <Step n={4}>{t("proSection.q6Step4")}</Step>
                    </div>
                    <P>{t("proSection.q6Outro")}</P>
                </Q>
                <Q q={t("proSection.q7")}>
                    <P>{t.rich("proSection.q7Body", rich)}</P>
                </Q>
            </Section>

            {/* ── Reporting ── */}
            <Section icon={BarChart3} title={t("reportingSection.title")} subtitle={t("reportingSection.subtitle")}>
                <Q q={t("reportingSection.q1")}>
                    <P>{t("reportingSection.q1Body")}</P>
                </Q>
                <Q q={t("reportingSection.q2")}>
                    <P>{t("reportingSection.q2Intro")}</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>{t.rich("reportingSection.q2Li1", rich)}</li>
                        <li>{t.rich("reportingSection.q2Li2", rich)}</li>
                        <li>{t.rich("reportingSection.q2Li3", rich)}</li>
                        <li>{t.rich("reportingSection.q2Li4", rich)}</li>
                        <li>{t.rich("reportingSection.q2Li5", rich)}</li>
                        <li>{t.rich("reportingSection.q2Li6", rich)}</li>
                    </ul>
                </Q>
                <Q q={t("reportingSection.q3")}>
                    <P>{t.rich("reportingSection.q3Body", rich)}</P>
                </Q>
                <Q q={t("reportingSection.q4")}>
                    <P>{t("reportingSection.q4Intro")}</P>
                    <div className="space-y-2">
                        <Step n={1}>{t.rich("reportingSection.q4Step1", rich)}</Step>
                        <Step n={2}>{t.rich("reportingSection.q4Step2", rich)}</Step>
                        <Step n={3}>{t("reportingSection.q4Step3")}</Step>
                    </div>
                </Q>
                <Q q={t("reportingSection.q5")}>
                    <P>{t.rich("reportingSection.q5Body", rich)}</P>
                </Q>
                <Q q={t("reportingSection.q6")}>
                    <P>{t("reportingSection.q6Body")}</P>
                </Q>
            </Section>

            {/* ── Transactions ── */}
            <Section icon={ArrowLeftRight} title={t("transactionsSection.title")} subtitle={t("transactionsSection.subtitle")}>
                <Q q={t("transactionsSection.q1")}>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>{t.rich("transactionsSection.q1Li1", rich)}</li>
                        <li>{t.rich("transactionsSection.q1Li2", rich)}</li>
                    </ul>
                </Q>
                <Q q={t("transactionsSection.q2")}>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2"><StatusBadge status="requested" /><span className="ml-1">{t("transactionsSection.q2Li1")}</span></div>
                        <div className="flex items-start gap-2"><StatusBadge status="approved" /><span className="ml-1">{t("transactionsSection.q2Li2")}</span></div>
                        <div className="flex items-start gap-2"><StatusBadge status="completed" /><span className="ml-1">{t("transactionsSection.q2Li3")}</span></div>
                        <div className="flex items-start gap-2"><StatusBadge status="rejected" /><span className="ml-1">{t("transactionsSection.q2Li4")}</span></div>
                        <div className="flex items-start gap-2"><StatusBadge status="cancelled" /><span className="ml-1">{t("transactionsSection.q2Li5")}</span></div>
                    </div>
                </Q>
                <Q q={t("transactionsSection.q3")}>
                    <P>{t("transactionsSection.q3Intro")}</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>{t.rich("transactionsSection.q3Li1", rich)}</li>
                        <li>{t.rich("transactionsSection.q3Li2", rich)}</li>
                        <li>{t.rich("transactionsSection.q3Li3", rich)}</li>
                        <li>{t.rich("transactionsSection.q3Li4", rich)}</li>
                    </ul>
                </Q>
                <Q q={t("transactionsSection.q4")}>
                    <P>{t.rich("transactionsSection.q4Body", rich)}</P>
                </Q>
            </Section>

            {/* ── Members ── */}
            <Section icon={Users} title={t("membersSection.title")} subtitle={t("membersSection.subtitle")}>
                <Q q={t("membersSection.q1")}>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>{t.rich("membersSection.q1Li1", rich)}</li>
                        <li>{t.rich("membersSection.q1Li2", rich)}</li>
                        <li>{t.rich("membersSection.q1Li3", rich)}</li>
                        <li>{t.rich("membersSection.q1Li4", rich)}</li>
                    </ul>
                </Q>
                <Q q={t("membersSection.q2")}>
                    <P>{t.rich("membersSection.q2Body", rich)}</P>
                </Q>
                <Q q={t("membersSection.q3")}>
                    <P>{t.rich("membersSection.q3Body", rich)}</P>
                </Q>
                <Q q={t("membersSection.q4")}>
                    <P>{t("membersSection.q4Body")}</P>
                </Q>
                <Q q={t("membersSection.q5")}>
                    <P>{t.rich("membersSection.q5Body", rich)}</P>
                </Q>
                <Q q={t("membersSection.q6")}>
                    <P>{t.rich("membersSection.q6Body", rich)}</P>
                </Q>
                <Q q={t("membersSection.q7")}>
                    <P>{t.rich("membersSection.q7Body", rich)}</P>
                </Q>
            </Section>

            {/* ── Discord Bot ── */}
            <Section icon={Bot} title={t("discordBot.title")} subtitle={t("discordBot.subtitle")}>
                <Q q={t("discordBot.q1")}>
                    <div className="space-y-2">
                        <Step n={1}>{t.rich("discordBot.q1Step1", rich)}</Step>
                        <Step n={2}>{t.rich("discordBot.q1Step2", rich)}</Step>
                        <Step n={3}>{t.rich("discordBot.q1Step3", rich)}</Step>
                        <Step n={4}>{t.rich("discordBot.q1Step4", rich)}</Step>
                    </div>
                    <p className="mt-2" style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)", fontSize: 13 }}>
                        {t("discordBot.q1note")}
                    </p>
                </Q>
                <Q q={t("discordBot.q2")}>
                    <P>{t.rich("discordBot.q2Body", rich)}</P>
                </Q>
                <Q q={t("discordBot.q3")}>
                    <P>{t("discordBot.q3Intro")}</P>
                    <div className="space-y-3">
                        <CommandBlock label={t("discordBot.q3SellLabel")}>
                            <p>{t.rich("discordBot.q3SellBody", rich)}</p>
                            <ul className="ml-4 mt-1 list-disc space-y-0.5">
                                <li>{t.rich("discordBot.q3SellItem", rich)}</li>
                                <li>{t.rich("discordBot.q3SellQty", rich)}</li>
                                <li>{t.rich("discordBot.q3SellPrice", rich)}</li>
                                <li>{t.rich("discordBot.q3SellNote", rich)}</li>
                            </ul>
                        </CommandBlock>
                        <CommandBlock label={t("discordBot.q3BuyLabel")}>
                            <p>{t.rich("discordBot.q3BuyBody", rich)}</p>
                        </CommandBlock>
                        <CommandBlock label={t("discordBot.q3InventoryLabel")}>
                            <p>{t("discordBot.q3InventoryBody")}</p>
                        </CommandBlock>
                    </div>
                    <P>{t.rich("discordBot.q3Outro", rich)}</P>
                </Q>
                <Q q={t("discordBot.q4")}>
                    <P>{t.rich("discordBot.q4Body", rich)}</P>
                </Q>
                <Q q={t("discordBot.q5")}>
                    <P>{t("discordBot.q5Intro")}</P>
                    <ul className="ml-4 list-disc space-y-0.5">
                        <li>{t("discordBot.q5Li1")}</li>
                        <li>{t("discordBot.q5Li2")}</li>
                        <li>{t("discordBot.q5Li3")}</li>
                    </ul>
                </Q>
                <Q q={t("discordBot.q6")}>
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <CheckCircle size={14} style={{ color: "rgba(80,210,120,0.7)", flexShrink: 0, marginTop: 1 }} />
                            <span><Highlight>Approve</Highlight> {t("discordBot.q6Li1")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <XCircle size={14} style={{ color: "rgba(220,80,80,0.7)", flexShrink: 0, marginTop: 1 }} />
                            <span><Highlight>Reject</Highlight> {t("discordBot.q6Li2")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle size={14} style={{ color: "rgba(79,195,220,0.7)", flexShrink: 0, marginTop: 1 }} />
                            <span><Highlight>Confirm Trade</Highlight> {t("discordBot.q6Li3")}</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <XCircle size={14} style={{ color: "rgba(140,140,160,0.6)", flexShrink: 0, marginTop: 1 }} />
                            <span><Highlight>Cancel</Highlight> {t("discordBot.q6Li4")}</span>
                        </div>
                    </div>
                    <P>{t("discordBot.q6Outro")}</P>
                </Q>
                <Q q={t("discordBot.q7")}>
                    <P>{t("discordBot.q7Body")}</P>
                </Q>
            </Section>

            {/* ── Settings ── */}
            <Section icon={Settings2} title={t("settingsSection.title")} subtitle={t("settingsSection.subtitle")}>
                <Q q={t("settingsSection.q1")}>
                    <div className="space-y-2">
                        <Step n={1}>{t("settingsSection.q1Step1")}</Step>
                        <Step n={2}>{t.rich("settingsSection.q1Step2", rich)}</Step>
                        <Step n={3}>{t("settingsSection.q1Step3")}</Step>
                        <Step n={4}>{t.rich("settingsSection.q1Step4", rich)}</Step>
                    </div>
                    <P>{t.rich("settingsSection.q1Outro", rich)}</P>
                </Q>
                <Q q={t("settingsSection.q2")}>
                    <P>{t.rich("settingsSection.q2Body", rich)}</P>
                </Q>
            </Section>

            {/* ── Audit Logs ── */}
            <Section icon={ShieldCheck} title={t("auditLogs.title")} subtitle={t("auditLogs.subtitle")}>
                <Q q={t("auditLogs.q1")}>
                    <P>{t("auditLogs.q1Intro")}</P>
                    <ul className="ml-4 list-disc space-y-0.5">
                        <li>{t("auditLogs.q1Li1")}</li>
                        <li>{t("auditLogs.q1Li2")}</li>
                        <li>{t("auditLogs.q1Li3")}</li>
                        <li>{t("auditLogs.q1Li4")}</li>
                        <li>{t("auditLogs.q1Li5")}</li>
                    </ul>
                </Q>
                <Q q={t("auditLogs.q2")}>
                    <P>{t.rich("auditLogs.q2Body", rich)}</P>
                </Q>
            </Section>

            {/* ── Quick Reference ── */}
            <Section icon={Terminal} title={t("quickRef.title")} subtitle={t("quickRef.subtitle")}>
                <div
                    className="overflow-x-auto rounded-lg border"
                    style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(4,12,20,0.6)" }}
                >
                    <table className="w-full text-[12px]" style={{ fontFamily: "var(--font-mono)" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(79,195,220,0.1)" }}>
                                {[t("quickRef.colCommand"), t("quickRef.colWho"), t("quickRef.colWhat")].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-2.5 text-left text-[10px] uppercase tracking-[0.2em]"
                                        style={{ color: "rgba(79,195,220,0.5)" }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["/sell",      t("quickRef.sellWho"),      t("quickRef.sellWhat")],
                                ["/buy",       t("quickRef.buyWho"),       t("quickRef.buyWhat")],
                                ["/inventory", t("quickRef.inventoryWho"), t("quickRef.inventoryWhat")],
                            ].map(([cmd, who, what]) => (
                                <tr
                                    key={cmd}
                                    style={{ borderBottom: "1px solid rgba(79,195,220,0.05)" }}
                                >
                                    <td className="px-4 py-2.5">
                                        <Code>{cmd}</Code>
                                    </td>
                                    <td className="px-4 py-2.5" style={{ color: "rgba(200,220,232,0.5)" }}>{who}</td>
                                    <td className="px-4 py-2.5" style={{ color: "rgba(200,220,232,0.5)" }}>{what}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div
                    className="mt-3 rounded-lg border p-4"
                    style={{ borderColor: "rgba(240,165,0,0.15)", background: "rgba(20,14,6,0.3)" }}
                >
                    <div className="flex items-start gap-2">
                        <Zap size={14} style={{ color: "rgba(240,165,0,0.7)", flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <p
                                className="mb-1 text-[10px] uppercase tracking-[0.15em]"
                                style={{ color: "rgba(240,165,0,0.7)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("quickRef.noteTitle")}
                            </p>
                            <p
                                className="text-[12px]"
                                style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("quickRef.noteText")}
                            </p>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}
