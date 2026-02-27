import {LucideIcon, PackageOpen} from "lucide-react";
import { LayoutDashboard, Users, Logs } from "lucide-react";

export type OrganizationRole = "owner" | "admin" | "member";

export type OrgNavItem = {
    key: string;
    label: string;
    href: (slug: string) => string;
    icon: LucideIcon;
    allowedRoles?: OrganizationRole[];
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
];