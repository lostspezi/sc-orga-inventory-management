"use client";

import { useEffect, useState, useCallback } from "react";
import { CheckCircle, XCircle, AlertCircle, Clock, Loader2, SkipForward, Download, History, RefreshCw } from "lucide-react";
import { ImportJobView, ImportRowResult } from "@/lib/types/import-job";

type Props = {
    initialJob: ImportJobView;
    organizationSlug: string;
    labels: {
        statusPending: string;
        statusProcessing: string;
        statusCompleted: string;
        statusFailed: string;
        progress: string;
        colRow: string;
        colInput: string;
        colResolved: string;
        colStatus: string;
        colMessage: string;
        statusSuccess: string;
        statusUpdated: string;
        statusNotFound: string;
        statusAlreadyExists: string;
        statusError: string;
        initiatedBy: string;
        startedAt: string;
        completedAt: string;
        backToInventory: string;
        viewAllImports: string;
        summary: string;
        summaryImported: string;
        summaryUpdated: string;
        summarySkipped: string;
        summaryFailed: string;
        downloadFailed: string;
    };
};

function StatusBadge({ status, labels }: { status: ImportRowResult["status"]; labels: Props["labels"] }) {
    const config = {
        success: {
            icon: <CheckCircle size={12} />,
            label: labels.statusSuccess,
            style: { background: "rgba(79,195,120,0.12)", color: "rgba(79,195,120,1)", borderColor: "rgba(79,195,120,0.2)" },
        },
        updated: {
            icon: <RefreshCw size={12} />,
            label: labels.statusUpdated,
            style: { background: "rgba(79,195,220,0.1)", color: "rgba(79,195,220,1)", borderColor: "rgba(79,195,220,0.2)" },
        },
        not_found: {
            icon: <AlertCircle size={12} />,
            label: labels.statusNotFound,
            style: { background: "rgba(220,180,79,0.1)", color: "rgba(220,180,79,1)", borderColor: "rgba(220,180,79,0.2)" },
        },
        already_exists: {
            icon: <SkipForward size={12} />,
            label: labels.statusAlreadyExists,
            style: { background: "rgba(79,120,195,0.12)", color: "rgba(120,160,220,1)", borderColor: "rgba(79,120,195,0.2)" },
        },
        error: {
            icon: <XCircle size={12} />,
            label: labels.statusError,
            style: { background: "rgba(220,79,79,0.1)", color: "rgba(220,100,100,1)", borderColor: "rgba(220,79,79,0.2)" },
        },
    }[status];

    return (
        <span
            className="inline-flex items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium"
            style={{ ...config.style, fontFamily: "var(--font-mono)" }}
        >
            {config.icon}
            {config.label}
        </span>
    );
}

function JobStatusIndicator({ status, labels }: { status: ImportJobView["status"]; labels: Props["labels"] }) {
    const config = {
        pending: { icon: <Clock size={14} />, label: labels.statusPending, color: "rgba(200,220,232,0.5)" },
        processing: { icon: <Loader2 size={14} className="animate-spin" />, label: labels.statusProcessing, color: "var(--accent-primary)" },
        completed: { icon: <CheckCircle size={14} />, label: labels.statusCompleted, color: "rgba(79,195,120,1)" },
        failed: { icon: <XCircle size={14} />, label: labels.statusFailed, color: "rgba(220,79,79,1)" },
    }[status];

    return (
        <span
            className="inline-flex items-center gap-2 text-sm font-medium"
            style={{ color: config.color, fontFamily: "var(--font-mono)" }}
        >
            {config.icon}
            {config.label}
        </span>
    );
}

