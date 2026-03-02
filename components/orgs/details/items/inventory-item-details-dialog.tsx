"use client";

import {useActionState, useEffect, useRef} from "react";
import {useRouter} from "next/navigation";
import {useTranslations} from "next-intl";
import {updateOrganizationInventoryItemAction} from "@/lib/actions/update-organization-inventory-item-action";
import RemoveOrganizationInventoryItemButton
    from "@/components/orgs/details/items/remove-organization-inventory-item-button";
import TransactionStatusBadge from "@/components/orgs/details/transactions/transaction-status-badge";
import type {OrganizationTransactionView} from "@/lib/types/transaction";

type Props = {
    open: boolean;
    onCloseAction: () => void;
    canEdit: boolean;
    organizationSlug: string;
    item: {
        inventoryItemId: string;
        itemId: string;
        name: string;
        category?: string;
        description?: string;
        buyPrice: number;
        sellPrice: number;
        quantity: number;
    } | null;
    slug: string;
    transactions?: OrganizationTransactionView[];
};

const initialState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export default function InventoryItemDetailsDialog({
                                                       open,
                                                       onCloseAction,
                                                       canEdit,
                                                       organizationSlug,
                                                       item,
                                                       slug,
                                                       transactions = [],
                                                   }: Props) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const router = useRouter();
    const t = useTranslations("inventory");
    const tc = useTranslations("common");

    const [state, formAction, isPending] = useActionState(
        updateOrganizationInventoryItemAction,
        initialState
    );

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    useEffect(() => {
        if (!state.success) return;

        queueMicrotask(() => {
            router.refresh();
        });
    }, [state.success, router]);

    if (!item) return null;

    const handleClose = () => {
        if (isPending) return;
        onCloseAction();
    };

    return (
        <dialog
            ref={dialogRef}
            className="fixed left-1/2 top-1/2 m-0 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
            style={{
                borderColor: "rgba(79,195,220,0.2)",
                background: "rgba(6,12,18,0.95)",
                boxShadow: "0 0 40px rgba(0,0,0,0.45)",
            }}
        >
            <div className="relative p-5 sm:p-6">
                <div
                    className="absolute left-6 right-6 top-0 h-px"
                    style={{background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)"}}
                />

                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        <p
                            className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                            style={{color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)"}}
                        >
                            {t("detailsLabel")}
                        </p>
                        <h2
                            className="text-lg font-semibold uppercase tracking-[0.08em]"
                            style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                        >
                            {item.name}
                        </h2>
                        <p
                            className="mt-1 text-sm"
                            style={{color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)"}}
                        >
                            {t("detailsDesc")}
                        </p>
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

                <form action={formAction} className="space-y-5">
                    <input type="hidden" name="organizationSlug" value={organizationSlug}/>
                    <input type="hidden" name="inventoryItemId" value={item.inventoryItemId}/>
                    <input type="hidden" name="itemName" value={item.name}/>

                    <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
                        <div className="space-y-4">
                            <div
                                className="rounded-lg border p-4"
                                style={{
                                    borderColor: "rgba(79,195,220,0.12)",
                                    background: "rgba(7,18,28,0.22)",
                                }}
                            >
                                <p
                                    className="text-[10px] uppercase tracking-[0.22em]"
                                    style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}
                                >
                                    {t("itemInfo")}
                                </p>

                                <div className="mt-3 space-y-3">
                                    <InfoRow label={t("name")} value={item.name}/>
                                    <InfoRow label={t("category")} value={item.category ?? t("uncategorized")}/>
                                </div>

                                {item.description && (
                                    <div className="mt-4">
                                        <p
                                            className="text-[10px] uppercase tracking-[0.22em]"
                                            style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}
                                        >
                                            Description
                                        </p>
                                        <p
                                            className="mt-2 text-sm"
                                            style={{color: "rgba(200,220,232,0.48)", fontFamily: "var(--font-mono)"}}
                                        >
                                            {item.description}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div
                                className="rounded-lg border p-4"
                                style={{
                                    borderColor: "rgba(79,195,220,0.12)",
                                    background: "rgba(7,18,28,0.22)",
                                }}
                            >
                                <p
                                    className="text-[10px] uppercase tracking-[0.22em]"
                                    style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}
                                >
                                    {t("eyebrow")}
                                </p>

                                <div className="mt-3 space-y-2">
                                    {transactions.length === 0 ? (
                                        <p
                                            className="text-[11px]"
                                            style={{color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)"}}
                                        >
                                            {t("noTransactions")}
                                        </p>
                                    ) : (
                                        transactions.map((tx) => {
                                            const directionLabel =
                                                tx.direction === "member_to_org" ? t("sellToOrg") : t("buyFromOrg");
                                            const date = new Date(tx.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            });
                                            return (
                                                <div
                                                    key={tx._id}
                                                    className="rounded-md border px-3 py-2"
                                                    style={{
                                                        borderColor: "rgba(79,195,220,0.08)",
                                                        background: "rgba(79,195,220,0.02)",
                                                    }}
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="text-[10px] uppercase"
                                                                style={{color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)"}}
                                                            >
                                                                {directionLabel}
                                                            </span>
                                                            <TransactionStatusBadge status={tx.status}/>
                                                        </div>
                                                        <span
                                                            className="text-[10px]"
                                                            style={{color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)"}}
                                                        >
                                                            {date}
                                                        </span>
                                                    </div>
                                                    <p
                                                        className="mt-1 text-[11px]"
                                                        style={{color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)"}}
                                                    >
                                                        {tx.quantity}x · {tx.totalPrice.toLocaleString()} DKP total
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>

                        <div
                            className="rounded-lg border p-4"
                            style={{
                                borderColor: "rgba(79,195,220,0.12)",
                                background: "rgba(7,18,28,0.22)",
                            }}
                        >
                            <p
                                className="text-[10px] uppercase tracking-[0.22em]"
                                style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}
                            >
                                {t("inventoryValues")}
                            </p>

                            <div className="mt-4 space-y-4">
                                <Field
                                    id="buyPrice"
                                    name="buyPrice"
                                    label={t("buyPrice")}
                                    defaultValue={item.buyPrice}
                                    disabled={!canEdit || isPending}
                                    error={state.fieldErrors?.buyPrice}
                                />

                                <Field
                                    id="sellPrice"
                                    name="sellPrice"
                                    label={t("sellPrice")}
                                    defaultValue={item.sellPrice}
                                    disabled={!canEdit || isPending}
                                    error={state.fieldErrors?.sellPrice}
                                />

                                <Field
                                    id="quantity"
                                    name="quantity"
                                    label={t("stock")}
                                    defaultValue={item.quantity}
                                    disabled={!canEdit || isPending}
                                    error={state.fieldErrors?.quantity}
                                />
                            </div>

                            {state.message && (
                                <p
                                    className="mt-4 text-sm"
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

                            {canEdit && (
                                <div className="mt-5 flex justify-end gap-2">
                                    <button type="submit" className="sc-btn" disabled={isPending}>
                                        {isPending ? tc("saving") : tc("save")}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div
                        className="rounded-lg border p-4"
                        style={{
                            borderColor: "rgba(220,79,79,0.12)",
                            background: "rgba(28,7,7,0.22)",
                        }}
                    >
                        <p
                            className="text-[10px] uppercase tracking-[0.22em]"
                            style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}
                        >
                            {t("dangerArea")}
                        </p>
                        <p
                            className="mt-1 text-sm"
                            style={{color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)"}}
                        >
                            {t("dangerWarning")}
                        </p>
                        <div className="mt-4 space-y-4 flex w-full justify-center">
                            <RemoveOrganizationInventoryItemButton
                                organizationSlug={slug}
                                inventoryItemId={item.inventoryItemId.toString()}
                                itemLabel={item.name}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </dialog>
    );
}

function InfoRow({label, value}: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span
                className="text-[10px] uppercase"
                style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)"}}
            >
                {label}
            </span>
            <span
                className="text-[11px] text-right"
                style={{color: "rgba(200,220,232,0.62)", fontFamily: "var(--font-mono)"}}
            >
                {value}
            </span>
        </div>
    );
}

function Field({
                   id,
                   name,
                   label,
                   defaultValue,
                   disabled,
                   error,
               }: {
    id: string;
    name: string;
    label: string;
    defaultValue: number;
    disabled: boolean;
    error?: string;
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                style={{color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)"}}
            >
                {label}
            </label>
            <input
                id={id}
                name={name}
                type="number"
                min="0"
                step="1"
                defaultValue={defaultValue}
                disabled={disabled}
                className="sc-input w-full disabled:opacity-70"
            />
            {error && (
                <p className="mt-1 text-xs" style={{color: "rgba(240,165,0,0.85)"}}>
                    {error}
                </p>
            )}
        </div>
    );
}
