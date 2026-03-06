import { getTranslations } from "next-intl/server";
import type { DailyStats } from "@/lib/repositories/organization-transaction-repository";

const W = 600;
const H = 140;
const PAD_LEFT = 32;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;
const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = H - PAD_TOP - PAD_BOTTOM;
const BAR_GAP = 0.25; // fraction of slot width

function formatDate(iso: string): string {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default async function TransactionVolumeChart({ data }: { data: DailyStats[] }) {
    const t = await getTranslations("charts");

    if (data.length === 0) return null;

    const maxCount = Math.max(...data.map((d) => d.sellCount + d.buyCount), 1);
    const slotW = PLOT_W / data.length;
    const barW = (slotW * (1 - BAR_GAP)) / 2;

    const yOf = (v: number) => PAD_TOP + PLOT_H - (v / maxCount) * PLOT_H;
    const xSlot = (i: number) => PAD_LEFT + i * slotW;

    // Y axis ticks
    const maxTick = Math.ceil(maxCount);
    const yTicks = [0, 0.5, 1].map((t) => ({
        fraction: t,
        value: Math.round(maxTick * t),
        y: yOf(maxTick * t),
    }));

    // X labels — show ~5
    const labelStep = Math.max(1, Math.floor(data.length / 5));
    const xLabels = data
        .map((d, i) => ({ d, i }))
        .filter(({ i }) => i === 0 || i === data.length - 1 || i % labelStep === 0);

    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.12)",
                background: "rgba(4,12,20,0.6)",
            }}
        >
            <div className="mb-3 flex items-center justify-between">
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    {t("volume")}
                </p>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ background: "rgba(80,210,120,0.7)" }} />
                        <span
                            className="text-[10px]"
                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("sell")}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm" style={{ background: "rgba(79,195,220,0.7)" }} />
                        <span
                            className="text-[10px]"
                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("buy")}
                        </span>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
            <svg
                viewBox={`0 0 ${W} ${H}`}
                style={{ overflow: "visible", minWidth: "460px", display: "block", width: "100%" }}
            >
                {/* Y grid lines */}
                {yTicks.map(({ fraction, value, y }) => (
                    <g key={fraction}>
                        <line
                            x1={PAD_LEFT}
                            y1={y}
                            x2={W - PAD_RIGHT}
                            y2={y}
                            stroke="rgba(79,195,220,0.06)"
                            strokeWidth={1}
                        />
                        <text
                            x={PAD_LEFT - 4}
                            y={y + 3.5}
                            textAnchor="end"
                            fontSize={9}
                            fill="rgba(200,220,232,0.3)"
                            fontFamily="var(--font-mono)"
                        >
                            {value}
                        </text>
                    </g>
                ))}

                {/* Bars */}
                {data.map((d, i) => {
                    const cx = xSlot(i) + slotW / 2;
                    const sellH = (d.sellCount / maxCount) * PLOT_H;
                    const buyH = (d.buyCount / maxCount) * PLOT_H;
                    const baseline = PAD_TOP + PLOT_H;

                    return (
                        <g key={d.date}>
                            {/* Sell bar (left) */}
                            {d.sellCount > 0 && (
                                <rect
                                    x={cx - barW - 1}
                                    y={baseline - sellH}
                                    width={barW}
                                    height={sellH}
                                    rx={1}
                                    fill="rgba(80,210,120,0.55)"
                                />
                            )}
                            {/* Buy bar (right) */}
                            {d.buyCount > 0 && (
                                <rect
                                    x={cx + 1}
                                    y={baseline - buyH}
                                    width={barW}
                                    height={buyH}
                                    rx={1}
                                    fill="rgba(79,195,220,0.55)"
                                />
                            )}
                        </g>
                    );
                })}

                {/* X axis */}
                <line
                    x1={PAD_LEFT}
                    y1={PAD_TOP + PLOT_H}
                    x2={W - PAD_RIGHT}
                    y2={PAD_TOP + PLOT_H}
                    stroke="rgba(79,195,220,0.15)"
                    strokeWidth={1}
                />

                {/* X labels */}
                {xLabels.map(({ d, i }) => (
                    <text
                        key={d.date}
                        x={xSlot(i) + slotW / 2}
                        y={H - 6}
                        textAnchor="middle"
                        fontSize={9}
                        fill="rgba(200,220,232,0.3)"
                        fontFamily="var(--font-mono)"
                    >
                        {formatDate(d.date)}
                    </text>
                ))}
            </svg>
            </div>
        </div>
    );
}
