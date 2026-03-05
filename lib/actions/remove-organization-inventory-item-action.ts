"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    deleteOrganizationInventoryItemInDb,
} from "@/lib/repositories/organization-inventory-item-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { triggerGoogleSheetSync } from "@/lib/google-sheets/trigger-sync";

export type RemoveOrganizationInventoryItemActionState = {
    success: boolean;
    message: string;
};

const initialState: RemoveOrganizationInventoryItemActionState = {
    success: false,
    message: "",
};

export async function removeOrganizationInventoryItemAction(
    _prevState: RemoveOrganizationInventoryItemActionState,
    formData: FormData
): Promise<RemoveOrganizationInventoryItemActionState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const inventoryItemId = String(formData.get("inventoryItemId") ?? "").trim();

    if (!organizationSlug || !inventoryItemId) {
        return {
            ...initialState,
            message: "Missing organization or inventory item.",
        };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return {
            ...initialState,
            message: "Organization not found.",
        };
    }

    const actor = org.members.find((m) => m.userId === session?.user?.id);

    if (!actor) {
        return {
            ...initialState,
            message: "You are not a member of this organization.",
        };
    }

    if (!["owner", "admin"].includes(actor.role)) {
        return {
            ...initialState,
            message: "Only owners or admins can remove inventory items.",
        };
    }

    const deletedEntry = await deleteOrganizationInventoryItemInDb(inventoryItemId, org._id);

    if (!deletedEntry) {
        return {
            ...initialState,
            message: "Inventory item could not be removed.",
        };
    }

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown User",
        action: "inventory.item_removed" as never,
        entityType: "inventory_item",
        entityId: deletedEntry._id.toString(),
        message: `Item "${deletedEntry.name}" was removed from the organization inventory.`,
        metadata: {
            inventoryItemId: deletedEntry._id.toString(),
            itemName: deletedEntry.name,
        },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/inventory`);

    if (org.googleSheetId) {
        triggerGoogleSheetSync(org._id, org.googleSheetId);
    }

    return {
        success: true,
        message: "Inventory item removed successfully.",
    };
}