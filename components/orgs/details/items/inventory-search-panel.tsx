"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {Search} from "lucide-react";
import { useTranslations } from "next-intl";
import InventoryItemDetailsDialog from "@/components/orgs/details/items/inventory-item-details-dialog";
import CreateTransactionDialog from "@/components/orgs/details/transactions/create-transaction-dialog";
import type {OrganizationTransactionView} from "@/lib/types/transaction";

type InventoryItem = {
    inventoryItemId: string;
    name: string;
    normalizedName: string;
    category?: string;
    scWikiUuid?: string;
    unit?: string;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
    minStock?: number;
    maxStock?: number;
};

type PaginationInfo = {
    page: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
};

type Props = {
    items: InventoryItem[];
    canManageItems: boolean;
    slug: string;
    transactionsByItemId?: Record<string, OrganizationTransactionView[]>;
    pagination: PaginationInfo;
    categories: string[];
    initialSearch: string;
    initialCategory: string;
};

type TransactionIntent = {
    inventoryItemId: string;
    direction: "org_to_member" | "member_to_org";
};

export default function InventorySearchPanel({
    items,
    canManageItems,
    slug,
    transactionsByItemId = {},
    pagination,
    categories,
    initialSearch,
    initialCategory,
}: Props) {
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [txIntent, setTxIntent] = useState<TransactionIntent | null>(null);
    const t = useTranslations("inventory");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [searchValue, setSearchValue] = useState(initialSearch);
    const [categoryValue, setCategoryValue] = useState(initialCategory);

    // Sync local state when server-driven initial values change (e.g. after navigation)
    useEffect(() => { setSearchValue(initialSearch); }, [initialSearch]);
    useEffect(() => { setCategoryValue(initialCategory); }, [initialCategory]);

    // Debounced search → URL update
    useEffect(() => {
        const trimmed = searchValue.trim();
        const timer = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (trimmed) { params.set("q", trimmed); } else { params.delete("q"); }
            params.delete("page");
            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }, 250);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    const handleCategoryChange = (val: string) => {
        setCategoryValue(val);
        const params = new URLSearchParams(searchParams.toString());
        if (val) { params.set("category", val); } else { params.delete("category"); }
        params.delete("page");
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    const goToPage = (p: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", String(p));
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    };

    // Derive the selected item from the items list so it auto-updates after router.refresh()
    const selectedItem = selectedItemId
        ? items.find((i) => i.inventoryItemId === selectedItemId) ?? null
        : null;

    const selectedTransactions = selectedItem
        ? (transactionsByItemId[selectedItem.inventoryItemId] ?? [])
        : [];

    const openTransaction = (item: InventoryItem, direction: "org_to_member" | "member_to_org") => {
        setTxIntent({ inventoryItemId: item.inventoryItemId, direction });
    };

    return (
        <>
            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.28)",
                }}
            >
                <div className="mb-3">
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)"}}
                    >
                        {t("searchLabel")}
                    </p>
                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                    >
                        {t("searchInventory")}
                    </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                    <div className="relative">
                        <Search
                            size={14}
                            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                            style={{color: "rgba(79,195,220,0.45)"}}
                        />
                        <input
                            type="text"
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            placeholder={t("searchPlaceholder")}
                            className="sc-input w-full pl-9!"
                            autoComplete="off"
                        />
                    </div>
                    <select
                        value={categoryValue}
                        onChange={(e) => handleCategoryChange(e.target.value)}
                        className="sc-input"
                        style={{ fontFamily: "var(--font-mono)", minWidth: 160 }}
                    >
                        <option value="">{t("categoryAll")}</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.28)",
                }}
            >
                <div className="mb-4">
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)"}}
                    >
                        {t("inventoryEntries")}
                    </p>
                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                    >
                        {t("registeredCount", { count: pagination.totalCount })}
                    </h3>
                </div>

                {items.length === 0 ? (
                    <div
                        className="rounded-lg border border-dashed p-8 text-center"
                        style={{
                            borderColor: "rgba(240,165,0,0.22)",
                            background: "rgba(20,14,6,0.10)",
                        }}
                    >
                        <p
                            className="text-sm uppercase tracking-[0.12em]"
                            style={{color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-display)"}}
                        >
                            {t("noMatchingItems")}
                        </p>
                        <p
                            className="mt-2 text-xs"
                            style={{color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)"}}
                        >
                            {t("noMatchingItemsDesc")}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {items.map((item) => (
                            <div
                                onClick={() => {
                                    setSelectedItemId(item.inventoryItemId);
                                    setDialogOpen(true);
                                }}
                                className="cursor-pointer rounded-md border p-4 text-left transition"
                                style={{
                                    borderColor: "rgba(79,195,220,0.10)",
                                    background: "rgba(7,18,28,0.18)",
                                }}
                                key={item.inventoryItemId}
                            >
                                <div className="space-y-1">
                                    <h4
                                        className="text-sm font-semibold uppercase tracking-[0.06em]"
                                        style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                                    >
                                        {item.name}
                                    </h4>
                                    <p
                                        className="text-[11px]"
                                        style={{color: "rgba(200,220,232,0.38)", fontFamily: "var(--font-mono)"}}
                                    >
                                        {item.category ?? t("uncategorized")}
                                    </p>
                                </div>

                                <div className="mt-4 space-y-2">
                                    <InfoRow label={t("buyPrice")} value={String(item.buyPrice)}/>
                                    <InfoRow label={t("sellPrice")} value={String(item.sellPrice)}/>
                                    <QuantityRow
                                        label={t("quantity")}
                                        value={item.quantity}
                                        outOfStock={t("outOfStock")}
                                        pieces={t("pieces", { count: item.quantity })}
                                        unit={item.unit}
                                        minStock={item.minStock}
                                        maxStock={item.maxStock}
                                        labelLow={t("stockLow")}
                                        labelFull={t("stockFull")}
                                    />
                                </div>

                                <div className="mt-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        type="button"
                                        onClick={() => openTransaction(item, "org_to_member")}
                                        className="flex-1 rounded border py-1.5 text-[10px] uppercase tracking-[0.15em] transition"
                                        style={{
                                            borderColor: "rgba(79,195,220,0.25)",
                                            color: "rgba(79,195,220,0.8)",
                                            background: "rgba(79,195,220,0.06)",
                                            fontFamily: "var(--font-mono)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {t("buy")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => openTransaction(item, "member_to_org")}
                                        className="flex-1 rounded border py-1.5 text-[10px] uppercase tracking-[0.15em] transition"
                                        style={{
                                            borderColor: "rgba(80,210,120,0.25)",
                                            color: "rgba(80,210,120,0.8)",
                                            background: "rgba(80,210,120,0.06)",
                                            fontFamily: "var(--font-mono)",
                                            cursor: "pointer",
                                        }}
                                    >
                                        {t("sell")}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {pagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => goToPage(pagination.page - 1)}
                            className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors"
                            style={{ opacity: pagination.page <= 1 ? 0.35 : 1 }}
                        >
                            {t("prevPage")}
                        </button>
                        <span
                            className="text-[11px]"
                            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("pageOf", { page: pagination.page, total: pagination.totalPages })}
                        </span>
                        <button
                            disabled={pagination.page >= pagination.totalPages}
                            onClick={() => goToPage(pagination.page + 1)}
                            className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors"
                            style={{ opacity: pagination.page >= pagination.totalPages ? 0.35 : 1 }}
                        >
                            {t("nextPage")}
                        </button>
                    </div>
                )}
            </div>

            <InventoryItemDetailsDialog
                open={dialogOpen}
                onCloseAction={() => { setDialogOpen(false); setSelectedItemId(null); }}
                canEdit={canManageItems}
                organizationSlug={slug}
                item={selectedItem}
                slug={slug}
                transactions={selectedTransactions}
                unit={selectedItem?.unit}
            />

            {txIntent && (
                <CreateTransactionDialog
                    key={txIntent.inventoryItemId + "-" + txIntent.direction}
                    open={true}
                    onCloseAction={() => setTxIntent(null)}
                    organizationSlug={slug}
                    inventoryItemId={txIntent.inventoryItemId}
                    inventoryItemName={items.find((i) => i.inventoryItemId === txIntent.inventoryItemId)?.name ?? ""}
                    inventoryItemBuyPrice={items.find((i) => i.inventoryItemId === txIntent.inventoryItemId)?.buyPrice ?? 0}
                    inventoryItemSellPrice={items.find((i) => i.inventoryItemId === txIntent.inventoryItemId)?.sellPrice ?? 0}
                    defaultDirection={txIntent.direction}
                />
            )}
        </>
    );
}

function InfoRow({label, value}: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span
                className="text-[10px] uppercase"
                style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}
            >
                {label}
            </span>
            <span
                className="text-[11px]"
                style={{color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)"}}
            >
                {value} aUEC
            </span>
        </div>
    );
}

function QuantityRow({
    label,
    value,
    outOfStock,
    pieces,
    unit,
    minStock,
    maxStock,
    labelLow,
    labelFull,
}: {
    label: string;
    value: number;
    outOfStock: string;
    pieces: string;
    unit?: string;
    minStock?: number;
    maxStock?: number;
    labelLow: string;
    labelFull: string;
}) {
    const isLow = minStock != null && value < minStock;
    const isFull = maxStock != null && value >= maxStock;

    return (
        <div className="flex items-center justify-between gap-2">
            <span
                className="text-[10px] uppercase"
                style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}
            >
                {label}
            </span>
            <div className="flex items-center gap-1.5">
                {isLow && (
                    <span
                        className="rounded px-1 py-0.5 text-[9px] uppercase tracking-[0.12em]"
                        style={{
                            background: "rgba(240,165,0,0.12)",
                            color: "rgba(240,165,0,0.9)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {labelLow}
                    </span>
                )}
                {isFull && (
                    <span
                        className="rounded px-1 py-0.5 text-[9px] uppercase tracking-[0.12em]"
                        style={{
                            background: "rgba(79,195,220,0.10)",
                            color: "rgba(79,195,220,0.8)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {labelFull}
                    </span>
                )}
                <span
                    className="text-[11px]"
                    style={{color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)"}}
                >
                    {value > 0
                        ? unit ? `${value} ${unit}` : pieces
                        : outOfStock}
                </span>
            </div>
        </div>
    );
}
