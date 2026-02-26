import { ExternalLink } from "lucide-react";
import OrgDetailsSidebar from "@/components/orgs/details/org-details-sidebar";
import OrgDetailsMobileNav from "@/components/orgs/details/org-details-mobile-nav";
import {OrganizationRole} from "@/components/orgs/details/org-details-nav";
import React from "react";
import OrgBreadcrumbs from "@/components/orgs/details/org-breadcrumbs";

type Props = {
    slug: string;
    orgName: string;
    orgRsiUrl?: string;
    children: React.ReactNode;
    currentRole: OrganizationRole;
};

export default function OrgDetailsShell({ slug, orgName, orgRsiUrl, children, currentRole }: Props) {
    return (
        <main className="min-h-screen px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-7xl space-y-4">
                {/* Header */}
                <header
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{ animation: "slide-in-up 0.45s ease forwards" }}
                >
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }}
                    />

                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p
                                className="mb-1 text-xs uppercase tracking-[0.35em]"
                                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-display)" }}
                            >
                                Organization Terminal
                            </p>
                            <h1
                                className="text-xl font-semibold uppercase tracking-[0.08em] sm:text-2xl"
                                style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                            >
                                {orgName}
                            </h1>
                            <OrgBreadcrumbs slug={slug} orgName={orgName} />
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            {orgRsiUrl && (
                                <a
                                    href={orgRsiUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="sc-btn inline-flex items-center gap-2"
                                >
                                    <ExternalLink size={16} />
                                    RSI Page
                                </a>
                            )}
                        </div>
                    </div>

                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.25), transparent)" }}
                    />
                </header>

                {/* Mobile nav */}
                <OrgDetailsMobileNav slug={slug} currentRole={currentRole} />

                {/* Content grid */}
                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
                    <OrgDetailsSidebar slug={slug} currentRole={currentRole} />

                    <section
                        className="hud-panel corner-tr corner-bl relative p-4 sm:p-5"
                        style={{ background: "rgba(8,16,24,0.55)", animation: "slide-in-up 0.5s ease forwards" }}
                    >
                        <div
                            className="absolute -top-px left-8 right-8 h-px"
                            style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.35), transparent)" }}
                        />
                        {children}
                        <div
                            className="absolute -bottom-px left-8 right-8 h-px"
                            style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.2), transparent)" }}
                        />
                    </section>
                </div>
            </div>
        </main>
    );
}