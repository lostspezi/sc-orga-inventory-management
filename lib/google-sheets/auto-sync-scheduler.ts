import { getDb } from "@/lib/db";
import { readInventoryFromSheet } from "./read-inventory-from-sheet";
import { syncInventoryToSheet } from "./sync-inventory-to-sheet";
import { createImportJob } from "@/lib/repositories/import-job-repository";
import { processImportJob } from "@/lib/inventory-import/process-import-job";
import type { OrganizationDocument } from "@/lib/types/organization";

const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes
const SYSTEM_USER_ID = "system";
const SYSTEM_USERNAME = "Auto-Sync";

declare global {
     
    var __sheetSyncStarted: boolean | undefined;
}

async function runSyncForOrg(org: OrganizationDocument): Promise<void> {
    if (!org.googleSheetId) return;

    let rows;
    try {
        rows = await readInventoryFromSheet(org.googleSheetId);
    } catch (err) {
        console.error(`[SheetSync] Failed to read sheet for org "${org.slug}":`, err);
        return;
    }

    if (rows.length === 0) {
        // Sheet is empty → push org inventory to sheet
        await syncInventoryToSheet(org._id, org.googleSheetId);
        return;
    }

    // Sheet has rows → import into org, then push final state back (handled inside processImportJob)
    const job = await createImportJob({
        organizationId: org._id,
        organizationSlug: org.slug,
        initiatedByUserId: SYSTEM_USER_ID,
        initiatedByUsername: SYSTEM_USERNAME,
        rows,
    });

    await processImportJob(job._id, rows, org, SYSTEM_USER_ID, SYSTEM_USERNAME);
}

async function runSyncForAllOrgs(): Promise<void> {
    const db = await getDb();
    const orgs = await db
        .collection<OrganizationDocument>("organizations")
        .find({ googleSheetId: { $exists: true, $ne: "" } })
        .toArray();

    for (const org of orgs) {
        try {
            await runSyncForOrg(org);
        } catch (err) {
            console.error(`[SheetSync] Auto-sync failed for org "${org.slug}":`, err);
        }
    }
}

export function startGoogleSheetAutoSync(): void {
    if (global.__sheetSyncStarted) return;
    global.__sheetSyncStarted = true;

    if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY) {
        return;
    }

    setInterval(() => {
        runSyncForAllOrgs().catch((err) => {
            console.error("[SheetSync] Scheduler error:", err);
        });
    }, INTERVAL_MS);
}
