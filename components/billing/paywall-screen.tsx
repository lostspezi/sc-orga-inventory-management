"use client";

import { useState, useTransition } from "react";
import { Lock, Zap } from "lucide-react";

type Props = {
    organizationSlug: string;
    featureName: string;
    isAdminOrOwner: boolean;
    labels: {
        lockedTitle: string;
        lockedDesc: string;
        upgradeBtn: string;
        notAdminNote: string;
        error: string;
    };
};

export default function PaywallScreen({ organizationSlug, featureName, isAdminOrOwner, labels }: Props) {
    const [error, setError] = useState<string | null>(null);
    const [pending, start] = useTransition();

    function handleUpgrade() {
        setError(null);
        start(async () => {
            const res = await fetch(`/api/orgs/${organizationSlug}/billing/checkout`, {
                method: "POST",
            });
            if (!res.ok) {
                setError(labels.error);
                return;
            }
            const { url } = await res.json() as { url: string };
            if (url) window.location.href = url;
        });
    }

    return (
        <div
            className="flex flex-col items-center justify-center rounded-lg border p-10 text-center"
            style={{
                borderColor: "rgba(79,195,220,0.15)",
                background: "rgba(6,14,20,0.5)",
                minHeight: 260,
            }}
        >
            <div
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-full border"
                style={{
                    borderColor: "rgba(79,195,220,0.25)",
                    color: "rgba(79,195,220,0.7)",
                    background: "rgba(79,195,220,0.06)",
                }}
            >
                <Lock size={24} />
            </div>

            <h3
                className="text-base font-semibold uppercase tracking-[0.1em]"
                style={{ color: "rgba(200,220,232,0.9)", fontFamily: "var(--font-display)" }}
            >
                {featureName} — {labels.lockedTitle}
            </h3>

            <p
                className="mt-2 max-w-sm text-xs"
                style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
            >
                {labels.lockedDesc}
            </p>

            {error && (
                <p className="mt-3 text-xs" style={{ color: "rgba(240,100,100,0.85)", fontFamily: "var(--font-mono)" }}>
                    {labels.error}
                </p>
            )}

            {isAdminOrOwner ? (
                <button
                    onClick={handleUpgrade}
                    disabled={pending}
                    className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-50"
                    style={{
                        borderColor: "rgba(87,242,135,0.35)",
                        color: "rgba(87,242,135,0.85)",
                        background: "rgba(87,242,135,0.08)",
                    }}
                >
                    <Zap size={14} />
                    {pending ? "..." : labels.upgradeBtn}
                </button>
            ) : (
                <p
                    className="mt-6 text-xs"
                    style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                >
                    {labels.notAdminNote}
                </p>
            )}
        </div>
    );
}
