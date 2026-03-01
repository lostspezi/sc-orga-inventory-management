"use client";

import { useState } from "react";
import { ArrowLeftRight, Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { OrganizationTransactionView } from "@/lib/types/transaction";
import TransactionStatusBadge from "@/components/orgs/details/transactions/transaction-status-badge";
import CreateTransactionDialog from "@/components/orgs/details/transactions/create-transaction-dialog";
import { respondToTransactionAction } from "@/lib/actions/respond-to-transaction-action";
import { confirmTransactionAction } from "@/lib/actions/confirm-transaction-action";
import { cancelTransactionAction } from "@/lib/actions/cancel-transaction-action";

type InventoryItemOption = {
    inventoryItemId: string;
    name: string;
};

type Props = {
    transactions: OrganizationTransactionView[];
    inventoryItems: InventoryItemOption[];
    currentUserId: string;
    currentUserRole: "owner" | "admin" | "member";
    organizationSlug: string;
};

export default function TransactionList({
    transactions,
    inventoryItems,
    currentUserId,
    currentUserRole,
    organizationSlug,
}: Props) {
    const [createOpen, setCreateOpen] = useState(false);
    const t = useTranslations("transactions");

    const isAdminOrOwner = currentUserRole === "owner" || currentUserRole === "admin";

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("eyebrow")}
                    </p>
                    <h2
                        className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {t("title")}
                    </h2>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {isAdminOrOwner ? t("descAdmin") : t("descMember")}
                    </p>
                </div>

                {inventoryItems.length > 0 && (
                    <button
                        onClick={() => setCreateOpen(true)}
                        className="sc-btn flex shrink-0 items-center gap-2"
                    >
                        <Plus size={14} />
                        {t("newRequest")}
                    </button>
                )}
            </div>

            {transactions.length === 0 ? (
                <div
                    className="rounded-lg border border-dashed p-8 text-center"
                    style={{
                        borderColor: "rgba(79,195,220,0.18)",
                        background: "rgba(7,18,28,0.14)",
                    }}
                >
                    <ArrowLeftRight
                        size={28}
                        className="mx-auto mb-3"
                        style={{ color: "rgba(79,195,220,0.3)" }}
                    />
                    <p
                        className="text-sm uppercase tracking-[0.12em]"
                        style={{ color: "rgba(79,195,220,0.6)", fontFamily: "var(--font-display)" }}
                    >
                        {t("noTransactions")}
                    </p>
                    <p
                        className="mt-2 text-xs"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("noTransactionsDesc")}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {transactions.map((tx) => (
                        <TransactionRow
                            key={tx._id}
                            tx={tx}
                            currentUserId={currentUserId}
                            isAdminOrOwner={isAdminOrOwner}
                        />
                    ))}
                </div>
            )}

            <CreateTransactionDialog
                open={createOpen}
                onCloseAction={() => setCreateOpen(false)}
                organizationSlug={organizationSlug}
                inventoryItems={inventoryItems}
            />
        </div>
    );
}

