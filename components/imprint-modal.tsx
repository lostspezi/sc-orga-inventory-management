export default function ImpressumModal({ onClose }: { onClose: () => void }) {
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ background: "rgba(2,5,8,0.85)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="hud-panel relative w-full max-w-lg p-8"
                style={{ animation: "slide-in-up 0.3s ease forwards" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* top glow line */}
                <div className="absolute -top-px left-8 right-8 h-px" style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }} />
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-3 text-[10px] tracking-[0.3em] uppercase" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-mono)", background: "var(--background)" }}>
                    LEGAL.DOC
                </div>

                {/* close button */}
                <button
                    onClick={onClose}
                    className="cursor-pointer absolute right-4 top-4 flex h-7 w-7 items-center justify-center border transition-colors"
                    style={{ borderColor: "rgba(79,195,220,0.2)", color: "rgba(79,195,220,0.5)" }}
                    aria-label="Close"
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                    </svg>
                </button>

                <h2 className="mb-6 text-sm font-bold uppercase tracking-[0.3em]" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    Imprint
                </h2>

                <div className="space-y-5 text-sm leading-relaxed" style={{ color: "rgba(200,220,232,0.55)", fontFamily: "var(--font-ui)" }}>
                    <div>
                        <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>Operator</p>
                        <p>[ Marcell Dechant ]</p>
                        <p>[ Address: On Request ]</p>
                    </div>
                    <div>
                        <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>Contact</p>
                        <p>E-Mail: <span style={{ color: "var(--accent-primary)" }}>[ marcell.dechant@proton.me ]</span></p>
                    </div>
                    <div>
                        <p className="mb-1.5 text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}>Disclaimer</p>
                        <p style={{ color: "rgba(200,220,232,0.4)" }}>
                            This platform is a private, non-commercial fan project with no affiliation to Cloud Imperium Games or the Star Citizen IP. All Star Citizen assets and trademarks belong to their respective owners.
                        </p>
                    </div>
                </div>

                {/* bottom glow line */}
                <div className="absolute -bottom-px left-8 right-8 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.3), transparent)" }} />
            </div>
        </div>
    );
}