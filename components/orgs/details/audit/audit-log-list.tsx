"use client";

import { useMemo, useRef, useState } from "react";
import { Clock3, FileText, User, X } from "lucide-react";
import { useTranslations } from "next-intl";

type AuditLogItem = {
    _id: string;
    action: string;
    message: string;
    actorUsername?: string;
    actorUserId: string;
    entityType: string;
    entityId?: string;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
};

type Props = {
    logs: AuditLogItem[];
};

export default function AuditLogList({ logs }: Props) {
    const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
    const dialogRef = useRef<HTMLDialogElement | null>(null);

    const openDetails = (log: AuditLogItem) => {
        setSelectedLog(log);
        dialogRef.current?.showModal();
    };

    const closeDetails = () => {
        dialogRef.current?.close();
        setSelectedLog(null);
    };

    return (
        <>
            <div className="space-y-2">
                {logs.map((log) => (
                    <AuditLogRow
                        key={log._id.toString()}
                        log={log}
                        onClick={() => openDetails(log)}
                    />
                ))}
            </div>

            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(79,195,220,0.2)",
                    background: "rgba(6,12,18,0.96)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.45)",
                }}
            >
                {selectedLog && (
                    <AuditLogDetailsDialogContent
                        log={selectedLog}
                        onClose={closeDetails}
                    />
                )}
            </dialog>
        </>
    );
}

function AuditLogRow({
                         log,
                         onClick,
                     }: {
    log: AuditLogItem;
    onClick: () => void;
}) {
    const actor = log.actorUsername ?? log.actorUserId;
    const createdAt = new Date(log.createdAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    return (
        <button
            type="button"
            onClick={onClick}
            className="cursor-pointer w-full rounded-lg border p-3 text-left transition hover:bg-white/5"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(7,18,28,0.26)",
            }}
        >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p
                    className="min-w-0 truncate pr-2 text-sm"
                    style={{ color: "rgba(200,220,232,0.58)", fontFamily: "var(--font-mono)" }}
                    title={log.message}
                >
                    {log.message}
                </p>

                <div className="flex shrink-0 flex-col gap-1 text-[11px] sm:items-end">
                    <span style={{ color: "rgba(200,220,232,0.46)", fontFamily: "var(--font-mono)" }}>
                        {actor}
                    </span>
                    <span style={{ color: "rgba(200,220,232,0.34)", fontFamily: "var(--font-mono)" }}>
                        {createdAt}
                    </span>
                </div>
            </div>
        </button>
    );
}

function AuditLogDetailsDialogContent({
                                          log,
                                          onClose,
                                      }: {
    log: AuditLogItem;
    onClose: () => void;
}) {
    const t = useTranslations("logs");
    const tc = useTranslations("common");
    const actor = log.actorUsername ?? log.actorUserId;
    const createdAt = new Date(log.createdAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    const formattedMetadata = useMemo(() => {
        if (!log.metadata) return null;

        try {
            return JSON.stringify(log.metadata, null, 2);
        } catch {
            return String(log.metadata);
        }
    }, [log.metadata]);

    return (
        <div className="relative p-5 sm:p-6">
            <div
                className="absolute left-6 right-6 top-0 h-px"
                style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }}
            />

            <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                    <p
                        className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("detailsLabel")}
                    </p>
                    <h3
                        className="text-lg font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {t("detailsTitle")}
                    </h3>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("detailsDesc")}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="cursor-pointer rounded-md border px-2.5 py-1 text-xs"
                    style={{
                        borderColor: "rgba(79,195,220,0.2)",
                        color: "rgba(200,220,232,0.6)",
                        fontFamily: "var(--font-mono)",
                        background: "rgba(79,195,220,0.04)",
                    }}
                >
                    <span className="inline-flex items-center gap-1">
                        <X size={12} />
                        {tc("close").toUpperCase()}
                    </span>
                </button>
            </div>

            <div className="space-y-4">
                <div
                    className="rounded-lg border p-4"
                    style={{
                        borderColor: "rgba(79,195,220,0.14)",
                        background: "rgba(7,18,28,0.28)",
                    }}
                >
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <div
                            className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.08em]"
                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                        >
                            <FileText size={16} />
                            {log.action}
                        </div>

                        <span
                            className="rounded border px-2 py-0.5 text-[10px] uppercase"
                            style={{
                                borderColor: "rgba(79,195,220,0.18)",
                                color: "rgba(79,195,220,0.6)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {log.entityType}
                        </span>
                    </div>

                    <p
                        className="text-sm leading-6"
                        style={{ color: "rgba(200,220,232,0.52)", fontFamily: "var(--font-mono)" }}
                    >
                        {log.message}
                    </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <DetailRow icon={<User size={14} />} label={t("actor")} value={actor} />
                    <DetailRow icon={<Clock3 size={14} />} label={t("time")} value={createdAt} />
                    <DetailRow label={t("action")} value={log.action} />
                    <DetailRow label={t("entityType")} value={log.entityType} />
                    {log.entityId && <DetailRow label={t("entityId")} value={log.entityId} />}
                    <DetailRow label={t("actorUserId")} value={log.actorUserId} />
                </div>

                {formattedMetadata && (
                    <div
                        className="rounded-lg border p-4"
                        style={{
                            borderColor: "rgba(79,195,220,0.14)",
                            background: "rgba(7,18,28,0.22)",
                        }}
                    >
                        <p
                            className="mb-2 text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("metadata")}
                        </p>

                        <pre
                            className="overflow-x-auto whitespace-pre-wrap wrap-break-word text-[11px]"
                            style={{
                                color: "rgba(200,220,232,0.42)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {formattedMetadata}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

function DetailRow({
                       icon,
                       label,
                       value,
                   }: {
    icon?: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div
            className="rounded-lg border px-3 py-2"
            style={{
                borderColor: "rgba(79,195,220,0.10)",
                background: "rgba(7,18,28,0.18)",
            }}
        >
            <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                {icon && <span style={{ color: "rgba(79,195,220,0.65)" }}>{icon}</span>}
                <span style={{ color: "rgba(200,220,232,0.35)" }}>{label}</span>
            </div>
            <p
                className="mt-1 break-all text-[12px]"
                style={{ color: "rgba(200,220,232,0.62)", fontFamily: "var(--font-mono)" }}
            >
                {value}
            </p>
        </div>
    );
}