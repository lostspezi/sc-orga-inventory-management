"use client";

import { ArrowLeftRight } from "lucide-react";
import type { ActivityEntry } from "@/components/orgs/details/dashboard/dashboard-shell";

const STATUS_COLOR: Record<string, string> = {
    requested:  "rgba(240,165,0,0.85)",
    approved:   "rgba(79,195,220,0.85)",
    completed:  "rgba(80,210,120,0.85)",
    rejected:   "rgba(220,80,80,0.85)",
    cancelled:  "rgba(140,140,160,0.65)",
};

const STATUS_LABEL: Record<string, string> = {
    requested: "Requested",
    approved:  "Approved",
    completed: "Completed",
    rejected:  "Rejected",
    cancelled: "Cancelled",
};

function timeAgo(ms: number): string {
    const diff = Math.floor((Date.now() - ms) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
}

export default function LiveActivityFeed({
    entries,
    isConnected,
}: {
    entries: ActivityEntry[];
    isConnected: boolean;
}) {
    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.12)",
                background: "rgba(4,12,20,0.6)",
            }}
        >
            <div className="mb-3 flex items-center justify-between">
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    Live Activity Feed
                </p>
                <div className="flex items-center gap-1.5">
                    <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                            background: isConnected ? "rgba(80,210,120,0.9)" : "rgba(140,140,160,0.5)",
                            boxShadow: isConnected ? "0 0 6px rgba(80,210,120,0.6)" : "none",
                        }}
                    />
                    <span
                        className="text-[10px] uppercase tracking-[0.15em]"
                        style={{
                            color: isConnected ? "rgba(80,210,120,0.7)" : "rgba(140,140,160,0.5)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {isConnected ? "Live" : "Connecting..."}
                    </span>
                </div>
            </div>

            {entries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6">
                    <ArrowLeftRight
                        size={22}
                        className="mb-2"
                        style={{ color: "rgba(79,195,220,0.2)" }}
                    />
                    <p
                        className="text-[11px] uppercase tracking-[0.15em]"
                        style={{ color: "rgba(79,195,220,0.3)", fontFamily: "var(--font-mono)" }}
                    >
                        Waiting for activity...
                    </p>
                </div>
            ) : (
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                    {entries.map((entry) => {
                        const tx = entry.transaction;
                        const color = STATUS_COLOR[tx.status] ?? STATUS_COLOR.cancelled;
                        const label = STATUS_LABEL[tx.status] ?? tx.status;
                        const dirLabel = tx.direction === "member_to_org" ? "Sell" : "Buy";

                        return (
                            <div
                                key={entry.id}
                                className="flex items-center gap-2 rounded px-2 py-1.5"
                                style={{
                                    background: "rgba(79,195,220,0.03)",
                                    borderLeft: `2px solid ${color.replace("0.85", "0.4")}`,
                                    animation: "slide-in-left 0.2s ease forwards",
                                }}
                            >
                                <span
                                    className="w-16 shrink-0 text-[10px] uppercase tracking-[0.12em]"
                                    style={{ color, fontFamily: "var(--font-mono)" }}
                                >
                                    {label}
                                </span>
                                <span
                                    className="min-w-0 flex-1 truncate text-[11px]"
                                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-mono)" }}
                                >
                                    {tx.itemName}
                                </span>
                                <span
                                    className="shrink-0 text-[10px]"
                                    style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                                >
                                    {dirLabel} · {tx.memberUsername}
                                </span>
                                <span
                                    className="w-10 shrink-0 text-right text-[10px]"
                                    style={{ color: "rgba(200,220,232,0.25)", fontFamily: "var(--font-mono)" }}
                                >
                                    {timeAgo(entry.at)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
