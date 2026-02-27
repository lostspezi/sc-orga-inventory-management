"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { addItemToOrganizationByName, getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { getOrCreateItemByName } from "@/lib/repositories/item-repository";

export type AddOrgItemActionState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        itemName?: string;
    };
};

const initialErrors = {
    success: false,
    message: "",
    fieldErrors: {},
};

export async function addOrgItemAction(
    _prevState: AddOrgItemActionState,
    formData: FormData
): Promise<AddOrgItemActionState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const itemName = String(formData.get("itemName") ?? "").trim();

    if (!organizationSlug) {
        return {
            ...initialErrors,
            message: "Missing organization.",
        };
    }

    if (!itemName) {
        return {
            ...initialErrors,
            message: "Please enter an item name.",
            fieldErrors: {
                itemName: "Item name is required.",
            },
        };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return {
            ...initialErrors,
            message: "Organization not found.",
        };
    }

    const actor = org.members.find((m) => m.userId === session?.user?.id);

    if (!actor) {
        return {
            ...initialErrors,
            message: "You are not a member of this organization.",
        };
    }

    if (!["owner", "admin"].includes(actor.role)) {
        return {
            ...initialErrors,
            message: "Only owners or admins can add items.",
        };
    }

    const item = await getOrCreateItemByName(itemName);
    const added = await addItemToOrganizationByName(organizationSlug, itemName);

    if (!added) {
        const alreadyLinked = org.itemIds?.some((id) => id.toString() === item._id.toString());

        return {
            success: false,
            message: alreadyLinked
                ? "This item is already linked to the organization."
                : "Failed to add item to organization.",
            fieldErrors: {},
        };
    }

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown User",
        action: "item.linked" as never, // replace once you extend your union type
        entityType: "organization",
        entityId: item._id.toString(),
        message: `Item "${item.name}" was added to the organization inventory.`,
        metadata: {
            itemId: item._id.toString(),
            itemName: item.name,
        },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/items`);

    return {
        success: true,
        message: `Item "${item.name}" added successfully.`,
        fieldErrors: {},
    };
}