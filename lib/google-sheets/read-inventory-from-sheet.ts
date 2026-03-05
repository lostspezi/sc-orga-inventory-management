import { getGoogleAccessToken } from "./auth";
import type { ImportRowInput } from "@/lib/types/import-job";

const SHEETS_API = "https://sheets.googleapis.com/v4/spreadsheets";

function parseNum(val: string | undefined): number | undefined {
    if (!val || val.trim() === "" || val.trim() === "—") return undefined;
    const n = Number(val.trim());
    return Number.isFinite(n) ? n : undefined;
}

export async function readInventoryFromSheet(sheetId: string): Promise<ImportRowInput[]> {
    const token = await getGoogleAccessToken();

    const res = await fetch(
        `${SHEETS_API}/${sheetId}/values/A1:F10000`,
        { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) {
        if (res.status === 403 || res.status === 404) {
            const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "the service account";
            throw new Error(
                `Cannot access the sheet. Make sure it is shared with "${email}" (Editor access) and the URL is correct.`
            );
        }
        const body = await res.text();
        throw new Error(`Failed to read sheet: ${res.status} — ${body}`);
    }

    const data = await res.json() as { values?: string[][] };
    const rows = data.values ?? [];

    if (rows.length < 2) return [];

    // Row 0 = headers — resolve column indices by name (same as CSV import)
    const headers = rows[0].map((h) => h.trim().toLowerCase());
    const col = (name: string) => headers.indexOf(name);

    const nameIdx     = col("name");
    const buyIdx      = col("buyprice");
    const sellIdx     = col("sellprice");
    const qtyIdx      = col("quantity");
    const minIdx      = col("minstock");
    const maxIdx      = col("maxstock");

    if (nameIdx === -1) {
        throw new Error('Sheet is missing a "name" column header.');
    }

    return rows.slice(1).flatMap((row): ImportRowInput[] => {
        const name = row[nameIdx]?.trim();
        if (!name) return [];
        return [{
            name,
            buyPrice:  buyIdx  !== -1 ? parseNum(row[buyIdx])  : undefined,
            sellPrice: sellIdx !== -1 ? parseNum(row[sellIdx]) : undefined,
            quantity:  qtyIdx  !== -1 ? (parseNum(row[qtyIdx]) ?? 0) : 0,
            minStock:  minIdx  !== -1 ? parseNum(row[minIdx])  : undefined,
            maxStock:  maxIdx  !== -1 ? parseNum(row[maxIdx])  : undefined,
        }];
    });
}
