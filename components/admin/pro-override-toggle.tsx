"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Zap } from "lucide-react";

type Props = {
    orgId: string;
    orgName: string;
    isPro: boolean;
    currentOverride: boolean;
};

export default function ProOverrideToggle({ orgId, orgName, isPro, currentOverride }: Props) {
    const router = useRouter();
    const [pending, start] = useTransition();
    const [error, setError] = useState<string | null>(null);

    function handleToggle() {
        setError(null);
        const enable = !currentOverride;
        const reason = enable ? window.prompt(`Enable PRO override for "${orgName}"?\nReason (optional):`) : undefined;
        if (enable && reason === null) return; // cancelled

        start(async () => {
            const res = await fetch(`/api/admin/orgs/${orgId}/pro-override`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ enabled: enable, reason: reason ?? undefined }),
            });
            if (!res.ok) {
                setError("Failed");
                return;
            }
            router.refresh();
        });
    }

    return (
        <div className="flex items-center gap-2">
            <span
                className="inline-flex items-center gap-1 rounded border px-2 py-1 text-[10px] uppercase tracking-[0.1em]"
                style={{
                    borderColor: isPro ? "rgba(87,242,135,0.3)" : "rgba(79,195,220,0.15)",
                    color: isPro ? "rgba(87,242,135,0.85)" : "rgba(200,220,232,0.3)",
                    background: isPro ? "rgba(87,242,135,0.07)" : "transparent",
                    fontFamily: "var(--font-mono)",
                }}
            >
                <Zap size={10} />
                {isPro ? "PRO" : "Free"}
            </span>
            <button
                onClick={handleToggle}
                disabled={pending}
                title={currentOverride ? "Disable PRO override" : "Enable PRO override"}
                className="inline-flex cursor-pointer items-center gap-1 rounded border px-2 py-1 text-[10px] uppercase tracking-[0.1em] transition-colors disabled:opacity-50"
                style={{
                    borderColor: currentOverride ? "rgba(240,165,0,0.3)" : "rgba(79,195,220,0.15)",
                    color: currentOverride ? "rgba(240,165,0,0.85)" : "rgba(79,195,220,0.4)",
                    background: currentOverride ? "rgba(240,165,0,0.07)" : "transparent",
                    fontFamily: "var(--font-mono)",
                }}
            >
                {pending ? "..." : currentOverride ? "Override ON" : "Override"}
            </button>
            {error && <span style={{ color: "rgba(240,100,100,0.8)", fontSize: 10 }}>{error}</span>}
        </div>
    );
}
