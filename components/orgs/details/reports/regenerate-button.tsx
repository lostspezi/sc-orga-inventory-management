"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";

interface Props {
    slug: string;
    reportId: string;
    weekLabel: string;
    labels: {
        button: string;
        confirmTitle: string;
        confirmMessage: string;
        confirm: string;
        cancel: string;
        regenerating: string;
    };
}

export default function RegenerateButton({
    slug,
    reportId,
    weekLabel,
    labels,
}: Props) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const dialogRef = useRef<HTMLDialogElement>(null);

    function handleRegenerate() {
        dialogRef.current?.close();
        startTransition(async () => {
            setError(null);
            try {
                const res = await fetch(
                    `/api/orgs/${slug}/reports/${reportId}/regenerate`,
                    { method: "POST" }
                );
                if (!res.ok) {
                    const data = await res.json().catch(() => ({}));
                    setError(data.error ?? "Failed to start regeneration");
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
                onClick={() => {
                    setError(null);
                    dialogRef.current?.showModal();
                }}
                disabled={isPending}
                className="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] transition disabled:opacity-40"
                style={{
                    borderColor: "rgba(140,140,160,0.25)",
                    color: "rgba(200,220,232,0.55)",
                    background: "rgba(200,220,232,0.03)",
                    fontFamily: "var(--font-mono)",
                }}
                title={labels.button}
            >
                <RefreshCw size={11} className={isPending ? "animate-spin" : ""} />
                {labels.button}
            </button>

            {error && (
                <p
                    className="text-xs mt-1"
                    style={{ color: "rgba(248,113,113,0.9)", fontFamily: "var(--font-mono)" }}
                >
                    {error}
                </p>
            )}

            <dialog
                ref={dialogRef}
                className="rounded-lg border p-0 backdrop:bg-black/70"
                style={{
                    background: "rgba(6,12,20,0.98)",
                    borderColor: "rgba(79,195,220,0.2)",
                    color: "var(--accent-primary)",
                    minWidth: "340px",
                    maxWidth: "420px",
                }}
            >
                <div className="p-6 space-y-4">
                    <div>
                        <p
                            className="text-[10px] uppercase tracking-[0.25em] mb-1"
                            style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                        >
                            Reporting
                        </p>
                        <h3
                            className="text-base font-semibold uppercase tracking-[0.08em]"
                            style={{ fontFamily: "var(--font-display)" }}
                        >
                            {labels.confirmTitle}
                        </h3>
                    </div>
                    <p
                        className="text-sm"
                        style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)" }}
                    >
                        {labels.confirmMessage.replace("{week}", weekLabel)}
                    </p>
                    <div className="flex justify-end gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => dialogRef.current?.close()}
                            className="sc-btn-outline"
                        >
                            {labels.cancel}
                        </button>
                        <button
                            type="button"
                            onClick={handleRegenerate}
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
