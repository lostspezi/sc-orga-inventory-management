import TopLine from "@/components/terminal/top-line";
import PanelLabel from "@/components/terminal/panel-label";
import Link from "next/link";
import BottomLine from "@/components/terminal/bottom-line";
import {OrganizationView} from "@/lib/types/organization";

export default function RecentOrganizationsPanel({
                                      organizations,
                                      totalCount,
                                  }: {
    organizations: OrganizationView[];
    totalCount: number;
}) {
    return (
        <section
            className="hud-panel corner-tr corner-bl relative p-4 sm:p-5"
            style={{ background: "rgba(8,16,24,0.55)" }}
        >
            <TopLine />
            <PanelLabel label="ORG.OVERVIEW" />

            <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Your Organizations
                    </p>
                    <h2
                        className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {totalCount} Registered
                    </h2>
                </div>

                <Link href="/terminal/orgs" className="sc-btn sc-btn-outline">
                    Open All
                </Link>
            </div>

            {organizations.length === 0 ? (
                <div
                    className="rounded-lg border border-dashed p-6 text-center"
                    style={{
                        borderColor: "rgba(240,165,0,0.28)",
                        background: "rgba(20,14,6,0.12)",
                    }}
                >
                    <p
                        className="text-sm uppercase tracking-[0.12em]"
                        style={{ color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-display)" }}
                    >
                        No Organizations Yet
                    </p>
                    <p
                        className="mt-2 text-xs"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        Create your first organization in the org directory.
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {organizations.map((org) => {
                        const owner = org.members.find((m) => m.role === "owner");
                        return (
                            <div
                                key={org._id.toString()}
                                className="rounded-lg border p-3"
                                style={{
                                    borderColor: "rgba(79,195,220,0.14)",
                                    background: "rgba(7,18,28,0.26)",
                                }}
                            >
                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p
                                            className="text-sm uppercase tracking-[0.08em]"
                                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                                        >
                                            {org.name}
                                        </p>
                                        <p
                                            className="text-[11px]"
                                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                        >
                                            /terminal/orgs/{org.slug}
                                        </p>
                                        <p
                                            className="mt-1 text-[11px]"
                                            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                                        >
                                            Members: {org.members.length} • Owner: {owner?.username ?? "—"}
                                        </p>
                                    </div>

                                    <Link href={`/terminal/orgs/${org.slug}`} className="sc-btn w-full sm:w-auto text-center">
                                        Open
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <BottomLine />
        </section>
    );
}