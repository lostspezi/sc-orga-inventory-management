"use client";

import { useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Download, ExternalLink, Zap, AlertTriangle, XCircle } from "lucide-react";
import type { InvoiceRow } from "@/app/terminal/orgs/[slug]/settings/billing/page";

type Labels = {
    backToSettings: string;
    eyebrow: string;
    subscriptionTitle: string;
    planLabel: string;
    cancelsAtPeriodEnd: string;
    proPlan: string;
    freePlan: string;
    accessUntil: string;
    renews: string;
    cancelPlanBtn: string;
    stripePortalBtn: string;
    opening: string;
    portalError: string;
    cancelError: string;
    invoicesTitle: string;
    noInvoices: string;
    colDate: string;
    colDescription: string;
    colAmount: string;
    colStatus: string;
    downloadPdf: string;
    viewInvoice: string;
    subscriptionIdLabel: string;
    cancelDialogTitle: string;
    cancelDialogDesc: string;
    keepPlanBtn: string;
    yesCancelBtn: string;
    cancelling: string;
};

type Props = {
    organizationSlug: string;
    organizationName: string;
    isPro: boolean;
    customerId: string | null;
    subscriptionId: string | null;
    stripeStatus: string | null;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string | null;
    invoices: InvoiceRow[];
    fetchError: string | null;
    labels: Labels;
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
        day: "2-digit", month: "short", year: "numeric",
    });
}

function formatAmount(cents: number, currency: string) {
    return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: currency.toUpperCase(),
    }).format(cents / 100);
}

function statusColor(status: string) {
    switch (status) {
        case "paid": return "rgba(87,242,135,0.8)";
        case "open": return "rgba(240,165,0,0.8)";
        case "void":
        case "uncollectible": return "rgba(240,100,100,0.7)";
        default: return "rgba(200,220,232,0.4)";
    }
}

function subStatusColor(status: string | null) {
    switch (status) {
        case "active": return "rgba(87,242,135,0.85)";
        case "trialing": return "rgba(79,195,220,0.85)";
        case "past_due":
        case "unpaid": return "rgba(240,165,0,0.85)";
        case "canceled": return "rgba(240,100,100,0.75)";
        default: return "rgba(200,220,232,0.4)";
    }
}

