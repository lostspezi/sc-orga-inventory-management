"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Download, AlertCircle, RefreshCw, MoreHorizontal } from "lucide-react";
import ReportStatusBadge from "./report-status-badge";
import type { OrgReportView } from "@/lib/types/report";
import { formatWeekRange } from "@/lib/reporting/week-utils";

interface Props {
    slug: string;
    initialReports: OrgReportView[];
    total: number;
    isAdminOrOwner: boolean;
    labels: {
        weekRange: string;
        status: string;
        generated: string;
        actions: string;
        download: string;
        noReports: string;
        noReportsDesc: string;
        statusLabels: {
            ready: string;
            generating: string;
            pending: string;
            failed: string;
        };
        regenerate: {
            button: string;
            confirmTitle: string;
            confirmMessage: string;
            confirm: string;
            cancel: string;
            regenerating: string;
        };
        errorDetails: string;
        generatedAt: string;
        neverGenerated: string;
        version: string;
        size: string;
        bytes: string;
    };
}

function fmtBytes(bytes: number | null): string {
    if (bytes === null) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function RowMenu({
    slug,
    report,
    isAdminOrOwner,
    labels,
}: {
    slug: string;
    report: OrgReportView;
    isAdminOrOwner: boolean;
    labels: Props["labels"];
}) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [showError, setShowError] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [regenError, setRegenError] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const canDownload = report.status === "ready";
    const canRegenerate =
        isAdminOrOwner && (report.status === "ready" || report.status === "failed");
    const hasFailed = report.status === "failed";

    function openRegenDialog() {
        setOpen(false);
        setRegenError(null);
        dialogRef.current?.showModal();
    }

    function handleRegenerate() {
        dialogRef.current?.close();
        startTransition(async () => {
            setRegenError(null);
            try {
                const res = await fetch(
                    `/api/orgs/${slug}/reports/${report.reportId}/regenerate`,
                    { method: "POST" }
                );
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setRegenError(data.error ?? "Failed to start regeneration");
                    return;
                }
                router.refresh();
            } catch {
                setRegenError("Network error. Please try again.");
            }
        });
    }

    return (
        <>
            <div className="relative flex justify-end" ref={menuRef}>
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    disabled={isPending}
                    className="cursor-pointer flex h-7 w-7 items-center justify-center rounded-md border transition disabled:opacity-40"
                    style={{
                        borderColor: open
                            ? "rgba(79,195,220,0.35)"
                            : "rgba(79,195,220,0.14)",
                        background: open
                            ? "rgba(79,195,220,0.08)"
                            : "transparent",
                        color: "rgba(79,195,220,0.7)",
                    }}
                >
                    {isPending ? (
                        <RefreshCw size={13} className="animate-spin" />
                    ) : (
                        <MoreHorizontal size={14} />
                    )}
                </button>

                {open && (
                    <div
                        className="absolute right-0 top-full z-50 mt-1.5 w-44 rounded-xl border shadow-2xl"
                        style={{
                            borderColor: "rgba(79,195,220,0.18)",
                            background: "rgba(6,12,18,0.97)",
                            backdropFilter: "blur(16px)",
                        }}
                    >
                        {/* Top glow */}
                        <div
                            className="absolute left-3 right-3 top-0 h-px"
                            style={{
                                background:
                                    "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                            }}
                        />

                        <div className="p-1.5 space-y-0.5">
                            {canDownload && (
                                <a
                                    href={`/api/orgs/${slug}/reports/${report.reportId}/download`}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        color: "rgba(79,195,220,0.85)",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                            "rgba(79,195,220,0.08)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = "transparent")
                                    }
                                >
                                    <Download size={12} />
                                    {labels.download}
                                </a>
                            )}

                            {hasFailed && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowError((v) => !v);
                                        setOpen(false);
                                    }}
                                    className="cursor-pointer flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        color: "rgba(248,113,113,0.85)",
                                    }}
                                    onMouseEnter={(e) =>
                                        (e.currentTarget.style.background =
                                            "rgba(248,113,113,0.08)")
                                    }
                                    onMouseLeave={(e) =>
                                        (e.currentTarget.style.background = "transparent")
                                    }
                                >
                                    <AlertCircle size={12} />
                                    {labels.errorDetails}
                                </button>
                            )}

                            {canRegenerate && (
                                <>
                                    {(canDownload || hasFailed) && (
                                        <div
                                            className="my-1 mx-2 h-px"
                                            style={{ background: "rgba(79,195,220,0.1)" }}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={openRegenDialog}
                                        className="cursor-pointer flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] uppercase tracking-[0.12em] transition-colors"
                                        style={{
                                            fontFamily: "var(--font-mono)",
                                            color: "rgba(200,220,232,0.55)",
                                        }}
                                        onMouseEnter={(e) =>
                                            (e.currentTarget.style.background =
                                                "rgba(200,220,232,0.05)")
                                        }
                                        onMouseLeave={(e) =>
                                            (e.currentTarget.style.background = "transparent")
                                        }
                                    >
                                        <RefreshCw size={12} />
                                        {labels.regenerate.button}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Error expansion */}
            {showError && report.errorMessage && (
                <div
                    className="col-span-4 px-4 py-3 text-xs border-t"
                    style={{
                        background: "rgba(248,113,113,0.05)",
                        borderColor: "rgba(248,113,113,0.15)",
                        color: "rgba(248,113,113,0.8)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    <span style={{ color: "rgba(248,113,113,0.5)" }}>ERROR: </span>
                    {report.errorMessage}
                    <span style={{ color: "rgba(200,220,232,0.3)" }}>
                        {" "}· retries: {report.retryCount}
                    </span>
                </div>
            )}

            {regenError && (
                <p
                    className="text-xs mt-1 text-right pr-1"
                    style={{ color: "rgba(248,113,113,0.9)", fontFamily: "var(--font-mono)" }}
                >
                    {regenError}
                </p>
            )}

            {/* Regenerate confirm dialog */}
            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    background: "rgba(6,12,18,0.97)",
                    borderColor: "rgba(79,195,220,0.2)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.45)",
                }}
            >
                <div className="relative p-6 space-y-4">
                    <div
                        className="absolute left-6 right-6 top-0 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }}
                    />
                    <div>
                        <p
                            className="text-[10px] uppercase tracking-[0.25em] mb-1"
                            style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                        >
                            Reporting
                        </p>
                        <h3
                            className="text-base font-semibold uppercase tracking-[0.08em]"
                            style={{ color: "rgba(200,220,232,0.95)", fontFamily: "var(--font-display)" }}
                        >
                            {labels.regenerate.confirmTitle}
                        </h3>
                    </div>
                    <p
                        className="text-sm"
                        style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)" }}
                    >
                        {labels.regenerate.confirmMessage}
                    </p>
                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => dialogRef.current?.close()}
                            className="cursor-pointer rounded-md border px-3 py-1.5 text-xs"
                            style={{
                                borderColor: "rgba(79,195,220,0.2)",
                                color: "rgba(200,220,232,0.6)",
                                fontFamily: "var(--font-mono)",
                                background: "rgba(79,195,220,0.04)",
                            }}
                        >
                            {labels.regenerate.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={handleRegenerate}
                            className="sc-btn"
                        >
                            {labels.regenerate.confirm}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}

export default function ReportList({
    slug,
    initialReports,
    isAdminOrOwner,
    labels,
}: Props) {
    const router = useRouter();
    const [reports, setReports] = useState<OrgReportView[]>(initialReports);
    const [, startTransition] = useTransition();

    // Poll active (generating/pending) reports every 3 seconds
    useEffect(() => {
        const active = reports.filter(
            (r) => r.status === "generating" || r.status === "pending"
        );
        if (active.length === 0) return;

        const timer = setInterval(() => {
            startTransition(() => {
                router.refresh();
            });
        }, 3000);

        return () => clearInterval(timer);
    }, [reports, router]);

    // Update local state when server re-renders
    useEffect(() => {
        setReports(initialReports);
    }, [initialReports]);

    if (reports.length === 0) {
        return (
            <div
                className="rounded-lg border py-12 text-center"
                style={{
                    borderColor: "rgba(79,195,220,0.1)",
                    background: "rgba(7,18,28,0.2)",
                }}
            >
                <p
                    className="text-sm font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(79,195,220,0.6)", fontFamily: "var(--font-display)" }}
                >
                    {labels.noReports}
                </p>
                <p
                    className="mt-2 text-xs"
                    style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                >
                    {labels.noReportsDesc}
                </p>
            </div>
        );
    }

    return (
        <div
            className="rounded-lg border"
            style={{ borderColor: "rgba(79,195,220,0.14)" }}
        >
            {/* Table header */}
            <div
                className="grid text-[10px] uppercase tracking-[0.18em] px-4 py-2.5 border-b"
                style={{
                    gridTemplateColumns: "1fr 120px 160px 40px",
                    background: "rgba(10,25,38,0.8)",
                    borderColor: "rgba(79,195,220,0.14)",
                    color: "rgba(79,195,220,0.6)",
                    fontFamily: "var(--font-mono)",
                }}
            >
                <span>{labels.weekRange}</span>
                <span>{labels.status}</span>
                <span>{labels.generated}</span>
                <span />
            </div>

            {/* Rows */}
            {reports.map((report) => {
                const isActive =
                    report.status === "generating" || report.status === "pending";
                const genDate = report.generatedAt
                    ? new Date(report.generatedAt).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "UTC",
                          hour12: false,
                      }) + " UTC"
                    : labels.neverGenerated;

                return (
                    <div key={report.reportId}>
                        <div
                            className="grid items-center px-4 py-3 border-b transition-colors"
                            style={{
                                gridTemplateColumns: "1fr 120px 160px 40px",
                                borderColor: "rgba(79,195,220,0.08)",
                                background: isActive
                                    ? "rgba(79,195,220,0.04)"
                                    : "transparent",
                            }}
                        >
                            {/* Week range */}
                            <div>
                                <p
                                    className="text-sm font-medium"
                                    style={{
                                        color: "rgba(200,220,232,0.9)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    {formatWeekRange(report.weekStart, report.weekEnd)}
                                </p>
                                <p
                                    className="text-[10px] mt-0.5"
                                    style={{
                                        color: "rgba(200,220,232,0.35)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    {report.weekLabel}
                                    {report.version > 1 ? ` · v${report.version}` : ""}
                                    {report.fileSize ? ` · ${fmtBytes(report.fileSize)}` : ""}
                                </p>
                            </div>

                            {/* Status badge */}
                            <div>
                                <ReportStatusBadge
                                    status={report.status}
                                    labels={labels.statusLabels}
                                />
                            </div>

                            {/* Generated date */}
                            <p
                                className="text-xs"
                                style={{
                                    color: "rgba(200,220,232,0.5)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {genDate}
                            </p>

                            {/* 3-dot menu */}
                            <div>
                                {isActive ? (
                                    <span
                                        className="flex justify-end text-xs"
                                        style={{
                                            color: "rgba(79,195,220,0.5)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        …
                                    </span>
                                ) : (
                                    <RowMenu
                                        slug={slug}
                                        report={report}
                                        isAdminOrOwner={isAdminOrOwner}
                                        labels={labels}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
