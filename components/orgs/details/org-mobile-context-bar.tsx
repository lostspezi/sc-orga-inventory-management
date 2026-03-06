"use client";

import { usePathname } from "next/navigation";
import { ORG_NAV_ITEMS } from "@/components/orgs/details/org-details-nav";

type Props = { slug: string; orgName: string };

export default function OrgMobileContextBar({ slug, orgName }: Props) {
    const pathname = usePathname();
    const activeItem = ORG_NAV_ITEMS.find((item) => {
        const href = item.href(slug);
        return pathname === href || pathname.startsWith(href + "/");
    });

    return (
        <div
            className="lg:hidden flex items-center gap-2 rounded border px-3 py-2"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(6,12,18,0.7)",
                fontFamily: "var(--font-mono)",
            }}
        >
            <span
                className="text-[10px] uppercase tracking-[0.2em] truncate"
                style={{ color: "rgba(79,195,220,0.5)" }}
            >
                {orgName}
            </span>
            {activeItem && (
                <>
                    <span style={{ color: "rgba(79,195,220,0.25)" }}>›</span>
                    <span
                        className="text-[10px] uppercase tracking-[0.2em] truncate"
                        style={{ color: "rgba(79,195,220,0.8)" }}
                    >
                        {activeItem.label}
                    </span>
                </>
            )}
        </div>
    );
}
