import { ObjectId } from "mongodb";
import { getGoogleAccessToken } from "./auth";
import { getOrganizationInventoryItemViewsByOrganizationId } from "@/lib/repositories/organization-inventory-item-repository";
import { setOrgGoogleSheetLastSynced } from "@/lib/repositories/organization-repository";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

async function sheetsRequest(
    token: string,
    method: string,
    url: string,
    body?: unknown
): Promise<Response> {
    return fetch(url, {
        method,
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: body ? JSON.stringify(body) : undefined,
    });
}

function extractSheetId(input: string): string {
    // Accept full URL or bare sheet ID
    const match = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : input.trim();
}

export async function syncInventoryToSheet(
    orgId: ObjectId,
    sheetIdOrUrl: string
): Promise<void> {
    const sheetId = extractSheetId(sheetIdOrUrl);
    const token = await getGoogleAccessToken();

    // Fetch all items
    const items = await getOrganizationInventoryItemViewsByOrganizationId(orgId);

    // Same format as the CSV import template
    const header = ["name", "buyPrice", "sellPrice", "quantity", "minStock", "maxStock"];
    const rows: (string | number)[][] = [header];

    for (const item of items) {
        rows.push([
            item.name,
            item.buyPrice,
            item.sellPrice,
            item.quantity,
            item.minStock ?? "",
            item.maxStock ?? "",
        ]);
    }

    // Clear the first tab (no sheet name prefix = default/first tab)
    const clearRes = await sheetsRequest(
        token,
        "POST",
        `${SHEETS_API}/${sheetId}/values/A1:Z10000:clear`
    );

    if (!clearRes.ok) {
        if (clearRes.status === 403 || clearRes.status === 404) {
            const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "the service account";
            throw new Error(
                `Cannot access the sheet. Make sure it is shared with "${email}" (Editor access) and the URL is correct.`
            );
        }
        const body = await clearRes.text();
        throw new Error(`Failed to clear sheet: ${clearRes.status} — ${body}`);
    }

    // Write all rows (always at least the header)
    const writeRes = await sheetsRequest(
        token,
        "PUT",
        `${SHEETS_API}/${sheetId}/values/A1?valueInputOption=RAW`,
        { range: "A1", majorDimension: "ROWS", values: rows }
    );

    if (!writeRes.ok) {
        const body = await writeRes.text();
        throw new Error(`Failed to write to sheet: ${writeRes.status} — ${body}`);
    }

    await setOrgGoogleSheetLastSynced(orgId);
}
