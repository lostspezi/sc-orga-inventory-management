import Link from "next/link";
import {auth} from "@/auth";

export default async function NotFound() {
    const session = await auth();

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-2xl" style={{ animation: "slide-in-up 0.65s ease forwards" }}>
                {/* ── Header / signal block ── */}
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
                                borderColor: "rgba(240,165,0,0.22)",
                                animation: "rotate-slow 10s linear infinite reverse",
                            }}
                        />

                        {/* warning diamond */}
                        <div
                            className="relative h-10 w-10 rotate-45 border-2"
                            style={{ borderColor: "rgba(240,165,0,0.9)" }}
                        >
                            <div
                                className="absolute inset-1"
                                style={{ background: "rgba(240,165,0,0.12)" }}
                            />
                        </div>

                        {/* blinking warning dot */}
                        <span
                            className="absolute"
                            style={{
                                bottom: 6,
                                right: 6,
                                width: 10,
                                height: 10,
                                borderRadius: "9999px",
                                background: "rgba(240,165,0,0.95)",
                                boxShadow: "0 0 0 0 rgba(240,165,0,0.45)",
                                animation: "pulse-warning 1.8s ease-out infinite",
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
                            color: "rgba(240,165,0,0.95)",
                            fontFamily: "var(--font-display)",
                            animation: "flicker 7s infinite",
                        }}
                    >
                        Error 404
                    </h1>

                    <p
                        className="mt-1 text-xs uppercase tracking-[0.25em]"
                        style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                    >
                        Requested Route Not Found
                    </p>
                </div>

                {/* ── Main error panel ── */}
                <div
                    className="hud-panel corner-tr corner-bl relative p-8"
                    style={{ animation: "slide-in-up 0.6s 0.05s ease both" }}
                >
                    {/* top accent line */}
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.9), transparent)",
                        }}
                    />
                    <div
                        className="absolute -top-5 left-1/2 -translate-x-1/2 px-3 text-[10px] uppercase tracking-[0.3em]"
                        style={{
                            color: "rgba(240,165,0,0.9)",
                            fontFamily: "var(--font-mono)",
                            background: "var(--background)",
                        }}
                    >
                        NAV.ERROR
                    </div>

                    {/* big 404 display */}
                    <div className="mb-6 text-center">
                        <div
                            className="inline-block text-6xl font-bold leading-none tracking-[0.15em]"
                            style={{
                                fontFamily: "var(--font-display)",
                                color: "rgba(240,165,0,0.12)",
                                textShadow: "0 0 24px rgba(240,165,0,0.15)",
                            }}
                        >
                            404
                        </div>
                    </div>

                    {/* status rows */}
                    <div className="space-y-3">
                        <StatusRow label="Route Lookup" status="fail" />
                        <StatusRow label="Sector Mapping" status="fail" />
                        <StatusRow label="Fallback Protocol" status="ok" />
                        <StatusRow label="Home Redirect Available" status="ok" />
                    </div>

                    {/* message box */}
                    <div
                        className="mt-6 rounded-md border p-4"
                        style={{
                            borderColor: "rgba(79,195,220,0.12)",
                            background: "rgba(7,18,28,0.35)",
                        }}
                    >
                        <p
                            className="text-[11px] leading-5 tracking-[0.12em]"
                            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            The requested page could not be located in the current UEE navigation grid.
                            It may have been moved, renamed, or never existed.
                        </p>
                    </div>

                    {/* action buttons */}
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                        <Link
                            href="/"
                            className="sc-btn w-full text-center"
                        >
                            Return Home
                        </Link>

                        <Link
                            href={session ? "/terminal" : "/login"}
                            className="sc-btn sc-btn-outline w-full text-center"
                        >
                            {session ? "Open Terminal" : "Login to Terminal"}
                        </Link>
                    </div>

                    {/* bottom accent line */}
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(79,195,220,0.25), transparent)",
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
                                background: "rgba(240,165,0,0.95)",
                                boxShadow: "0 0 10px rgba(240,165,0,0.35)",
                                animation: "pulse-soft 1.6s ease-in-out infinite",
                            }}
                        />
                        <span
                            className="text-[10px] uppercase tracking-[0.2em]"
                            style={{ color: "rgba(240,165,0,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            Navigation Fault
                        </span>
                    </div>

                    <span
                        className="text-[10px] tracking-[0.15em]"
                        style={{ color: "rgba(79,195,220,0.25)", fontFamily: "var(--font-mono)" }}
                    >
                        ERR.ROUTE.404
                    </span>
                </div>

                <p
                    className="mt-6 text-center text-[10px] tracking-[0.15em]"
                    style={{ color: "rgba(200,220,232,0.15)", fontFamily: "var(--font-mono)" }}
                >
                    Unauthorized route probing may be logged by UEE systems
                </p>
            </div>
        </main>
    );
}

function StatusRow({
                       label,
                       status,
                   }: Readonly<{ label: string; status: "ok" | "fail" | "wait" }>) {
    const styles =
        status === "ok"
            ? {
                dot: "rgba(79,195,220,0.95)",
                glow: "0 0 10px rgba(79,195,220,0.35)",
                text: "rgba(79,195,220,0.65)",
                right: "rgba(79,195,220,0.45)",
                tag: "OK",
            }
            : status === "fail"
                ? {
                    dot: "rgba(240,165,0,0.95)",
                    glow: "0 0 10px rgba(240,165,0,0.35)",
                    text: "rgba(240,165,0,0.72)",
                    right: "rgba(240,165,0,0.45)",
                    tag: "ERR",
                }
                : {
                    dot: "rgba(200,220,232,0.2)",
                    glow: "none",
                    text: "rgba(200,220,232,0.28)",
                    right: "rgba(200,220,232,0.18)",
                    tag: "WAIT",
                };

    return (
        <div className="flex items-center gap-3">
            <span
                className="inline-flex h-2.5 w-2.5 shrink-0 rounded-full"
                style={{
                    background: styles.dot,
                    boxShadow: styles.glow,
                    animation: status === "fail" ? "pulse-soft 1.3s ease-in-out infinite" : "none",
                }}
            />
            <span
                className="text-[11px] uppercase tracking-[0.2em]"
                style={{
                    color: styles.text,
                    fontFamily: "var(--font-mono)",
                }}
            >
                {label}
            </span>
            <span
                className="ml-auto text-[10px] tracking-[0.15em]"
                style={{
                    color: styles.right,
                    fontFamily: "var(--font-mono)",
                }}
            >
                {styles.tag}
            </span>
        </div>
    );
}