import {notFound, redirect} from "next/navigation";
import {auth} from "@/auth";
import {getTranslations} from "next-intl/server";
import {getOrganizationViewBySlug} from "@/lib/repositories/organization-repository";
import {
    getOrganizationInventoryItemViewsByOrganizationId
} from "@/lib/repositories/organization-inventory-item-repository";
import {
    getTransactionsByOrganizationId,
    getTransactionsByMember,
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
import { getDiscordUserId } from "@/lib/discord/get-discord-user-id";
import { getMemberDkp } from "@/lib/raid-helper/get-member-dkp";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ deleted?: string; tab?: string }>;
};

export default async function OrgItemsPage({params, searchParams}: Props) {
    const {slug} = await params;
    const {deleted, tab} = await searchParams;
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

    const [t, tAuec, tCsv] = await Promise.all([
        getTranslations("inventory"),
        getTranslations("auec"),
        getTranslations("csvImport"),
    ]);

    // Fetch data in parallel
    const [inventoryItems, allTransactions, auecTransactions] = await Promise.all([
        activeTab === "items"
            ? getOrganizationInventoryItemViewsByOrganizationId(org._id)
            : Promise.resolve([]),
        activeTab === "items" && currentMember
            ? canManageItems
                ? getTransactionsByOrganizationId(org._id)
                : getTransactionsByMember(org._id, session.user.id)
            : Promise.resolve([] as OrganizationTransactionView[]),
        activeTab === "auec" && currentMember
            ? canManageItems
                ? getAuecTransactionsByOrg(org._id)
                : getAuecTransactionsByOrg(org._id, session.user.id)
            : Promise.resolve([]),
    ]);

    // DKP balance for buy direction on aUEC tab
    let currentDkp: number | null = null;
    if (activeTab === "auec" && org.raidHelperApiKey && org.discordGuildId) {
        const discordId = await getDiscordUserId(session.user.id);
        if (discordId) {
            currentDkp = await getMemberDkp(org.discordGuildId, discordId, org.raidHelperApiKey);
        }
    }

    const serializedInventoryItems = inventoryItems.map((item) => ({
        inventoryItemId: item.inventoryItemId.toString(),
        itemId: item.itemId.toString(),
        name: item.name,
        normalizedName: item.normalizedName,
        description: item.description,
        category: item.category,
        itemClass: item.itemClass,
        grade: item.grade,
        size: item.size,
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
                        />
                    </>
                ) : (
                    <AuecCashDesk
                        organizationSlug={org.slug}
                        currentUserId={session.user.id}
                        isAdminOrOwner={isAdminOrOwner}
                        auecBalance={org.auecBalance}
                        auecBuyPriceDkp={org.auecBuyPriceDkp}
                        auecBuyPriceAuec={org.auecBuyPriceAuec}
                        auecSellPriceDkp={org.auecSellPriceDkp}
                        auecSellPriceAuec={org.auecSellPriceAuec}
                        transactions={auecTransactions}
                        currentDkp={currentDkp}
                    />
                )}
            </div>
        </>
    );
}
