"use client";

import {useCallback, useEffect, useMemo, useState} from "react";
import CreateInventoryItemDialog from "@/components/orgs/details/items/create-inventory-item-dialog";

type ItemSearchResult = {
    id: string;
    name: string;
    normalizedName: string;
    category?: string | null;
    description?: string | null;
};

type Props = {
    organizationSlug: string;
};

function normalizeItemName(value: string) {
    return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export default function CreateInventoryItemForm({organizationSlug}: Props) {
    const [itemName, setItemName] = useState("");
    const [results, setResults] = useState<ItemSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const normalizedInput = useMemo(() => normalizeItemName(itemName), [itemName]);

    useEffect(() => {
        if (!normalizedInput) {
            setResults([]);
            return;
        }

        const t = setTimeout(async () => {
            try {
                setIsLoading(true);

                const res = await fetch(`/api/items/search?q=${encodeURIComponent(itemName)}`, {
                    method: "GET",
                    cache: "no-store",
                });

                const data: { results: ItemSearchResult[] } = await res.json();
                setResults(data.results ?? []);
            } catch {
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        }, 250);

        return () => clearTimeout(t);
    }, [itemName, normalizedInput]);

    const exactExistingItem =
        results.find((item) => item.normalizedName === normalizedInput) ?? null;

    const canContinue = !!itemName.trim();

    const handleCloseDialog = useCallback(() => {
        setDialogOpen(false);
    }, []);

    return (
        <>
            <div className="space-y-4 mt-4">
                <div className="relative">
                    <label
                        htmlFor="inventoryItemName"
                        className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                        style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}
                    >
                        Item Name
                    </label>

                    <input
                        id="inventoryItemName"
                        type="text"
                        value={itemName}
                        onChange={(e) => setItemName(e.target.value)}
                        placeholder="e.g. MedPen"
                        className="sc-input w-full"
                        autoComplete="off"
                    />

                    {!!normalizedInput && (
                        <div
                            className="mt-2 rounded-md border p-2"
                            style={{
                                borderColor: "rgba(79,195,220,0.10)",
                                background: "rgba(7,18,28,0.18)",
                            }}
                        >
                            {isLoading ? (
                                <p
                                    className="text-[11px]"
                                    style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}
                                >
                                    Searching items...
                                </p>
                            ) : results.length === 0 ? (
                                <p
                                    className="text-[11px]"
                                    style={{color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)"}}
                                >
                                    No existing item found. A new item will be created.
                                </p>
                            ) : (
                                <div className="space-y-1">
                                    {results.map((item) => {
                                        const isExact = item.normalizedName === normalizedInput;

                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => setItemName(item.name)}
                                                className="flex w-full items-center justify-between rounded-md border px-2 py-2 text-left"
                                                style={{
                                                    borderColor: isExact
                                                        ? "rgba(79,195,220,0.22)"
                                                        : "rgba(79,195,220,0.08)",
                                                    background: isExact
                                                        ? "rgba(79,195,220,0.06)"
                                                        : "rgba(79,195,220,0.02)",
                                                    cursor: "pointer",
                                                }}
                                            >
                                                    <span
                                                        className="text-[11px]"
                                                        style={{
                                                            color: "rgba(200,220,232,0.62)",
                                                            fontFamily: "var(--font-mono)"
                                                        }}
                                                    >
                                                        {item.name}
                                                    </span>
                                                {item.category && (
                                                    <span
                                                        className="text-[10px] uppercase"
                                                        style={{
                                                            color: "rgba(79,195,220,0.55)",
                                                            fontFamily: "var(--font-mono)"
                                                        }}
                                                    >
                                                            {item.category}
                                                        </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end">
                    <button
                        type="button"
                        disabled={!canContinue}
                        onClick={() => setDialogOpen(true)}
                        className="sc-btn disabled:opacity-50"
                    >
                        {exactExistingItem ? "Configure Existing Item" : "Create New Item"}
                    </button>
                </div>
            </div>

            <CreateInventoryItemDialog
                open={dialogOpen}
                organizationSlug={organizationSlug}
                itemName={itemName.trim()}
                existingItem={exactExistingItem}
                onCloseAction={handleCloseDialog}
            />
        </>
    );
}