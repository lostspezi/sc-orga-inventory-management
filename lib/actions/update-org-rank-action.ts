"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { updateOrgRank } from "@/lib/repositories/org-rank-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type State = { success: boolean; message: string };

export async function updateOrgRankAction(
    _prev: State,
    formData: FormData
): Promise<State> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const rankId = String(formData.get("rankId") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || undefined;
    const order = parseInt(String(formData.get("order") ?? "1"), 10) || 1;
    const color = String(formData.get("color") ?? "").trim() || undefined;
    const isDefault = formData.get("isDefault") === "true";

    if (!rankId || !name) return { success: false, message: "Missing required fields." };

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin"].includes(actor.role)) {
        return { success: false, message: "Not authorized." };
    }

    const updated = await updateOrgRank(rankId, { name, description, order, color, isDefault }, org._id);
    if (!updated) return { success: false, message: "Rank not found or update failed." };

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "rank.updated",
        entityType: "rank",
        entityId: rankId,
        message: `Rank "${name}" updated.`,
        metadata: { name, order, color, isDefault },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);
    return { success: true, message: "Rank updated." };
}
