export default function FeatureRow({
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