import SignIn from "@/components/sign-in";
import {auth} from "@/auth";
import {redirect} from "next/navigation";

export const metadata = {
    title: "Login",
    robots: { index: false, follow: false },
};

type Props = {
    searchParams: Promise<{ callbackUrl?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
    const session = await auth();
    const { callbackUrl } = await searchParams;

    if (session) {
        redirect(callbackUrl || "/terminal");
    }

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-16">
            <div className="w-full max-w-md" style={{ animation: "slide-in-up 0.7s ease forwards" }}>

                {/* ── Logo / header block ── */}
                <div className="mb-8 text-center" style={{ animation: "slide-in-up 0.5s ease forwards" }}>
                    {/* hex ring decoration */}
                    <div className="relative mx-auto mb-6 flex h-20 w-20 items-center justify-center">
                        <div
                            className="absolute inset-0 rounded-full border"
                            style={{
                                borderColor: "rgba(79,195,220,0.3)",
                                animation: "rotate-slow 20s linear infinite",
                            }}
                        />
                        <div
                            className="absolute inset-2 rounded-full border"
                            style={{
                                borderColor: "rgba(240,165,0,0.2)",
                                animation: "rotate-slow 14s linear infinite reverse",
                            }}
                        />
                        {/* UEE logo placeholder — diamond */}
                        <div
                            className="h-8 w-8 border-2 rotate-45"
                            style={{ borderColor: "var(--accent-primary)" }}
                        >
                            <div
                                className="absolute inset-1 rotate-0"
                                style={{ background: "rgba(79,195,220,0.15)" }}
                            />
                        </div>
                        {/* status dot */}
                        <span
                            className="status-dot online absolute"
                            style={{ bottom: 6, right: 6 }}
                        />
                    </div>

                    <p
                        className="font-display mb-1 text-xs tracking-[0.4em] uppercase"
                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-display)" }}
                    >
                        United Empire of Earth
                    </p>
                    <h1
                        className="font-display text-2xl font-bold tracking-wider uppercase"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)", animation: "flicker 8s infinite" }}
                    >
                        Inventory Management
                    </h1>
                    <p
                        className="mt-1 text-xs tracking-[0.25em] uppercase"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        Restricted Access — Authorize to Continue
                    </p>
                </div>

                {/* ── Main login panel ── */}
                <div
                    className="hud-panel corner-tr corner-bl relative p-8"
                    style={{ animation: "slide-in-up 0.65s 0.1s ease both" }}
                >
                    {/* top label bar */}
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }}
                    />
                    <div
                        className="absolute -top-5 left-1/2 -translate-x-1/2 px-3 text-[10px] tracking-[0.3em] uppercase"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-mono)", background: "var(--background)" }}
                    >
                        AUTH.SYS
                    </div>

                    {/* ── Discord sign-in ── */}
                    <SignIn callbackUrl={callbackUrl} />

                    {/* ── Divider ── */}
                    <div className="sc-divider my-6">OR</div>

                    {/* ── Manual credentials form (visual placeholder) ── */}
                    <div className="space-y-4">
                        <div>
                            <label
                                className="mb-1.5 block text-[10px] tracking-[0.25em] uppercase"
                                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                Citizen ID
                            </label>
                            <input
                                type="text"
                                className="sc-input"
                                placeholder="SC-XXXX-XXXX"
                                disabled
                            />
                        </div>
                        <div>
                            <label
                                className="mb-1.5 block text-[10px] tracking-[0.25em] uppercase"
                                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                Access Code
                            </label>
                            <input
                                type="password"
                                className="sc-input"
                                placeholder="••••••••••••"
                                disabled
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                            <span
                                className="status-dot warning"
                                style={{ flexShrink: 0 }}
                            />
                            <span
                                className="text-[10px] tracking-wider"
                                style={{ color: "rgba(240,165,0,0.6)", fontFamily: "var(--font-mono)" }}
                            >
                                Manual auth offline — use Discord provider
                            </span>
                        </div>

                        <button
                            type="button"
                            className="sc-btn sc-btn-outline w-full opacity-40 cursor-not-allowed"
                            disabled
                        >
                            Access Inventory Terminal
                        </button>
                    </div>

                    {/* bottom label bar */}
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.3), transparent)" }}
                    />
                </div>

                {/* ── System status bar ── */}
                <div
                    className="mt-4 flex items-center justify-between px-2"
                    style={{ animation: "slide-in-up 0.7s 0.2s ease both" }}
                >
                    <div className="flex items-center gap-2">
                        <span className="status-dot online" />
                        <span
                            className="text-[10px] tracking-[0.2em] uppercase"
                            style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}
                        >
                            Systems Nominal
                        </span>
                    </div>
                    <span
                        className="text-[10px] tracking-[0.15em]"
                        style={{ color: "rgba(79,195,220,0.25)", fontFamily: "var(--font-mono)" }}
                    >
                        v0.1.0 — SYS.SECURE
                    </span>
                </div>

                {/* ── Sub-footer ── */}
                <p
                    className="mt-6 text-center text-[10px] tracking-[0.15em]"
                    style={{ color: "rgba(200,220,232,0.15)", fontFamily: "var(--font-mono)" }}
                >
                    Unauthorized access is a violation of UEE code §18.7
                </p>
            </div>
        </main>
    );
}