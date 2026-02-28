import type { DailyStats } from "@/lib/repositories/organization-transaction-repository";

const W = 600;
const H = 140;
const PAD_LEFT = 52;
const PAD_RIGHT = 12;
const PAD_TOP = 12;
const PAD_BOTTOM = 28;
const PLOT_W = W - PAD_LEFT - PAD_RIGHT;
const PLOT_H = H - PAD_TOP - PAD_BOTTOM;

function formatRevenue(v: number): string {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
    return String(v);
}

function formatDate(iso: string): string {
    const d = new Date(iso + "T00:00:00Z");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

export default function RevenueChart({ data }: { data: DailyStats[] }) {
    if (data.length === 0) return null;

    const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);

    const xOf = (i: number) => PAD_LEFT + (i / (data.length - 1)) * PLOT_W;
    const yOf = (v: number) => PAD_TOP + PLOT_H - (v / maxRevenue) * PLOT_H;

    // Area path
    const points = data.map((d, i) => `${xOf(i)},${yOf(d.revenue)}`).join(" L ");
    const areaPath = `M ${xOf(0)},${PAD_TOP + PLOT_H} L ${points} L ${xOf(data.length - 1)},${PAD_TOP + PLOT_H} Z`;
    const linePath = `M ${points}`;

    // X-axis labels — show ~5 evenly spaced
    const labelStep = Math.max(1, Math.floor(data.length / 5));
    const xLabels = data
        .map((d, i) => ({ d, i }))
        .filter(({ i }) => i === 0 || i === data.length - 1 || i % labelStep === 0);

    // Y-axis labels — 4 ticks
    const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
        value: maxRevenue * t,
        y: yOf(maxRevenue * t),
    }));

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
                    Revenue · 30 Days
                </p>
                <p
                    className="text-[10px]"
                    style={{ color: "rgba(200,220,232,0.25)", fontFamily: "var(--font-mono)" }}
                >
                    Completed transactions only
                </p>
            </div>

            <svg
                viewBox={`0 0 ${W} ${H}`}
                className="w-full"
                style={{ overflow: "visible" }}
            >
                {/* Y grid lines + labels */}
                {yTicks.map(({ value, y }) => (
                    <g key={value}>
                        <line
                            x1={PAD_LEFT}
                            y1={y}
                            x2={W - PAD_RIGHT}
                            y2={y}
                            stroke="rgba(79,195,220,0.06)"
                            strokeWidth={1}
                        />
                        <text
                            x={PAD_LEFT - 6}
                            y={y + 3.5}
                            textAnchor="end"
                            fontSize={9}
                            fill="rgba(200,220,232,0.3)"
                            fontFamily="var(--font-mono)"
                        >
                            {formatRevenue(value)}
                        </text>
                    </g>
                ))}

                {/* Area fill */}
                <defs>
                    <linearGradient id="rev-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(79,195,220,0.28)" />
                        <stop offset="100%" stopColor="rgba(79,195,220,0.02)" />
                    </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#rev-grad)" />

                {/* Line */}
                <path
                    d={linePath}
                    fill="none"
                    stroke="rgba(79,195,220,0.75)"
                    strokeWidth={1.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Data point dots (only non-zero) */}
                {data.map((d, i) =>
                    d.revenue > 0 ? (
                        <circle
                            key={i}
                            cx={xOf(i)}
                            cy={yOf(d.revenue)}
                            r={2.5}
                            fill="rgba(79,195,220,0.9)"
                        />
                    ) : null
                )}

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
                        x={xOf(i)}
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
    );
}
