"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

type InventoryItem = {
    inventoryItemId: string;
    itemId: string;
    name: string;
    normalizedName: string;
    description?: string;
    category?: string;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
};

type Props = {
    items: InventoryItem[];
};

function normalize(value: string) {
    return value.trim().toLowerCase();
}

export default function InventorySearchPanel({ items }: Props) {
    const [query, setQuery] = useState("");

    const filteredItems = useMemo(() => {
        const q = normalize(query);

        if (!q) return items;

        return items.filter((item) => {
            return (
                item.name.toLowerCase().includes(q) ||
                item.normalizedName.includes(q) ||
                item.category?.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q)
            );
        });
    }, [items, query]);

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
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Search
                    </p>
                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        Search Inventory
                    </h3>
                </div>

                <div className="relative">
                    <Search
                        size={14}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                        style={{ color: "rgba(79,195,220,0.45)" }}
                    />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search by item name, category, description..."
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
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Inventory Entries
                    </p>
                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {filteredItems.length} Registered
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
                            style={{ color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-display)" }}
                        >
                            No Matching Items
                        </p>
                        <p
                            className="mt-2 text-xs"
                            style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                        >
                            No inventory items matched your search.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredItems.map((item) => (
                            <div
                                key={item.inventoryItemId}
                                className="rounded-md border p-4"
                                style={{
                                    borderColor: "rgba(79,195,220,0.10)",
                                    background: "rgba(7,18,28,0.18)",
                                }}
                            >
                                <div className="space-y-1">
                                    <h4
                                        className="text-sm font-semibold uppercase tracking-[0.06em]"
                                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                                    >
                                        {item.name}
                                    </h4>

                                    <p
                                        className="text-[11px]"
                                        style={{ color: "rgba(200,220,232,0.38)", fontFamily: "var(--font-mono)" }}
                                    >
                                        {item.category ?? "Uncategorized"}
                                    </p>
                                </div>

                                {item.description && (
                                    <p
                                        className="mt-3 text-xs"
                                        style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                                    >
                                        {item.description}
                                    </p>
                                )}

                                <div className="mt-4 space-y-2">
                                    <InfoRow label="Buy Price" value={String(item.buyPrice)} />
                                    <InfoRow label="Sell Price" value={String(item.sellPrice)} />
                                    <InfoRow label="Quantity" value={String(item.quantity)} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

function InfoRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-2">
            <span
                className="text-[10px] uppercase"
                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
            >
                {label}
            </span>
            <span
                className="text-[11px]"
                style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)" }}
            >
                {value}
            </span>
        </div>
    );
}