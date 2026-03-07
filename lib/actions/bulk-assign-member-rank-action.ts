"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { bulkUpdateOrgMemberRank } from "@/lib/repositories/org-member-repository";
import { getOrgRankById } from "@/lib/repositories/org-rank-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type State = { success: boolean; message: string };

export async function bulkAssignMemberRankAction(
    _prev: State,
    formData: FormData
): Promise<State> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const rankId = String(formData.get("rankId") ?? "").trim();
    const userIdsRaw = String(formData.get("userIds") ?? "").trim();

    if (!rankId || !userIdsRaw) {
        return { success: false, message: "Missing required fields." };
    }

    const userIds = userIdsRaw
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean);

    if (userIds.length === 0) {
        return { success: false, message: "No members selected." };
    }

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin", "hr"].includes(actor.role)) {
        return { success: false, message: "Not authorized." };
    }

    const rank = await getOrgRankById(rankId);
    if (!rank || rank.organizationId.toString() !== org._id.toString()) {
        return { success: false, message: "Invalid rank." };
    }

    const count = await bulkUpdateOrgMemberRank(org._id, userIds, rankId, {
        toRankId: rankId,
        assignedBy: session.user.id,
        assignedByUsername: session.user.name ?? "Unknown",
        assignedAt: new Date(),
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "member.bulk_rank_assigned",
        entityType: "member",
        message: `Rank "${rank.name}" bulk-assigned to ${count} member(s).`,
        metadata: { rankId, rankName: rank.name, count, userIds },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);
    return { success: true, message: `Rank assigned to ${count} member(s).` };
}
