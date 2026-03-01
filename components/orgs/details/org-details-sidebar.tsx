"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ORG_NAV_ITEMS, type OrganizationRole } from "@/components/orgs/details/org-details-nav";

type Props = {
    slug: string;
    currentRole: OrganizationRole;
};

export default function OrgDetailsSidebar({ slug, currentRole }: Props) {
    const pathname = usePathname();
    const t = useTranslations("orgShell");

    const navLabels: Record<string, string> = {
        dashboard: t("navDashboard"),
        inventory: t("navInventory"),
        transactions: t("navTransactions"),
        members: t("navMembers"),
        logs: t("navLogs"),
        settings: t("navSettings"),
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
                    const href = item.href(slug);
                    const isActive = pathname === href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={href}
                            className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm transition"
                            style={{
                                borderColor: isActive
                                    ? "rgba(79,195,220,0.35)"
                                    : "rgba(79,195,220,0.12)",
                                background: isActive
                                    ? "rgba(79,195,220,0.08)"
                                    : "rgba(79,195,220,0.02)",
                                color: isActive
                                    ? "rgba(79,195,220,0.95)"
                                    : "rgba(200,220,232,0.65)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            <Icon size={16} />
                            <span className="uppercase tracking-[0.12em]">{navLabels[item.key] ?? item.label}</span>
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