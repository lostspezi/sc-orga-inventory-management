"use client";

import Link from "next/link";
import {useState} from "react";
import ImpressumModal from "@/components/imprint-modal";

export default function Home() {
    const [showImpressum, setShowImpressum] = useState<boolean>(false);

    return (
        <div className="relative min-h-screen overflow-hidden" style={{background: "var(--background)"}}>

            {showImpressum && <ImpressumModal onClose={() => setShowImpressum(false)}/>}

            {/* ── Scan-line overlay ── */}
            <div className="scan-overlay"/>

            {/* ── Background atmosphere ── */}
            <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
                <div className="absolute rounded-full" style={{
                    width: 900,
                    height: 900,
                    top: "-20%",
                    right: "-10%",
                    background: "radial-gradient(circle, rgba(79,195,220,0.05) 0%, transparent 65%)",
                    filter: "blur(80px)",
                    animation: "drift 16s ease-in-out infinite alternate"
                }}/>
                <div className="absolute rounded-full" style={{
                    width: 600,
                    height: 600,
                    bottom: "-10%",
                    left: "-10%",
                    background: "radial-gradient(circle, rgba(240,165,0,0.04) 0%, transparent 70%)",
                    filter: "blur(60px)",
                    animation: "drift 20s ease-in-out infinite alternate-reverse"
                }}/>
                <div className="absolute inset-0 opacity-[0.025]" style={{
                    backgroundImage: "linear-gradient(rgba(79,195,220,1) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,220,1) 1px, transparent 1px)",
                    backgroundSize: "80px 80px"
                }}/>
                {[
                    {top: "10%", left: "5%", size: 2, delay: "0s", dur: "3s"},
                    {top: "20%", left: "80%", size: 1, delay: "1.2s", dur: "4s"},
                    {top: "40%", left: "15%", size: 3, delay: "0.5s", dur: "2.5s"},
                    {top: "55%", left: "90%", size: 1, delay: "2s", dur: "5s"},
                    {top: "70%", left: "45%", size: 2, delay: "0.8s", dur: "3.5s"},
                    {top: "85%", left: "70%", size: 1, delay: "1.5s", dur: "4.5s"},
                    {top: "30%", left: "55%", size: 2, delay: "0.3s", dur: "3s"},
                    {top: "65%", left: "25%", size: 1, delay: "2.2s", dur: "5.5s"},
                ].map((s, i) => (
                    <div key={i} className="absolute rounded-full" style={{
                        top: s.top,
                        left: s.left,
                        width: s.size,
                        height: s.size,
                        background: i % 4 === 0 ? "rgba(240,165,0,0.8)" : "rgba(79,195,220,0.7)",
                        animation: `twinkle ${s.dur} ${s.delay} ease-in-out infinite`
                    }}/>
                ))}
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 flex min-h-screen flex-col">

                {/* ── Nav ── */}
                <nav className="flex items-center justify-between px-8 py-6" style={{
                    borderBottom: "1px solid rgba(79,195,220,0.08)",
                    animation: "slide-in-up 0.4s ease forwards"
                }}>
                    <div className="flex items-center gap-3">
                        <div className="relative h-7 w-7 flex items-center justify-center">
                            <div className="absolute inset-0 rounded-full border" style={{
                                borderColor: "rgba(79,195,220,0.3)",
                                animation: "rotate-slow 20s linear infinite"
                            }}/>
                            <div className="h-3 w-3 rotate-45 border" style={{borderColor: "var(--accent-primary)"}}/>
                        </div>
                        <span className="text-xs tracking-[0.3em] uppercase"
                              style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}>
                            Orga Inventory
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="status-dot online"/>
                        <span className="text-[10px] tracking-[0.2em] uppercase"
                              style={{color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)"}}>
                            Systems Online
                        </span>
                    </div>
                </nav>

                {/* ── Hero ── */}
                <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
                    <div className="mb-6 flex items-center gap-3"
                         style={{animation: "slide-in-up 0.5s 0.1s ease both"}}>
                        <div className="h-px w-12"
                             style={{background: "linear-gradient(90deg, transparent, var(--accent-primary))"}}/>
                        <span className="text-[10px] tracking-[0.4em] uppercase"
                              style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}>
                            United Empire of Earth — Org Commerce
                        </span>
                        <div className="h-px w-12"
                             style={{background: "linear-gradient(90deg, var(--accent-primary), transparent)"}}/>
                    </div>

                    <h1
                        className="mb-4 text-5xl font-black uppercase leading-tight tracking-widest sm:text-6xl lg:text-7xl"
                        style={{
                            color: "var(--accent-primary)",
                            fontFamily: "var(--font-display)",
                            animation: "slide-in-up 0.6s 0.15s ease both, flicker 10s 2s infinite"
                        }}
                    >
                        Orga<br/>
                        <span style={{color: "var(--accent-secondary)"}}>Inventory</span>
                    </h1>

                    <p
                        className="mb-3 text-sm font-semibold uppercase tracking-[0.3em]"
                        style={{
                            color: "rgba(200,220,232,0.5)",
                            fontFamily: "var(--font-display)",
                            animation: "slide-in-up 0.6s 0.2s ease both"
                        }}
                    >
                        Management System
                    </p>

                    <p
                        className="mb-12 max-w-xl text-base leading-relaxed"
                        style={{
                            color: "rgba(200,220,232,0.55)",
                            fontFamily: "var(--font-ui)",
                            animation: "slide-in-up 0.6s 0.25s ease both"
                        }}
                    >
                        Members can sell goods to the organization or purchase directly from the
                        org&#39;s stockpile. Transparent pricing, full transaction history —
                        organized trade for serious Star Citizen orgs.
                    </p>

                    <div style={{animation: "slide-in-up 0.6s 0.35s ease both"}}>
                        <Link href="/login"
                              className="sc-btn sc-btn-primary inline-flex items-center gap-3 px-10 py-4 text-sm animate-pulse-glow">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2.5">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M14 12H3"/>
                            </svg>
                            Access Terminal
                        </Link>
                    </div>
                </section>

                {/* ── Feature cards ── */}
                <section className="px-6 pb-24">
                    <div className="mx-auto max-w-4xl grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {[
                            {
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                           strokeWidth="1.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                                </svg>,
                                label: "Org Stockpile",
                                desc: "Full overview of all goods and resources owned by the organization — always current and transparent.",
                                delay: "0.4s",
                            },
                            {
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                           strokeWidth="1.5">
                                    <polyline points="17 1 21 5 17 9"/>
                                    <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4"/>
                                    <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
                                </svg>,
                                label: "Sell to the Org",
                                desc: "Members can sell looted or farmed goods directly to the org — at fair, agreed-upon prices.",
                                delay: "0.5s",
                            },
                            {
                                icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                           strokeWidth="1.5">
                                    <circle cx="9" cy="21" r="1"/>
                                    <circle cx="20" cy="21" r="1"/>
                                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                                </svg>,
                                label: "Buy from Stockpile",
                                desc: "Members can purchase needed equipment, ammunition or cargo directly from the org's inventory.",
                                delay: "0.6s",
                            },
                        ].map((f) => (
                            <div key={f.label} className="hud-panel p-6"
                                 style={{animation: `slide-in-up 0.6s ${f.delay} ease both`}}>
                                <div className="mb-3" style={{color: "var(--accent-primary)"}}>{f.icon}</div>
                                <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest"
                                    style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}>
                                    {f.label}
                                </h3>
                                <p className="text-sm leading-relaxed"
                                   style={{color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-ui)"}}>
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer
                    className="flex items-center justify-center gap-6 px-8 py-4"
                    style={{borderTop: "1px solid rgba(79,195,220,0.08)"}}
                >
                    <span className="text-[10px] tracking-[0.2em] uppercase"
                          style={{color: "rgba(79,195,220,0.2)", fontFamily: "var(--font-mono)"}}>
                        Unauthorized access is a violation of UEE code §18.7 — v0.1.0
                    </span>
                    <span style={{color: "rgba(79,195,220,0.1)"}}>|</span>
                    <button
                        onClick={() => setShowImpressum(true)}
                        className="cursor-pointer text-[10px] tracking-[0.2em] uppercase transition-colors hover:text-cyan-400"
                        style={{color: "rgba(79,195,220,0.35)", fontFamily: "var(--font-mono)"}}
                    >
                        Imprint
                    </button>
                </footer>
            </div>
        </div>
    );
}