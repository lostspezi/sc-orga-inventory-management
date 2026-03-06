"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

type CheckoutDialogLabels = {
    title: string;
    priceLabel: string;
    priceDetails: string;
    cancelNote: string;
    withdrawalNotice: string;
    checkboxTerms: string;
    checkboxWithdrawal: string;
    ctaButton: string;
    cancelButton: string;
    loadingButton: string;
    errorCheckout: string;
};

type Props = {
    organizationSlug: string;
    onClose: () => void;
    labels: CheckoutDialogLabels;
};

export default function CheckoutConsentDialog({ organizationSlug, onClose, labels }: Props) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [checkedTerms, setCheckedTerms] = useState(false);
    const [checkedWithdrawal, setCheckedWithdrawal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    function handleClose() {
        if (loading) return;
        onClose();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!checkedTerms || !checkedWithdrawal || loading) return;

        setLoading(true);
        setError(null);

        try {
            const res = await fetch(`/api/orgs/${organizationSlug}/billing/checkout`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    consentTerms: true,
                    consentWithdrawalWaiver: true,
                    consentTimestamp: new Date().toISOString(),
                }),
            });

            if (!res.ok) {
                setError(labels.errorCheckout);
                setLoading(false);
                return;
            }

            const { url } = await res.json() as { url: string };
            if (url) window.location.href = url;
        } catch {
            setError(labels.errorCheckout);
            setLoading(false);
        }
    }

    const canSubmit = checkedTerms && checkedWithdrawal && !loading;

    return (
        <dialog
            ref={dialogRef}
            onCancel={(e) => { e.preventDefault(); handleClose(); }}
            className="w-full max-w-lg rounded-lg border p-0 backdrop:bg-black/70"
            style={{
                background: "rgba(8,16,24,0.98)",
                borderColor: "rgba(87,242,135,0.2)",
                color: "inherit",
                position: "fixed",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                margin: 0,
            }}
        >
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Header */}
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(87,242,135,0.6)", fontFamily: "var(--font-mono)" }}
                    >
                        PRO
                    </p>
                    <h2
                        className="mt-0.5 text-lg font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "rgba(87,242,135,0.9)", fontFamily: "var(--font-display)" }}
                    >
                        {labels.title}
                    </h2>
                </div>

                {/* Price summary */}
                <div
                    className="rounded border p-4 space-y-1"
                    style={{
                        borderColor: "rgba(87,242,135,0.2)",
                        background: "rgba(87,242,135,0.05)",
                    }}
                >
                    <p
                        className="text-xl font-semibold"
                        style={{ color: "rgba(87,242,135,0.9)", fontFamily: "var(--font-mono)" }}
                    >
                        {labels.priceLabel}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(200,220,232,0.55)", fontFamily: "var(--font-mono)" }}>
                        {labels.priceDetails}
                    </p>
                    <p className="text-xs" style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                        {labels.cancelNote}
                    </p>
                </div>

                {/* Withdrawal notice */}
                <p
                    className="text-xs leading-relaxed"
                    style={{ color: "rgba(200,220,232,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    {labels.withdrawalNotice}
                </p>

                {/* Checkbox 1 — Terms & Privacy */}
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={checkedTerms}
                        onChange={(e) => setCheckedTerms(e.target.checked)}
                        className="mt-0.5 shrink-0 accent-green-400"
                        disabled={loading}
                    />
                    <span className="text-xs leading-relaxed space-y-0.5" style={{ color: "rgba(200,220,232,0.7)", fontFamily: "var(--font-mono)" }}>
                        <span className="block">{labels.checkboxTerms}</span>
                        <span className="block">
                            <Link
                                href="/legal/terms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline mr-3"
                                style={{ color: "rgba(79,195,220,0.8)" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Terms &amp; Conditions
                            </Link>
                            <Link
                                href="/legal/privacy"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="underline"
                                style={{ color: "rgba(79,195,220,0.8)" }}
                                onClick={(e) => e.stopPropagation()}
                            >
                                Privacy Policy
                            </Link>
                        </span>
                    </span>
                </label>

                {/* Checkbox 2 — Withdrawal waiver */}
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={checkedWithdrawal}
                        onChange={(e) => setCheckedWithdrawal(e.target.checked)}
                        className="mt-0.5 shrink-0 accent-green-400"
                        disabled={loading}
                    />
                    <span className="text-xs leading-relaxed" style={{ color: "rgba(200,220,232,0.7)", fontFamily: "var(--font-mono)" }}>
                        {labels.checkboxWithdrawal}
                    </span>
                </label>

                {/* Error */}
                {error && (
                    <p className="text-xs" style={{ color: "rgba(240,100,100,0.85)", fontFamily: "var(--font-mono)" }}>
                        {error}
                    </p>
                )}

                {/* Actions */}
                <div className="flex justify-end gap-3 pt-1">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="inline-flex items-center rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-40 cursor-pointer"
                        style={{
                            borderColor: "rgba(79,195,220,0.25)",
                            color: "rgba(79,195,220,0.7)",
                            background: "transparent",
                        }}
                    >
                        {labels.cancelButton}
                    </button>

                    <button
                        type="submit"
                        disabled={!canSubmit}
                        className="inline-flex items-center rounded-md border px-4 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-40 cursor-pointer"
                        style={{
                            borderColor: canSubmit ? "rgba(87,242,135,0.4)" : "rgba(87,242,135,0.15)",
                            color: "rgba(87,242,135,0.9)",
                            background: canSubmit ? "rgba(87,242,135,0.1)" : "rgba(87,242,135,0.03)",
                        }}
                    >
                        {loading ? labels.loadingButton : labels.ctaButton}
                    </button>
                </div>
            </form>
        </dialog>
    );
}

export type { CheckoutDialogLabels };
