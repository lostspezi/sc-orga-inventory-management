"use client";

import { X } from "lucide-react";
import type { ActivityEntry } from "@/components/orgs/details/dashboard/dashboard-shell";

const STATUS_CONFIG: Record<string, { label: string; color: string; borderColor: string }> = {
    requested:  { label: "New Request",  color: "rgba(240,165,0,0.9)",    borderColor: "rgba(240,165,0,0.35)"    },
    approved:   { label: "Approved",     color: "rgba(79,195,220,0.9)",   borderColor: "rgba(79,195,220,0.35)"   },
    completed:  { label: "Completed",    color: "rgba(80,210,120,0.9)",   borderColor: "rgba(80,210,120,0.35)"   },
    rejected:   { label: "Rejected",     color: "rgba(220,80,80,0.9)",    borderColor: "rgba(220,80,80,0.35)"    },
    cancelled:  { label: "Cancelled",    color: "rgba(140,140,160,0.7)",  borderColor: "rgba(140,140,160,0.25)"  },
};

export default function ToastContainer({
    toasts,
    onDismiss,
}: {
    toasts: ActivityEntry[];
    onDismiss: (id: string) => void;
}) {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
            {toasts.map((toast) => {
                const tx = toast.transaction;
                const cfg = STATUS_CONFIG[tx.status] ?? STATUS_CONFIG.cancelled;
                const dirLabel = tx.direction === "member_to_org" ? "Sell" : "Buy";

                return (
                    <div
                        key={toast.id}
                        className="w-72 overflow-hidden rounded-lg border"
                        style={{
                            background: "rgba(4,12,20,0.97)",
                            borderColor: cfg.borderColor,
                            boxShadow: `0 0 24px ${cfg.borderColor}, 0 4px 24px rgba(0,0,0,0.5)`,
                            animation: "slide-in-up 0.22s ease forwards",
                        }}
                    >
                        <div className="h-px" style={{ background: cfg.color, opacity: 0.6 }} />

                        <div className="p-3">
                            <div className="flex items-start gap-2">
                                <div className="min-w-0 flex-1">
                                    <p
                                        className="text-[10px] uppercase tracking-[0.2em]"
                                        style={{ color: cfg.color, fontFamily: "var(--font-mono)" }}
                                    >
                                        {cfg.label}
                                    </p>
                                    <p
                                        className="mt-0.5 truncate text-sm font-semibold uppercase tracking-[0.06em]"
                                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                                    >
                                        {tx.itemName}
                                    </p>
                                    <p
                                        className="mt-0.5 text-[11px]"
                                        style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}
                                    >
                                        {dirLabel} · {tx.quantity}× · {tx.totalPrice.toLocaleString()} aUEC
                                    </p>
                                    <p
                                        className="text-[11px]"
                                        style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                                    >
                                        by {tx.memberUsername}
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => onDismiss(toast.id)}
                                    className="mt-0.5 shrink-0 cursor-pointer rounded p-0.5 transition-colors hover:text-white"
                                    style={{ color: "rgba(200,220,232,0.3)" }}
                                    aria-label="Dismiss"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
