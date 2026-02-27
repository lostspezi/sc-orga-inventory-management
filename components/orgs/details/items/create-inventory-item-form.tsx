"use client";

import React, {startTransition, useActionState, useEffect, useRef, useState} from "react";
import {
    createOrganizationInventoryItemAction,
    type CreateOrganizationInventoryItemActionState,
} from "@/lib/actions/create-organization-inventory-item-action";
import ScItemAutocomplete, {type SelectedItemWithVariants} from "@/components/orgs/details/items/sc-item-autocomplete";

type Props = { organizationSlug: string };

const initialState: CreateOrganizationInventoryItemActionState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export default function CreateInventoryItemForm({organizationSlug}: Props) {
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction, isPending] = useActionState(createOrganizationInventoryItemAction, initialState);
    const [selection, setSelection] = useState<SelectedItemWithVariants | null>(null);

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
        }

        // Only pass the user-selected variants (not all siblings)
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
            <input type="hidden" name="organizationSlug" value={organizationSlug}/>

            <div className="space-y-1.5">
                <label className="text-[10px] uppercase tracking-[0.18em]"
                       style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}>
                    Item Name
                </label>
                <ScItemAutocomplete onSelectAction={setSelection} disabled={isPending}/>
                {state.fieldErrors?.itemName && (
                    <p className="text-[11px]" style={{
                        color: "rgba(248,113,113,0.8)",
                        fontFamily: "var(--font-mono)"
                    }}>{state.fieldErrors.itemName}</p>
                )}
            </div>

            {selection?.item.source === "sc_wiki" && (
                <>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em]"
                               style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}>
                            Category <span style={{color: "rgba(200,220,232,0.25)"}}>(optional)</span>
                        </label>
                        <input type="text" name="category" defaultValue={selection.item.category ?? ""}
                               key={selection.item.scUuid ?? "cat"} placeholder="e.g. WeaponGun, Armor..."
                               className="sc-input w-full" disabled={isPending}/>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em]"
                               style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}>
                            Description <span style={{color: "rgba(200,220,232,0.25)"}}>(optional)</span>
                        </label>
                        <textarea name="description" defaultValue={selection.item.description ?? ""}
                                  key={selection.item.scUuid ?? "desc"} rows={3} className="sc-input w-full resize-none"
                                  disabled={isPending}/>
                    </div>
                </>
            )}

            <div className="grid grid-cols-3 gap-3">
                {(["buyPrice", "sellPrice", "quantity"] as const).map((field) => (
                    <div key={field} className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-[0.18em]"
                               style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}>
                            {field === "buyPrice" ? "Buy Price" : field === "sellPrice" ? "Sell Price" : "Quantity"}
                        </label>
                        <input type="number" name={field} min={0} step={field === "quantity" ? 1 : "any"}
                               defaultValue={field === "quantity" ? 1 : 0} className="sc-input w-full"
                               disabled={isPending}/>
                        {state.fieldErrors?.[field] && (
                            <p className="text-[11px]" style={{
                                color: "rgba(248,113,113,0.8)",
                                fontFamily: "var(--font-mono)"
                            }}>{state.fieldErrors[field]}</p>
                        )}
                    </div>
                ))}
            </div>

            {!state.success && state.message && (
                <p className="text-[11px]"
                   style={{color: "rgba(248,113,113,0.8)", fontFamily: "var(--font-mono)"}}>{state.message}</p>
            )}
            {state.success && (
                <p className="text-[11px]"
                   style={{color: "rgba(74,222,128,0.8)", fontFamily: "var(--font-mono)"}}>{state.message}</p>
            )}

            <button
                type="submit"
                disabled={isPending || !selection}
                className="cursor-pointer rounded-md border px-4 py-2 text-[10px] uppercase tracking-[0.14em] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                    borderColor: "rgba(79,195,220,0.25)",
                    color: "rgba(79,195,220,0.85)",
                    fontFamily: "var(--font-mono)",
                    background: "rgba(79,195,220,0.06)"
                }}
            >
                {isPending
                    ? "Adding..."
                    : variantCount > 0
                        ? `Add Item + ${variantCount} Variant${variantCount !== 1 ? "s" : ""}`
                        : "Add to Inventory"}
            </button>
        </form>
    );
}