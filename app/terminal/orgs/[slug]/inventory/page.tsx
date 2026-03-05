import {notFound, redirect} from "next/navigation";
import {auth} from "@/auth";
import {getTranslations} from "next-intl/server";
import {getOrganizationViewBySlug} from "@/lib/repositories/organization-repository";
import {
    getOrganizationInventoryItemViewsPaginated,
    getDistinctInventoryCategories,
} from "@/lib/repositories/organization-inventory-item-repository";
import {
    getTransactionsByInventoryItemIds,
    getTransactionsByMemberAndInventoryItemIds,
} from "@/lib/repositories/organization-transaction-repository";
import { getAuecTransactionsByOrg } from "@/lib/repositories/organization-auec-transaction-repository";
import CreateInventoryItemForm from "@/components/orgs/details/items/create-inventory-item-form";
import HudAccordion from "@/components/ui/hud-accordion";
import InventorySearchPanel from "@/components/orgs/details/items/inventory-search-panel";
import CsvImportForm from "@/components/orgs/details/items/csv-import-form";
import Link from "next/link";
import ShowDeleteSuccessMessage from "@/components/orgs/details/items/show-delete-success-message";
import InventoryTabNav from "@/components/orgs/details/items/inventory-tab-nav";
import AuecCashDesk from "@/components/orgs/details/auec/auec-cash-desk";
import type {OrganizationTransactionView} from "@/lib/types/transaction";
import { getUserAuecBalance } from "@/lib/repositories/user-repository";
import { ObjectId } from "mongodb";

const PAGE_SIZE = 25;

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ deleted?: string; tab?: string; page?: string; q?: string; category?: string }>;
};

