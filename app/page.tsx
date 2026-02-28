"use client";

import Link from "next/link";
import { useState } from "react";
import LegalDialog from "@/components/lega-dialog";

// ─── Background ───────────────────────────────────────────────────────────────

const STARS = [
    { top: "8%",  left: "6%",  size: 2, delay: "0s",   dur: "3s"   },
    { top: "18%", left: "82%", size: 1, delay: "1.2s",  dur: "4s"   },
    { top: "38%", left: "14%", size: 3, delay: "0.5s",  dur: "2.5s" },
    { top: "52%", left: "91%", size: 1, delay: "2s",    dur: "5s"   },
    { top: "68%", left: "47%", size: 2, delay: "0.8s",  dur: "3.5s" },
    { top: "83%", left: "72%", size: 1, delay: "1.5s",  dur: "4.5s" },
    { top: "28%", left: "58%", size: 2, delay: "0.3s",  dur: "3s"   },
    { top: "62%", left: "22%", size: 1, delay: "2.2s",  dur: "5.5s" },
    { top: "12%", left: "42%", size: 1, delay: "0.9s",  dur: "3.2s" },
    { top: "75%", left: "5%",  size: 2, delay: "1.8s",  dur: "4.2s" },
    { top: "45%", left: "65%", size: 1, delay: "0.6s",  dur: "2.8s" },
    { top: "90%", left: "38%", size: 2, delay: "1.1s",  dur: "3.8s" },
];

function Background() {
    return (
        <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
            <div className="absolute rounded-full" style={{
                width: 1000, height: 1000,
                top: "-25%", right: "-12%",
                background: "radial-gradient(circle, rgba(79,195,220,0.05) 0%, transparent 65%)",
                filter: "blur(80px)",
                animation: "drift 18s ease-in-out infinite alternate",
            }} />
            <div className="absolute rounded-full" style={{
                width: 700, height: 700,
                bottom: "-15%", left: "-12%",
                background: "radial-gradient(circle, rgba(240,165,0,0.04) 0%, transparent 70%)",
                filter: "blur(60px)",
                animation: "drift 22s ease-in-out infinite alternate-reverse",
            }} />
            <div className="absolute rounded-full" style={{
                width: 500, height: 500,
                top: "40%", left: "35%",
                background: "radial-gradient(circle, rgba(79,195,220,0.025) 0%, transparent 70%)",
                filter: "blur(50px)",
                animation: "drift 14s ease-in-out infinite alternate",
            }} />
            <div className="absolute inset-0 opacity-[0.018]" style={{
                backgroundImage: "linear-gradient(rgba(79,195,220,1) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,220,1) 1px, transparent 1px)",
                backgroundSize: "80px 80px",
            }} />
            {STARS.map((s, i) => (
                <div key={i} className="absolute rounded-full" style={{
                    top: s.top, left: s.left,
                    width: s.size, height: s.size,
                    background: i % 4 === 0 ? "rgba(240,165,0,0.8)" : "rgba(79,195,220,0.7)",
                    animation: `twinkle ${s.dur} ${s.delay} ease-in-out infinite`,
                }} />
            ))}
        </div>
    );
}

// ─── Section divider ─────────────────────────────────────────────────────────

function Divider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-4 py-2">
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.2))" }} />
            <span className="text-[9px] uppercase tracking-[0.35em]" style={{ color: "rgba(79,195,220,0.3)", fontFamily: "var(--font-mono)" }}>
                {label}
            </span>
            <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(79,195,220,0.2), transparent)" }} />
        </div>
    );
}

// ─── Feature card ─────────────────────────────────────────────────────────────

