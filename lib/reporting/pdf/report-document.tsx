import React from "react";
import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles } from "./styles";
import { CoverSection } from "./cover-section";
import { KpiGrid } from "./kpi-grid";
import { TopItemsTable, TopMembersTable } from "./top-items-table";
import { TransactionTable } from "./transaction-table";
import type { KpiSnapshot } from "@/lib/types/report";
import type { OrganizationTransactionDocument } from "@/lib/types/transaction";

interface ReportDocumentProps {
    orgName: string;
    weekStart: string;
    weekEnd: string;
    weekLabel: string;
    timezone: string;
    generatedAt: string;
    kpi: KpiSnapshot;
    transactions: OrganizationTransactionDocument[];
}

function Footer({ orgName, weekLabel }: { orgName: string; weekLabel: string }) {
    return (
        <View style={styles.footer} fixed>
            <Text style={styles.footerText}>
                {orgName.toUpperCase()}  ·  {weekLabel}
            </Text>
            <Text style={styles.footerText}>SCOIM.IO — Confidential</Text>
            <Text
                style={styles.footerText}
                render={({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
                    `Page ${pageNumber} / ${totalPages}`
                }
            />
        </View>
    );
}

export function ReportDocument({
    orgName,
    weekStart,
    weekEnd,
    weekLabel,
    timezone,
    generatedAt,
    kpi,
    transactions,
}: ReportDocumentProps) {
    return (
        <Document
            title={`${orgName} — Weekly Report ${weekLabel}`}
            author="SCOIM.io"
            subject="Weekly Operations Report"
            creator="SCOIM.io Reporting"
        >
            {/* Page 1: Cover + KPIs + Top Items + Top Members */}
            <Page size="A4" style={styles.page}>
                <CoverSection
                    orgName={orgName}
                    weekStart={weekStart}
                    weekEnd={weekEnd}
                    weekLabel={weekLabel}
                    generatedAt={generatedAt}
                    timezone={timezone}
                />

                <View style={styles.section}>
                    <KpiGrid kpi={kpi} />
                </View>

                <View style={styles.accentLine} />

                <TopItemsTable items={kpi.mostTradedItems} />

                <TopMembersTable members={kpi.mostActiveMembers} />

                <Footer orgName={orgName} weekLabel={weekLabel} />
            </Page>

            {/* Page 2+: Transaction log */}
            <Page size="A4" style={styles.page}>
                <View style={{ paddingTop: 24 }}>
                    <TransactionTable transactions={transactions} />
                </View>
                <Footer orgName={orgName} weekLabel={weekLabel} />
            </Page>
        </Document>
    );
}