function downloadFailedCsv(job: ImportJobView) {
    const failedResults = job.results.filter(
        (r) => r.status === "not_found" || r.status === "error"
    );
    const lines = failedResults.map((r) => {
        const row = job.rows[r.rowIndex];
        if (!row) return null;
        const cells = [
            `"${row.name.replace(/"/g, '""')}"`,
            row.buyPrice ?? "",
            row.sellPrice ?? "",
            row.quantity ?? "",
            row.minStock ?? "",
            row.maxStock ?? "",
        ];
        return cells.join(",");
    }).filter(Boolean);

    const csv = ["name,buyPrice,sellPrice,quantity,minStock,maxStock", ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `import-failed-${job.id}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function CsvImportResultsClient({ initialJob, organizationSlug, labels }: Props) {
    const [job, setJob] = useState<ImportJobView>(initialJob);

    const poll = useCallback(async () => {
        try {
            const res = await fetch(
                `/api/orgs/${organizationSlug}/inventory/import/${initialJob.id}`
            );
            if (res.ok) {
                const updated: ImportJobView = await res.json();
                setJob(updated);
            }
        } catch {
            // ignore poll errors
        }
    }, [organizationSlug, initialJob.id]);

    useEffect(() => {
        if (job.status === "completed" || job.status === "failed") return;
        const interval = setInterval(poll, 2000);
        return () => clearInterval(interval);
    }, [job.status, poll]);

    const successCount = job.results.filter((r) => r.status === "success").length;
    const updatedCount = job.results.filter((r) => r.status === "updated").length;
    const skippedCount = job.results.filter((r) => r.status === "already_exists").length;
    const failedCount = job.results.filter(
        (r) => r.status === "not_found" || r.status === "error"
    ).length;

    const progressPct =
        job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0;

    return (
        <div className="space-y-6">
            {/* Job meta */}
            <div
                className="hud-panel relative rounded-lg border p-5 space-y-4"
                style={{ borderColor: "rgba(79,195,220,0.14)", background: "rgba(7,18,28,0.3)" }}
            >
                <div className="corner-tr" />
                <div className="corner-bl" />

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <JobStatusIndicator status={job.status} labels={labels} />
                    <div className="flex flex-wrap gap-4 text-xs" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}>
                        <span>{labels.initiatedBy}: <span style={{ color: "rgba(200,220,232,0.8)" }}>{job.initiatedByUsername}</span></span>
                        <span>{labels.startedAt}: <span style={{ color: "rgba(200,220,232,0.8)" }}>{new Date(job.createdAt).toLocaleString()}</span></span>
                        {job.completedAt && (
                            <span>{labels.completedAt}: <span style={{ color: "rgba(200,220,232,0.8)" }}>{new Date(job.completedAt).toLocaleString()}</span></span>
                        )}
                    </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}>
                        <span>{labels.progress}</span>
                        <span>{job.processedRows} / {job.totalRows}</span>
                    </div>
                    <div
                        className="h-1.5 w-full overflow-hidden rounded-full"
                        style={{ background: "rgba(79,195,220,0.1)" }}
                    >
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${progressPct}%`,
                                background:
                                    job.status === "failed"
                                        ? "rgba(220,79,79,0.7)"
                                        : job.status === "completed"
                                        ? "rgba(79,195,120,0.7)"
                                        : "var(--accent-primary)",
                            }}
                        />
                    </div>
                </div>

                {/* Summary counts (visible once processing starts) */}
                {job.processedRows > 0 && (
                    <div className="flex flex-wrap gap-4 text-sm">
                        <span className="flex items-center gap-1.5" style={{ color: "rgba(79,195,120,1)", fontFamily: "var(--font-mono)" }}>
                            <CheckCircle size={13} />
                            {successCount} {labels.summaryImported}
                        </span>
                        <span className="flex items-center gap-1.5" style={{ color: "rgba(79,195,220,1)", fontFamily: "var(--font-mono)" }}>
                            <RefreshCw size={13} />
                            {updatedCount} {labels.summaryUpdated}
                        </span>
                        <span className="flex items-center gap-1.5" style={{ color: "rgba(120,160,220,1)", fontFamily: "var(--font-mono)" }}>
                            <SkipForward size={13} />
                            {skippedCount} {labels.summarySkipped}
                        </span>
                        <span className="flex items-center gap-1.5" style={{ color: "rgba(220,100,100,1)", fontFamily: "var(--font-mono)" }}>
                            <XCircle size={13} />
                            {failedCount} {labels.summaryFailed}
                        </span>
                    </div>
                )}
            </div>

            {/* Results table */}
            {job.results.length > 0 && (
                <div
                    className="overflow-x-auto rounded-lg border"
                    style={{ borderColor: "rgba(79,195,220,0.1)" }}
                >
                    <table className="w-full text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                        <thead>
                            <tr
                                style={{
                                    borderBottom: "1px solid rgba(79,195,220,0.1)",
                                    background: "rgba(7,18,28,0.5)",
                                }}
                            >
                                {[labels.colRow, labels.colInput, labels.colResolved, labels.colStatus, labels.colMessage].map((col) => (
                                    <th
                                        key={col}
                                        className="px-4 py-2.5 text-left text-xs uppercase tracking-wider"
                                        style={{ color: "rgba(79,195,220,0.6)" }}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {job.results.map((result) => (
                                <tr
                                    key={result.rowIndex}
                                    style={{
                                        borderBottom: "1px solid rgba(79,195,220,0.05)",
                                        background:
                                            result.status === "success"
                                                ? "rgba(79,195,120,0.03)"
                                                : result.status === "updated"
                                                ? "rgba(79,195,220,0.04)"
                                                : result.status === "error" || result.status === "not_found"
                                                ? "rgba(220,79,79,0.03)"
                                                : "transparent",
                                    }}
                                >
                                    <td className="px-4 py-2.5 text-xs" style={{ color: "rgba(200,220,232,0.4)" }}>
                                        {result.rowIndex + 1}
                                    </td>
                                    <td className="px-4 py-2.5" style={{ color: "rgba(200,220,232,0.8)" }}>
                                        {result.inputName}
                                    </td>
                                    <td className="px-4 py-2.5" style={{ color: "rgba(200,220,232,0.6)" }}>
                                        {result.resolvedName ?? "—"}
                                    </td>
                                    <td className="px-4 py-2.5">
                                        <StatusBadge status={result.status} labels={labels} />
                                    </td>
                                    <td className="px-4 py-2.5 text-xs" style={{ color: "rgba(200,220,232,0.4)" }}>
                                        {result.message ?? "—"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Actions */}
            {(job.status === "completed" || job.status === "failed") && (
                <div className="flex flex-wrap gap-3">
                    <a
                        href={`/terminal/orgs/${organizationSlug}/inventory`}
                        className="sc-btn-outline inline-flex items-center gap-2 text-sm"
                    >
                        {labels.backToInventory}
                    </a>
                    <a
                        href={`/terminal/orgs/${organizationSlug}/inventory/imports`}
                        className="sc-btn-outline inline-flex items-center gap-2 text-sm"
                    >
                        <History size={14} />
                        {labels.viewAllImports}
                    </a>
                    {failedCount > 0 && (
                        <button
                            type="button"
                            onClick={() => downloadFailedCsv(job)}
                            className="sc-btn-outline inline-flex items-center gap-2 text-sm"
                        >
                            <Download size={14} />
                            {labels.downloadFailed}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
