"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CreditCard, FileText, Zap } from "lucide-react";
import type { OrgBillingView } from "@/lib/types/organization";

type Props = {
    organizationSlug: string;
    billing: OrgBillingView;
    isAdminOrOwner: boolean;
    labels: {
        label: string;
        freeStatus: string;
        proStatus: string;
        proTitle: string;
        freeTitle: string;
        proDesc: string;
        freeDesc: string;
        renewsOn: string;
        cancelsOn: string;
        cancelAtPeriodEnd: string;
        manageBtn: string;
        upgradeBtn: string;
        proOverrideNote: string;
        errorCheckout: string;
        errorPortal: string;
        featuresTitle: string;
        features: string[];
    };
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString(undefined, {
        day: "2-digit", month: "short", year: "numeric",
    });
}

export default function BillingCard({ organizationSlug, billing, isAdminOrOwner, labels }: Props) {
    const isPro = billing.isPro;
    const [error, setError] = useState<string | null>(null);
    const [checkoutPending, startCheckout] = useTransition();

    const borderColor = isPro ? "rgba(87,242,135,0.18)" : "rgba(79,195,220,0.18)";
    const bg = isPro ? "rgba(6,20,14,0.18)" : "rgba(6,14,20,0.18)";
    const accentColor = isPro ? "rgba(87,242,135,0.85)" : "rgba(79,195,220,0.85)";
    const accentBorder = isPro ? "rgba(87,242,135,0.2)" : "rgba(79,195,220,0.2)";
    const accentBg = isPro ? "rgba(87,242,135,0.06)" : "rgba(79,195,220,0.06)";

    function handleUpgrade() {
        setError(null);
        startCheckout(async () => {
            const res = await fetch(`/api/orgs/${organizationSlug}/billing/checkout`, {
                method: "POST",
            });
            if (!res.ok) {
                setError(labels.errorCheckout);
                return;
            }
            const { url } = await res.json() as { url: string };
            if (url) window.location.href = url;
        });
    }

    return (
        <div
            className="rounded-lg border p-4"
            style={{ borderColor, background: bg }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                    style={{ borderColor: accentBorder, color: accentColor, background: accentBg }}
                >
                    {isPro ? <Zap size={18} /> : <CreditCard size={18} />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: isPro ? "rgba(87,242,135,0.6)" : "rgba(79,195,220,0.6)", fontFamily: "var(--font-mono)" }}
                        >
                            {labels.label}
                        </p>
                        <span
                            className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                            style={{
                                borderColor: isPro ? "rgba(87,242,135,0.25)" : "rgba(79,195,220,0.25)",
                                color: accentColor,
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {isPro ? labels.proStatus : labels.freeStatus}
                        </span>
                        {billing.proOverride && (
                            <span
                                className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                                style={{
                                    borderColor: "rgba(240,165,0,0.25)",
                                    color: "rgba(240,165,0,0.85)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                Override
                            </span>
                        )}
                    </div>

                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: accentColor, fontFamily: "var(--font-display)" }}
                    >
                        {isPro ? labels.proTitle : labels.freeTitle}
                    </h3>

                    <p
                        className="mt-1 text-xs"
                        style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {isPro ? labels.proDesc : labels.freeDesc}
                    </p>

                    {isPro && billing.currentPeriodEnd && (
                        <p className="mt-1 text-xs" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                            {billing.cancelAtPeriodEnd ? labels.cancelsOn : labels.renewsOn}: {formatDate(billing.currentPeriodEnd)}
                            {billing.cancelAtPeriodEnd && (
                                <span className="ml-2" style={{ color: "rgba(240,165,0,0.75)" }}>
                                    ({labels.cancelAtPeriodEnd})
                                </span>
                            )}
                        </p>
                    )}

                    {isPro && billing.proOverride && (
                        <p className="mt-1 text-[10px]" style={{ color: "rgba(240,165,0,0.6)", fontFamily: "var(--font-mono)" }}>
                            {labels.proOverrideNote}
                        </p>
                    )}
                </div>
            </div>

            {/* What&apos;s included */}
            {!isPro && (
                <div
                    className="mt-4 rounded border p-3 space-y-1"
                    style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(79,195,220,0.04)" }}
                >
                    <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                        {labels.featuresTitle}
                    </p>
                    <ul className="mt-1 space-y-0.5" style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                        {labels.features.map((f, i) => (
                            <li key={i}>→ {f}</li>
                        ))}
                    </ul>
                </div>
            )}

            {error && (
                <p className="mt-3 text-xs" style={{ color: "rgba(240,100,100,0.85)", fontFamily: "var(--font-mono)" }}>
                    {error}
                </p>
            )}

            {isAdminOrOwner && !billing.proOverride && (
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                    {billing.status && (
                        <Link
                            href={`/terminal/orgs/${organizationSlug}/settings/billing`}
                            className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors"
                            style={{
                                borderColor: "rgba(79,195,220,0.3)",
                                color: "rgba(79,195,220,0.8)",
                                background: "rgba(79,195,220,0.05)",
                            }}
                        >
                            <FileText size={12} />
                            {labels.manageBtn}
                        </Link>
                    )}
                    {!isPro && (
                        <button
                            onClick={handleUpgrade}
                            disabled={checkoutPending}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-50"
                            style={{
                                borderColor: "rgba(87,242,135,0.35)",
                                color: "rgba(87,242,135,0.85)",
                                background: "rgba(87,242,135,0.08)",
                            }}
                        >
                            <Zap size={12} />
                            {checkoutPending ? "..." : labels.upgradeBtn}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
