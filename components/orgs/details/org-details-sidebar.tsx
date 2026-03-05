"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ORG_NAV_ITEMS, type OrganizationRole } from "@/components/orgs/details/org-details-nav";

type Props = {
    slug: string;
    currentRole: OrganizationRole;
    isPro?: boolean;
};

export default function OrgDetailsSidebar({ slug, currentRole, isPro = false }: Props) {
    const pathname = usePathname();
    const t = useTranslations("orgShell");

    const navLabels: Record<string, string> = {
        dashboard: t("navDashboard"),
        inventory: t("navInventory"),
        transactions: t("navTransactions"),
        members: t("navMembers"),
        logs: t("navLogs"),
        settings: t("navSettings"),
        reporting: t("navReporting"),
        faq: t("navFaq"),
    };

    const visibleItems = ORG_NAV_ITEMS.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(currentRole)
    );

    return (
        <aside
            className="hud-panel corner-tr corner-bl relative hidden h-fit p-4 lg:block"
            style={{ background: "rgba(8,16,24,0.55)" }}
        >
            <div
                className="absolute -top-px left-6 right-6 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.35), transparent)" }}
            />

            <p
                className="mb-3 text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
            >
                {t("navigationLabel")}
            </p>

            <nav className="space-y-2">
                {visibleItems.map((item) => {
                    const locked = !!item.requiresPro && !isPro;
                    const href = locked
                        ? `/terminal/orgs/${slug}/settings?tab=pro`
                        : item.href(slug);
                    const isActive = !locked && pathname === item.href(slug);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={href}
                            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition"
                            style={{
                                borderColor: isActive
                                    ? "rgba(79,195,220,0.35)"
                                    : locked
                                        ? "rgba(251,191,36,0.12)"
                                        : "rgba(79,195,220,0.12)",
                                background: isActive
                                    ? "rgba(79,195,220,0.08)"
                                    : locked
                                        ? "rgba(251,191,36,0.03)"
                                        : "rgba(79,195,220,0.02)",
                                color: isActive
                                    ? "rgba(79,195,220,0.95)"
                                    : locked
                                        ? "rgba(200,220,232,0.4)"
                                        : "rgba(200,220,232,0.65)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            <Icon size={16} />
                            <span className="uppercase tracking-[0.12em]">{navLabels[item.key] ?? item.label}</span>
                            {locked && (
                                <span
                                    className="ml-auto rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em]"
                                    style={{
                                        background: "rgba(251,191,36,0.12)",
                                        color: "rgba(251,191,36,0.8)",
                                        fontFamily: "var(--font-mono)",
                                        border: "1px solid rgba(251,191,36,0.2)",
                                    }}
                                >
                                    PRO
                                </span>
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div
                className="absolute -bottom-px left-6 right-6 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.2), transparent)" }}
            />
        </aside>
    );
}