"use server";

import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { bulkUpdateRankOrder } from "@/lib/repositories/org-rank-repository";
import { revalidatePath } from "next/cache";

export async function reorderOrgRanksAction(
    _prev: { success: boolean; message: string },
    formData: FormData
): Promise<{ success: boolean; message: string }> {
    const session = await auth();
    if (!session?.user?.id) return { success: false, message: "Unauthorized" };

    const slug = formData.get("organizationSlug") as string;
    const ranksJson = formData.get("ranks") as string;

    if (!slug || !ranksJson) return { success: false, message: "Missing data" };

    const org = await getOrganizationBySlug(slug);
    if (!org) return { success: false, message: "Organization not found" };

    const member = org.members.find((m) => m.userId === session.user.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
        return { success: false, message: "Insufficient permissions" };
    }

    let updates: { rankId: string; order: number }[];
    try {
        updates = JSON.parse(ranksJson);
    } catch {
        return { success: false, message: "Invalid rank order data" };
    }

    await bulkUpdateRankOrder(updates);
    revalidatePath(`/terminal/orgs/${slug}/members`);
    return { success: true, message: "" };
}
