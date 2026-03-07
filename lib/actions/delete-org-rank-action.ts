"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { deleteOrgRank, getOrgRankById } from "@/lib/repositories/org-rank-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type State = { success: boolean; message: string };

export async function deleteOrgRankAction(
    _prev: State,
    formData: FormData
): Promise<State> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const rankId = String(formData.get("rankId") ?? "").trim();

    if (!rankId) return { success: false, message: "Missing rank ID." };

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin"].includes(actor.role)) {
        return { success: false, message: "Not authorized." };
    }

    const rank = await getOrgRankById(rankId);
    if (!rank) return { success: false, message: "Rank not found." };

    const result = await deleteOrgRank(rankId, org._id);
    if (!result.success) {
        if (result.memberCount) {
            return {
                success: false,
                message: `Cannot delete rank: ${result.memberCount} member(s) assigned. Reassign them first.`,
            };
        }
        return { success: false, message: "Delete failed." };
    }

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "rank.deleted",
        entityType: "rank",
        entityId: rankId,
        message: `Rank "${rank.name}" deleted.`,
        metadata: { rankName: rank.name },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);
    return { success: true, message: "Rank deleted." };
}
