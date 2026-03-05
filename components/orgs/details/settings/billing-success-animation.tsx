"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

interface Star {
    id: number;
    x: number;
    y: number;
    size: number;
    delay: number;
    duration: number;
}

function generateStars(count: number): Star[] {
    return Array.from({ length: count }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 2 + 0.5,
        delay: Math.random() * 4,
        duration: Math.random() * 2 + 1.5,
    }));
}

export default function BillingSuccessAnimation() {
    const [mounted, setMounted] = useState(false);
    const [visible, setVisible] = useState(true);
    const [textPhase, setTextPhase] = useState(false);
    const [stars, setStars] = useState<Star[]>([]);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        setStars(generateStars(90));
        const t1 = setTimeout(() => setTextPhase(true), 1500);
        const t2 = setTimeout(() => dismiss(), 7000);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function dismiss() {
        setVisible(false);
        const url = new URL(window.location.href);
        url.searchParams.delete("billing");
        router.replace(url.pathname + (url.search !== "?" ? url.search : ""), { scroll: false });
    }

    if (!mounted || !visible) return null;

    return createPortal(
        <>
            <style>{`
                @keyframes bs-fade-in {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes bs-launch {
                    0%   { transform: translateY(0) scale(1);    opacity: 1; }
                    15%  { transform: translateY(-12px) scale(1.15); }
                    100% { transform: translateY(-140vh) scale(0.5); opacity: 0; }
                }
                @keyframes bs-trail {
                    0%   { height: 0;    opacity: 0;   }
                    30%  { height: 60px; opacity: 0.6; }
                    100% { height: 0;    opacity: 0;   }
                }
                @keyframes bs-slide-up {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0);    }
                }
                @keyframes bs-glow {
                    0%, 100% { text-shadow: 0 0 18px rgba(87,242,135,0.7), 0 0 40px rgba(87,242,135,0.3); }
                    50%      { text-shadow: 0 0 30px rgba(87,242,135,1),   0 0 70px rgba(87,242,135,0.5); }
                }
                @keyframes bs-star {
                    0%, 100% { opacity: 0.15; transform: scale(1);   }
                    50%      { opacity: 1;    transform: scale(1.8); }
                }
                @keyframes bs-pulse {
                    0%, 100% { opacity: 0.2; }
                    50%      { opacity: 0.5; }
                }
                @keyframes bs-scanline {
                    0%   { transform: translateY(-100%); }
                    100% { transform: translateY(200%);  }
                }
                @keyframes bs-badge {
                    from { opacity: 0; transform: scale(0.7); }
                    to   { opacity: 1; transform: scale(1);   }
                }
            `}</style>

            {/* Backdrop */}
            <div
                onClick={dismiss}
                style={{
                    position: "fixed", inset: 0, zIndex: 9999,
                    background: "radial-gradient(ellipse at 50% 60%, rgba(0,20,10,0.97) 0%, rgba(0,4,12,0.98) 100%)",
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    animation: "bs-fade-in 0.5s ease",
                    cursor: "pointer",
                    backdropFilter: "blur(6px)",
                    overflow: "hidden",
                }}
            >
                {/* Stars */}
                {stars.map(s => (
                    <div key={s.id} style={{
                        position: "absolute",
                        left: `${s.x}%`, top: `${s.y}%`,
                        width: s.size, height: s.size,
                        borderRadius: "50%",
                        background: "rgba(200,230,255,0.9)",
                        animation: `bs-star ${s.duration}s ease-in-out ${s.delay}s infinite`,
                        pointerEvents: "none",
                    }} />
                ))}

                {/* Scanline overlay */}
                <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(transparent 50%, rgba(0,0,0,0.03) 50%)",
                    backgroundSize: "100% 4px",
                    pointerEvents: "none",
                    opacity: 0.4,
                }} />

                {/* Main content */}
                <div style={{ position: "relative", textAlign: "center", zIndex: 1, padding: "0 24px" }}>

                    {/* Rocket + trail */}
                    <div style={{ position: "relative", display: "inline-block" }}>
                        {/* Trail */}
                        <div style={{
                            position: "absolute",
                            bottom: -4, left: "50%", transform: "translateX(-50%)",
                            width: 8,
                            background: "linear-gradient(to bottom, rgba(87,242,135,0.7), rgba(255,140,0,0.4), transparent)",
                            borderRadius: 4,
                            animation: "bs-trail 1.2s ease 0.3s forwards",
                        }} />
                        {/* Rocket */}
                        <div style={{
                            fontSize: 72,
                            display: "inline-block",
                            animation: "bs-launch 1.2s cubic-bezier(0.22,0.61,0.36,1) 0.35s forwards",
                            filter: "drop-shadow(0 0 24px rgba(87,242,135,0.5))",
                            lineHeight: 1,
                        }}>
                            🚀
                        </div>
                    </div>

                    {/* Text — appears after rocket clears */}
                    {textPhase && (
                        <div style={{ marginTop: 8 }}>
                            {/* Status badge */}
                            <div style={{
                                display: "inline-flex", alignItems: "center", gap: 8,
                                border: "1px solid rgba(87,242,135,0.25)",
                                borderRadius: 99, padding: "4px 14px", marginBottom: 20,
                                background: "rgba(87,242,135,0.06)",
                                animation: "bs-badge 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
                            }}>
                                <span style={{
                                    width: 6, height: 6, borderRadius: "50%",
                                    background: "rgba(87,242,135,0.9)",
                                    display: "inline-block",
                                    boxShadow: "0 0 8px rgba(87,242,135,0.8)",
                                }} />
                                <span style={{
                                    fontSize: 10, letterSpacing: "0.35em",
                                    color: "rgba(87,242,135,0.75)",
                                    fontFamily: "var(--font-mono)",
                                    textTransform: "uppercase",
                                }}>
                                    PRO Activated
                                </span>
                            </div>

                            {/* Headline */}
                            <h2 style={{
                                fontSize: "clamp(28px, 5vw, 44px)",
                                fontWeight: 800,
                                letterSpacing: "0.1em",
                                color: "rgba(87,242,135,0.95)",
                                fontFamily: "var(--font-display)",
                                textTransform: "uppercase",
                                margin: "0 0 16px",
                                animation: "bs-slide-up 0.6s ease 0.05s both, bs-glow 2.5s ease-in-out 0.65s infinite",
                            }}>
                                Legend Status
                            </h2>

                            {/* Sub-message */}
                            <p style={{
                                fontSize: 14,
                                color: "rgba(200,220,232,0.55)",
                                fontFamily: "var(--font-mono)",
                                maxWidth: 420,
                                lineHeight: 1.75,
                                margin: "0 auto 8px",
                                animation: "bs-slide-up 0.6s ease 0.18s both",
                            }}>
                                Your organisation has cleared the stratosphere.
                                <br />
                                The stars ahead are yours to conquer, Commander.
                            </p>

                            <p style={{
                                fontSize: 11,
                                color: "rgba(200,220,232,0.3)",
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.1em",
                                margin: "0 auto 0",
                                animation: "bs-slide-up 0.6s ease 0.3s both",
                            }}>
                                Thank you for upgrading.
                            </p>

                            {/* Divider */}
                            <div style={{
                                width: 60, height: 1, margin: "28px auto 28px",
                                background: "linear-gradient(to right, transparent, rgba(87,242,135,0.3), transparent)",
                                animation: "bs-slide-up 0.6s ease 0.4s both",
                            }} />

                            {/* Dismiss hint */}
                            <p style={{
                                fontSize: 10,
                                color: "rgba(200,220,232,0.2)",
                                fontFamily: "var(--font-mono)",
                                letterSpacing: "0.25em",
                                textTransform: "uppercase",
                                animation: "bs-pulse 2.5s ease-in-out 1s infinite",
                            }}>
                                Click anywhere to continue
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </>,
        document.body
    );
}
