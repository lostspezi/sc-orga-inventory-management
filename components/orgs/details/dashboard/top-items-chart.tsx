import { getTranslations } from "next-intl/server";
import type { TopItem } from "@/lib/repositories/organization-transaction-repository";

function formatRevenue(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M aUEC`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K aUEC`;
    return `${v.toLocaleString()} aUEC`;
}

const BAR_COLORS = [
    "rgba(79,195,220,0.75)",
    "rgba(80,210,120,0.75)",
    "rgba(240,165,0,0.75)",
    "rgba(160,120,220,0.75)",
    "rgba(220,120,80,0.75)",
];

export default async function TopItemsChart({ items }: { items: TopItem[] }) {
    const t = await getTranslations("charts");

    if (items.length === 0) {
        return (
            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.12)",
                    background: "rgba(4,12,20,0.6)",
                }}
            >
                <p
                    className="mb-3 text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    {t("topItems")}
                </p>
                <p
                    className="py-4 text-center text-[11px]"
                    style={{ color: "rgba(200,220,232,0.25)", fontFamily: "var(--font-mono)" }}
                >
                    {t("noTopItems")}
                </p>
            </div>
        );
    }

    const maxRevenue = items[0]?.revenue ?? 1;

    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.12)",
                background: "rgba(4,12,20,0.6)",
            }}
        >
            <p
                className="mb-3 text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
            >
                {t("topItems")}
            </p>

            <div className="space-y-3">
                {items.map((item, idx) => {
                    const pct = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                    const color = BAR_COLORS[idx % BAR_COLORS.length];

                    return (
                        <div key={item.itemName}>
                            <div className="mb-1 flex items-baseline justify-between gap-2">
                                <span
                                    className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.06em]"
                                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                                >
                                    {item.itemName}
                                </span>
                                <span
                                    className="shrink-0 text-[10px]"
                                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                >
                                    {item.count}× · {formatRevenue(item.revenue)}
                                </span>
                            </div>
                            <div
                                className="h-1.5 w-full rounded-full overflow-hidden"
                                style={{ background: "rgba(79,195,220,0.08)" }}
                            >
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${pct}%`,
                                        background: color,
                                        transition: "width 0.6s ease",
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
