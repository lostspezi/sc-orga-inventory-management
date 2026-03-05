import { ObjectId, Db } from "mongodb";
import type { KpiSnapshot, TopTradedItem, TopMember, InventoryChange, LargestTransaction } from "@/lib/types/report";

/**
 * Compute all KPIs for a given week using MongoDB aggregation pipelines.
 * This is the main KPI engine — all reads from DB, no in-memory arrays.
 */
export async function computeKpis(
    db: Db,
    organizationId: ObjectId,
    weekStart: Date,
    weekEnd: Date,
    prevKpiSnapshot: KpiSnapshot | null
): Promise<KpiSnapshot> {
    const txFilter = {
        organizationId,
        status: "completed",
        updatedAt: { $gte: weekStart, $lte: weekEnd },
    };
    const auecFilter = {
        organizationId,
        status: "completed",
        updatedAt: { $gte: weekStart, $lte: weekEnd },
    };

    const [
        totalsResult,
        topItemsResult,
        topMembersResult,
        largestResult,
        inventoryResult,
        auecResult,
        rawCount,
    ] = await Promise.all([
        // 1. Credit totals per direction
        db.collection("organization_transactions").aggregate([
            { $match: txFilter },
            {
                $group: {
                    _id: "$direction",
                    total: { $sum: "$totalPrice" },
                    count: { $sum: 1 },
                },
            },
        ]).toArray(),

        // 2. Top traded items (by quantity)
        db.collection("organization_transactions").aggregate([
            { $match: txFilter },
            {
                $group: {
                    _id: "$itemName",
                    totalQuantity: { $sum: "$quantity" },
                    transactionCount: { $sum: 1 },
                    earned: {
                        $sum: {
                            $cond: [{ $eq: ["$direction", "member_to_org"] }, "$totalPrice", 0],
                        },
                    },
                    spent: {
                        $sum: {
                            $cond: [{ $eq: ["$direction", "org_to_member"] }, "$totalPrice", 0],
                        },
                    },
                },
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
        ]).toArray(),

        // 3. Most active members
        db.collection("organization_transactions").aggregate([
            { $match: txFilter },
            {
                $group: {
                    _id: { memberId: "$memberId", memberUsername: "$memberUsername" },
                    transactionCount: { $sum: 1 },
                    totalCredits: { $sum: "$totalPrice" },
                },
            },
            { $sort: { transactionCount: -1 } },
            { $limit: 5 },
        ]).toArray(),

        // 4. Largest single transaction
        db.collection("organization_transactions").aggregate([
            { $match: txFilter },
            { $sort: { totalPrice: -1 } },
            { $limit: 1 },
        ]).toArray(),

        // 5. Inventory stock movement per item
        db.collection("organization_transactions").aggregate([
            { $match: txFilter },
            {
                $group: {
                    _id: "$itemName",
                    stockIn: {
                        $sum: {
                            $cond: [{ $eq: ["$direction", "member_to_org"] }, "$quantity", 0],
                        },
                    },
                    stockOut: {
                        $sum: {
                            $cond: [{ $eq: ["$direction", "org_to_member"] }, "$quantity", 0],
                        },
                    },
                },
            },
            { $match: { $or: [{ stockIn: { $gt: 0 } }, { stockOut: { $gt: 0 } }] } },
            { $sort: { _id: 1 } },
        ]).toArray(),

        // 6. aUEC transactions
        db.collection("organization_auec_transactions").aggregate([
            { $match: auecFilter },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    totalVolume: { $sum: "$auecAmount" },
                    netOrgChange: {
                        $sum: {
                            $cond: [
                                { $eq: ["$direction", "member_to_org"] },
                                "$auecAmount",
                                { $multiply: ["$auecAmount", -1] },
                            ],
                        },
                    },
                },
            },
        ]).toArray(),

        // 7. Raw transaction count (any status)
        db.collection("organization_transactions").countDocuments({
            organizationId,
            updatedAt: { $gte: weekStart, $lte: weekEnd },
        }),
    ]);

    // --- Parse totals ---
    let totalCreditsEarned = 0;
    let totalCreditsSpent = 0;
    let totalTransactions = 0;
    for (const row of totalsResult) {
        if (row._id === "member_to_org") {
            totalCreditsEarned = row.total ?? 0;
            totalTransactions += row.count ?? 0;
        } else if (row._id === "org_to_member") {
            totalCreditsSpent = row.total ?? 0;
            totalTransactions += row.count ?? 0;
        }
    }
    const netCredits = totalCreditsEarned - totalCreditsSpent;

    // --- Top items ---
    const mostTradedItems: TopTradedItem[] = topItemsResult.map((r) => ({
        name: r._id as string,
        totalQuantity: r.totalQuantity ?? 0,
        transactionCount: r.transactionCount ?? 0,
        netCredits: (r.earned ?? 0) - (r.spent ?? 0),
    }));

    // --- Top members ---
    const mostActiveMembers: TopMember[] = topMembersResult.map((r) => ({
        userId: (r._id as { memberId: string }).memberId,
        username: (r._id as { memberUsername: string }).memberUsername,
        transactionCount: r.transactionCount ?? 0,
        totalCredits: r.totalCredits ?? 0,
    }));

    // --- Largest transaction ---
    let largestTransaction: LargestTransaction | null = null;
    if (largestResult.length > 0) {
        const t = largestResult[0];
        largestTransaction = {
            transactionId: t._id.toString(),
            itemName: t.itemName ?? "",
            quantity: t.quantity ?? 0,
            totalPrice: t.totalPrice ?? 0,
            memberUsername: t.memberUsername ?? "",
            direction: t.direction,
            date: (t.updatedAt as Date)?.toISOString() ?? new Date().toISOString(),
        };
    }

    // --- Inventory changes ---
    const inventoryChanges: InventoryChange[] = inventoryResult.map((r) => ({
        itemName: r._id as string,
        stockIn: r.stockIn ?? 0,
        stockOut: r.stockOut ?? 0,
        netDelta: (r.stockIn ?? 0) - (r.stockOut ?? 0),
    }));

    // --- aUEC ---
    const auecRow = auecResult[0] ?? null;
    const totalAuecTransactions = auecRow?.count ?? 0;
    const totalAuecVolume = auecRow?.totalVolume ?? 0;
    const orgAuecNetChange = auecRow?.netOrgChange ?? 0;

    // --- Week-over-week ---
    let prevWeek: KpiSnapshot["prevWeek"] = null;
    if (prevKpiSnapshot) {
        const txDelta = totalTransactions - prevKpiSnapshot.totalTransactions;
        const netDelta = netCredits - prevKpiSnapshot.netCredits;
        prevWeek = {
            totalTransactionsDelta: txDelta,
            totalTransactionsDeltaPct:
                prevKpiSnapshot.totalTransactions > 0
                    ? Math.round((txDelta / prevKpiSnapshot.totalTransactions) * 100)
                    : null,
            netCreditsDelta: netDelta,
            netCreditsDeltaPct:
                prevKpiSnapshot.netCredits !== 0
                    ? Math.round((netDelta / Math.abs(prevKpiSnapshot.netCredits)) * 100)
                    : null,
        };
    }

    return {
        totalTransactions,
        totalCreditsEarned,
        totalCreditsSpent,
        netCredits,
        orgAuecNetChange,
        largestTransaction,
        mostTradedItems,
        mostActiveMembers,
        inventoryChanges,
        totalAuecTransactions,
        totalAuecVolume,
        prevWeek,
        totalRawTransactionDocs: rawCount,
        computedAt: new Date().toISOString(),
    };
}
