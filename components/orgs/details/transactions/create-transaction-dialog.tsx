"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createTransactionAction } from "@/lib/actions/create-transaction-action";

type InventoryItemOption = {
    inventoryItemId: string;
    name: string;
    buyPrice: number;
    sellPrice: number;
};

// Two usage modes:
// 1. Opened from a specific item card: provide inventoryItemId + inventoryItemName + prices directly
// 2. Opened from the transactions page "New Request" button: provide inventoryItems list
type Props = {
    open: boolean;
    onCloseAction: () => void;
    organizationSlug: string;
    defaultDirection?: "org_to_member" | "member_to_org";
    memberAuecBalance?: number | null;
} & (
    | {
          inventoryItemId: string;
          inventoryItemName: string;
          inventoryItemBuyPrice: number;
          inventoryItemSellPrice: number;
          inventoryItems?: never;
          defaultInventoryItemId?: never;
      }
    | {
          inventoryItems: InventoryItemOption[];
          defaultInventoryItemId?: string;
          inventoryItemId?: never;
          inventoryItemName?: never;
          inventoryItemBuyPrice?: never;
          inventoryItemSellPrice?: never;
      }
);

const initialState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export default function CreateTransactionDialog({
    open,
    onCloseAction,
    organizationSlug,
    defaultDirection,
    memberAuecBalance,
    ...rest
}: Props) {
    const t = useTranslations("transactions");
    const tc = useTranslations("common");
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [state, formAction, isPending] = useActionState(createTransactionAction, initialState);

    // In list mode, track selected item from the dropdown
    const isSingleItemMode = "inventoryItemId" in rest && rest.inventoryItemId != null;
    const [selectedItemId, setSelectedItemId] = useState(
        isSingleItemMode ? rest.inventoryItemId : (rest.defaultInventoryItemId ?? "")
    );
    const [selectedDirection, setSelectedDirection] = useState<"org_to_member" | "member_to_org" | "">(
        defaultDirection ?? ""
    );
    const [quantity, setQuantity] = useState(1);


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
            ? t("buyFromOrgFull")
            : defaultDirection === "member_to_org"
            ? t("sellToOrgFull")
            : t("requestLabel");

    // Resolve current item prices
    let buyPrice: number | null = null;
    let sellPrice: number | null = null;
    if (isSingleItemMode) {
        buyPrice = rest.inventoryItemBuyPrice;
        sellPrice = rest.inventoryItemSellPrice;
    } else {
        const found = rest.inventoryItems?.find((i) => i.inventoryItemId === selectedItemId);
        if (found) {
            buyPrice = found.buyPrice;
            sellPrice = found.sellPrice;
        }
    }

    const pricePerUnit =
        selectedDirection === "member_to_org"
            ? sellPrice
            : selectedDirection === "org_to_member"
            ? buyPrice
            : null;
    const totalPrice = pricePerUnit !== null ? pricePerUnit * quantity : null;

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
                            {t("newLabel")}
                        </p>
                        <h2
                            className="text-lg font-semibold uppercase tracking-[0.08em]"
                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                        >
                            {directionLabel}
                        </h2>
                        {isSingleItemMode && rest.inventoryItemName && (
                            <p
                                className="mt-0.5 text-[11px]"
                                style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                {rest.inventoryItemName}
                            </p>
                        )}
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
                        {tc("close").toUpperCase()}
                    </button>
                </div>

                {memberAuecBalance != null && (
                    <div
                        className="mb-4 rounded-md border px-3 py-2 text-[11px]"
                        style={{
                            borderColor: "rgba(79,195,220,0.18)",
                            background: "rgba(79,195,220,0.04)",
                            color: "rgba(200,220,232,0.5)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {t("memberAuecBalance")}: <span style={{ color: "var(--accent-primary)" }}>{memberAuecBalance.toLocaleString()} aUEC</span>
                    </div>
                )}

                <form action={formAction} className="space-y-4">
                    <input type="hidden" name="organizationSlug" value={organizationSlug} />

                    {isSingleItemMode ? (
                        <input type="hidden" name="inventoryItemId" value={rest.inventoryItemId} />
                    ) : (
                        <div>
                            <label
                                htmlFor="inventoryItemId"
                                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("item")}
                            </label>
                            <select
                                id="inventoryItemId"
                                name="inventoryItemId"
                                required
                                disabled={isPending}
                                defaultValue={rest.defaultInventoryItemId ?? ""}
                                onChange={(e) => setSelectedItemId(e.target.value)}
                                className="sc-input w-full disabled:opacity-70"
                            >
                                <option value="">{t("selectItem")}</option>
                                {rest.inventoryItems?.map((item) => (
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
                    )}

                    <div>
                        <label
                            htmlFor="direction"
                            className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("direction")}
                        </label>
                        <select
                            id="direction"
                            name="direction"
                            required
                            disabled={isPending}
                            defaultValue={defaultDirection ?? ""}
                            onChange={(e) => setSelectedDirection(e.target.value as "org_to_member" | "member_to_org" | "")}
                            className="sc-input w-full disabled:opacity-70"
                        >
                            <option value="">{t("selectDirection")}</option>
                            <option value="org_to_member">{t("buyFromOrgFull")}</option>
                            <option value="member_to_org">{t("sellToOrgFull")}</option>
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
                                {t("quantity")}
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
                                onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                            />
                            {state.fieldErrors?.quantity && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.quantity}
                                </p>
                            )}
                        </div>

                        <div>
                            <p
                                className="mb-1.5 text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("pricePerUnit")}
                            </p>
                            <div
                                className="sc-input flex w-full items-center opacity-70"
                                style={{ color: "rgba(200,220,232,0.6)" }}
                            >
                                {pricePerUnit !== null
                                    ? `${pricePerUnit.toLocaleString()} aUEC`
                                    : "—"}
                            </div>
                        </div>
                    </div>

                    {totalPrice !== null && (
                        <p
                            className="text-[11px]"
                            style={{
                                color: "rgba(79,195,220,0.65)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {t("totalAuec")}: {totalPrice.toLocaleString()} aUEC
                        </p>
                    )}

                    <div>
                        <label
                            htmlFor="note"
                            className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("note")}
                        </label>
                        <textarea
                            id="note"
                            name="note"
                            rows={2}
                            disabled={isPending}
                            className="sc-input w-full resize-none disabled:opacity-70"
                            placeholder={t("notePlaceholder")}
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
                            {tc("cancel")}
                        </button>
                        <button type="submit" className="sc-btn" disabled={isPending}>
                            {isPending ? t("submitting") : t("submit")}
                        </button>
                    </div>
                </form>
            </div>
        </dialog>
    );
}
