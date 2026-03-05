import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { KpiSnapshot } from "@/lib/types/report";

function fmtCredits(n: number): string {
    if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M aUEC`;
    if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}K aUEC`;
    return `${n} aUEC`;
}

interface TopItemsTableProps {
    items: KpiSnapshot["mostTradedItems"];
}

export function TopItemsTable({ items }: TopItemsTableProps) {
    if (items.length === 0) {
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEyebrow}>Top Traded Items</Text>
                </View>
                <Text style={{ ...styles.tableCellMuted, paddingTop: 4 }}>
                    No completed item trades this week.
                </Text>
            </View>
        );
    }

    const maxQty = Math.max(...items.map((i) => i.totalQuantity), 1);

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionEyebrow}>Top Traded Items</Text>
            </View>
            <View style={styles.table}>
                {/* Header */}
                <View style={styles.tableHeaderRow}>
                    <Text style={{ ...styles.tableHeaderCell, width: "32%" }}>Item</Text>
                    <Text style={{ ...styles.tableHeaderCell, width: "14%", textAlign: "right" }}>Qty</Text>
                    <Text style={{ ...styles.tableHeaderCell, width: "14%", textAlign: "right" }}>Trades</Text>
                    <Text style={{ ...styles.tableHeaderCell, width: "22%", textAlign: "right" }}>Net Credits</Text>
                    <Text style={{ ...styles.tableHeaderCell, width: "18%" }}>Volume</Text>
                </View>

                {/* Rows */}
                {items.map((item, idx) => {
                    const barWidth = Math.round((item.totalQuantity / maxQty) * 14);
                    const bar = "█".repeat(barWidth) + "░".repeat(14 - barWidth);
                    return (
                        <View
                            key={item.name}
                            style={[
                                styles.tableRow,
                                idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                            ]}
                        >
                            <Text style={{ ...styles.tableCellBold, width: "32%" }}>{item.name}</Text>
                            <Text style={{ ...styles.tableCell, width: "14%", textAlign: "right" }}>
                                {item.totalQuantity.toLocaleString()}
                            </Text>
                            <Text style={{ ...styles.tableCellMuted, width: "14%", textAlign: "right" }}>
                                {item.transactionCount}
                            </Text>
                            <Text
                                style={{
                                    ...(item.netCredits >= 0
                                        ? styles.tableCellPositive
                                        : styles.tableCellNegative),
                                    width: "22%",
                                    textAlign: "right",
                                }}
                            >
                                {item.netCredits >= 0 ? "+" : ""}
                                {fmtCredits(item.netCredits)}
                            </Text>
                            <Text style={{ ...styles.tableCellMuted, width: "18%", fontSize: 6 }}>
                                {bar}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

interface TopMembersTableProps {
    members: KpiSnapshot["mostActiveMembers"];
}

export function TopMembersTable({ members }: TopMembersTableProps) {
    if (members.length === 0) {
        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionEyebrow}>Most Active Members</Text>
                </View>
                <Text style={{ ...styles.tableCellMuted, paddingTop: 4 }}>
                    No member activity this week.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionEyebrow}>Most Active Members</Text>
            </View>
            <View style={styles.table}>
                <View style={styles.tableHeaderRow}>
                    <Text style={{ ...styles.tableHeaderCell, width: "8%" }}>#</Text>
                    <Text style={{ ...styles.tableHeaderCell, width: "40%" }}>Member</Text>
                    <Text style={{ ...styles.tableHeaderCell, width: "22%", textAlign: "right" }}>Trades</Text>
                    <Text style={{ ...styles.tableHeaderCell, width: "30%", textAlign: "right" }}>Total Credits</Text>
                </View>
                {members.map((member, idx) => (
                    <View
                        key={member.userId}
                        style={[
                            styles.tableRow,
                            idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                        ]}
                    >
                        <Text style={{ ...styles.tableCellMuted, width: "8%" }}>{idx + 1}</Text>
                        <Text style={{ ...styles.tableCellBold, width: "40%" }}>{member.username}</Text>
                        <Text style={{ ...styles.tableCell, width: "22%", textAlign: "right" }}>
                            {member.transactionCount}
                        </Text>
                        <Text style={{ ...styles.tableCell, width: "30%", textAlign: "right" }}>
                            {fmtCredits(member.totalCredits)}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
}
