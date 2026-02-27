"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    createOrganizationInventoryItemAction,
    type CreateOrganizationInventoryItemActionState,
} from "@/lib/actions/create-organization-inventory-item-action";

type ExistingItemOption = {
    id: string;
    name: string;
    category?: string | null;
    description?: string | null;
};

type Props = {
    open: boolean;
    organizationSlug: string;
    itemName: string;
    existingItem: ExistingItemOption | null;
    onCloseAction: () => void;
};

const initialState: CreateOrganizationInventoryItemActionState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export default function CreateInventoryItemDialog({
                                                      open,
                                                      organizationSlug,
                                                      itemName,
                                                      existingItem,
                                                      onCloseAction,
                                                  }: Props) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const handledSuccessRef = useRef(false);
    const router = useRouter();

    const [state, formAction, isPending] = useActionState(
        createOrganizationInventoryItemAction,
        initialState
    );

    const isExisting = !!existingItem;

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) {
            dialog.showModal();
        }

        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        if (!state.success || handledSuccessRef.current) return;

        handledSuccessRef.current = true;

        queueMicrotask(() => {
            onCloseAction();
            router.refresh();
        });
    }, [state.success, onCloseAction, router]);

    useEffect(() => {
        if (open) {
            handledSuccessRef.current = false;
        }
    }, [open]);

    const handleClose = () => {
        if (isPending) return;
        onCloseAction();
    };

    return (
        <dialog
            ref={dialogRef}
            className="fixed left-1/2 top-1/2 m-0 w-full max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
            style={{
                borderColor: "rgba(79,195,220,0.2)",
                background: "rgba(6,12,18,0.95)",
                boxShadow: "0 0 40px rgba(0,0,0,0.45)",
            }}
        >
            <div className="relative p-5 sm:p-6">
                <div
                    className="absolute left-6 right-6 top-0 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }}
                />

                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        <p
                            className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                            style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            INVENTORY.CONFIG
                        </p>
                        <h2
                            className="text-lg font-semibold uppercase tracking-[0.08em]"
                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                        >
                            {isExisting ? "Configure Existing Item" : "Create New Item"}
                        </h2>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {isExisting
                                ? "This item already exists globally. Only inventory values are needed."
                                : "This item does not exist yet. Add item details and inventory values."}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={isPending}
                        className="cursor-pointer rounded-md border px-2.5 py-1 text-xs disabled:opacity-50"
                        style={{
                            borderColor: "rgba(79,195,220,0.2)",
                            color: "rgba(200,220,232,0.6)",
                            fontFamily: "var(--font-mono)",
                            background: "rgba(79,195,220,0.04)",
                        }}
                    >
                        CLOSE
                    </button>
                </div>

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="organizationSlug" value={organizationSlug} />
                    <input type="hidden" name="itemName" value={itemName} />
                    <input type="hidden" name="existingItemId" value={existingItem?.id ?? ""} />

                    <div>
                        <label
                            className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            Item Name
                        </label>
                        <input
                            type="text"
                            value={itemName}
                            readOnly
                            className="sc-input w-full opacity-80"
                        />
                    </div>

                    {!isExisting && (
                        <>
                            <div>
                                <label
                                    htmlFor="category"
                                    className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                                >
                                    Category
                                </label>
                                <input
                                    id="category"
                                    name="category"
                                    type="text"
                                    placeholder="e.g. Medical"
                                    className="sc-input w-full"
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="description"
                                    className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                                >
                                    Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={3}
                                    placeholder="Optional item description"
                                    className="sc-input w-full resize-none"
                                />
                            </div>
                        </>
                    )}

                    <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                            <label
                                htmlFor="buyPrice"
                                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                Buy Price
                            </label>
                            <input
                                id="buyPrice"
                                name="buyPrice"
                                type="number"
                                min="0"
                                step="1"
                                defaultValue="0"
                                className="sc-input w-full"
                                required
                            />
                            {state.fieldErrors?.buyPrice && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.buyPrice}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="sellPrice"
                                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                Sell Price
                            </label>
                            <input
                                id="sellPrice"
                                name="sellPrice"
                                type="number"
                                min="0"
                                step="1"
                                defaultValue="0"
                                className="sc-input w-full"
                                required
                            />
                            {state.fieldErrors?.sellPrice && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.sellPrice}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="quantity"
                                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                Quantity
                            </label>
                            <input
                                id="quantity"
                                name="quantity"
                                type="number"
                                min="0"
                                step="1"
                                defaultValue="0"
                                className="sc-input w-full"
                                required
                            />
                            {state.fieldErrors?.quantity && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.quantity}
                                </p>
                            )}
                        </div>
                    </div>

                    {state.message && (
                        <p
                            className="text-sm"
                            style={{
                                color: state.success
                                    ? "rgba(79,195,220,0.75)"
                                    : "rgba(240,165,0,0.9)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {state.message}
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={handleClose} className="sc-btn sc-btn-outline" disabled={isPending}>
                            Cancel
                        </button>
                        <button type="submit" className="sc-btn" disabled={isPending}>
                            {isPending ? "Saving..." : "Save Item"}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}