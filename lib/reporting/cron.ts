import cron from "node-cron";
import { getDb } from "@/lib/db";
import { createReportDoc, getReportByWeekLabel } from "@/lib/repositories/report-repository";
import { processReport } from "./process-report";
import { getPreviousWeekBoundaries } from "./week-utils";
import type { OrganizationDocument } from "@/lib/types/organization";

declare global {
     
    var __reportingCronStarted: boolean | undefined;
}

/**
 * Start the weekly report cron (Monday 02:00 UTC).
 * Uses a global flag so it only runs once even under Next.js hot-reloads.
 */
export function startReportingCron() {
    if (global.__reportingCronStarted) return;
    global.__reportingCronStarted = true;

    // Every Monday at 02:00 UTC
    cron.schedule(
        "0 2 * * 1",
        async () => {
            console.log("[Reporting Cron] Monday trigger — scanning PRO orgs...");
            try {
                await runScheduledReports();
            } catch (err) {
                console.error("[Reporting Cron] Fatal error in runScheduledReports:", err);
            }
        },
        { timezone: "UTC" }
    );

    console.log("[Reporting Cron] Scheduled — runs every Monday 02:00 UTC");
}

async function runScheduledReports() {
    const db = await getDb();

    // Find all PRO orgs (active subscription or admin override)
    const proOrgs = await db
        .collection<OrganizationDocument>("organizations")
        .find({
            $or: [
                { "subscription.status": { $in: ["active", "trialing"] } },
                { "proOverride.enabled": true },
            ],
        })
        .toArray();

    if (proOrgs.length === 0) {
        console.log("[Reporting Cron] No PRO orgs found, nothing to do.");
        return;
    }

    console.log(`[Reporting Cron] Processing ${proOrgs.length} PRO org(s)...`);

    // Process in batches of 5 to limit memory pressure
    const BATCH = 5;
    for (let i = 0; i < proOrgs.length; i += BATCH) {
        const batch = proOrgs.slice(i, i + BATCH);
        await Promise.all(
            batch.map(async (org) => {
                try {
                    const tz = org.timezone ?? "UTC";
                    const { weekStart, weekEnd, weekLabel } = getPreviousWeekBoundaries(tz);

                    // Skip if already successfully generated
                    const existing = await getReportByWeekLabel(org._id, weekLabel);
                    if (existing?.status === "ready") {
                        console.log(`[Reporting Cron] ${org.slug} — ${weekLabel} already ready, skip.`);
                        return;
                    }

                    // Reuse existing doc if it's in a failed/pending state, else create
                    let reportId: string;
                    if (existing && existing.status !== "generating") {
                        reportId = existing._id.toString();
                        // Reset for re-processing if it failed
                        if (existing.status === "failed") {
                            const { default: col } = await import("@/lib/db").then(
                                async (m) => ({ default: (await m.getDb()).collection("organization_reports") })
                            );
                            await col.updateOne(
                                { _id: existing._id },
                                { $set: { status: "pending", errorMessage: null } }
                            );
                        }
                    } else {
                        reportId = await createReportDoc({
                            organizationId: org._id,
                            organizationSlug: org.slug,
                            weekStart,
                            weekEnd,
                            weekLabel,
                            timezone: tz,
                            createdBy: "scheduler",
                        });
                    }

                    console.log(`[Reporting Cron] ${org.slug} — queuing ${weekLabel}...`);
                    processReport(reportId).catch((err) => {
                        console.error(`[Reporting Cron] ${org.slug} — processReport error:`, err);
                    });
                } catch (err) {
                    console.error(`[Reporting Cron] Error for org ${org.slug}:`, err);
                }
            })
        );
    }
}
