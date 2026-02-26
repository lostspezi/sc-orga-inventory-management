export default function GlobalLoading() {
    return (
        <div
            className="relative min-h-screen overflow-hidden"
            style={{ background: "var(--background)" }}
        >
            {/* ── Scan-line overlay ── */}
            <div className="scan-overlay" />

            {/* ── Background atmosphere ── */}
            <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 900,
                        height: 900,
                        top: "-20%",
                        right: "-10%",
                        background:
                            "radial-gradient(circle, rgba(79,195,220,0.05) 0%, transparent 65%)",
                        filter: "blur(80px)",
                        animation: "drift 16s ease-in-out infinite alternate",
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 600,
                        height: 600,
                        bottom: "-10%",
                        left: "-10%",
                        background:
                            "radial-gradient(circle, rgba(240,165,0,0.04) 0%, transparent 70%)",
                        filter: "blur(60px)",
                        animation: "drift 20s ease-in-out infinite alternate-reverse",
                    }}
                />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(79,195,220,1) 1px, transparent 1px), linear-gradient(90deg, rgba(79,195,220,1) 1px, transparent 1px)",
                        backgroundSize: "80px 80px",
                    }}
                />

                {[
                    { top: "10%", left: "5%", size: 2, delay: "0s", dur: "3s" },
                    { top: "20%", left: "80%", size: 1, delay: "1.2s", dur: "4s" },
                    { top: "40%", left: "15%", size: 3, delay: "0.5s", dur: "2.5s" },
                    { top: "55%", left: "90%", size: 1, delay: "2s", dur: "5s" },
                    { top: "70%", left: "45%", size: 2, delay: "0.8s", dur: "3.5s" },
                    { top: "85%", left: "70%", size: 1, delay: "1.5s", dur: "4.5s" },
                ].map((s, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            top: s.top,
                            left: s.left,
                            width: s.size,
                            height: s.size,
                            background:
                                i % 4 === 0
                                    ? "rgba(240,165,0,0.8)"
                                    : "rgba(79,195,220,0.7)",
                            animation: `twinkle ${s.dur} ${s.delay} ease-in-out infinite`,
                        }}
                    />
                ))}
            </div>

            {/* ── Content ── */}
            <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-10">
                <div className="w-full max-w-2xl text-center">
                    {/* Top badge */}
                    <div
                        className="mb-6 inline-flex items-center gap-3"
                        style={{ animation: "slide-in-up 0.45s ease forwards" }}
                    >
                        <div
                            className="h-px w-10"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, var(--accent-primary))",
                            }}
                        />
                        <span
                            className="text-[10px] uppercase tracking-[0.4em]"
                            style={{
                                color: "rgba(79,195,220,0.5)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            United Empire of Earth
                        </span>
                        <div
                            className="h-px w-10"
                            style={{
                                background:
                                    "linear-gradient(90deg, var(--accent-primary), transparent)",
                            }}
                        />
                    </div>

                    {/* Core loading panel */}
                    <div
                        className="hud-panel corner-tr corner-bl relative p-6 sm:p-8"
                        style={{ animation: "slide-in-up 0.55s 0.05s ease both" }}
                    >
                        <div
                            className="absolute -top-px left-8 right-8 h-px"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                            }}
                        />
                        <div
                            className="absolute -top-5 left-1/2 -translate-x-1/2 px-3 text-[10px] uppercase tracking-[0.3em]"
                            style={{
                                color: "var(--accent-primary)",
                                fontFamily: "var(--font-mono)",
                                background: "var(--background)",
                            }}
                        >
                            SYS.LOADING
                        </div>

                        {/* Animated emblem */}
                        <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                            <div
                                className="absolute inset-0 rounded-full border"
                                style={{
                                    borderColor: "rgba(79,195,220,0.22)",
                                    animation: "rotate-slow 18s linear infinite",
                                }}
                            />
                            <div
                                className="absolute inset-2 rounded-full border"
                                style={{
                                    borderColor: "rgba(240,165,0,0.16)",
                                    animation: "rotate-slow 11s linear infinite reverse",
                                }}
                            />
                            <div
                                className="relative h-10 w-10 rotate-45 border-2"
                                style={{ borderColor: "var(--accent-primary)" }}
                            >
                                <div
                                    className="absolute inset-1"
                                    style={{ background: "rgba(79,195,220,0.12)" }}
                                />
                            </div>
                            <span
                                className="absolute"
                                style={{
                                    bottom: 6,
                                    right: 6,
                                    width: 10,
                                    height: 10,
                                    borderRadius: "9999px",
                                    background: "var(--accent-primary)",
                                    boxShadow: "0 0 0 0 rgba(79,195,220,0.5)",
                                    animation: "pulse-dot 1.8s ease-out infinite",
                                }}
                            />
                        </div>

                        <h1
                            className="text-2xl font-semibold uppercase tracking-[0.12em] sm:text-3xl"
                            style={{
                                color: "var(--accent-primary)",
                                fontFamily: "var(--font-display)",
                                animation: "flicker 8s infinite",
                            }}
                        >
                            Initializing Terminal
                        </h1>

                        <p
                            className="mx-auto mt-3 max-w-xl text-sm leading-6"
                            style={{
                                color: "rgba(200,220,232,0.45)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            Routing uplink established. Loading secure modules and synchronizing
                            organization data.
                        </p>

                        {/* Progress bar */}
                        <div className="mx-auto mt-6 max-w-lg">
                            <div className="mb-2 flex items-center justify-between">
                                <span
                                    className="text-[10px] uppercase tracking-[0.25em]"
                                    style={{
                                        color: "rgba(79,195,220,0.5)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    Loading Sequence
                                </span>
                                <span
                                    className="text-[10px]"
                                    style={{
                                        color: "rgba(79,195,220,0.35)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    In Progress
                                </span>
                            </div>

                            <div
                                className="relative h-2 overflow-hidden rounded-sm border"
                                style={{
                                    borderColor: "rgba(79,195,220,0.2)",
                                    background: "rgba(79,195,220,0.04)",
                                }}
                            >
                                <div
                                    className="absolute inset-y-0 left-0 w-[38%]"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, rgba(79,195,220,0.25), rgba(79,195,220,0.9))",
                                    }}
                                />
                                <div
                                    className="absolute inset-y-0 left-0 w-[35%]"
                                    style={{
                                        background:
                                            "linear-gradient(90deg, rgba(79,195,220,0.02), rgba(79,195,220,0.45), rgba(79,195,220,0.02))",
                                        animation: "loading-sweep 1.8s ease-in-out infinite",
                                    }}
                                />
                            </div>
                        </div>

                        {/* Faux terminal lines */}
                        <div
                            className="mt-6 rounded-lg border p-4 text-left"
                            style={{
                                borderColor: "rgba(79,195,220,0.12)",
                                background: "rgba(7,18,28,0.30)",
                            }}
                        >
                            <p
                                className="text-[11px] leading-6"
                                style={{
                                    color: "rgba(200,220,232,0.38)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                [BOOT] Core terminal shell initialized
                                <br />
                                [AUTH] Security layer handshake complete
                                <br />
                                [SYNC] Organization index ........ loading
                                <br />
                                [SYNC] Member registry .......... loading
                                <br />
                                [SYS] Awaiting route payload
                                <span
                                    style={{
                                        animation: "blink-cursor 1s steps(1) infinite",
                                    }}
                                >
                                    _
                                </span>
                            </p>
                        </div>

                        <div
                            className="absolute -bottom-px left-8 right-8 h-px"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, rgba(79,195,220,0.2), transparent)",
                            }}
                        />
                    </div>

                    {/* Footer status */}
                    <div
                        className="mt-4 flex items-center justify-center gap-2"
                        style={{ animation: "slide-in-up 0.65s 0.12s ease both" }}
                    >
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "9999px",
                                background: "var(--accent-primary)",
                                boxShadow: "0 0 10px rgba(79,195,220,0.45)",
                                animation: "pulse-soft 1.6s ease-in-out infinite",
                            }}
                        />
                        <span
                            className="text-[10px] uppercase tracking-[0.2em]"
                            style={{
                                color: "rgba(79,195,220,0.4)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            Systems responding
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}