import { Activity, CheckCircle, TrendingUp, Package } from "lucide-react";
import { getTranslations } from "next-intl/server";
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
            className="rounded-lg border p-3 sm:p-4"
            style={{
                borderColor: `${color.replace("1)", "0.15)")}`,
                background: `${color.replace("1)", "0.04)")}`,
            }}
        >
            <div className="flex items-start gap-2 sm:gap-3">
                <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border sm:h-9 sm:w-9"
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
                        className="mt-0.5 text-base font-semibold tracking-[0.04em] sm:text-xl"
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

export default async function DashboardKpiCards({ stats, inventoryItemCount }: Props) {
    const t = await getTranslations("kpi");

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
                label={t("activeRequests")}
                value={String(stats.activeRequests)}
                sub={t("pendingApproval")}
                color="rgba(240,165,0,1)"
            />
            <KpiCard
                icon={<CheckCircle size={16} />}
                label={t("completed")}
                value={String(stats.completedThisMonth)}
                sub={t("completedThis")}
                color="rgba(80,210,120,1)"
            />
            <KpiCard
                icon={<TrendingUp size={16} />}
                label={t("revenue")}
                value={`${revenueFormatted} ${t("currency")}`}
                sub={t("completedThis")}
                color="rgba(79,195,220,1)"
            />
            <KpiCard
                icon={<Package size={16} />}
                label={t("inventory")}
                value={String(inventoryItemCount)}
                sub={t("listedItems")}
                color="rgba(160,120,220,1)"
            />
        </div>
    );
}
