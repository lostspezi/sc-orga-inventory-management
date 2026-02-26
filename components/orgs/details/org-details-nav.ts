import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, Users, Logs } from "lucide-react";

export type OrgNavItem = {
    key: string;
    label: string;
    href: (slug: string) => string;
    icon: LucideIcon;
};

export const ORG_NAV_ITEMS: OrgNavItem[] = [
    {
        key: "dashboard",
        label: "Dashboard",
        href: (slug) => `/terminal/orgs/${slug}`,
        icon: LayoutDashboard,
    },
    {
        key: "members",
        label: ( "Members" ),
        href: (slug) => `/terminal/orgs/${slug}/members`,
        icon: Users,
    },
    {
        key: "logs",
        label: "Logs",
        href: (slug) => `/terminal/orgs/${slug}/logs`,
        icon: Logs,
    },
];