import type { ReportStatus } from "@/lib/types/report";

interface Props {
    status: ReportStatus;
    labels: {
        ready: string;
        generating: string;
        pending: string;
        failed: string;
    };
}

const STATUS_CONFIG: Record<
    ReportStatus,
    { dot: string; text: string; bg: string; border: string }
> = {
    ready: {
        dot: "rgba(74,222,128,0.9)",
        text: "rgba(74,222,128,0.9)",
        bg: "rgba(74,222,128,0.06)",
        border: "rgba(74,222,128,0.2)",
    },
    generating: {
        dot: "rgba(79,195,220,0.9)",
        text: "rgba(79,195,220,0.9)",
        bg: "rgba(79,195,220,0.06)",
        border: "rgba(79,195,220,0.2)",
    },
    pending: {
        dot: "rgba(251,191,36,0.8)",
        text: "rgba(251,191,36,0.8)",
        bg: "rgba(251,191,36,0.05)",
        border: "rgba(251,191,36,0.2)",
    },
    failed: {
        dot: "rgba(248,113,113,0.9)",
        text: "rgba(248,113,113,0.9)",
        bg: "rgba(248,113,113,0.06)",
        border: "rgba(248,113,113,0.2)",
    },
};

export default function ReportStatusBadge({ status, labels }: Props) {
    const cfg = STATUS_CONFIG[status];
    const label =
        status === "ready"
            ? labels.ready
            : status === "generating"
            ? labels.generating
            : status === "pending"
            ? labels.pending
            : labels.failed;

    return (
        <span
            className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]"
            style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.text,
                fontFamily: "var(--font-mono)",
            }}
        >
            <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                    background: cfg.dot,
                    boxShadow:
                        status === "generating"
                            ? `0 0 6px ${cfg.dot}`
                            : undefined,
                    animation:
                        status === "generating" ? "pulse 1.5s infinite" : undefined,
                }}
            />
            {label}
        </span>
    );
}
