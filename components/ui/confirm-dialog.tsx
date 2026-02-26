"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, X } from "lucide-react";

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    tone?: "danger" | "default";
    isLoading?: boolean;
    onConfirm: () => void | Promise<void>;
    onClose: () => void;
};

export default function ConfirmDialog({
                                          open,
                                          title,
                                          description,
                                          confirmLabel = "Confirm",
                                          cancelLabel = "Cancel",
                                          tone = "danger",
                                          isLoading = false,
                                          onConfirm,
                                          onClose,
                                      }: Readonly<ConfirmDialogProps>) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const busy = isLoading || isSubmitting;
    const isDanger = tone === "danger";

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    const handleClose = () => {
        if (busy) return;
        onClose();
    };

    const handleConfirm = async () => {
        try {
            setIsSubmitting(true);
            await onConfirm();
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <dialog
            ref={dialogRef}
            onClose={handleClose}
            className="fixed left-1/2 top-1/2 m-0 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
            style={{
                borderColor: isDanger
                    ? "rgba(240,165,0,0.2)"
                    : "rgba(79,195,220,0.2)",
                background: "rgba(6,12,18,0.96)",
                boxShadow: "0 0 40px rgba(0,0,0,0.45)",
            }}
        >
            <div className="relative p-5 sm:p-6">
                <div
                    className="absolute left-6 right-6 top-0 h-px"
                    style={{
                        background: isDanger
                            ? "linear-gradient(90deg, transparent, rgba(240,165,0,0.9), transparent)"
                            : "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                    }}
                />

                <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <div
                            className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-lg border"
                            style={{
                                borderColor: isDanger
                                    ? "rgba(240,165,0,0.2)"
                                    : "rgba(79,195,220,0.2)",
                                color: isDanger
                                    ? "rgba(240,165,0,0.9)"
                                    : "var(--accent-primary)",
                                background: isDanger
                                    ? "rgba(240,165,0,0.05)"
                                    : "rgba(79,195,220,0.05)",
                            }}
                        >
                            {isDanger ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
                        </div>

                        <div>
                            <p
                                className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                                style={{
                                    color: isDanger
                                        ? "rgba(240,165,0,0.7)"
                                        : "rgba(79,195,220,0.45)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                SYSTEM.CONFIRM
                            </p>
                            <h2
                                className="text-lg font-semibold uppercase tracking-[0.08em]"
                                style={{
                                    color: isDanger
                                        ? "rgba(240,165,0,0.9)"
                                        : "var(--accent-primary)",
                                    fontFamily: "var(--font-display)",
                                }}
                            >
                                {title}
                            </h2>
                            {description && (
                                <p
                                    className="mt-1 text-sm"
                                    style={{
                                        color: "rgba(200,220,232,0.45)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    {description}
                                </p>
                            )}
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={busy}
                        className="cursor-pointer rounded-md border px-2.5 py-1 text-xs disabled:opacity-50"
                        style={{
                            borderColor: "rgba(79,195,220,0.2)",
                            color: "rgba(200,220,232,0.6)",
                            fontFamily: "var(--font-mono)",
                            background: "rgba(79,195,220,0.04)",
                        }}
                    >
                        <span className="inline-flex items-center gap-1">
                            <X size={12} />
                            CLOSE
                        </span>
                    </button>
                </div>

                <div
                    className="rounded-lg border p-4"
                    style={{
                        borderColor: isDanger
                            ? "rgba(240,165,0,0.14)"
                            : "rgba(79,195,220,0.14)",
                        background: isDanger
                            ? "rgba(20,14,6,0.12)"
                            : "rgba(7,18,28,0.28)",
                    }}
                >
                    <p
                        className="text-[11px] leading-5"
                        style={{
                            color: "rgba(200,220,232,0.38)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        [CONFIRM] Awaiting operator approval
                        <br />
                        [STATE] Action requires manual confirmation
                        <br />
                        [READY] Proceed or abort<span style={{ animation: "blink-cursor 1s steps(1) infinite" }}>_</span>
                    </p>
                </div>

                <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={busy}
                        className="cursor-pointer sc-btn sc-btn-outline disabled:opacity-50"
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={handleConfirm}
                        disabled={busy}
                        className="cursor-pointer sc-btn disabled:opacity-50"
                        style={
                            isDanger
                                ? {
                                    borderColor: "rgba(240,165,0,0.24)",
                                    background: "rgba(240,165,0,0.08)",
                                    color: "rgba(240,165,0,0.95)",
                                }
                                : undefined
                        }
                    >
                        {busy ? "Processing..." : confirmLabel}
                    </button>
                </div>
            </div>
        </dialog>
    );
}