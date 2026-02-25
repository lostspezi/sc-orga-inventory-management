"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ORG_NAV_ITEMS } from "@/components/orgs/details/org-details-nav";

type Props = {
    slug: string;
};

export default function OrgDetailsSidebar({ slug }: Props) {
    const pathname = usePathname();

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
                Navigation
            </p>

            <nav className="space-y-2">
                {ORG_NAV_ITEMS.map((item) => {
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
                            <span className="uppercase tracking-[0.12em]">{item.label}</span>
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