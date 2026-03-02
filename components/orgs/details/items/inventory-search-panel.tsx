"use client";

import {useMemo, useState} from "react";
import {Search} from "lucide-react";
import { useTranslations } from "next-intl";
import InventoryItemDetailsDialog from "@/components/orgs/details/items/inventory-item-details-dialog";
import CreateTransactionDialog from "@/components/orgs/details/transactions/create-transaction-dialog";
import type {OrganizationTransactionView} from "@/lib/types/transaction";

type InventoryItem = {
    inventoryItemId: string;
    itemId: string;
    name: string;
    normalizedName: string;
    description?: string;
    category?: string;
    itemClass?: string;
    grade?: string;
    size?: string;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
};

type Props = {
    items: InventoryItem[];
    canManageItems: boolean;
    slug: string;
    transactionsByItemId?: Record<string, OrganizationTransactionView[]>;
};

type TransactionIntent = {
    inventoryItemId: string;
    direction: "org_to_member" | "member_to_org";
};

function normalize(value: string) {
    return value.trim().toLowerCase();
}

export default function InventorySearchPanel({items, canManageItems, slug, transactionsByItemId = {}}: Props) {
    const [query, setQuery] = useState("");
    const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [txIntent, setTxIntent] = useState<TransactionIntent | null>(null);
    const t = useTranslations("inventory");

    const filteredItems = useMemo(() => {
        const q = normalize(query);
        if (!q) return items;
        return items.filter((item) =>
            item.name.toLowerCase().includes(q) ||
            item.normalizedName.includes(q) ||
            item.category?.toLowerCase().includes(q) ||
            item.description?.toLowerCase().includes(q)
        );
    }, [items, query]);

    const selectedTransactions = selectedItem
        ? (transactionsByItemId[selectedItem.inventoryItemId] ?? [])
        : [];

    const inventoryItemOptions = items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        name: item.name,
        buyPrice: item.buyPrice,
        sellPrice: item.sellPrice,
    }));

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

                <div className="relative">
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                        style={{color: "rgba(79,195,220,0.45)"}}
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={t("searchPlaceholder")}
                        className="sc-input w-full pl-9!"
                        autoComplete="off"
                    />
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
                        {t("registeredCount", { count: filteredItems.length })}
                    </h3>
                </div>

                {filteredItems.length === 0 ? (
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
                        {filteredItems.map((item) => (
                            <div
                                onClick={() => {
                                    setSelectedItem(item);
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
                                    {(item.itemClass || item.grade || item.size) && (
                                        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                                            {item.itemClass && (
                                                <span className="text-[10px]" style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}>
                                                    {item.itemClass}
                                                </span>
                                            )}
                                            {item.grade && (
                                                <span className="text-[10px]" style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}>
                                                    {t("grade")}&nbsp;{item.grade}
                                                </span>
                                            )}
                                            {item.size && (
                                                <span className="text-[10px]" style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}>
                                                    {t("size")}&nbsp;{item.size}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {item.description && (
                                    <p
                                        className="mt-3 text-xs"
                                        style={{color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)"}}
                                    >
                                        {item.description}
                                    </p>
                                )}

                                <div className="mt-4 space-y-2">
                                    <InfoRow label={t("buyPrice")} value={String(item.buyPrice)}/>
                                    <InfoRow label={t("sellPrice")} value={String(item.sellPrice)}/>
                                    <QuantityRow
                                        label={t("quantity")}
                                        value={item.quantity}
                                        outOfStock={t("outOfStock")}
                                        pieces={t("pieces", { count: item.quantity })}
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
            </div>

            <InventoryItemDetailsDialog
                open={dialogOpen}
                onCloseAction={() => setDialogOpen(false)}
                canEdit={canManageItems}
                organizationSlug={slug}
                item={selectedItem}
                slug={slug}
                transactions={selectedTransactions}
            />

            {txIntent && (
                <CreateTransactionDialog
                    key={txIntent.inventoryItemId + "-" + txIntent.direction}
                    open={true}
                    onCloseAction={() => setTxIntent(null)}
                    organizationSlug={slug}
                    inventoryItems={inventoryItemOptions}
                    defaultInventoryItemId={txIntent.inventoryItemId}
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
                {value} DKP
            </span>
        </div>
    );
}

function QuantityRow({label, value, outOfStock, pieces}: { label: string; value: number; outOfStock: string; pieces: string }) {
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
                {value > 0 ? pieces : outOfStock}
            </span>
        </div>
    );
}