function TransactionRow({
    tx,
    currentUserId,
    isAdminOrOwner,
}: {
    tx: OrganizationTransactionView;
    currentUserId: string;
    isAdminOrOwner: boolean;
}) {
    const t = useTranslations("transactions");

    const isMemberParty = tx.memberId === currentUserId;
    const isCounterParty =
        (tx.initiatedBy === "member" && isAdminOrOwner) ||
        (tx.initiatedBy === "admin" && isMemberParty);

    const canApproveOrReject = tx.status === "requested" && isCounterParty;

    const canConfirm =
        tx.status === "approved" &&
        ((isAdminOrOwner && !tx.adminConfirmed) || (isMemberParty && !tx.memberConfirmed));

    const canCancel =
        (tx.status === "requested" || tx.status === "approved") &&
        (isAdminOrOwner || isMemberParty);

    const directionLabel =
        tx.direction === "member_to_org" ? t("sellToOrg") : t("buyFromOrg");

    const directionColor =
        tx.direction === "member_to_org"
            ? "rgba(80,210,120,0.8)"
            : "rgba(79,195,220,0.8)";

    const date = new Date(tx.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });

    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.10)",
                background: "rgba(7,18,28,0.22)",
            }}
        >
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span
                            className="text-sm font-semibold uppercase tracking-[0.06em]"
                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                        >
                            {tx.itemName}
                        </span>
                        <span
                            className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.15em]"
                            style={{
                                color: directionColor,
                                background: `${directionColor.replace("0.8", "0.07")}`,
                                border: `1px solid ${directionColor.replace("0.8", "0.2")}`,
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {directionLabel}
                        </span>
                        <TransactionStatusBadge status={tx.status} />
                    </div>

                    <div
                        className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px]"
                        style={{ color: "rgba(200,220,232,0.48)", fontFamily: "var(--font-mono)" }}
                    >
                        <span>Qty: {tx.quantity}</span>
                        <span>{tx.pricePerUnit.toLocaleString()} aUEC/unit</span>
                        <span>Total: {tx.totalPrice.toLocaleString()} aUEC</span>
                        <span>By: {tx.memberUsername}</span>
                        <span>{date}</span>
                    </div>

                    {tx.note && (
                        <p
                            className="mt-1 text-[11px] italic"
                            style={{ color: "rgba(200,220,232,0.38)", fontFamily: "var(--font-mono)" }}
                        >
                            &ldquo;{tx.note}&rdquo;
                        </p>
                    )}

                    {tx.status === "approved" && (
                        <p
                            className="mt-1 text-[10px]"
                            style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                        >
                            In-game trade confirmed:{" "}
                            {tx.memberConfirmed ? "member ✓" : "member ✗"},{" "}
                            {tx.adminConfirmed ? "admin ✓" : "admin ✗"}
                        </p>
                    )}
                </div>

                <div className="flex shrink-0 flex-wrap gap-2">
                    {canApproveOrReject && (
                        <>
                            <form action={respondToTransactionAction}>
                                <input type="hidden" name="transactionId" value={tx._id} />
                                <input type="hidden" name="response" value="approved" />
                                <button
                                    type="submit"
                                    className="rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] transition"
                                    style={{
                                        borderColor: "rgba(80,210,120,0.3)",
                                        color: "rgba(80,210,120,0.85)",
                                        background: "rgba(80,210,120,0.06)",
                                        fontFamily: "var(--font-mono)",
                                        cursor: "pointer",
                                    }}
                                >
                                    {t("approve")}
                                </button>
                            </form>
                            <form action={respondToTransactionAction}>
                                <input type="hidden" name="transactionId" value={tx._id} />
                                <input type="hidden" name="response" value="rejected" />
                                <button
                                    type="submit"
                                    className="rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] transition"
                                    style={{
                                        borderColor: "rgba(220,80,80,0.3)",
                                        color: "rgba(220,80,80,0.85)",
                                        background: "rgba(220,80,80,0.06)",
                                        fontFamily: "var(--font-mono)",
                                        cursor: "pointer",
                                    }}
                                >
                                    {t("reject")}
                                </button>
                            </form>
                        </>
                    )}

                    {canConfirm && (
                        <form action={confirmTransactionAction}>
                            <input type="hidden" name="transactionId" value={tx._id} />
                            <button
                                type="submit"
                                className="rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] transition"
                                style={{
                                    borderColor: "rgba(79,195,220,0.3)",
                                    color: "rgba(79,195,220,0.85)",
                                    background: "rgba(79,195,220,0.06)",
                                    fontFamily: "var(--font-mono)",
                                    cursor: "pointer",
                                }}
                            >
                                {t("confirmTrade")}
                            </button>
                        </form>
                    )}

                    {canCancel && (
                        <form action={cancelTransactionAction}>
                            <input type="hidden" name="transactionId" value={tx._id} />
                            <button
                                type="submit"
                                className="rounded-md border px-2.5 py-1 text-[11px] uppercase tracking-[0.12em] transition"
                                style={{
                                    borderColor: "rgba(140,140,160,0.25)",
                                    color: "rgba(140,140,160,0.65)",
                                    background: "rgba(140,140,160,0.04)",
                                    fontFamily: "var(--font-mono)",
                                    cursor: "pointer",
                                }}
                            >
                                {t("cancelTrade")}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