export default function BillingManagePage({
    organizationSlug,
    organizationName,
    isPro,
    customerId,
    subscriptionId,
    stripeStatus,
    cancelAtPeriodEnd,
    currentPeriodEnd,
    invoices,
    fetchError,
    labels,
}: Props) {
    const router = useRouter();
    const cancelDialogRef = useRef<HTMLDialogElement>(null);
    const [portalError, setPortalError] = useState<string | null>(null);
    const [portalPending, startPortal] = useTransition();
    const [cancelError, setCancelError] = useState<string | null>(null);
    const [cancelPending, startCancel] = useTransition();

    function handlePortal() {
        setPortalError(null);
        startPortal(async () => {
            const res = await fetch(`/api/orgs/${organizationSlug}/billing/portal`, { method: "POST" });
            if (!res.ok) { setPortalError(labels.portalError); return; }
            const { url } = await res.json() as { url: string };
            if (url) window.location.href = url;
        });
    }

    function handleCancelConfirm() {
        setCancelError(null);
        startCancel(async () => {
            const res = await fetch(`/api/orgs/${organizationSlug}/billing/cancel`, { method: "POST" });
            if (!res.ok) {
                setCancelError(labels.cancelError);
                return;
            }
            cancelDialogRef.current?.close();
            router.refresh();
        });
    }

    const accentColor = isPro ? "rgba(87,242,135,0.85)" : "rgba(79,195,220,0.85)";
    const borderColor = isPro ? "rgba(87,242,135,0.15)" : "rgba(79,195,220,0.15)";

    return (
        <div className="space-y-4">
            {/* Back link + header */}
            <div>
                <Link
                    href={`/terminal/orgs/${organizationSlug}/settings`}
                    className="inline-flex items-center gap-1.5 text-xs transition-colors mb-3"
                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                >
                    <ArrowLeft size={12} />
                    {labels.backToSettings}
                </Link>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {labels.eyebrow}
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    {organizationName} — {labels.subscriptionTitle}
                </h2>
            </div>

            {/* Subscription status card */}
            <div
                className="rounded-lg border p-5"
                style={{ borderColor, background: isPro ? "rgba(6,20,14,0.22)" : "rgba(6,14,20,0.22)" }}
            >
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                        <div
                            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                            style={{ borderColor, color: accentColor, background: isPro ? "rgba(87,242,135,0.06)" : "rgba(79,195,220,0.06)" }}
                        >
                            <Zap size={18} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className="text-[10px] uppercase tracking-[0.25em]"
                                    style={{ color: isPro ? "rgba(87,242,135,0.55)" : "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                                >
                                    {labels.planLabel}
                                </span>
                                {stripeStatus && (
                                    <span
                                        className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                                        style={{
                                            borderColor: `${subStatusColor(stripeStatus)}33`,
                                            color: subStatusColor(stripeStatus),
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        {stripeStatus}
                                    </span>
                                )}
                                {cancelAtPeriodEnd && (
                                    <span
                                        className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                                        style={{
                                            borderColor: "rgba(240,165,0,0.25)",
                                            color: "rgba(240,165,0,0.8)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        {labels.cancelsAtPeriodEnd}
                                    </span>
                                )}
                            </div>
                            <p
                                className="mt-1 text-base font-semibold uppercase tracking-[0.06em]"
                                style={{ color: accentColor, fontFamily: "var(--font-display)" }}
                            >
                                {isPro ? labels.proPlan : labels.freePlan}
                            </p>
                            {currentPeriodEnd && (
                                <p className="mt-0.5 text-xs" style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                                    {cancelAtPeriodEnd ? labels.accessUntil : labels.renews}: {formatDate(currentPeriodEnd)}
                                </p>
                            )}
                        </div>
                    </div>

                    {customerId && (
                        <div className="flex flex-col gap-2 items-end">
                            <div className="flex flex-wrap gap-2 justify-end">
                                {!cancelAtPeriodEnd && stripeStatus === "active" && (
                                    <button
                                        onClick={() => cancelDialogRef.current?.showModal()}
                                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors"
                                        style={{
                                            borderColor: "rgba(220,79,79,0.25)",
                                            color: "rgba(220,79,79,0.7)",
                                            background: "rgba(220,79,79,0.05)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        <XCircle size={12} />
                                        {labels.cancelPlanBtn}
                                    </button>
                                )}
                                <button
                                    onClick={handlePortal}
                                    disabled={portalPending}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-50"
                                    style={{
                                        borderColor: "rgba(79,195,220,0.3)",
                                        color: "rgba(79,195,220,0.8)",
                                        background: "rgba(79,195,220,0.05)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    <ExternalLink size={12} />
                                    {portalPending ? labels.opening : labels.stripePortalBtn}
                                </button>
                            </div>
                            {portalError && (
                                <p className="text-[11px]" style={{ color: "rgba(240,100,100,0.8)", fontFamily: "var(--font-mono)" }}>
                                    {portalError}
                                </p>
                            )}
                            {cancelError && (
                                <p className="text-[11px]" style={{ color: "rgba(240,100,100,0.8)", fontFamily: "var(--font-mono)" }}>
                                    {cancelError}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Fetch error */}
            {fetchError && (
                <div
                    className="flex items-center gap-2 rounded-lg border p-4"
                    style={{ borderColor: "rgba(240,165,0,0.2)", background: "rgba(20,14,6,0.2)" }}
                >
                    <AlertTriangle size={16} style={{ color: "rgba(240,165,0,0.8)" }} />
                    <p className="text-xs" style={{ color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-mono)" }}>
                        {fetchError}
                    </p>
                </div>
            )}

            {/* Invoice list */}
            <div
                className="rounded-lg border overflow-hidden"
                style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(7,18,28,0.35)" }}
            >
                <div className="px-5 py-4 border-b" style={{ borderColor: "rgba(79,195,220,0.1)" }}>
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                    >
                        {labels.invoicesTitle}
                    </p>
                </div>

                {invoices.length === 0 && !fetchError ? (
                    <p className="px-5 py-6 text-sm" style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}>
                        {labels.noInvoices}
                    </p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(79,195,220,0.1)", color: "rgba(79,195,220,0.45)" }}>
                                    {[labels.colDate, labels.colDescription, labels.colAmount, labels.colStatus, ""].map((h) => (
                                        <th
                                            key={h}
                                            className={`px-5 py-3 text-[10px] uppercase tracking-[0.2em] ${h === "" ? "text-right" : "text-left"}`}
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {invoices.map((inv) => (
                                    <tr
                                        key={inv.id}
                                        style={{ borderBottom: "1px solid rgba(79,195,220,0.06)", color: "rgba(200,220,232,0.75)" }}
                                    >
                                        <td className="px-5 py-3 text-xs whitespace-nowrap" style={{ color: "rgba(200,220,232,0.5)" }}>
                                            {formatDate(inv.date)}
                                        </td>
                                        <td className="px-5 py-3 text-xs max-w-[240px] truncate">
                                            {inv.description}
                                        </td>
                                        <td className="px-5 py-3 text-xs font-medium whitespace-nowrap">
                                            {formatAmount(inv.amount, inv.currency)}
                                        </td>
                                        <td className="px-5 py-3">
                                            <span
                                                className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                                                style={{
                                                    borderColor: `${statusColor(inv.status)}33`,
                                                    color: statusColor(inv.status),
                                                }}
                                            >
                                                {inv.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {inv.pdfUrl && (
                                                    <a
                                                        href={inv.pdfUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="Download PDF"
                                                        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors"
                                                        style={{
                                                            borderColor: "rgba(79,195,220,0.2)",
                                                            color: "rgba(79,195,220,0.7)",
                                                            background: "rgba(79,195,220,0.04)",
                                                        }}
                                                    >
                                                        <Download size={10} />
                                                        {labels.downloadPdf}
                                                    </a>
                                                )}
                                                {inv.hostedUrl && (
                                                    <a
                                                        href={inv.hostedUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        title="View invoice"
                                                        className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors"
                                                        style={{
                                                            borderColor: "rgba(79,195,220,0.12)",
                                                            color: "rgba(79,195,220,0.45)",
                                                        }}
                                                    >
                                                        <ExternalLink size={10} />
                                                        {labels.viewInvoice}
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Subscription ID for reference */}
            {subscriptionId && (
                <p className="text-[10px]" style={{ color: "rgba(200,220,232,0.2)", fontFamily: "var(--font-mono)" }}>
                    {labels.subscriptionIdLabel}: {subscriptionId}
                </p>
            )}

            {/* Cancel confirmation dialog */}
            <dialog
                ref={cancelDialogRef}
                className="rounded-lg border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(220,79,79,0.25)",
                    background: "rgba(12,6,6,0.97)",
                    minWidth: 320,
                    maxWidth: 440,
                }}
            >
                <div className="p-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <XCircle size={20} style={{ color: "rgba(220,79,79,0.8)", flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <h3
                                className="text-base font-semibold uppercase tracking-[0.08em]"
                                style={{ color: "rgba(220,79,79,0.9)", fontFamily: "var(--font-display)" }}
                            >
                                {labels.cancelDialogTitle}
                            </h3>
                            <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}>
                                {labels.cancelDialogDesc}
                                {currentPeriodEnd ? ` (${formatDate(currentPeriodEnd)})` : ""}.
                            </p>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={() => { setCancelError(null); cancelDialogRef.current?.close(); }}
                            className="inline-flex cursor-pointer items-center rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors"
                            style={{
                                borderColor: "rgba(79,195,220,0.2)",
                                color: "rgba(79,195,220,0.6)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {labels.keepPlanBtn}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancelConfirm}
                            disabled={cancelPending}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-50"
                            style={{
                                borderColor: "rgba(220,79,79,0.35)",
                                color: "rgba(220,79,79,0.85)",
                                background: "rgba(220,79,79,0.08)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            <XCircle size={12} />
                            {cancelPending ? labels.cancelling : labels.yesCancelBtn}
                        </button>
                    </div>

                    {cancelError && (
                        <p className="text-[11px]" style={{ color: "rgba(240,100,100,0.8)", fontFamily: "var(--font-mono)" }}>
                            {cancelError}
                        </p>
                    )}
                </div>
            </dialog>
        </div>
    );
}
