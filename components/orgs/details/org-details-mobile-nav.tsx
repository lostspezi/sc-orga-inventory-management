"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ORG_NAV_ITEMS } from "@/components/orgs/details/org-details-nav";

type Props = {
    slug: string;
};

export default function OrgDetailsMobileNav({ slug }: Props) {
    const pathname = usePathname();

    return (
        <div className="lg:hidden">
            <div
                className="hud-panel corner-tr corner-bl relative overflow-x-auto p-2"
                style={{ background: "rgba(8,16,24,0.55)" }}
            >
                <div className="flex min-w-max gap-2">
                    {ORG_NAV_ITEMS.map((item) => {
                        const href = item.href(slug);
                        const isActive = pathname === href;
                        const Icon = item.icon;

                        return (
                            <Link
                                key={item.key}
                                href={href}
                                className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs"
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
                                <Icon size={14} />
                                <span className="uppercase tracking-[0.12em]">{item.label}</span>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}