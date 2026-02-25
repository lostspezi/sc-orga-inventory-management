import Link from "next/link";
import {signOutAction} from "@/lib/actions";

export default function TerminalPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-4xl" style={{ animation: "slide-in-up 0.65s ease forwards" }}>
                {/* ── Header ── */}
                <div className="mb-8 text-center" style={{ animation: "slide-in-up 0.45s ease forwards" }}>
                    <div className="relative mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                        {/* rotating rings */}
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
                                borderColor: "rgba(240,165,0,0.18)",
                                animation: "rotate-slow 11s linear infinite reverse",
                            }}
                        />

                        {/* center diamond */}
                        <div
                            className="relative h-10 w-10 rotate-45 border-2"
                            style={{ borderColor: "var(--accent-primary)" }}
                        >
                            <div
                                className="absolute inset-1"
                                style={{ background: "rgba(79,195,220,0.12)" }}
                            />
                        </div>

                        {/* online dot */}
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
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-display)" }}
                    >
                        United Empire of Earth
                    </p>

                    <h1
                        className="text-3xl font-bold uppercase tracking-[0.18em]"
                        style={{
                            color: "var(--accent-primary)",
                            fontFamily: "var(--font-display)",
                            animation: "flicker 8s infinite",
                        }}
                    >
                        Inventory Terminal
                    </h1>

                    <p
                        className="mt-1 text-xs uppercase tracking-[0.25em]"
                        style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                    >
                        Module Initialization In Progress
                    </p>
                </div>

                {/* ── Main terminal panel ── */}
                <div
                    className="hud-panel corner-tr corner-bl relative p-8"
                    style={{ animation: "slide-in-up 0.6s 0.05s ease both" }}
                >
                    {/* top accent */}
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{
                            background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
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
                        TERMINAL.STATUS
                    </div>

                    {/* 2-column content */}
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                        {/* left column */}
                        <div>
                            <div
                                className="mb-4 rounded-md border p-4"
                                style={{
                                    borderColor: "rgba(79,195,220,0.15)",
                                    background: "rgba(7,18,28,0.32)",
                                }}
                            >
                                <p
                                    className="text-[11px] leading-5 tracking-[0.12em]"
                                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                                >
                                    Welcome to the UEE Inventory Management Terminal.
                                    <br />
                                    Core systems are online, but feature modules are still under active development.
                                    <br />
                                    First functions will be deployed soon.
                                </p>
                            </div>

                            {/* progress block */}
                            <div className="mb-5">
                                <div className="mb-2 flex items-center justify-between">
                                    <span
                                        className="text-[10px] uppercase tracking-[0.25em]"
                                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                                    >
                                        Deployment Progress
                                    </span>
                                    <span
                                        className="text-[10px] tracking-[0.15em]"
                                        style={{ color: "rgba(79,195,220,0.3)", fontFamily: "var(--font-mono)" }}
                                    >
                                        24%
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
                                        className="absolute inset-y-0 left-0"
                                        style={{
                                            width: "24%",
                                            background:
                                                "linear-gradient(90deg, rgba(79,195,220,0.25), rgba(79,195,220,0.9))",
                                        }}
                                    />
                                    <div
                                        className="absolute inset-y-0 left-0"
                                        style={{
                                            width: "35%",
                                            background:
                                                "linear-gradient(90deg, rgba(79,195,220,0.02), rgba(79,195,220,0.4), rgba(79,195,220,0.02))",
                                            animation: "loading-sweep 1.8s ease-in-out infinite",
                                        }}
                                    />
                                </div>
                            </div>

                            {/* roadmap */}
                            <div className="space-y-3">
                                <FeatureRow label="Inventory List" status="building" />
                                <FeatureRow label="Item Details" status="planned" />
                                <FeatureRow label="Stock Movement Log" status="planned" />
                                <FeatureRow label="Role-based Access Controls" status="planned" />
                                <FeatureRow label="Audit & Event Timeline" status="planned" />
                            </div>
                        </div>

                        {/* right column */}
                        <div className="space-y-4">
                            <div
                                className="rounded-md border p-4"
                                style={{
                                    borderColor: "rgba(240,165,0,0.16)",
                                    background: "rgba(20,14,6,0.18)",
                                }}
                            >
                                <p
                                    className="mb-2 text-[10px] uppercase tracking-[0.25em]"
                                    style={{ color: "rgba(240,165,0,0.7)", fontFamily: "var(--font-mono)" }}
                                >
                                    Current Status
                                </p>
                                <p
                                    className="text-[11px] leading-5 tracking-[0.08em]"
                                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                                >
                                    We are currently wiring the first terminal modules.
                                    Authentication is active, terminal shell UI is online, feature endpoints are next.
                                </p>
                            </div>

                            <div
                                className="rounded-md border p-4"
                                style={{
                                    borderColor: "rgba(79,195,220,0.12)",
                                    background: "rgba(7,18,28,0.3)",
                                }}
                            >
                                <p
                                    className="mb-2 text-[10px] uppercase tracking-[0.25em]"
                                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                                >
                                    Upcoming Modules
                                </p>
                                <ul
                                    className="space-y-1 text-[11px]"
                                    style={{ color: "rgba(200,220,232,0.42)", fontFamily: "var(--font-mono)" }}
                                >
                                    <li>• Inventory overview</li>
                                    <li>• Search and filters</li>
                                    <li>• Item create / update</li>
                                    <li>• Activity history</li>
                                </ul>
                            </div>

                            {/* Buttons */}
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Link href="/" className="sc-btn w-full text-center">
                                    Home
                                </Link>

                                <form action={signOutAction}>
                                    <button
                                        type="submit"
                                        className="sc-btn sc-btn-outline w-full"
                                    >
                                        Logout
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* terminal faux output */}
                    <div
                        className="mt-6 rounded-md border p-3"
                        style={{
                            borderColor: "rgba(79,195,220,0.12)",
                            background: "rgba(7,18,28,0.35)",
                        }}
                    >
                        <p
                            className="text-[10px] leading-5 tracking-[0.12em]"
                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                        >
                            [BOOT] Terminal shell initialized
                            <br />
                            [AUTH] Clearance level verified
                            <br />
                            [MOD] inventory.core ........ pending
                            <br />
                            [MOD] inventory.audit ....... pending
                            <br />
                            [SYS] Standing by for first feature deployment<span style={{ animation: "blink-cursor 1s steps(1) infinite" }}>_</span>
                        </p>
                    </div>

                    {/* bottom accent */}
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(79,195,220,0.3), transparent)",
                        }}
                    />
                </div>

                {/* ── footer status ── */}
                <div
                    className="mt-4 flex items-center justify-between px-2"
                    style={{ animation: "slide-in-up 0.7s 0.15s ease both" }}
                >
                    <div className="flex items-center gap-2">
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
                            style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}
                        >
                            Terminal Online
                        </span>
                    </div>

                    <span
                        className="text-[10px] tracking-[0.15em]"
                        style={{ color: "rgba(79,195,220,0.25)", fontFamily: "var(--font-mono)" }}
                    >
                        Build: DEV-PREVIEW
                    </span>
                </div>

                <p
                    className="mt-6 text-center text-[10px] tracking-[0.15em]"
                    style={{ color: "rgba(200,220,232,0.15)", fontFamily: "var(--font-mono)" }}
                >
                    Feature rollout in progress. Check back soon.
                </p>
            </div>
        </main>
    );
}

