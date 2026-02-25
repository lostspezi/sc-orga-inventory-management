export default function StatusRow({
                       icon,
                       label,
                       value,
                       tone,
                   }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    tone: "cyan" | "amber";
}) {
    const isAmber = tone === "amber";

    return (
        <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
            <span style={{ color: isAmber ? "rgba(240,165,0,0.7)" : "rgba(79,195,220,0.65)" }}>{icon}</span>
            <span style={{ color: "rgba(200,220,232,0.42)" }}>{label}</span>
            <span
                className="ml-auto rounded border px-1.5 py-0.5 text-[10px]"
                style={{
                    borderColor: isAmber ? "rgba(240,165,0,0.2)" : "rgba(79,195,220,0.2)",
                    color: isAmber ? "rgba(240,165,0,0.8)" : "rgba(79,195,220,0.7)",
                }}
            >
                {value}
            </span>
        </div>
    );
}