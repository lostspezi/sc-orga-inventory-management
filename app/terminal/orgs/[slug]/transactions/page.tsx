import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    getTransactionsByOrganizationId,
    getTransactionsByMember,
} from "@/lib/repositories/organization-transaction-repository";
import { getOrganizationInventoryItemViewsByOrganizationId } from "@/lib/repositories/organization-inventory-item-repository";
import TransactionList from "@/components/orgs/details/transactions/transaction-list";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function OrgTransactionsPage({ params }: Props) {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const org = await getOrganizationBySlug(slug);

    if (!org) {
        notFound();
    }

    const currentMember = org.members.find((m) => m.userId === session.user!.id);
    const t = await getTranslations("transactions");

    if (!currentMember) {
        return (
            <div
                className="rounded-lg border p-6"
                style={{
                    borderColor: "rgba(240,165,0,0.18)",
                    background: "rgba(20,14,6,0.12)",
                }}
            >
                <h2
                    className="text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                >
                    {t("forbidden")}
                </h2>
                <p
                    className="mt-2 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("forbiddenMessage")}
                </p>
            </div>
        );
    }

    const isAdminOrOwner = currentMember.role === "owner" || currentMember.role === "admin";

    const transactions = isAdminOrOwner
        ? await getTransactionsByOrganizationId(org._id)
        : await getTransactionsByMember(org._id, session.user.id);

    const inventoryItems = await getOrganizationInventoryItemViewsByOrganizationId(org._id);

    const serializedInventoryItems = inventoryItems.map((item) => ({
        inventoryItemId: item.inventoryItemId.toString(),
        name: item.name,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
    }));

    return (
        <TransactionList
            transactions={transactions}
            inventoryItems={serializedInventoryItems}
            currentUserId={session.user.id}
            currentUserRole={currentMember.role}
            organizationSlug={org.slug}
        />
    );
}
