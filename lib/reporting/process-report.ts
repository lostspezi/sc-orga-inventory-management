import crypto from "crypto";
import { getDb } from "@/lib/db";
import { getOrganizationById } from "@/lib/repositories/organization-repository";
import {
    getReportById,
    claimReportForProcessing,
    completeReport,
    failReport,
    getPreviousWeekReport,
} from "@/lib/repositories/report-repository";
import { computeKpis } from "./compute-kpis";
import { generateReportPdf } from "./generate-pdf";
import { uploadReportPdf, deleteReportPdf } from "./storage";
import { notify, notifyMany } from "@/lib/notify";
import type { OrganizationTransactionDocument } from "@/lib/types/transaction";

export async function processReport(reportId: string): Promise<void> {
    // Atomic claim — prevents double-processing
    const claimed = await claimReportForProcessing(reportId);
    if (!claimed) {
        console.log(`[Reporting] Report ${reportId} already being processed or not pending, skipping.`);
        return;
    }

    try {
        const report = await getReportById(reportId);
        if (!report) throw new Error(`Report ${reportId} not found in DB`);

        const org = await getOrganizationById(report.organizationId.toString());
        if (!org) throw new Error(`Org ${report.organizationId} not found`);

        // --- 1. Fetch transactions for the week ---
        const db = await getDb();
        const transactions = await db
            .collection<OrganizationTransactionDocument>("organization_transactions")
            .find({
                organizationId: report.organizationId,
                status: "completed",
                updatedAt: { $gte: report.weekStart, $lte: report.weekEnd },
            })
            .sort({ updatedAt: 1 })
            .toArray();

        // --- 2. Fetch previous week's snapshot for WoW comparison ---
        const prevReport = await getPreviousWeekReport(report.organizationId, report.weekStart);

        // --- 3. Compute KPIs ---
        const kpiSnapshot = await computeKpis(
            db,
            report.organizationId,
            report.weekStart,
            report.weekEnd,
            prevReport?.kpiSnapshot ?? null
        );

        // --- 4. Render PDF ---
        const now = new Date().toISOString();
        const pdfBuffer = await generateReportPdf({
            orgName: org.name,
            weekStart: report.weekStart.toISOString(),
            weekEnd: report.weekEnd.toISOString(),
            weekLabel: report.weekLabel,
            timezone: report.timezone,
            generatedAt: now,
            kpi: kpiSnapshot,
            transactions,
        });

        // --- 5. Compute checksum ---
        const checksum = crypto.createHash("sha256").update(pdfBuffer).digest("hex");

        // --- 6. Delete old file if regenerating ---
        if (report.fileId) {
            await deleteReportPdf(report.fileId);
        }

        // --- 7. Upload to GridFS ---
        const fileId = await uploadReportPdf(
            report.organizationId.toString(),
            report.weekLabel,
            report.version,
            pdfBuffer
        );

        // --- 8. Mark ready ---
        await completeReport(reportId, {
            fileId,
            fileSize: pdfBuffer.length,
            checksum,
            kpiSnapshot,
        });

        console.log(
            `[Reporting] Report ${reportId} (${report.weekLabel}) for org ${org.slug} completed. ` +
            `${pdfBuffer.length} bytes, ${transactions.length} transactions.`
        );

        // --- 9. Notify ---
        const link = `/terminal/orgs/${org.slug}/reports`;
        if (report.createdBy !== "scheduler") {
            await notify(
                report.createdBy,
                "report.ready",
                "Weekly Report Ready",
                `Your report for ${report.weekLabel} is ready to download.`,
                link
            );
        } else {
            // Notify all admins/owners
            const adminIds = org.members
                .filter((m) => ["owner", "admin"].includes(m.role))
                .map((m) => m.userId);
            if (adminIds.length > 0) {
                await notifyMany(
                    adminIds,
                    "report.ready",
                    "Weekly Report Ready",
                    `The automated report for ${report.weekLabel} is available.`,
                    link
                );
            }
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Reporting] Report ${reportId} failed:`, message);
        await failReport(reportId, message);

        // On scheduler-triggered failure, notify admins after max retries
        try {
            const report = await getReportById(reportId);
            if (report && report.createdBy === "scheduler" && report.retryCount >= 3) {
                const org = await getOrganizationById(report.organizationId.toString());
                if (org) {
                    const adminIds = org.members
                        .filter((m) => ["owner", "admin"].includes(m.role))
                        .map((m) => m.userId);
                    if (adminIds.length > 0) {
                        await notifyMany(
                            adminIds,
                            "report.failed",
                            "Weekly Report Failed",
                            `Report generation for ${report.weekLabel} failed after 3 attempts. Please regenerate manually.`,
                            `/terminal/orgs/${org.slug}/reports`
                        );
                    }
                }
            }
        } catch {
            // Don't let notification failure mask the original error
        }
    }
}
