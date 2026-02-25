export default function PanelLabel({ label }: { label: string }) {
    return (
        <div
            className="absolute -top-5 left-4 px-3 text-[10px] uppercase tracking-[0.3em]"
            style={{
                color: "var(--accent-primary)",
                fontFamily: "var(--font-mono)",
                background: "var(--background)",
            }}
        >
            {label}
        </div>
    );
}