function FeatureCard({
    icon, title, desc, tags, delay, accent = "rgba(79,195,220",
}: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    tags?: string[];
    delay: string;
    accent?: string;
}) {
    return (
        <div
            className="relative overflow-hidden rounded-lg border p-5"
            style={{
                borderColor: `${accent},0.12)`,
                background: `${accent},0.03)`,
                animation: `slide-in-up 0.6s ${delay} ease both`,
            }}
        >
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${accent},0.35), transparent)` }} />
            <div className="mb-3" style={{ color: `${accent},0.8)` }}>{icon}</div>
            <h3 className="mb-1.5 text-sm font-bold uppercase tracking-[0.1em]" style={{ color: `${accent},0.9)`, fontFamily: "var(--font-display)" }}>
                {title}
            </h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-ui)" }}>
                {desc}
            </p>
            {tags && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                        <span key={t} className="rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.12em]" style={{
                            color: `${accent},0.6)`,
                            background: `${accent},0.07)`,
                            border: `1px solid ${accent},0.15)`,
                            fontFamily: "var(--font-mono)",
                        }}>
                            {t}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Mock Discord Embed ───────────────────────────────────────────────────────

function MockEmbed() {
    return (
        <div className="w-full max-w-sm rounded-lg border overflow-hidden" style={{
            borderColor: "rgba(79,195,220,0.2)",
            background: "rgba(30,31,34,0.95)",
        }}>
            <div className="h-1" style={{ background: "rgba(240,165,0,0.85)" }} />
            <div className="p-4">
                <p className="mb-3 text-[11px] uppercase tracking-[0.2em]" style={{ color: "rgba(240,165,0,0.7)", fontFamily: "var(--font-mono)" }}>
                    New Transaction Request
                </p>
                <div className="space-y-1.5 text-[12px]" style={{ fontFamily: "var(--font-mono)" }}>
                    {[
                        { k: "Item",      v: "Laranite",        vc: "rgba(79,195,220,0.9)"  },
                        { k: "Direction", v: "Sell → Org",      vc: "rgba(200,220,232,0.7)" },
                        { k: "Qty",       v: "200×",            vc: "rgba(200,220,232,0.7)" },
                        { k: "Total",     v: "480,000 aUEC",    vc: "rgba(80,210,120,0.9)"  },
                        { k: "Member",    v: "StarPilot_77",    vc: "rgba(200,220,232,0.7)" },
                    ].map(({ k, v, vc }) => (
                        <div key={k} className="flex gap-3">
                            <span className="w-20 shrink-0" style={{ color: "rgba(200,220,232,0.3)" }}>{k}</span>
                            <span style={{ color: vc }}>{v}</span>
                        </div>
                    ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {[
                        { label: "✓ Approve", color: "rgba(80,210,120"  },
                        { label: "✕ Reject",  color: "rgba(220,80,80"   },
                        { label: "⊘ Cancel",  color: "rgba(140,140,160" },
                    ].map(({ label, color }) => (
                        <div key={label} className="rounded px-3 py-1 text-[11px] font-semibold" style={{
                            color: `${color},0.9)`,
                            background: `${color},0.1)`,
                            border: `1px solid ${color},0.25)`,
                            fontFamily: "var(--font-mono)",
                        }}>
                            {label}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Mock Dashboard ───────────────────────────────────────────────────────────

function MockDashboard() {
    return (
        <div className="w-full max-w-sm space-y-3">
            <div className="grid grid-cols-2 gap-2">
                {[
                    { label: "Active Requests",    value: "12",       color: "rgba(240,165,0"   },
                    { label: "Completed / Month",  value: "84",       color: "rgba(80,210,120"  },
                    { label: "Revenue / Month",    value: "2.4M aUEC",color: "rgba(79,195,220"  },
                    { label: "Inventory Items",    value: "31",       color: "rgba(160,120,220" },
                ].map(({ label, value, color }) => (
                    <div key={label} className="rounded border p-3" style={{
                        borderColor: `${color},0.15)`,
                        background: `${color},0.04)`,
                    }}>
                        <p className="text-[9px] uppercase tracking-[0.18em]" style={{ color: `${color},0.55)`, fontFamily: "var(--font-mono)" }}>{label}</p>
                        <p className="mt-1 text-lg font-bold tracking-wider" style={{ color: `${color},0.9)`, fontFamily: "var(--font-display)" }}>{value}</p>
                    </div>
                ))}
            </div>
            <div className="rounded border p-3" style={{ borderColor: "rgba(79,195,220,0.08)", background: "rgba(4,12,20,0.6)" }}>
                <div className="mb-2 flex items-center justify-between">
                    <p className="text-[9px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>Live Activity Feed</p>
                    <span className="text-[9px] uppercase tracking-[0.15em]" style={{ color: "rgba(80,210,120,0.7)", fontFamily: "var(--font-mono)" }}>● Live</span>
                </div>
                {[
                    { status: "Completed", item: "Diamond",  color: "rgba(80,210,120,0.85)" },
                    { status: "Approved",  item: "Laranite", color: "rgba(79,195,220,0.85)" },
                    { status: "Requested", item: "Bexalite", color: "rgba(240,165,0,0.85)"  },
                ].map((e) => (
                    <div key={e.item} className="mb-1 flex items-center gap-2 py-1 text-[11px]" style={{
                        fontFamily: "var(--font-mono)",
                        borderLeft: `2px solid ${e.color.replace("0.85", "0.35")}`,
                        paddingLeft: 8,
                    }}>
                        <span className="w-16 shrink-0" style={{ color: e.color }}>{e.status}</span>
                        <span style={{ color: "rgba(79,195,220,0.8)" }}>{e.item}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
    const [showLegal, setShowLegal] = useState(false);

    return (
        <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
            {showLegal && <LegalDialog onClose={() => setShowLegal(false)} />}
            <div className="scan-overlay" />
            <Background />

            <div className="relative z-10 flex min-h-screen flex-col">

                {/* ── NAV ──────────────────────────────────────────────── */}
                <nav className="flex items-center justify-between px-6 py-5 sm:px-10" style={{
                    borderBottom: "1px solid rgba(79,195,220,0.08)",
                    animation: "slide-in-up 0.4s ease forwards",
                }}>
                    <div className="flex items-center gap-3">
                        <div className="relative flex h-7 w-7 items-center justify-center">
                            <div className="absolute inset-0 rounded-full border" style={{ borderColor: "rgba(79,195,220,0.3)", animation: "rotate-slow 20s linear infinite" }} />
                            <div className="h-3 w-3 rotate-45 border" style={{ borderColor: "var(--accent-primary)" }} />
                        </div>
                        <span className="text-xs uppercase tracking-[0.3em]" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                            Orga Inventory
                        </span>
                    </div>
                    <div className="flex items-center gap-5">
                        <div className="hidden items-center gap-2 sm:flex">
                            <span className="status-dot online" />
                            <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>
                                Systems Online
                            </span>
                        </div>
                        <Link href="/login" className="sc-btn sc-btn-primary px-5 py-2.5 text-xs">
                            Access Terminal
                        </Link>
                    </div>
                </nav>

                {/* ── HERO ─────────────────────────────────────────────── */}
                <section className="flex flex-col items-center px-6 pt-24 pb-20 text-center sm:px-10">
                    <div className="mb-6 flex items-center gap-3" style={{ animation: "slide-in-up 0.5s 0.1s ease both" }}>
                        <div className="h-px w-10" style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary))" }} />
                        <span className="text-[10px] uppercase tracking-[0.4em]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
                            United Empire of Earth — Org Commerce
                        </span>
                        <div className="h-px w-10" style={{ background: "linear-gradient(90deg, var(--accent-primary), transparent)" }} />
                    </div>

                    <h1 className="mb-5 text-5xl font-black uppercase leading-tight tracking-widest sm:text-6xl lg:text-7xl"
                        style={{
                            color: "var(--accent-primary)",
                            fontFamily: "var(--font-display)",
                            animation: "slide-in-up 0.6s 0.15s ease both, flicker 10s 2s infinite",
                        }}
                    >
                        Trade Command<br />
                        <span style={{ color: "var(--accent-secondary)" }}>Center</span>
                    </h1>

                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em]" style={{
                        color: "rgba(200,220,232,0.45)",
                        fontFamily: "var(--font-display)",
                        animation: "slide-in-up 0.6s 0.2s ease both",
                    }}>
                        For Star Citizen Organizations
                    </p>

                    <p className="mb-10 max-w-2xl text-base leading-relaxed" style={{
                        color: "rgba(200,220,232,0.52)",
                        fontFamily: "var(--font-ui)",
                        animation: "slide-in-up 0.6s 0.25s ease both",
                    }}>
                        Real-time inventory management, Discord-native buy/sell requests with interactive bot embeds,
                        full transaction approval workflows, and live dashboards — all in one HUD built for serious orgs.
                    </p>

                    {/* Feature pills */}
                    <div className="mb-10 flex flex-wrap justify-center gap-2" style={{ animation: "slide-in-up 0.6s 0.3s ease both" }}>
                        {[
                            "Real-time Dashboard",
                            "Discord Bot Included",
                            "Buy / Sell Workflows",
                            "Auto Stock Tracking",
                            "Role-based Access",
                            "Full Audit Trail",
                        ].map((b) => (
                            <span key={b} className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.12em]" style={{
                                borderColor: "rgba(79,195,220,0.2)",
                                color: "rgba(79,195,220,0.6)",
                                background: "rgba(79,195,220,0.04)",
                                fontFamily: "var(--font-mono)",
                            }}>
                                {b}
                            </span>
                        ))}
                    </div>

                    <div style={{ animation: "slide-in-up 0.6s 0.35s ease both" }}>
                        <Link href="/login" className="sc-btn sc-btn-primary inline-flex items-center gap-3 px-10 py-4 text-sm animate-pulse-glow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M14 12H3" />
                            </svg>
                            Access Terminal
                        </Link>
                    </div>
                </section>

                {/* ── HOW IT WORKS ─────────────────────────────────────── */}
                <section className="px-6 pb-20 sm:px-10">
                    <div className="mx-auto max-w-5xl">
                        <Divider label="How it works" />
                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                {
                                    n: "01", color: "rgba(240,165,0", delay: "0s",
                                    title: "Create Request",
                                    desc: "A member initiates a buy or sell via the web terminal or Discord slash commands — with inventory autocomplete.",
                                },
                                {
                                    n: "02", color: "rgba(79,195,220", delay: "0.1s",
                                    title: "Review & Approve",
                                    desc: "An admin approves or rejects — directly in the terminal or by clicking a button on the Discord embed.",
                                },
                                {
                                    n: "03", color: "rgba(160,120,220", delay: "0.2s",
                                    title: "In-Game Trade",
                                    desc: "Both parties complete the exchange inside Star Citizen, then each confirms it in the terminal or via Discord.",
                                },
                                {
                                    n: "04", color: "rgba(80,210,120", delay: "0.3s",
                                    title: "Auto Complete",
                                    desc: "Once both sides confirm, the transaction closes and inventory stock adjusts automatically. Charts update in real time.",
                                },
                            ].map(({ n, title, desc, color, delay }) => (
                                <div key={n} className="relative overflow-hidden rounded-lg border p-5" style={{
                                    borderColor: `${color},0.15)`,
                                    background: `${color},0.03)`,
                                    animation: `slide-in-up 0.6s ${delay} ease both`,
                                }}>
                                    <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${color},0.3), transparent)` }} />
                                    <p className="mb-2 text-3xl font-black" style={{ color: `${color},0.12)`, fontFamily: "var(--font-display)" }}>{n}</p>
                                    <h3 className="mb-2 text-sm font-bold uppercase tracking-[0.08em]" style={{ color: `${color},0.85)`, fontFamily: "var(--font-display)" }}>
                                        {title}
                                    </h3>
                                    <p className="text-[12px] leading-relaxed" style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-ui)" }}>
                                        {desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ── FEATURE GRID ─────────────────────────────────────── */}
                <section className="px-6 pb-20 sm:px-10">
                    <div className="mx-auto max-w-5xl">
                        <Divider label="Features" />
                        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            <FeatureCard
                                delay="0s" accent="rgba(79,195,220"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>}
                                title="Live Dashboard"
                                desc="Real-time KPI cards, 30-day revenue and volume charts, top-performing items, and a live activity feed — all updated the moment any transaction changes state."
                                tags={["SSE push", "SVG charts", "Auto-refresh"]}
                            />
                            <FeatureCard
                                delay="0.08s" accent="rgba(80,210,120"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>}
                                title="Inventory Management"
                                desc="Full catalogue of org goods with auto stock sync. Stock adjusts automatically when trades complete. Search the Star Citizen item database directly."
                                tags={["Auto stock sync", "SC item search"]}
                            />
                            <FeatureCard
                                delay="0.16s" accent="rgba(240,165,0"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>}
                                title="Buy & Sell Workflows"
                                desc="Full multi-step lifecycle: request → approve → in-game confirm → complete. Either party can initiate, both must confirm before stock moves."
                                tags={["5 statuses", "Dual confirm", "Cancel anytime"]}
                            />
                            <FeatureCard
                                delay="0.24s" accent="rgba(88,101,242"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.132 18.11a19.963 19.963 0 0 0 6.011 3.037.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.037.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z"/></svg>}
                                title="Discord Bot"
                                desc="Members use /sell and /buy with inventory autocomplete. Every transaction posts a rich embed with live action buttons — approve, confirm, cancel — without leaving Discord."
                                tags={["Slash commands", "Autocomplete", "Interactive embeds"]}
                            />
                            <FeatureCard
                                delay="0.32s" accent="rgba(160,120,220"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
                                title="Member Management"
                                desc="Three-tier role system (owner / admin / member). Invite new members via Discord DM. Manage roles and remove members from the web terminal."
                                tags={["3 roles", "Discord invites"]}
                            />
                            <FeatureCard
                                delay="0.4s" accent="rgba(220,80,80"
                                icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                                title="Audit Trail"
                                desc="Every action — transaction changes, inventory edits, role changes, settings updates — is recorded with timestamp and actor. Full history for org owners."
                                tags={["Immutable log", "Owner only"]}
                            />
                        </div>
                    </div>
                </section>

                {/* ── DISCORD SPOTLIGHT ────────────────────────────────── */}
                <section className="px-6 pb-20 sm:px-10">
                    <div className="mx-auto max-w-5xl">
                        <Divider label="Discord Integration" />
                        <div className="mt-8 overflow-hidden rounded-lg border" style={{
                            borderColor: "rgba(88,101,242,0.2)",
                            background: "rgba(88,101,242,0.03)",
                        }}>
                            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(88,101,242,0.5), transparent)" }} />
                            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:gap-12">
                                <div className="space-y-5">
                                    <div>
                                        <p className="mb-1 text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(88,101,242,0.6)", fontFamily: "var(--font-mono)" }}>
                                            Discord-native trading
                                        </p>
                                        <h3 className="text-xl font-bold uppercase tracking-[0.08em]" style={{ color: "rgba(88,101,242,0.9)", fontFamily: "var(--font-display)" }}>
                                            Never leave Discord
                                        </h3>
                                    </div>
                                    <p className="text-[13px] leading-relaxed" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-ui)" }}>
                                        The bot integrates fully into your org&apos;s workflow. Members create trade requests,
                                        admins approve them, and both sides confirm the in-game exchange —
                                        all through interactive Discord embeds that update in real time.
                                    </p>
                                    <div className="space-y-3">
                                        {[
                                            { cmd: "/sell", desc: "Sell goods to the org — picks items from your inventory with live autocomplete" },
                                            { cmd: "/buy",  desc: "Request to purchase from the org stockpile — same autocomplete experience" },
                                        ].map(({ cmd, desc }) => (
                                            <div key={cmd} className="flex items-start gap-3 rounded border p-3" style={{
                                                borderColor: "rgba(88,101,242,0.15)",
                                                background: "rgba(88,101,242,0.05)",
                                            }}>
                                                <code className="mt-0.5 shrink-0 rounded px-2 py-0.5 text-[11px]" style={{
                                                    color: "rgba(88,101,242,0.9)",
                                                    background: "rgba(88,101,242,0.12)",
                                                    fontFamily: "var(--font-mono)",
                                                }}>
                                                    {cmd}
                                                </code>
                                                <p className="text-[12px]" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-ui)" }}>
                                                    {desc}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-[11px]" style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}>
                                        ↳ One Discord server per org · Notification channel configurable in Settings
                                    </p>
                                </div>
                                <div className="flex items-start justify-center lg:justify-end">
                                    <MockEmbed />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── DASHBOARD PREVIEW ────────────────────────────────── */}
                <section className="px-6 pb-20 sm:px-10">
                    <div className="mx-auto max-w-5xl">
                        <Divider label="Live Dashboard" />
                        <div className="mt-8 overflow-hidden rounded-lg border" style={{
                            borderColor: "rgba(79,195,220,0.12)",
                            background: "rgba(4,12,20,0.5)",
                        }}>
                            <div className="h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.4), transparent)" }} />
                            <div className="grid grid-cols-1 gap-8 p-6 lg:grid-cols-2 lg:gap-12">
                                <div className="space-y-4">
                                    <div>
                                        <p className="mb-1 text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                                            Always in the know
                                        </p>
                                        <h3 className="text-xl font-bold uppercase tracking-[0.08em]" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                                            Real-time org overview
                                        </h3>
                                    </div>
                                    <p className="text-[13px] leading-relaxed" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-ui)" }}>
                                        The dashboard connects live to the server. The moment any transaction changes state —
                                        anywhere, by anyone — you receive a toast notification and the dashboard silently refreshes.
                                        No manual refresh, no polling.
                                    </p>
                                    <ul className="space-y-2">
                                        {[
                                            "KPI cards: active requests, completed trades, revenue, item count",
                                            "30-day revenue area chart and sell/buy volume bar chart",
                                            "Top 5 items by revenue with percentage bars",
                                            "Last 10 completed trades at a glance",
                                            "Live activity feed with real-time status updates",
                                        ].map((item) => (
                                            <li key={item} className="flex items-start gap-2 text-[12px]" style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}>
                                                <span style={{ color: "var(--accent-primary)", flexShrink: 0 }}>▸</span>
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="flex items-start justify-center lg:justify-end">
                                    <MockDashboard />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── BOTTOM CTA ───────────────────────────────────────── */}
                <section className="px-6 pb-20 text-center sm:px-10">
                    <div className="mx-auto max-w-xl">
                        <p className="mb-4 text-[10px] uppercase tracking-[0.35em]" style={{ color: "rgba(79,195,220,0.35)", fontFamily: "var(--font-mono)" }}>
                            Ready to launch
                        </p>
                        <h2 className="mb-4 text-3xl font-black uppercase tracking-widest" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                            Get your org online
                        </h2>
                        <p className="mb-8 text-sm leading-relaxed" style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-ui)" }}>
                            Log in with Discord, create an organization, connect the bot to your server,
                            and start managing trades in minutes.
                        </p>
                        <Link href="/login" className="sc-btn sc-btn-primary inline-flex items-center gap-3 px-10 py-4 text-sm">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M14 12H3" />
                            </svg>
                            Access Terminal
                        </Link>
                    </div>
                </section>

                {/* ── FOOTER ───────────────────────────────────────────── */}
                <footer className="flex items-center justify-center gap-6 px-8 py-4" style={{ borderTop: "1px solid rgba(79,195,220,0.08)" }}>
                    <span className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.18)", fontFamily: "var(--font-mono)" }}>
                        Unauthorized access is a violation of UEE code §18.7 — v0.1.0
                    </span>
                    <span style={{ color: "rgba(79,195,220,0.1)" }}>|</span>
                    <button
                        onClick={() => setShowLegal(true)}
                        className="cursor-pointer text-[10px] uppercase tracking-[0.2em] transition-colors hover:text-cyan-400"
                        style={{ color: "rgba(79,195,220,0.3)", fontFamily: "var(--font-mono)" }}
                    >
                        Legal
                    </button>
                </footer>
            </div>
        </div>
    );
}
