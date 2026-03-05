"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { deleteAllOrganizationInventoryItemsInDb } from "@/lib/repositories/organization-inventory-item-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

export type ClearInventoryActionState = {
    success: boolean;
    message: string;
};

export async function clearInventoryAction(
    _prevState: ClearInventoryActionState,
    formData: FormData
): Promise<ClearInventoryActionState> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    if (!organizationSlug) return { success: false, message: "Missing organization." };

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor) return { success: false, message: "You are not a member of this organization." };
    if (!["owner", "admin"].includes(actor.role)) {
        return { success: false, message: "Only owners or admins can clear the inventory." };
    }

    const deletedCount = await deleteAllOrganizationInventoryItemsInDb(org._id);

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown User",
        action: "inventory.cleared",
        entityType: "inventory",
        entityId: org._id.toString(),
        message: `All inventory items (${deletedCount}) were deleted by ${session.user.name ?? "Unknown User"}.`,
        metadata: { deletedCount },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/inventory`);

    return {
        success: true,
        message: `Inventory cleared — ${deletedCount} item${deletedCount !== 1 ? "s" : ""} removed.`,
    };
}
