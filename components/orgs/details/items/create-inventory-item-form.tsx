"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { Package, ShoppingBag } from "lucide-react";
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

function UnitBadge({ unit }: { unit: string }) {
    return (
        <span style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)", fontSize: 9 }}>
            {unit}
        </span>
    );
}

export default function CreateInventoryItemForm({ organizationSlug }: Props) {
    const t = useTranslations("inventory");
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState(createOrganizationInventoryItemAction, initialState);
    const [selection, setSelection] = useState<SelectedItemWithVariants | null>(null);
    const [excludeShopItems, setExcludeShopItems] = useState(false);
    const [commoditiesOnly, setCommoditiesOnly] = useState(false);
    const [resetKey, setResetKey] = useState(0);

    const unitLabel = selection?.item.unit ?? null;

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            startTransition(() => {
                setSelection(null);
                setResetKey((k) => k + 1);
            });
        }
    }, [state.success]);

    function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!selection) return;

        const formData = new FormData(e.currentTarget);
        formData.set("itemName", selection.item.name);
        if (selection.item.scUuid) formData.set("scWikiUuid", selection.item.scUuid);
        if (selection.item.category) formData.set("category", selection.item.category);
        if (selection.item.unit) formData.set("unit", selection.item.unit);

        // Remove empty min/max stock so action treats them as undefined
        if (!formData.get("minStock")) formData.delete("minStock");
        if (!formData.get("maxStock")) formData.delete("maxStock");

        if (selection.selectedVariants.length > 0) {
            formData.set(
                "variantsJson",
                JSON.stringify(
                    selection.selectedVariants.map((v) => ({
                        name: v.name,
                        type: v.type,
                        uuid: v.uuid,
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

            {/* Filter checkboxes */}
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                {/* Exclude shop items */}
                <label
                    className="flex flex-1 items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors"
                    style={{
                        borderColor: excludeShopItems ? "rgba(79,195,220,0.25)" : "rgba(79,195,220,0.1)",
                        background: excludeShopItems ? "rgba(79,195,220,0.05)" : "rgba(7,18,28,0.2)",
                    }}
                >
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
                        <span className="text-[11px] leading-tight" style={{ color: excludeShopItems ? "rgba(200,220,232,0.75)" : "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                            {t("filterOfficial")}
                        </span>
                    </div>
                </label>

                {/* Commodities only */}
                <label
                    className="flex flex-1 items-center gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors"
                    style={{
                        borderColor: commoditiesOnly ? "rgba(79,195,220,0.25)" : "rgba(79,195,220,0.1)",
                        background: commoditiesOnly ? "rgba(79,195,220,0.05)" : "rgba(7,18,28,0.2)",
                    }}
                >
                    <div
                        className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                        style={{
                            borderColor: commoditiesOnly ? "rgba(79,195,220,0.6)" : "rgba(79,195,220,0.25)",
                            background: commoditiesOnly ? "rgba(79,195,220,0.15)" : "transparent",
                        }}
                    >
                        <input
                            type="checkbox"
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            checked={commoditiesOnly}
                            onChange={(e) => {
                                setCommoditiesOnly(e.target.checked);
                                setSelection(null);
                            }}
                            disabled={isPending}
                        />
                        {commoditiesOnly && (
                            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                                <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="rgba(79,195,220,0.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        )}
                    </div>
                    <div className="flex flex-1 items-center gap-2 min-w-0">
                        <Package size={12} style={{ color: commoditiesOnly ? "rgba(79,195,220,0.7)" : "rgba(79,195,220,0.3)", flexShrink: 0 }} />
                        <span className="text-[11px] leading-tight" style={{ color: commoditiesOnly ? "rgba(200,220,232,0.75)" : "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                            {t("filterCommodities")}
                        </span>
                    </div>
                </label>
            </div>

            {/* Item search */}
            <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                    {t("itemName")}
                </label>
                <ScItemAutocomplete
                    key={resetKey}
                    onSelectAction={setSelection}
                    disabled={isPending}
                    excludeShopItems={excludeShopItems}
                    commoditiesOnly={commoditiesOnly}
                />
                {state.fieldErrors?.itemName && (
                    <p className="text-[11px]" style={{ color: "rgba(248,113,113,0.8)", fontFamily: "var(--font-mono)" }}>{state.fieldErrors.itemName}</p>
                )}
            </div>

            {/* Buy price / Sell price / Quantity */}
            <div className="grid grid-cols-3 gap-3">
                {(["buyPrice", "sellPrice", "quantity"] as const).map((field) => (
                    <div key={field} className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                            {field === "buyPrice" ? t("buyPrice") : field === "sellPrice" ? t("sellPrice") : t("quantity")}
                            {field === "quantity" && unitLabel && <UnitBadge unit={unitLabel} />}
                        </label>
                        <input type="number" name={field} min={0} step={field === "quantity" ? 1 : "any"} defaultValue={field === "quantity" ? 1 : 0} className="sc-input w-full" disabled={isPending} />
                        {state.fieldErrors?.[field] && (
                            <p className="text-[11px]" style={{ color: "rgba(248,113,113,0.8)", fontFamily: "var(--font-mono)" }}>{state.fieldErrors[field]}</p>
                        )}
                    </div>
                ))}
            </div>

            {/* Min / Max stock */}
            <div className="grid grid-cols-2 gap-3">
                {(["minStock", "maxStock"] as const).map((field) => (
                    <div key={field} className="space-y-1.5">
                        <label className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                            {field === "minStock" ? t("minStock") : t("maxStock")}
                            {unitLabel && <UnitBadge unit={unitLabel} />}
                        </label>
                        <input
                            type="number"
                            name={field}
                            min={0}
                            step={1}
                            placeholder="—"
                            className="sc-input w-full"
                            disabled={isPending}
                        />
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
