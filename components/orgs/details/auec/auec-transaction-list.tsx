"use client";

import { useTranslations } from "next-intl";
import { confirmAuecTransactionAction } from "@/lib/actions/confirm-auec-transaction-action";
import { cancelAuecTransactionAction } from "@/lib/actions/cancel-auec-transaction-action";
import { respondToAuecTransactionAction } from "@/lib/actions/respond-to-auec-transaction-action";
import type { AuecTransactionView } from "@/lib/types/auec-transaction";

type Props = {
    transactions: AuecTransactionView[];
    currentUserId: string;
    isAdminOrOwner: boolean;
};

const STATUS_STYLES: Record<string, { color: string; bg: string }> = {
    requested: { color: "rgba(250,166,26,0.9)", bg: "rgba(250,166,26,0.08)" },
    approved:  { color: "rgba(88,101,242,0.9)",  bg: "rgba(88,101,242,0.08)"  },
    completed: { color: "rgba(87,242,135,0.9)",  bg: "rgba(87,242,135,0.08)"  },
    rejected:  { color: "rgba(237,66,69,0.9)",   bg: "rgba(237,66,69,0.08)"   },
    cancelled: { color: "rgba(149,165,166,0.9)", bg: "rgba(149,165,166,0.08)" },
};

export default function AuecTransactionList({ transactions, currentUserId, isAdminOrOwner }: Props) {
    const t = useTranslations("auec");

    if (transactions.length === 0) {
        return (
            <div
                className="rounded-lg border p-6 text-center"
                style={{ borderColor: "rgba(79,195,220,0.1)", background: "rgba(7,18,28,0.2)" }}
            >
                <p
                    className="text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("noTransactions")}
                </p>
                <p
                    className="mt-1 text-xs"
                    style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                >
                    {t("noTransactionsDesc")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {transactions.map((tx) => {
                const style = STATUS_STYLES[tx.status] ?? STATUS_STYLES.cancelled;
                const isMemberParty = tx.memberId === currentUserId;
                const isSell = tx.direction === "member_to_org";

                const canApproveReject = isAdminOrOwner && tx.status === "requested";
                const canConfirm =
                    (isAdminOrOwner || isMemberParty) &&
                    tx.status === "approved" &&
                    !((isAdminOrOwner && tx.adminConfirmed) || (!isAdminOrOwner && isMemberParty && tx.memberConfirmed));
                const canCancel =
                    (isAdminOrOwner || isMemberParty) &&
                    (tx.status === "requested" || tx.status === "approved");

                const statusMap: Record<string, string> = {
                    requested: t("statusRequested"),
                    approved:  t("statusApproved"),
                    completed: t("statusCompleted"),
                    rejected:  t("statusRejected"),
                    cancelled: t("statusCancelled"),
                };

                return (
                    <div
                        key={tx._id}
                        className="rounded-lg border p-4"
                        style={{
                            borderColor: "rgba(79,195,220,0.1)",
                            background: "rgba(7,18,28,0.25)",
                        }}
                    >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="flex-1 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span
                                        className="rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.15em]"
                                        style={{
                                            color: style.color,
                                            background: style.bg,
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        {statusMap[tx.status] ?? tx.status}
                                    </span>
                                    <span
                                        className="text-xs uppercase tracking-[0.1em]"
                                        style={{
                                            color: isSell ? "rgba(80,210,120,0.8)" : "rgba(88,101,242,0.8)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        {isSell ? t("directionSell") : t("directionBuy")}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-4">
                                    <div>
                                        <span
                                            className="text-[10px] uppercase"
                                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {t("auecAmount")}:{" "}
                                        </span>
                                        <span
                                            className="text-sm font-semibold"
                                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {tx.auecAmount.toLocaleString()} aUEC
                                        </span>
                                    </div>
                                    <div>
                                        <span
                                            className="text-[10px] uppercase"
                                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {t("totalDkp")}:{" "}
                                        </span>
                                        <span
                                            className="text-sm font-semibold"
                                            style={{ color: "rgba(200,220,232,0.8)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {tx.totalDkp.toLocaleString()} DKP
                                        </span>
                                    </div>
                                    <div>
                                        <span
                                            className="text-[10px] uppercase"
                                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {t("memberLabel")}:{" "}
                                        </span>
                                        <span
                                            className="text-xs"
                                            style={{ color: "rgba(200,220,232,0.6)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {tx.memberUsername}
                                        </span>
                                    </div>
                                </div>

                                {tx.status === "approved" && (
                                    <div
                                        className="mt-1 flex gap-4 text-[10px]"
                                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                                    >
                                        <span>{t("memberConfirmed")}: {tx.memberConfirmed ? "✅" : "⬜"}</span>
                                        <span>{t("adminConfirmed")}: {tx.adminConfirmed ? "✅" : "⬜"}</span>
                                    </div>
                                )}

                                {tx.note && (
                                    <p
                                        className="mt-1 text-xs italic"
                                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                                    >
                                        &ldquo;{tx.note}&rdquo;
                                    </p>
                                )}

                                <p
                                    className="text-[10px]"
                                    style={{ color: "rgba(200,220,232,0.25)", fontFamily: "var(--font-mono)" }}
                                >
                                    {new Date(tx.createdAt).toLocaleString("en-GB", { timeZone: "UTC" })} UTC
                                </p>
                            </div>

                            {/* Action buttons */}
                            <div className="flex shrink-0 flex-wrap gap-2">
                                {canApproveReject && (
                                    <>
                                        <form action={respondToAuecTransactionAction}>
                                            <input type="hidden" name="transactionId" value={tx._id} />
                                            <input type="hidden" name="response" value="approve" />
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
                                        <form action={respondToAuecTransactionAction}>
                                            <input type="hidden" name="transactionId" value={tx._id} />
                                            <input type="hidden" name="response" value="reject" />
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
                                    <form action={confirmAuecTransactionAction}>
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
                                    <form action={cancelAuecTransactionAction}>
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
                                            {t("cancel")}
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
