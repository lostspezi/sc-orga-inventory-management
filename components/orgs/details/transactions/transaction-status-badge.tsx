"use client";

import { useTranslations } from "next-intl";

type TransactionStatus = "requested" | "approved" | "completed" | "rejected" | "cancelled";

const STATUS_COLORS: Record<TransactionStatus, { color: string; bg: string; border: string }> = {
    requested: { color: "rgba(240,165,0,0.9)", bg: "rgba(240,165,0,0.06)", border: "rgba(240,165,0,0.22)" },
    approved: { color: "rgba(79,195,220,0.9)", bg: "rgba(79,195,220,0.06)", border: "rgba(79,195,220,0.22)" },
    completed: { color: "rgba(80,210,120,0.9)", bg: "rgba(80,210,120,0.06)", border: "rgba(80,210,120,0.22)" },
    rejected: { color: "rgba(220,80,80,0.9)", bg: "rgba(220,80,80,0.06)", border: "rgba(220,80,80,0.22)" },
    cancelled: { color: "rgba(140,140,160,0.7)", bg: "rgba(140,140,160,0.06)", border: "rgba(140,140,160,0.18)" },
};

const STATUS_KEYS: Record<TransactionStatus, string> = {
    requested: "statusRequested",
    approved: "statusApproved",
    completed: "statusCompleted",
    rejected: "statusRejected",
    cancelled: "statusCancelled",
};

export default function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
    const t = useTranslations("transactions");
    const s = STATUS_COLORS[status];

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
            {t(STATUS_KEYS[status])}
        </span>
    );
}
