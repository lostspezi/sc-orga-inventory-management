export default function AuthLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
            {/* ── Scan-line overlay ── */}
            <div className="scan-overlay" />

            {/* ── Animated star field ── */}
            <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
                {/* large blurry nebula blobs */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 600, height: 600,
                        top: "-10%", left: "60%",
                        background: "radial-gradient(circle, rgba(79,195,220,0.06) 0%, transparent 70%)",
                        filter: "blur(60px)",
                        animation: "drift 12s ease-in-out infinite alternate",
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 800, height: 400,
                        top: "50%", left: "-20%",
                        background: "radial-gradient(circle, rgba(240,165,0,0.04) 0%, transparent 70%)",
                        filter: "blur(80px)",
                        animation: "drift 18s ease-in-out infinite alternate-reverse",
                    }}
                />
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 500, height: 500,
                        bottom: "-5%", right: "-5%",
                        background: "radial-gradient(circle, rgba(79,195,220,0.05) 0%, transparent 70%)",
                        filter: "blur(60px)",
                        animation: "drift 15s ease-in-out infinite alternate",
                    }}
                />

                {/* star dots */}
                {[
                    { top:"8%",  left:"12%",  size:2, delay:"0s",   dur:"3s"  },
                    { top:"15%", left:"78%",  size:1, delay:"1.2s", dur:"4s"  },
                    { top:"22%", left:"45%",  size:3, delay:"0.5s", dur:"2.5s"},
                    { top:"35%", left:"88%",  size:1, delay:"2s",   dur:"5s"  },
                    { top:"42%", left:"5%",   size:2, delay:"0.8s", dur:"3.5s"},
                    { top:"55%", left:"33%",  size:1, delay:"1.5s", dur:"4.5s"},
                    { top:"60%", left:"92%",  size:2, delay:"0.3s", dur:"3s"  },
                    { top:"70%", left:"18%",  size:3, delay:"2.2s", dur:"2s"  },
                    { top:"78%", left:"65%",  size:1, delay:"1.0s", dur:"5s"  },
                    { top:"88%", left:"40%",  size:2, delay:"0.7s", dur:"3.8s"},
                    { top:"5%",  left:"55%",  size:1, delay:"1.8s", dur:"4.2s"},
                    { top:"48%", left:"72%",  size:2, delay:"0.4s", dur:"3.2s"},
                    { top:"92%", left:"80%",  size:1, delay:"2.5s", dur:"4.8s"},
                    { top:"30%", left:"22%",  size:2, delay:"1.1s", dur:"3.6s"},
                    { top:"65%", left:"50%",  size:1, delay:"0.9s", dur:"5.5s"},
                ].map((s, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            top: s.top, left: s.left,
                            width: s.size, height: s.size,
                            background: i % 5 === 0 ? "rgba(240,165,0,0.8)" : "rgba(79,195,220,0.7)",
                            boxShadow: `0 0 ${s.size * 3}px currentColor`,
                            animation: `twinkle ${s.dur} ${s.delay} ease-in-out infinite`,
                        }}
                    />
                ))}

                {/* thin grid lines */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `
                            linear-gradient(rgba(79,195,220,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(79,195,220,1) 1px, transparent 1px)
                        `,
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            {/* ── Page content ── */}
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}