import React from "react";
import { View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import type { OrganizationTransactionDocument } from "@/lib/types/transaction";

const MAX_ROWS = 500;

function fmtDate(d: Date): string {
    return d.toUTCString().slice(5, 16); // "DD Mon YYYY"
}

function truncate(s: string, len: number): string {
    return s.length > len ? s.slice(0, len - 1) + "…" : s;
}

interface TransactionTableProps {
    transactions: OrganizationTransactionDocument[];
}

export function TransactionTable({ transactions }: TransactionTableProps) {
    const truncated = transactions.length > MAX_ROWS;
    const rows = truncated ? transactions.slice(0, MAX_ROWS) : transactions;

    return (
        <View style={styles.section}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionEyebrow}>
                    Transaction Log — {transactions.length} records
                    {truncated ? ` (showing first ${MAX_ROWS})` : ""}
                </Text>
            </View>

            {transactions.length === 0 ? (
                <Text style={{ ...styles.tableCellMuted, paddingTop: 4 }}>
                    No completed transactions this week.
                </Text>
            ) : (
                <View style={styles.table}>
                    {/* Header */}
                    <View style={styles.tableHeaderRow}>
                        <Text style={{ ...styles.tableHeaderCell, width: "13%" }}>Date</Text>
                        <Text style={{ ...styles.tableHeaderCell, width: "14%" }}>Member</Text>
                        <Text style={{ ...styles.tableHeaderCell, width: "7%" }}>Type</Text>
                        <Text style={{ ...styles.tableHeaderCell, width: "22%" }}>Item</Text>
                        <Text style={{ ...styles.tableHeaderCell, width: "8%", textAlign: "right" }}>Qty</Text>
                        <Text style={{ ...styles.tableHeaderCell, width: "16%", textAlign: "right" }}>Unit Price</Text>
                        <Text style={{ ...styles.tableHeaderCell, width: "20%", textAlign: "right" }}>Total</Text>
                    </View>

                    {/* Rows */}
                    {rows.map((tx, idx) => {
                        const isSell = tx.direction === "member_to_org";
                        const date = tx.updatedAt instanceof Date ? tx.updatedAt : new Date(tx.updatedAt);
                        return (
                            <View
                                key={tx._id.toString()}
                                style={[
                                    styles.tableRow,
                                    idx % 2 === 0 ? styles.tableRowEven : styles.tableRowOdd,
                                ]}
                            >
                                <Text style={{ ...styles.tableCellMuted, width: "13%", fontSize: 6.5 }}>
                                    {fmtDate(date)}
                                </Text>
                                <Text style={{ ...styles.tableCell, width: "14%" }}>
                                    {truncate(tx.memberUsername, 12)}
                                </Text>
                                <Text
                                    style={{
                                        width: "7%",
                                        fontFamily: "Courier-Bold",
                                        fontSize: 6,
                                        color: isSell ? "#4ade80" : "#f87171",
                                        textTransform: "uppercase",
                                        letterSpacing: 0.5,
                                    }}
                                >
                                    {isSell ? "SELL" : "BUY"}
                                </Text>
                                <Text style={{ ...styles.tableCell, width: "22%" }}>
                                    {truncate(tx.itemName, 22)}
                                </Text>
                                <Text style={{ ...styles.tableCell, width: "8%", textAlign: "right" }}>
                                    {tx.quantity.toLocaleString()}
                                </Text>
                                <Text style={{ ...styles.tableCellMuted, width: "16%", textAlign: "right" }}>
                                    {tx.pricePerUnit.toLocaleString()}
                                </Text>
                                <Text style={{ ...styles.tableCellBold, width: "20%", textAlign: "right" }}>
                                    {tx.totalPrice.toLocaleString()}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}

            {truncated && (
                <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                        ⚠  Table truncated at {MAX_ROWS} rows ({transactions.length - MAX_ROWS} additional records not shown).
                        Full data is available via CSV export on the Inventory page.
                    </Text>
                </View>
            )}
        </View>
    );
}
