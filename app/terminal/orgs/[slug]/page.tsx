import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    getDashboardStats,
    getDailyTransactionStats,
    getTopItemsByRevenue,
    getRecentCompletedTransactions,
} from "@/lib/repositories/organization-transaction-repository";
import { getOrganizationInventoryItemViewsByOrganizationId } from "@/lib/repositories/organization-inventory-item-repository";
import DashboardShell from "@/components/orgs/details/dashboard/dashboard-shell";
import DashboardKpiCards from "@/components/orgs/details/dashboard/dashboard-kpi-cards";
import RevenueChart from "@/components/orgs/details/dashboard/revenue-chart";
import TransactionVolumeChart from "@/components/orgs/details/dashboard/transaction-volume-chart";
import TopItemsChart from "@/components/orgs/details/dashboard/top-items-chart";
import RecentCompletedList from "@/components/orgs/details/dashboard/recent-completed-list";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function OrgDashboardPage({ params }: Props) {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const org = await getOrganizationBySlug(slug);

    if (!org) {
        notFound();
    }

    const member = org.members.find((m) => m.userId === session.user!.id);

    if (!member) {
        return (
            <div
                className="rounded-lg border p-6"
                style={{
                    borderColor: "rgba(240,165,0,0.18)",
                    background: "rgba(20,14,6,0.12)",
                }}
            >
                <h2
                    className="text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                >
                    Forbidden
                </h2>
                <p
                    className="mt-2 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    You are not a member of this organization.
                </p>
            </div>
        );
    }

    const [stats, dailyStats, topItems, recentCompleted, inventoryItems] = await Promise.all([
        getDashboardStats(org._id),
        getDailyTransactionStats(org._id, 30),
        getTopItemsByRevenue(org._id, 5),
        getRecentCompletedTransactions(org._id, 10),
        getOrganizationInventoryItemViewsByOrganizationId(org._id),
    ]);

    return (
        <DashboardShell organizationSlug={slug}>
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Dashboard
                    </p>
                    <h2
                        className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        Organization Overview
                    </h2>
                </div>

                {/* KPI Cards */}
                <DashboardKpiCards
                    stats={stats}
                    inventoryItemCount={inventoryItems.length}
                />

                {/* Charts row */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <RevenueChart data={dailyStats} />
                    <TransactionVolumeChart data={dailyStats} />
                </div>

                {/* Top items + Recent completed */}
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <TopItemsChart items={topItems} />
                    <RecentCompletedList transactions={recentCompleted} />
                </div>
            </div>
        </DashboardShell>
    );
}
