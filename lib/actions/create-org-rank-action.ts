"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { createOrgRank } from "@/lib/repositories/org-rank-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type State = { success: boolean; message: string };

export async function createOrgRankAction(
    _prev: State,
    formData: FormData
): Promise<State> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const name = String(formData.get("name") ?? "").trim();
    const description = String(formData.get("description") ?? "").trim() || undefined;
    const order = parseInt(String(formData.get("order") ?? "1"), 10) || 1;
    const color = String(formData.get("color") ?? "").trim() || undefined;
    const isDefault = formData.get("isDefault") === "true";

    if (!name) return { success: false, message: "Rank name is required." };

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin"].includes(actor.role)) {
        return { success: false, message: "Not authorized." };
    }

    const rank = await createOrgRank({
        organizationId: org._id,
        organizationSlug: org.slug,
        name,
        description,
        order,
        color,
        isDefault,
        createdBy: session.user.id,
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "rank.created",
        entityType: "rank",
        entityId: rank._id.toString(),
        message: `Rank "${name}" created.`,
        metadata: { name, order, color, isDefault },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);
    return { success: true, message: "Rank created." };
}
