import {LucideIcon, PackageOpen} from "lucide-react";
import { LayoutDashboard, Users, Logs, ArrowLeftRight, Settings2, HelpCircle, BarChart3 } from "lucide-react";

export type OrganizationRole = "owner" | "admin" | "member";

export type OrgNavItem = {
    key: string;
    label: string;
    href: (slug: string) => string;
    icon: LucideIcon;
    allowedRoles?: OrganizationRole[];
    requiresPro?: boolean;
};

export const ORG_NAV_ITEMS: OrgNavItem[] = [
    {
        key: "dashboard",
        label: "Dashboard",
        href: (slug) => `/terminal/orgs/${slug}`,
        icon: LayoutDashboard,
    },
    {
      key: "inventory",
      label: "Inventory",
      href: (slug) => `/terminal/orgs/${slug}/inventory`,
      icon: PackageOpen,
    },
    {
        key: "transactions",
        label: "Transactions",
        href: (slug) => `/terminal/orgs/${slug}/transactions`,
        icon: ArrowLeftRight,
    },
    {
        key: "members",
        label: "Members",
        href: (slug) => `/terminal/orgs/${slug}/members`,
        icon: Users,
        allowedRoles: ["owner", "admin"],
    },
    {
        key: "logs",
        label: "Logs",
        href: (slug) => `/terminal/orgs/${slug}/logs`,
        icon: Logs,
        allowedRoles: ["owner"],
    },
    {
        key: "settings",
        label: "Settings",
        href: (slug) => `/terminal/orgs/${slug}/settings`,
        icon: Settings2,
        allowedRoles: ["owner", "admin"],
    },
    {
        key: "reporting",
        label: "Reporting",
        href: (slug) => `/terminal/orgs/${slug}/reports`,
        icon: BarChart3,
        allowedRoles: ["owner", "admin"],
        requiresPro: true,
    },
    {
        key: "faq",
        label: "Help",
        href: (slug) => `/terminal/orgs/${slug}/faq`,
        icon: HelpCircle,
    },
];