import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { KpiSnapshot } from "@/lib/types/report";

function fmtCredits(n: number): string {
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
    return String(n);
}

function fmtDelta(delta: number, pct: number | null): string {
    const sign = delta >= 0 ? "+" : "";
    if (pct !== null) return `${sign}${pct}%`;
    return `${sign}${delta}`;
}

interface KpiCardProps {
    label: string;
    value: string;
    subvalue?: string;
    delta?: number;
    deltaPct?: number | null;
    positiveIsGood?: boolean;
}

function KpiCard({ label, value, subvalue, delta, deltaPct, positiveIsGood = true }: KpiCardProps) {
    const hasDelta = delta !== undefined && delta !== null;
    const isPositive = hasDelta && (positiveIsGood ? delta >= 0 : delta <= 0);
    const deltaText = hasDelta ? fmtDelta(delta, deltaPct ?? null) : null;

    return (
        <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{label}</Text>
            <Text style={styles.kpiValue}>{value}</Text>
            {subvalue ? <Text style={styles.kpiSubvalue}>{subvalue}</Text> : null}
            {deltaText ? (
                <View style={styles.kpiDeltaRow}>
                    <Text
                        style={
                            isPositive
                                ? styles.kpiDeltaPositive
                                : styles.kpiDeltaNegative
                        }
                    >
                        {isPositive ? "▲ " : "▼ "}
                        {deltaText} WoW
                    </Text>
                </View>
            ) : null}
        </View>
    );
}

interface KpiGridProps {
    kpi: KpiSnapshot;
}

export function KpiGrid({ kpi }: KpiGridProps) {
    const topItem = kpi.mostTradedItems[0];
    const topMember = kpi.mostActiveMembers[0];
    const largest = kpi.largestTransaction;

    return (
        <View>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionEyebrow}>KPI Summary</Text>
            </View>
            <View style={styles.kpiGrid}>
                <KpiCard
                    label="Total Transactions"
                    value={String(kpi.totalTransactions)}
                    delta={kpi.prevWeek?.totalTransactionsDelta}
                    deltaPct={kpi.prevWeek?.totalTransactionsDeltaPct}
                />
                <KpiCard
                    label="Net Credits (aUEC)"
                    value={fmtCredits(kpi.netCredits)}
                    subvalue={`+${fmtCredits(kpi.totalCreditsEarned)} earned / -${fmtCredits(kpi.totalCreditsSpent)} spent`}
                    delta={kpi.prevWeek?.netCreditsDelta}
                    deltaPct={kpi.prevWeek?.netCreditsDeltaPct}
                />
                <KpiCard
                    label="Org aUEC Pool Delta"
                    value={`${kpi.orgAuecNetChange >= 0 ? "+" : ""}${fmtCredits(kpi.orgAuecNetChange)}`}
                    subvalue={`${kpi.totalAuecTransactions} aUEC desk txns`}
                    positiveIsGood={true}
                />
                <KpiCard
                    label="Largest Trade"
                    value={largest ? fmtCredits(largest.totalPrice) : "—"}
                    subvalue={largest ? `${largest.itemName} · ${largest.memberUsername}` : "No completed trades"}
                />
                <KpiCard
                    label="Top Traded Item"
                    value={topItem ? topItem.name : "—"}
                    subvalue={topItem ? `${topItem.totalQuantity.toLocaleString()} units · ${topItem.transactionCount} trades` : "No data"}
                />
                <KpiCard
                    label="Most Active Member"
                    value={topMember ? topMember.username : "—"}
                    subvalue={topMember ? `${topMember.transactionCount} trades · ${fmtCredits(topMember.totalCredits)} aUEC` : "No data"}
                />
            </View>
        </View>
    );
}
