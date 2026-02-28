type TransactionStatus = "requested" | "approved" | "completed" | "rejected" | "cancelled";

const STATUS_STYLES: Record<TransactionStatus, { label: string; color: string; bg: string; border: string }> = {
    requested: {
        label: "REQUESTED",
        color: "rgba(240,165,0,0.9)",
        bg: "rgba(240,165,0,0.06)",
        border: "rgba(240,165,0,0.22)",
    },
    approved: {
        label: "APPROVED",
        color: "rgba(79,195,220,0.9)",
        bg: "rgba(79,195,220,0.06)",
        border: "rgba(79,195,220,0.22)",
    },
    completed: {
        label: "COMPLETED",
        color: "rgba(80,210,120,0.9)",
        bg: "rgba(80,210,120,0.06)",
        border: "rgba(80,210,120,0.22)",
    },
    rejected: {
        label: "REJECTED",
        color: "rgba(220,80,80,0.9)",
        bg: "rgba(220,80,80,0.06)",
        border: "rgba(220,80,80,0.22)",
    },
    cancelled: {
        label: "CANCELLED",
        color: "rgba(140,140,160,0.7)",
        bg: "rgba(140,140,160,0.06)",
        border: "rgba(140,140,160,0.18)",
    },
};

export default function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
    const s = STATUS_STYLES[status];

    return (
        <span
            className="inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-[0.18em]"
            style={{
                color: s.color,
                background: s.bg,
                border: `1px solid ${s.border}`,
                fontFamily: "var(--font-mono)",
            }}
        >
            {s.label}
        </span>
    );
}