function FeatureRow({
                        label,
                        status,
                    }: Readonly<{ label: string; status: "building" | "planned" | "done" }>) {
    const ui =
        status === "done"
            ? {
                dot: "rgba(79,195,220,0.95)",
                glow: "0 0 10px rgba(79,195,220,0.35)",
                text: "rgba(79,195,220,0.7)",
                right: "rgba(79,195,220,0.45)",
                tag: "READY",
            }
            : status === "building"
                ? {
                    dot: "rgba(240,165,0,0.95)",
                    glow: "0 0 10px rgba(240,165,0,0.3)",
                    text: "rgba(240,165,0,0.72)",
                    right: "rgba(240,165,0,0.45)",
                    tag: "BUILD",
                }
                : {
                    dot: "rgba(200,220,232,0.2)",
                    glow: "none",
                    text: "rgba(200,220,232,0.34)",
                    right: "rgba(200,220,232,0.2)",
                    tag: "PLAN",
                };

    return (
        <div className="flex items-center gap-3">
            <span
                className="relative inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                    background: ui.dot,
                    boxShadow: ui.glow,
                    animation: status === "building" ? "pulse-soft 1.2s ease-in-out infinite" : "none",
                }}
            >
                {status === "building" && (
                    <span
                        className="absolute -inset-1 rounded-full"
                        style={{
                            border: "1px solid rgba(240,165,0,0.35)",
                            animation: "ping-ring 1.4s ease-out infinite",
                        }}
                    />
                )}
            </span>

            <span
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{ color: ui.text, fontFamily: "var(--font-mono)" }}
            >
                {label}
            </span>

            <span
                className="ml-auto text-[10px] tracking-[0.15em]"
                style={{ color: ui.right, fontFamily: "var(--font-mono)" }}
            >
                {ui.tag}
            </span>
        </div>
    );
}