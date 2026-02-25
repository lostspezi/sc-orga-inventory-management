import {ArrowRight} from "lucide-react";

export default function QuickAccessCardContent({
                                    title,
                                    description,
                                    icon,
                                    status,
                                    active,
                                }: {
    title: string;
    description: string;
    icon: React.ReactNode;
    status: string;
    active: boolean;
}) {
    return (
        <>
            <div className="mb-2 flex items-center justify-between gap-2">
                <div
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    {icon}
                    {title}
                </div>
                <span
                    className="rounded border px-2 py-0.5 text-[10px] uppercase"
                    style={{
                        borderColor: active ? "rgba(79,195,220,0.2)" : "rgba(240,165,0,0.2)",
                        color: active ? "rgba(79,195,220,0.65)" : "rgba(240,165,0,0.75)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {status}
                </span>
            </div>

            <p
                className="text-xs"
                style={{ color: "rgba(200,220,232,0.42)", fontFamily: "var(--font-mono)" }}
            >
                {description}
            </p>

            {active && (
                <div
                    className="mt-3 inline-flex items-center gap-1 text-xs uppercase tracking-[0.14em]"
                    style={{ color: "rgba(79,195,220,0.65)", fontFamily: "var(--font-mono)" }}
                >
                    Open <ArrowRight size={14} />
                </div>
            )}
        </>
    );
}