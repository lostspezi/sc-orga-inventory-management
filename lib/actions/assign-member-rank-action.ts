"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getOrgMemberByUserId, updateOrgMemberRank } from "@/lib/repositories/org-member-repository";
import { getOrgRankById } from "@/lib/repositories/org-rank-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type State = { success: boolean; message: string };

export async function assignMemberRankAction(
    _prev: State,
    formData: FormData
): Promise<State> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const targetUserId = String(formData.get("targetUserId") ?? "").trim();
    const rankId = String(formData.get("rankId") ?? "").trim() || null;

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin", "hr"].includes(actor.role)) {
        return { success: false, message: "Not authorized." };
    }

    const target = org.members.find((m) => m.userId === targetUserId);
    if (!target) return { success: false, message: "Target member not found." };

    const targetMember = await getOrgMemberByUserId(org._id, targetUserId);
    if (!targetMember) return { success: false, message: "Member profile not found." };

    let newRankName: string | undefined;
    if (rankId) {
        const rank = await getOrgRankById(rankId);
        if (!rank || rank.organizationId.toString() !== org._id.toString()) {
            return { success: false, message: "Invalid rank." };
        }
        newRankName = rank.name;
    }

    await updateOrgMemberRank(org._id, targetUserId, rankId, {
        fromRankId: targetMember.rankId,
        toRankId: rankId ?? undefined,
        assignedBy: session.user.id,
        assignedByUsername: session.user.name ?? "Unknown",
        assignedAt: new Date(),
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "member.rank_assigned",
        entityType: "member",
        entityId: targetUserId,
        message: `Rank ${newRankName ? `"${newRankName}"` : "cleared"} assigned to member.`,
        metadata: { fromRankId: targetMember.rankId, toRankId: rankId, rankName: newRankName },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);
    return { success: true, message: "Rank assigned." };
}
