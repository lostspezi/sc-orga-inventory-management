import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    getDashboardStats,
    getDailyTransactionStats,
    getTopItemsByRevenue,
    getRecentCompletedTransactions,
} from "@/lib/repositories/organization-transaction-repository";
import { getOrganizationInventoryItemViewsByOrganizationId } from "@/lib/repositories/organization-inventory-item-repository";
import { getLatestAppNews } from "@/lib/repositories/app-news-repository";
import DashboardShell from "@/components/orgs/details/dashboard/dashboard-shell";
import DashboardKpiCards from "@/components/orgs/details/dashboard/dashboard-kpi-cards";
import RevenueChart from "@/components/orgs/details/dashboard/revenue-chart";
import TransactionVolumeChart from "@/components/orgs/details/dashboard/transaction-volume-chart";
import TopItemsChart from "@/components/orgs/details/dashboard/top-items-chart";
import RecentCompletedList from "@/components/orgs/details/dashboard/recent-completed-list";
import NewsFeed from "@/components/orgs/details/dashboard/news-feed";

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

    const [stats, dailyStats, topItems, recentCompleted, inventoryItems, newsItems] = await Promise.all([
        getDashboardStats(org._id),
        getDailyTransactionStats(org._id, 30),
        getTopItemsByRevenue(org._id, 5),
        getRecentCompletedTransactions(org._id, 10),
        getOrganizationInventoryItemViewsByOrganizationId(org._id),
        getLatestAppNews(3),
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

                {/* Discord not connected hint */}
                {!org.discordGuildId && (
                    <div
                        className="flex items-start gap-3 rounded-lg border p-3"
                        style={{
                            borderColor: "rgba(88,101,242,0.2)",
                            background: "rgba(88,101,242,0.04)",
                        }}
                    >
                        <svg
                            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
                            style={{ color: "rgba(88,101,242,0.7)", flexShrink: 0, marginTop: 1 }}
                        >
                            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057.1 18.08.114 18.1.132 18.11a19.963 19.963 0 0 0 6.011 3.037.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.037.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                        </svg>
                        <div className="flex-1 min-w-0">
                            <p
                                className="text-[11px] font-semibold uppercase tracking-[0.15em]"
                                style={{ color: "rgba(88,101,242,0.85)", fontFamily: "var(--font-mono)" }}
                            >
                                Discord bot not connected
                            </p>
                            <p
                                className="mt-0.5 text-[11px]"
                                style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                            >
                                {member.role === "owner" || member.role === "admin"
                                    ? <>Connect a Discord server in <Link href={`/terminal/orgs/${slug}/settings`} className="underline" style={{ color: "rgba(88,101,242,0.8)" }}>Settings</Link> to enable slash commands, transaction embeds, and member invites.</>
                                    : "Ask an admin to connect a Discord server to enable slash commands and member invites."
                                }
                            </p>
                        </div>
                    </div>
                )}

                {/* News feed */}
                <NewsFeed posts={newsItems.map((p) => ({
                    _id: p._id.toString(),
                    title: p.title,
                    body: p.body,
                    publishedAt: p.publishedAt.toISOString(),
                }))} />

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
