"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const ORG_SLUG_RE = /^\/terminal\/orgs\/([^/]+)/;
const REFRESH_INTERVAL_MS = 3 * 60 * 1000;

type Cache = { slug: string; dkp: number };

export default function DkpBadge() {
    const pathname = usePathname();
    const [cache, setCache] = useState<Cache | null>(null);

    const currentSlug = pathname.match(ORG_SLUG_RE)?.[1] ?? null;

    useEffect(() => {
        if (!currentSlug) return;

        let cancelled = false;

        async function fetchDkp() {
            try {
                const res = await fetch(`/api/orgs/${currentSlug}/members/dkp`);
                if (!res.ok) return;
                const data = await res.json() as { dkp: number | null; hasDkpIntegration: boolean };
                if (cancelled) return;
                if (data.hasDkpIntegration && data.dkp !== null) {
                    setCache({ slug: currentSlug!, dkp: data.dkp });
                } else {
                    setCache(null);
                }
            } catch {
                // silently fail — don't break the header on a DKP fetch error
            }
        }

        void fetchDkp();
        const interval = setInterval(fetchDkp, REFRESH_INTERVAL_MS);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [currentSlug]);

    // Only show DKP that belongs to the currently visible org
    const dkp = cache?.slug === currentSlug ? cache.dkp : null;

    if (dkp === null) return null;

    return (
        <div
            className="hidden sm:flex items-center gap-1.5 rounded border px-2.5 py-1"
            style={{
                borderColor: "rgba(80,210,120,0.25)",
                background: "rgba(80,210,120,0.05)",
            }}
        >
            <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: "rgba(80,210,120,0.7)" }}
            />
            <span
                className="text-[10px] uppercase tracking-[0.15em] whitespace-nowrap"
                style={{ color: "rgba(80,210,120,0.85)", fontFamily: "var(--font-mono)" }}
            >
                {dkp.toLocaleString()} DKP
            </span>
        </div>
    );
}