export default async function OrgItemsPage({params, searchParams}: Props) {
    const {slug} = await params;
    const {deleted, tab, page: pageParam, q, category} = await searchParams;
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
    const isAdminOrOwner = canManageItems;

    const activeTab = tab === "auec" ? "auec" : "items";

    const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
    const search = q?.trim() ?? "";
    const categoryFilter = category?.trim() ?? "";

    const [t, tAuec, tCsv] = await Promise.all([
        getTranslations("inventory"),
        getTranslations("auec"),
        getTranslations("csvImport"),
    ]);

    // Stage 1: fetch paginated items + categories + auec in parallel
    const [paginatedResult, categories, auecTransactions] = await Promise.all([
        activeTab === "items"
            ? getOrganizationInventoryItemViewsPaginated(org._id, {
                page,
                pageSize: PAGE_SIZE,
                search: search || undefined,
                category: categoryFilter || undefined,
            })
            : Promise.resolve(null),
        activeTab === "items" ? getDistinctInventoryCategories(org._id) : Promise.resolve([]),
        activeTab === "auec" && currentMember
            ? canManageItems
                ? getAuecTransactionsByOrg(org._id)
                : getAuecTransactionsByOrg(org._id, session.user.id)
            : Promise.resolve([]),
    ]);

    // Stage 2: fetch transactions scoped to the current page's items
    const inventoryItems = paginatedResult?.items ?? [];
    const pageItemIds: ObjectId[] = inventoryItems.map((i) => i.inventoryItemId);

    const allTransactions: OrganizationTransactionView[] =
        activeTab === "items" && currentMember && pageItemIds.length > 0
            ? canManageItems
                ? await getTransactionsByInventoryItemIds(org._id, pageItemIds)
                : await getTransactionsByMemberAndInventoryItemIds(org._id, session.user.id, pageItemIds)
            : [];

    // Member aUEC balance for the aUEC tab
    const memberAuecBalance = activeTab === "auec" ? await getUserAuecBalance(session.user.id) : null;

    const serializedInventoryItems = inventoryItems.map((item) => ({
        inventoryItemId: item.inventoryItemId.toString(),
        name: item.name,
        normalizedName: item.normalizedName,
        category: item.category,
        scWikiUuid: item.scWikiUuid,
        minStock: item.minStock,
        maxStock: item.maxStock,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
        quantity: item.quantity,
    }));

    const transactionsByItemId: Record<string, OrganizationTransactionView[]> = {};
    for (const tx of allTransactions) {
        if (!transactionsByItemId[tx.inventoryItemId]) {
            transactionsByItemId[tx.inventoryItemId] = [];
        }
        transactionsByItemId[tx.inventoryItemId].push(tx);
    }

    const pagination = {
        page: paginatedResult?.page ?? 1,
        totalPages: paginatedResult?.totalPages ?? 1,
        totalCount: paginatedResult?.totalCount ?? 0,
        pageSize: PAGE_SIZE,
    };

    return (
        <>
            {deleted && <ShowDeleteSuccessMessage message={deleted}/>}
            <div className="space-y-4">
                {/* Header */}
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)"}}
                    >
                        {t("eyebrow")}
                    </p>
                    <h2
                        className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                        style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                    >
                        {t("title")}
                    </h2>
                    <p
                        className="mt-1 text-sm"
                        style={{color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)"}}
                    >
                        {t("description")}
                    </p>
                </div>

                {/* Tab navigation */}
                <InventoryTabNav
                    slug={org.slug}
                    activeTab={activeTab}
                    tabItemsLabel={tAuec("tabItems")}
                    tabAuecLabel={tAuec("tabAuec")}
                />

                {activeTab === "items" ? (
                    <>
                        {canManageItems && (
                            <>
                                <HudAccordion
                                    eyebrow={t("eyebrow")}
                                    title={t("addItem")}
                                    description={t("addItemDesc")}
                                >
                                    <CreateInventoryItemForm organizationSlug={org.slug}/>
                                </HudAccordion>
                                <HudAccordion
                                    eyebrow={tCsv("eyebrow")}
                                    title={tCsv("title")}
                                    description={tCsv("description")}
                                >
                                    <CsvImportForm
                                        organizationSlug={org.slug}
                                        labels={{
                                            downloadTemplate: tCsv("downloadTemplate"),
                                            dropzone: tCsv("dropzone"),
                                            browse: tCsv("browse"),
                                            previewTitle: tCsv("previewTitle"),
                                            previewDesc: tCsv("previewDesc"),
                                            colName: tCsv("colName"),
                                            colBuyPrice: tCsv("colBuyPrice"),
                                            colSellPrice: tCsv("colSellPrice"),
                                            colQuantity: tCsv("colQuantity"),
                                            colMinStock: tCsv("colMinStock"),
                                            colMaxStock: tCsv("colMaxStock"),
                                            submitBtn: tCsv("submitBtn"),
                                            submitting: tCsv("submitting"),
                                            clearFile: tCsv("clearFile"),
                                            rowsLoaded: tCsv("rowsLoaded"),
                                            parseError: tCsv("parseError"),
                                            tooManyRows: tCsv("tooManyRows"),
                                        }}
                                    />
                                    <div className="mt-4 border-t pt-3" style={{ borderColor: "rgba(79,195,220,0.08)" }}>
                                        <Link
                                            href={`/terminal/orgs/${org.slug}/inventory/imports`}
                                            className="inline-flex items-center gap-1.5 text-xs transition-colors"
                                            style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {tCsv("viewAllImports")} →
                                        </Link>
                                    </div>
                                </HudAccordion>
                            </>
                        )}
                        <InventorySearchPanel
                            items={serializedInventoryItems}
                            canManageItems={canManageItems}
                            slug={org.slug}
                            transactionsByItemId={transactionsByItemId}
                            pagination={pagination}
                            categories={categories}
                            initialSearch={search}
                            initialCategory={categoryFilter}
                        />
                    </>
                ) : (
                    <AuecCashDesk
                        organizationSlug={org.slug}
                        currentUserId={session.user.id}
                        isAdminOrOwner={isAdminOrOwner}
                        auecBalance={org.auecBalance}
                        transactions={auecTransactions}
                        memberAuecBalance={memberAuecBalance}
                    />
                )}
            </div>
        </>
    );
}
