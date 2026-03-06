"use client";

import { useState } from "react";

export default function DataExportButton({
    exportLabel,
    downloadingLabel,
    desc,
}: {
    exportLabel: string;
    downloadingLabel: string;
    desc: string;
}) {
    const [loading, setLoading] = useState(false);

    async function handleExport() {
        setLoading(true);
        try {
            const res = await fetch("/api/user/export");
            if (!res.ok) throw new Error("Export failed");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `my-data-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex items-center justify-between gap-4">
            <p
                className="text-xs leading-relaxed"
                style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
            >
                {desc}
            </p>
            <button
                onClick={handleExport}
                disabled={loading}
                className="sc-btn sc-btn-outline shrink-0 text-xs"
                style={{ padding: "0.4rem 0.9rem" }}
            >
                {loading ? downloadingLabel : exportLabel}
            </button>
        </div>
    );
}
