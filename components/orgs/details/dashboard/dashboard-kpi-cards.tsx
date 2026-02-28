import { Activity, CheckCircle, TrendingUp, Package } from "lucide-react";
import type { DashboardStats } from "@/lib/repositories/organization-transaction-repository";

type KpiCardProps = {
    icon: React.ReactNode;
    label: string;
    value: string;
    sub?: string;
    color: string;
};

function KpiCard({ icon, label, value, sub, color }: KpiCardProps) {
    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: `${color.replace("1)", "0.15)")}`,
                background: `${color.replace("1)", "0.04)")}`,
            }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                        borderColor: `${color.replace("1)", "0.2)")}`,
                        color: `${color.replace("1)", "0.85)")}`,
                        background: `${color.replace("1)", "0.06)")}`,
                    }}
                >
                    {icon}
                </div>
                <div className="min-w-0 flex-1">
                    <p
                        className="text-[10px] uppercase tracking-[0.2em]"
                        style={{ color: `${color.replace("1)", "0.55)")}`, fontFamily: "var(--font-mono)" }}
                    >
                        {label}
                    </p>
                    <p
                        className="mt-0.5 text-xl font-semibold tracking-[0.04em]"
                        style={{ color: `${color.replace("1)", "0.9)")}`, fontFamily: "var(--font-display)" }}
                    >
                        {value}
                    </p>
                    {sub && (
                        <p
                            className="mt-0.5 text-[10px]"
                            style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                        >
                            {sub}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

type Props = {
    stats: DashboardStats;
    inventoryItemCount: number;
};

export default function DashboardKpiCards({ stats, inventoryItemCount }: Props) {
    const revenueFormatted =
        stats.revenueThisMonth >= 1_000_000
            ? `${(stats.revenueThisMonth / 1_000_000).toFixed(1)}M`
            : stats.revenueThisMonth >= 1_000
            ? `${(stats.revenueThisMonth / 1_000).toFixed(0)}K`
            : stats.revenueThisMonth.toLocaleString();

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <KpiCard
                icon={<Activity size={16} />}
                label="Active Requests"
                value={String(stats.activeRequests)}
                sub="pending approval"
                color="rgba(240,165,0,1)"
            />
            <KpiCard
                icon={<CheckCircle size={16} />}
                label="Completed"
                value={String(stats.completedThisMonth)}
                sub="this month"
                color="rgba(80,210,120,1)"
            />
            <KpiCard
                icon={<TrendingUp size={16} />}
                label="Revenue"
                value={`${revenueFormatted} aUEC`}
                sub="this month"
                color="rgba(79,195,220,1)"
            />
            <KpiCard
                icon={<Package size={16} />}
                label="Inventory"
                value={String(inventoryItemCount)}
                sub="listed items"
                color="rgba(160,120,220,1)"
            />
        </div>
    );
}
