"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTransactionAction } from "@/lib/actions/create-transaction-action";

type InventoryItemOption = {
    inventoryItemId: string;
    name: string;
};

type Props = {
    open: boolean;
    onCloseAction: () => void;
    organizationSlug: string;
    inventoryItems: InventoryItemOption[];
    defaultInventoryItemId?: string;
    defaultDirection?: "org_to_member" | "member_to_org";
};

const initialState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export default function CreateTransactionDialog({
    open,
    onCloseAction,
    organizationSlug,
    inventoryItems,
    defaultInventoryItemId,
    defaultDirection,
}: Props) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [state, formAction, isPending] = useActionState(createTransactionAction, initialState);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    useEffect(() => {
        if (state.success) {
            onCloseAction();
        }
    }, [state.success, onCloseAction]);

    const handleClose = () => {
        if (isPending) return;
        onCloseAction();
    };

    const directionLabel =
        defaultDirection === "org_to_member"
            ? "Buy from Organization"
            : defaultDirection === "member_to_org"
            ? "Sell to Organization"
            : "Request Transaction";

    return (
        <dialog
            ref={dialogRef}
            className="fixed left-1/2 top-1/2 m-0 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
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
                            TRANSACTION.NEW
                        </p>
                        <h2
                            className="text-lg font-semibold uppercase tracking-[0.08em]"
                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                        >
                            {directionLabel}
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="cursor-pointer rounded-md border px-2.5 py-1 text-xs"
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

                    <div>
                        <label
                            htmlFor="inventoryItemId"
                            className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            Item
                        </label>
                        <select
                            id="inventoryItemId"
                            name="inventoryItemId"
                            required
                            disabled={isPending}
                            defaultValue={defaultInventoryItemId ?? ""}
                            className="sc-input w-full disabled:opacity-70"
                        >
                            <option value="">Select an item...</option>
                            {inventoryItems.map((item) => (
                                <option key={item.inventoryItemId} value={item.inventoryItemId}>
                                    {item.name}
                                </option>
                            ))}
                        </select>
                        {state.fieldErrors?.inventoryItemId && (
                            <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                {state.fieldErrors.inventoryItemId}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="direction"
                            className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            Direction
                        </label>
                        <select
                            id="direction"
                            name="direction"
                            required
                            disabled={isPending}
                            defaultValue={defaultDirection ?? ""}
                            className="sc-input w-full disabled:opacity-70"
                        >
                            <option value="">Select direction...</option>
                            <option value="org_to_member">Buy from Organization</option>
                            <option value="member_to_org">Sell to Organization</option>
                        </select>
                        {state.fieldErrors?.direction && (
                            <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                {state.fieldErrors.direction}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
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
                                min="1"
                                step="1"
                                required
                                disabled={isPending}
                                className="sc-input w-full disabled:opacity-70"
                                placeholder="1"
                            />
                            {state.fieldErrors?.quantity && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.quantity}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="pricePerUnit"
                                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                Price / Unit (aUEC)
                            </label>
                            <input
                                id="pricePerUnit"
                                name="pricePerUnit"
                                type="number"
                                min="0"
                                step="1"
                                required
                                disabled={isPending}
                                className="sc-input w-full disabled:opacity-70"
                                placeholder="0"
                            />
                            {state.fieldErrors?.pricePerUnit && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.pricePerUnit}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="note"
                            className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            Note (optional)
                        </label>
                        <textarea
                            id="note"
                            name="note"
                            rows={2}
                            disabled={isPending}
                            className="sc-input w-full resize-none disabled:opacity-70"
                            placeholder="Any details for the other party..."
                        />
                    </div>

                    {state.message && (
                        <p
                            className="text-sm"
                            style={{
                                color: state.success ? "rgba(80,210,120,0.85)" : "rgba(240,165,0,0.9)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {state.message}
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isPending}
                            className="cursor-pointer rounded-md border px-3 py-1.5 text-xs disabled:opacity-50"
                            style={{
                                borderColor: "rgba(79,195,220,0.2)",
                                color: "rgba(200,220,232,0.6)",
                                fontFamily: "var(--font-mono)",
                                background: "rgba(79,195,220,0.04)",
                            }}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="sc-btn" disabled={isPending}>
                            {isPending ? "Submitting..." : "Submit Request"}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}
