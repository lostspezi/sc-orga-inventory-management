import { CheckCircle } from "lucide-react";
import type { OrganizationTransactionView } from "@/lib/types/transaction";

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function RecentCompletedList({
    transactions,
}: {
    transactions: OrganizationTransactionView[];
}) {
    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.12)",
                background: "rgba(4,12,20,0.6)",
            }}
        >
            <p
                className="mb-3 text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
            >
                Recent Completed Trades
            </p>

            {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                    <CheckCircle
                        size={22}
                        className="mb-2"
                        style={{ color: "rgba(80,210,120,0.2)" }}
                    />
                    <p
                        className="text-[11px] uppercase tracking-[0.15em]"
                        style={{ color: "rgba(80,210,120,0.3)", fontFamily: "var(--font-mono)" }}
                    >
                        No completed trades yet.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {transactions.map((tx) => {
                        const dirLabel = tx.direction === "member_to_org" ? "Sell" : "Buy";
                        const dirColor =
                            tx.direction === "member_to_org"
                                ? "rgba(80,210,120,0.75)"
                                : "rgba(79,195,220,0.75)";

                        return (
                            <div
                                key={tx._id}
                                className="flex items-center gap-3 rounded px-2 py-1.5"
                                style={{ background: "rgba(80,210,120,0.03)" }}
                            >
                                <div
                                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                                    style={{ background: "rgba(80,210,120,0.6)" }}
                                />
                                <span
                                    className="min-w-0 flex-1 truncate text-[11px] font-semibold uppercase tracking-[0.05em]"
                                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                                >
                                    {tx.itemName}
                                </span>
                                <span
                                    className="shrink-0 rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                                    style={{
                                        color: dirColor,
                                        background: dirColor.replace("0.75", "0.07"),
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    {dirLabel}
                                </span>
                                <span
                                    className="shrink-0 text-[11px]"
                                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                >
                                    {tx.quantity}× · {tx.totalPrice.toLocaleString()} aUEC
                                </span>
                                <span
                                    className="hidden shrink-0 text-[10px] sm:block"
                                    style={{ color: "rgba(200,220,232,0.25)", fontFamily: "var(--font-mono)" }}
                                >
                                    {tx.memberUsername}
                                </span>
                                <span
                                    className="hidden shrink-0 text-right text-[10px] lg:block"
                                    style={{ color: "rgba(200,220,232,0.2)", fontFamily: "var(--font-mono)" }}
                                >
                                    {formatDate(tx.updatedAt)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
