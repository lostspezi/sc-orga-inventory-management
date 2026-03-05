import { ObjectId } from "mongodb";

export type ReportStatus = "pending" | "generating" | "ready" | "failed";

export interface TopTradedItem {
    name: string;
    totalQuantity: number;
    transactionCount: number;
    netCredits: number;
}

export interface TopMember {
    userId: string;
    username: string;
    transactionCount: number;
    totalCredits: number;
}

export interface InventoryChange {
    itemName: string;
    stockIn: number;
    stockOut: number;
    netDelta: number;
}

export interface LargestTransaction {
    transactionId: string;
    itemName: string;
    quantity: number;
    totalPrice: number;
    memberUsername: string;
    direction: "member_to_org" | "org_to_member";
    date: string; // ISO
}

export interface KpiSnapshot {
    // Volume
    totalTransactions: number;

    // Credit flow
    totalCreditsEarned: number;   // SUM(totalPrice) WHERE direction="member_to_org"
    totalCreditsSpent: number;    // SUM(totalPrice) WHERE direction="org_to_member"
    netCredits: number;           // earned - spent
    orgAuecNetChange: number;     // net change to org's aUEC pool this week

    // Highlights
    largestTransaction: LargestTransaction | null;

    // Rankings
    mostTradedItems: TopTradedItem[];    // top 5
    mostActiveMembers: TopMember[];      // top 5

    // Inventory movement
    inventoryChanges: InventoryChange[];

    // aUEC desk
    totalAuecTransactions: number;
    totalAuecVolume: number;

    // Week-over-week (null if no prior week snapshot available)
    prevWeek: {
        totalTransactionsDelta: number;
        totalTransactionsDeltaPct: number | null;
        netCreditsDelta: number;
        netCreditsDeltaPct: number | null;
    } | null;

    // Raw counts for transparency
    totalRawTransactionDocs: number;

    computedAt: string; // ISO
}

export interface OrgReportDocument {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;

    // Week boundaries (UTC)
    weekStart: Date;
    weekEnd: Date;
    weekLabel: string; // e.g. "2026-W10"
    timezone: string;  // IANA, copied from org at creation, default "UTC"

    status: ReportStatus;
    version: number; // starts at 1, increments on regeneration

    createdAt: Date;
    createdBy: string;  // userId or "scheduler"
    generatedAt: Date | null;

    // Storage
    fileId: string | null;    // GridFS ObjectId string
    fileSize: number | null;  // bytes
    checksum: string | null;  // SHA-256 hex

    // KPI snapshot frozen at generation time
    kpiSnapshot: KpiSnapshot | null;

    // Error handling
    errorMessage: string | null;
    retryCount: number;
}

export interface OrgReportView {
    reportId: string;
    organizationId: string;
    weekStart: string;
    weekEnd: string;
    weekLabel: string;
    timezone: string;
    status: ReportStatus;
    version: number;
    createdAt: string;
    createdBy: string;
    generatedAt: string | null;
    fileSize: number | null;
    kpiSnapshot: KpiSnapshot | null;
    errorMessage: string | null;
    retryCount: number;
}
