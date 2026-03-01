"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";

type Props = {
    slug: string;
    orgName?: string;
};

export default function OrgBreadcrumbs({ slug, orgName }: Props) {
    const pathname = usePathname();
    const t = useTranslations("orgShell");

    const LABELS: Record<string, string> = {
        terminal: t("terminalCrumb"),
        orgs: t("organizationsCrumb"),
        members: t("membersCrumb"),
        inventory: t("inventoryCrumb"),
        transactions: t("transactionsCrumb"),
        logs: t("logsCrumb"),
        settings: t("settingsCrumb"),
        faq: t("faqCrumb"),
    };

    function formatSegment(segment: string) {
        return LABELS[segment] ?? segment.replace(/-/g, " ");
    }

    const segments = pathname.split("/").filter(Boolean);

    const crumbs = segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;

        const label =
            segment === slug
                ? (orgName ?? slug.toUpperCase())
                : formatSegment(segment);

        const isDisabled = segment === "orgs";

        return {
            href,
            label,
            isLast,
            isDisabled,
        };
    });

    return (
        <nav
            aria-label="Breadcrumb"
            className="mt-1 flex flex-wrap items-center gap-1 text-xs sm:text-sm"
            style={{ fontFamily: "var(--font-mono)" }}
        >
            {crumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-1">
                    {index > 0 && (
                        <ChevronRight
                            size={14}
                            style={{ color: "rgba(200,220,232,0.22)" }}
                        />
                    )}

                    {crumb.isLast || crumb.isDisabled ? (
                        <span
                            style={{
                                color: crumb.isDisabled
                                    ? "rgba(200,220,232,0.32)"
                                    : "rgba(200,220,232,0.5)",
                            }}
                        >
                            {crumb.label}
                        </span>
                    ) : (
                        <Link
                            href={crumb.href}
                            className="transition-colors hover:underline"
                            style={{ color: "rgba(79,195,220,0.7)" }}
                        >
                            {crumb.label}
                        </Link>
                    )}
                </div>
            ))}
        </nav>
    );
}