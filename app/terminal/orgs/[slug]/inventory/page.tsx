import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getOrganizationViewBySlug } from "@/lib/repositories/organization-repository";
import { getOrganizationInventoryItemViewsByOrganizationId } from "@/lib/repositories/organization-inventory-item-repository";
import CreateInventoryItemForm from "@/components/orgs/details/items/create-inventory-item-form";
import HudAccordion from "@/components/ui/hud-accordion";
import InventorySearchPanel from "@/components/orgs/details/items/inventory-search-panel";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function OrgItemsPage({ params }: Props) {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const org = await getOrganizationViewBySlug(slug);

    if (!org) {
        notFound();
    }

    const currentMember = org.members.find((m) => m.userId === session?.user?.id);
    const canManageItems =
        !!currentMember && (currentMember.role === "owner" || currentMember.role === "admin");

    const inventoryItems = await getOrganizationInventoryItemViewsByOrganizationId(org._id);

    const serializedInventoryItems = inventoryItems.map((item) => ({
        inventoryItemId: item.inventoryItemId.toString(),
        itemId: item.itemId.toString(),
        name: item.name,
        normalizedName: item.normalizedName,
        description: item.description,
        category: item.category,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
        quantity: item.quantity,
    }));

    return (
        <div className="space-y-4">
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Inventory
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    Item Management
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    View all inventory entries. Owners and admins can add and configure items.
                </p>
            </div>

            {canManageItems && (
                <HudAccordion
                    eyebrow="Inventory"
                    title="Add Item"
                    description="Create a new item or reuse an existing one for this organization."
                >
                    <CreateInventoryItemForm organizationSlug={org.slug} />
                </HudAccordion>
            )}

            <InventorySearchPanel items={serializedInventoryItems} canManageItems={canManageItems} slug={org.slug} />

        </div>
    );
}
