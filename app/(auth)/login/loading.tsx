export default function LoginLoading() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-md" style={{animation: "slide-in-up 0.6s ease forwards"}}>
                {/* ── Header ── */}
                <div className="mb-8 text-center" style={{animation: "slide-in-up 0.45s ease forwards"}}>
                    <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                        {/* outer rotating ring */}
                        <div
                            className="absolute inset-0 rounded-full border"
                            style={{
                                borderColor: "rgba(79,195,220,0.3)",
                                animation: "rotate-slow 14s linear infinite",
                            }}
                        />
                        {/* inner rotating ring */}
                        <div
                            className="absolute inset-2 rounded-full border"
                            style={{
                                borderColor: "rgba(240,165,0,0.22)",
                                animation: "rotate-slow 9s linear infinite reverse",
                            }}
                        />

                        {/* center diamond */}
                        <div
                            className="relative h-8 w-8 rotate-45 border-2"
                            style={{borderColor: "var(--accent-primary)"}}
                        >
                            <div
                                className="absolute inset-1"
                                style={{background: "rgba(79,195,220,0.12)"}}
                            />
                        </div>

                        {/* pulsing status dot */}
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

                    <p
                        className="mb-1 text-xs uppercase tracking-[0.4em]"
                        style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-display)"}}
                    >
                        United Empire of Earth
                    </p>

                    <h1
                        className="text-2xl font-bold uppercase tracking-wider"
                        style={{
                            color: "var(--accent-primary)",
                            fontFamily: "var(--font-display)",
                            animation: "flicker 8s infinite",
                        }}
                    >
                        Authorizing Session
                    </h1>

                    <p
                        className="mt-1 text-xs uppercase tracking-[0.25em]"
                        style={{color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)"}}
                    >
                        Syncing Identity Credentials
                    </p>
                </div>

                {/* ── Main loading panel ── */}
                <div
                    className="hud-panel corner-tr corner-bl relative p-8"
                    style={{animation: "slide-in-up 0.6s 0.05s ease both"}}
                >
                    {/* top accent line */}
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
                        AUTH.LOADING
                    </div>

                    {/* status rows */}
                    <div className="space-y-4">
                        <StatusRow label="Handshake UEE Relay" done/>
                        <StatusRow label="Validating Discord Identity" active/>
                        <StatusRow label="Decrypting Access Profile"/>
                        <StatusRow label="Routing to Inventory Terminal"/>
                    </div>

                    {/* progress bar */}
                    <div className="mt-6">
                        <div className="mb-2 flex items-center justify-between">
                            <span
                                className="text-[10px] uppercase tracking-[0.25em]"
                                style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}
                            >
                                Progress
                            </span>
                            <span
                                className="text-[10px] tracking-[0.15em]"
                                style={{color: "rgba(79,195,220,0.35)", fontFamily: "var(--font-mono)"}}
                            >
                                AUTH.SYS
                            </span>
                        </div>

                        <div
                            className="relative h-2 overflow-hidden rounded-sm border"
                            style={{
                                borderColor: "rgba(79,195,220,0.2)",
                                background: "rgba(79,195,220,0.04)",
                            }}
                        >
                            {/* moving glow */}
                            <div
                                className="absolute inset-y-0 left-0"
                                style={{
                                    width: "45%",
                                    background:
                                        "linear-gradient(90deg, rgba(79,195,220,0.05), rgba(79,195,220,0.75), rgba(79,195,220,0.05))",
                                    animation: "loading-sweep 1.4s ease-in-out infinite",
                                }}
                            />
                        </div>
                    </div>

                    {/* fake log output */}
                    <div
                        className="mt-6 rounded-md border p-3"
                        style={{
                            borderColor: "rgba(79,195,220,0.12)",
                            background: "rgba(7,18,28,0.35)",
                        }}
                    >
                        <p
                            className="text-[10px] leading-5 tracking-[0.12em]"
                            style={{color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)"}}
                        >
                            [SYS] Establishing secure session...
                            <br/>
                            [AUTH] Provider response received
                            <br/>
                            [AUTH] Mapping clearance role...
                            <br/>
                            [SYS] Initializing terminal route...
                        </p>
                    </div>

                    {/* bottom accent line */}
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(79,195,220,0.3), transparent)",
                        }}
                    />
                </div>

                {/* ── Footer status ── */}
                <div
                    className="mt-4 flex items-center justify-between px-2"
                    style={{animation: "slide-in-up 0.7s 0.15s ease both"}}
                >
                    <div className="flex items-center gap-2">
                        <span
                            style={{
                                width: 8,
                                height: 8,
                                borderRadius: "9999px",
                                background: "var(--accent-primary)",
                                boxShadow: "0 0 10px rgba(79,195,220,0.5)",
                                animation: "pulse-soft 1.6s ease-in-out infinite",
                            }}
                        />
                        <span
                            className="text-[10px] uppercase tracking-[0.2em]"
                            style={{color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)"}}
                        >
                            Authorizing
                        </span>
                    </div>

                    <span
                        className="text-[10px] tracking-[0.15em]"
                        style={{color: "rgba(79,195,220,0.25)", fontFamily: "var(--font-mono)"}}
                    >
                        Please wait...
                    </span>
                </div>

                <p
                    className="mt-6 text-center text-[10px] tracking-[0.15em]"
                    style={{color: "rgba(200,220,232,0.15)", fontFamily: "var(--font-mono)"}}
                >
                    Secure link initialization in progress
                </p>
            </div>
        </main>
    );
}

function StatusRow({
                       label,
                       done = false,
                       active = false,
                   }: Readonly<{ label: string; done?: boolean; active?: boolean }>) {
    return (
        <div className="flex items-center gap-3">
            {/* status icon */}
            <span
                className="relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                    background: done
                        ? "rgba(79,195,220,0.95)"
                        : active
                            ? "rgba(240,165,0,0.95)"
                            : "rgba(200,220,232,0.2)",
                    boxShadow: done
                        ? "0 0 10px rgba(79,195,220,0.45)"
                        : active
                            ? "0 0 10px rgba(240,165,0,0.35)"
                            : "none",
                    animation: active ? "pulse-soft 1.2s ease-in-out infinite" : "none",
                }}
            >
                {active && (
                    <span
                        className="absolute -inset-1 rounded-full"
                        style={{
                            border: "1px solid rgba(240,165,0,0.35)",
                            animation: "ping-ring 1.4s ease-out infinite",
                        }}
                    />
                )}
            </span>

            {/* label */}
            <span
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{
                    color: done
                        ? "rgba(79,195,220,0.75)"
                        : active
                            ? "rgba(240,165,0,0.75)"
                            : "rgba(200,220,232,0.28)",
                    fontFamily: "var(--font-mono)",
                }}
            >
                {label}
            </span>

            {/* right side tag */}
            <span
                className="ml-auto text-[10px] tracking-[0.15em]"
                style={{
                    color: done
                        ? "rgba(79,195,220,0.45)"
                        : active
                            ? "rgba(240,165,0,0.45)"
                            : "rgba(200,220,232,0.18)",
                    fontFamily: "var(--font-mono)",
                }}
            >
                {done ? "OK" : active ? "RUN" : "WAIT"}
            </span>
        </div>
    );
}