import { getAllOrganizationsForAdmin } from "@/lib/repositories/organization-repository";
import { getBotGuildCount } from "@/lib/discord/get-bot-guild-count";
import Link from "next/link";

export const metadata = { title: "Admin Overview" };

type KpiCardProps = {
    label: string;
    value: React.ReactNode;
    sub?: string;
};

function KpiCard({ label, value, sub }: KpiCardProps) {
    return (
        <div
            className="hud-panel p-5"
            style={{ background: "rgba(8,16,24,0.5)" }}
        >
            <p
                className="text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
            >
                {label}
            </p>
            <p
                className="mt-1 text-3xl font-semibold tabular-nums"
                style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
            >
                {value}
            </p>
            {sub && (
                <p
                    className="mt-1 text-xs"
                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                >
                    {sub}
                </p>
            )}
        </div>
    );
}

export default async function AdminOverviewPage() {
    const [rows, botGuildCount] = await Promise.all([
        getAllOrganizationsForAdmin(),
        getBotGuildCount(),
    ]);

    const totalMemberships = rows.reduce((sum, r) => sum + r.memberCount, 0);
    const orgsWithDiscord = rows.filter((r) => r.org.discordGuildId).length;

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-7xl space-y-6"
                style={{ animation: "slide-in-up 0.45s ease forwards" }}
            >
                {/* Page header */}
                <section
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.55)" }}
                >
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.6), transparent)",
                        }}
                    />
                    <p
                        className="mb-1 text-xs uppercase tracking-[0.35em]"
                        style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-display)" }}
                    >
                        Super Admin
                    </p>
                    <h1
                        className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                        style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                    >
                        Overview
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        Platform-wide statistics and quick access.
                    </p>
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.2), transparent)",
                        }}
                    />
                </section>

                {/* KPI grid */}
                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <KpiCard
                        label="Organizations"
                        value={rows.length}
                        sub="registered in database"
                    />
                    <KpiCard
                        label="Total Memberships"
                        value={totalMemberships}
                        sub="across all organizations"
                    />
                    <KpiCard
                        label="Discord Integrated"
                        value={orgsWithDiscord}
                        sub="orgs with bot connected"
                    />
                    <KpiCard
                        label="Bot Active On"
                        value={
                            botGuildCount !== null ? (
                                botGuildCount
                            ) : (
                                <span
                                    className="text-lg"
                                    style={{ color: "rgba(240,165,0,0.5)" }}
                                >
                                    —
                                </span>
                            )
                        }
                        sub={botGuildCount !== null ? "Discord servers" : "bot unavailable"}
                    />
                </section>

                {/* Quick links */}
                <section className="grid gap-4 sm:grid-cols-2">
                    <Link
                        href="/terminal/admin/organizations"
                        className="hud-panel group flex items-center justify-between p-5 transition-colors"
                        style={{ background: "rgba(8,16,24,0.45)" }}
                    >
                        <div>
                            <p
                                className="text-[10px] uppercase tracking-[0.25em]"
                                style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                            >
                                Manage
                            </p>
                            <p
                                className="mt-0.5 text-base font-semibold uppercase tracking-[0.08em]"
                                style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                            >
                                Organizations
                            </p>
                            <p
                                className="mt-1 text-xs"
                                style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                            >
                                View all orgs, transfer ownership
                            </p>
                        </div>
                        <span
                            className="text-xl"
                            style={{ color: "rgba(79,195,220,0.3)" }}
                        >
                            →
                        </span>
                    </Link>

                    <Link
                        href="/terminal/admin/discord-servers"
                        className="hud-panel group flex items-center justify-between p-5 transition-colors"
                        style={{ background: "rgba(8,16,24,0.45)" }}
                    >
                        <div>
                            <p
                                className="text-[10px] uppercase tracking-[0.25em]"
                                style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                            >
                                Manage
                            </p>
                            <p
                                className="mt-0.5 text-base font-semibold uppercase tracking-[0.08em]"
                                style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                            >
                                Discord Servers
                            </p>
                            <p
                                className="mt-1 text-xs"
                                style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                            >
                                View bot servers, disconnect from servers
                            </p>
                        </div>
                        <span
                            className="text-xl"
                            style={{ color: "rgba(79,195,220,0.3)" }}
                        >
                            →
                        </span>
                    </Link>
                </section>
            </div>
        </main>
    );
}
