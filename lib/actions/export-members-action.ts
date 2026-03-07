"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import { getOrgMembersByOrganizationId, buildOrgMemberViews } from "@/lib/repositories/org-member-repository";
import { getOrgRanksByOrganizationId } from "@/lib/repositories/org-rank-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type State = {
    success: boolean;
    message: string;
    csv?: string;
};

export async function exportMembersAction(
    _prev: State,
    formData: FormData
): Promise<State> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    if (!isProOrg(org)) {
        return { success: false, message: "CSV export requires PRO subscription." };
    }

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin", "hr"].includes(actor.role)) {
        return { success: false, message: "Not authorized." };
    }

    const [memberDocs, ranks] = await Promise.all([
        getOrgMembersByOrganizationId(org._id),
        getOrgRanksByOrganizationId(org._id),
    ]);

    const views = await buildOrgMemberViews(memberDocs, ranks);

    const headers = ["username", "displayName", "role", "rank", "status", "joinedAt", "tags", "auecBalance"];
    const rows = views.map((m) => [
        m.username,
        m.displayName ?? "",
        m.role,
        m.rankName ?? "",
        m.status,
        new Date(m.joinedAt).toISOString().slice(0, 10),
        (m.tags ?? []).join(";"),
        m.auecBalance?.toString() ?? "",
    ]);

    const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
        .join("\n");

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "member.exported",
        entityType: "member",
        message: `Members exported as CSV (${views.length} rows).`,
        metadata: { count: views.length },
    });

    return { success: true, message: "Export ready.", csv };
}
