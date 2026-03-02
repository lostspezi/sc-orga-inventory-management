"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import {
    createOrganizationInventoryItemAction,
    type CreateOrganizationInventoryItemActionState,
} from "@/lib/actions/create-organization-inventory-item-action";
import ScItemAutocomplete, { type SelectedItemWithVariants } from "@/components/orgs/details/items/sc-item-autocomplete";

type Props = { organizationSlug: string };

const initialState: CreateOrganizationInventoryItemActionState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export default function CreateInventoryItemForm({ organizationSlug }: Props) {
    const t = useTranslations("inventory");
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState(createOrganizationInventoryItemAction, initialState);
    const [selection, setSelection] = useState<SelectedItemWithVariants | null>(null);
    const [excludeShopItems, setExcludeShopItems] = useState(false);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            startTransition(() => setSelection(null));
        }
    }, [state.success]);

    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selection) return;

        const formData = new FormData(e.currentTarget);
        formData.set("itemName", selection.item.name);

        if (selection.item.source === "local" && selection.item.localId) {
            formData.set("existingItemId", selection.item.localId);
        } else {
            formData.delete("existingItemId");
            if (selection.item.category) formData.set("category", selection.item.category);
            if (selection.item.description) formData.set("description", selection.item.description);
            if (selection.item.itemClass) formData.set("itemClass", selection.item.itemClass);
            if (selection.item.grade) formData.set("grade", selection.item.grade);
            if (selection.item.size) formData.set("size", selection.item.size);
        }

        if (selection.selectedVariants.length > 0) {
            formData.set(
                "variantsJson",
                JSON.stringify(
                    selection.selectedVariants.map((v) => ({
                        name: v.name,
                        type: v.type,
                        description: v.description,
                        manufacturer: v.manufacturer,
                    }))
                )
            );
        }

        startTransition(() => formAction(formData));
    }

    const variantCount = selection?.selectedVariants.length ?? 0;

    return (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <input type="hidden" name="organizationSlug" value={organizationSlug} />

            {/* Filter: Exclude shop items */}
            <label
                className="flex items-center gap-3 mt-4 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors group"
                style={{
                    borderColor: excludeShopItems ? "rgba(79,195,220,0.25)" : "rgba(79,195,220,0.1)",
                    background: excludeShopItems ? "rgba(79,195,220,0.05)" : "rgba(7,18,28,0.2)",
                }}
            >
                {/* Custom checkbox */}
                <div
                    className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                    style={{
                        borderColor: excludeShopItems ? "rgba(79,195,220,0.6)" : "rgba(79,195,220,0.25)",
                        background: excludeShopItems ? "rgba(79,195,220,0.15)" : "transparent",
                    }}
                >
                    <input
                        type="checkbox"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        checked={excludeShopItems}
                        onChange={(e) => {
                            setExcludeShopItems(e.target.checked);
                            // Clear selection when filter changes to avoid stale results
                            setSelection(null);
                        }}
                        disabled={isPending}
                    />
                    {excludeShopItems && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                            <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="rgba(79,195,220,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>

                <div className="flex flex-1 items-center gap-2 min-w-0">
                    <ShoppingBag size={12} style={{ color: excludeShopItems ? "rgba(79,195,220,0.7)" : "rgba(79,195,220,0.3)", flexShrink: 0 }} />
                    <span
                        className="text-[11px] leading-tight"
                        style={{ color: excludeShopItems ? "rgba(200,220,232,0.75)" : "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("filterOfficial")}
                    </span>
                </div>
            </label>

            {/* Item search */}
            <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                    {t("itemName")}
                </label>
                <ScItemAutocomplete
                    onSelectAction={setSelection}
                    disabled={isPending}
                    excludeShopItems={excludeShopItems}
                />
                {state.fieldErrors?.itemName && (
                    <p className="text-[11px]" style={{ color: "rgba(248,113,113,0.8)", fontFamily: "var(--font-mono)" }}>{state.fieldErrors.itemName}</p>
                )}
            </div>

            {selection?.item.source === "sc_wiki" && (
                <>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                            {t("category")} <span style={{ color: "rgba(200,220,232,0.25)" }}>(optional)</span>
                        </label>
                        <input type="text" name="category" defaultValue={selection.item.category ?? ""} key={selection.item.scUuid ?? "cat"} placeholder={t("categoryHint")} className="sc-input w-full" disabled={isPending} />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                            {t("itemDescription")} <span style={{ color: "rgba(200,220,232,0.25)" }}>(optional)</span>
                        </label>
                        <textarea name="description" defaultValue={selection.item.description ?? ""} key={selection.item.scUuid ?? "desc"} rows={3} className="sc-input w-full resize-none" disabled={isPending} />
                    </div>
                </>
            )}

            <div className="grid grid-cols-3 gap-3">
                {(["buyPrice", "sellPrice", "quantity"] as const).map((field) => (
                    <div key={field} className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                            {field === "buyPrice" ? t("buyPrice") : field === "sellPrice" ? t("sellPrice") : t("quantity")}
                        </label>
                        <input type="number" name={field} min={0} step={field === "quantity" ? 1 : "any"} defaultValue={field === "quantity" ? 1 : 0} className="sc-input w-full" disabled={isPending} />
                        {state.fieldErrors?.[field] && (
                            <p className="text-[11px]" style={{ color: "rgba(248,113,113,0.8)", fontFamily: "var(--font-mono)" }}>{state.fieldErrors[field]}</p>
                        )}
                    </div>
                ))}
            </div>

            {!state.success && state.message && (
                <p className="text-[11px]" style={{ color: "rgba(248,113,113,0.8)", fontFamily: "var(--font-mono)" }}>{state.message}</p>
            )}
            {state.success && (
                <p className="text-[11px]" style={{ color: "rgba(74,222,128,0.8)", fontFamily: "var(--font-mono)" }}>{state.message}</p>
            )}

            <button
                type="submit"
                disabled={isPending || !selection}
                className="cursor-pointer rounded-md border px-4 py-2 text-[10px] uppercase tracking-[0.14em] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ borderColor: "rgba(79,195,220,0.25)", color: "rgba(79,195,220,0.85)", fontFamily: "var(--font-mono)", background: "rgba(79,195,220,0.06)" }}
            >
                {isPending
                    ? t("adding")
                    : variantCount > 0
                        ? t("addItemVariants", { count: variantCount })
                        : t("addToInventory")}
            </button>
        </form>
    );
}