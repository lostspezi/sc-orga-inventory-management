"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

interface Props {
    slug: string;
    currentWeekLabel: string;
    labels: {
        button: string;
        confirmTitle: string;
        confirmMessage: string;
        confirm: string;
        cancel: string;
        generating: string;
        alreadyExists: string;
    };
}

export default function GenerateReportButton({ slug, currentWeekLabel, labels }: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);

    function openConfirm() {
        setError(null);
        dialogRef.current?.showModal();
    }

    function handleGenerate() {
        dialogRef.current?.close();
        startTransition(async () => {
            setError(null);
            try {
                const res = await fetch(`/api/orgs/${slug}/reports`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({}),
                });

                if (res.status === 409) {
                    const data = await res.json();
                    if (data.existing) {
                        setError(labels.alreadyExists);
                    } else if (data.reportId) {
                        // Already generating — just refresh to show it
                        router.refresh();
                    }
                    return;
                }

                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setError(data.error ?? "Failed to start report generation");
                    return;
                }

                router.refresh();
            } catch {
                setError("Network error. Please try again.");
            }
        });
    }

    return (
        <>
            <button
                type="button"
                onClick={openConfirm}
                disabled={isPending}
                className="sc-btn inline-flex items-center gap-2"
            >
                <Plus size={15} />
                {isPending ? labels.generating : labels.button}
            </button>

            {error && (
                <p
                    className="mt-2 text-xs"
                    style={{ color: "rgba(248,113,113,0.9)", fontFamily: "var(--font-mono)" }}
                >
                    {error}
                </p>
            )}

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
                            {labels.confirmTitle}
                        </h3>
                    </div>
                    <p
                        className="text-sm"
                        style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)" }}
                    >
                        {labels.confirmMessage.replace("{week}", currentWeekLabel)}
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
                            {labels.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={handleGenerate}
                            className="sc-btn"
                        >
                            {labels.confirm}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
