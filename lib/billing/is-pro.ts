import type { OrganizationDocument } from "@/lib/types/organization";

export function isProOrg(org: OrganizationDocument): boolean {
    if (org.proOverride?.enabled) return true;
    const s = org.subscription;
    if (!s) return false;
    return (
        (s.status === "active" || s.status === "trialing") &&
        s.currentPeriodEnd > new Date()
    );
}
