import { ObjectId } from "mongodb";
import { syncInventoryToSheet } from "./sync-inventory-to-sheet";

/**
 * Fire-and-forget sync. Errors are logged but not surfaced.
 */
export function triggerGoogleSheetSync(orgId: ObjectId, sheetId: string): void {
    syncInventoryToSheet(orgId, sheetId).catch((err) => {
        console.error("[GoogleSheets] sync failed for org", orgId.toString(), err);
    });
}
