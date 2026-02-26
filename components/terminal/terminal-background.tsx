export default function TerminalBackground() {
    return (
        <>
            <div className="scan-overlay" />

            <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
                <div
                    className="absolute rounded-full"
                    style={{
                        width: 900,
                        height: 900,
                        top: "-20%",
                        right: "-10%",
                        background: "radial-gradient(circle, rgba(79,195,220,0.05) 0%, transparent 65%)",
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
                        background: "radial-gradient(circle, rgba(240,165,0,0.04) 0%, transparent 70%)",
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
                    { top: "30%", left: "55%", size: 2, delay: "0.3s", dur: "3s" },
                    { top: "65%", left: "25%", size: 1, delay: "2.2s", dur: "5.5s" },
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
        </>
    );
}