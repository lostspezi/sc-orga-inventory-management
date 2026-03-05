import { ObjectId } from "mongodb";
import { ImportRowInput, ImportRowResult } from "@/lib/types/import-job";
import { OrganizationDocument } from "@/lib/types/organization";
import {
    createOrganizationInventoryItemInDb,
    updateOrganizationInventoryItemInDb,
} from "@/lib/repositories/organization-inventory-item-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import {
    updateImportJobProgress,
    completeImportJob,
    failImportJob,
} from "@/lib/repositories/import-job-repository";
import { notify } from "@/lib/notify";
import { getDiscordUserId } from "@/lib/discord/get-discord-user-id";
import { sendDiscordDm } from "@/lib/discord/send-discord-dm";
import { triggerGoogleSheetSync } from "@/lib/google-sheets/trigger-sync";

type ScWikiItem = {
    uuid: string;
    name: string;
    type: string;
    manufacturer: { name: string } | null;
    description: { en_EN?: string } | null;
    description_data: { name: string; value: string; type: string }[] | null;
};

async function fetchScWikiItems(query: string, limit = 10): Promise<ScWikiItem[]> {
    try {
        const url = `https://api.star-citizen.wiki/api/items?filter[name]=${encodeURIComponent(query)}&page[size]=${limit}&locale=en_EN`;
        const res = await fetch(url, {
            headers: { Accept: "application/json" },
            cache: "no-store",
        });
        if (!res.ok) return [];
        const json = await res.json();
        return json.data ?? [];
    } catch {
        return [];
    }
}

/** Score how many words from the query appear in the candidate name. */
function wordOverlapScore(query: string, candidate: string): number {
    const words = query.toLowerCase().split(/\s+/).filter((w) => w.length > 1);
    const cand = candidate.toLowerCase();
    return words.filter((w) => cand.includes(w)).length;
}

/**
 * Find the best matching SC Wiki item for a given name.
 *
 * Strategy:
 *  1. Search with the full name → exact match wins, then best word-overlap.
 *  2. If no results, progressively drop trailing words and repeat.
 */
async function fetchBestMatch(query: string): Promise<ScWikiItem | null> {
    const normalized = query.trim().toLowerCase();

    // --- Pass 1: full name ---
    const fullResults = await fetchScWikiItems(query, 10);

    if (fullResults.length > 0) {
        const exact = fullResults.find((i) => i.name.toLowerCase() === normalized);
        if (exact) return exact;

        const scored = fullResults
            .map((i) => ({ item: i, score: wordOverlapScore(query, i.name) }))
            .filter((r) => r.score > 0)
            .sort((a, b) => b.score - a.score);
        if (scored.length > 0) return scored[0].item;

        return fullResults[0];
    }

    // --- Pass 2: drop trailing words one at a time ---
    const words = query.trim().split(/\s+/);
    for (let drop = 1; drop < words.length; drop++) {
        const shortened = words.slice(0, words.length - drop).join(" ");
        if (shortened.length < 3) break;

        const results = await fetchScWikiItems(shortened, 15);
        if (results.length === 0) continue;

        const scored = results
            .map((i) => ({ item: i, score: wordOverlapScore(query, i.name) }))
            .filter((r) => r.score > 0)
            .sort((a, b) => b.score - a.score);
        if (scored.length > 0) return scored[0].item;
    }

    return null;
}

export async function processImportJob(
    jobId: ObjectId,
    rows: ImportRowInput[],
    org: OrganizationDocument,
    initiatedByUserId: string,
    initiatedByUsername: string
): Promise<void> {
    const results: ImportRowResult[] = [];

    try {
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];

            try {
                const match = await fetchBestMatch(row.name);

                if (!match) {
                    results.push({
                        rowIndex: i,
                        inputName: row.name,
                        status: "not_found",
                        message: "No matching item found in Star Citizen Wiki.",
                    });
                    await updateImportJobProgress(jobId, i + 1, results);
                    continue;
                }

                const category = match.type !== "UNDEFINED" ? match.type : undefined;

                const createResult = await createOrganizationInventoryItemInDb({
                    organizationId: org._id,
                    organizationSlug: org.slug,
                    name: match.name,
                    category,
                    scWikiUuid: match.uuid,
                    buyPrice: row.buyPrice ?? 0,
                    sellPrice: row.sellPrice ?? 0,
                    quantity: row.quantity ?? 0,
                });

                if (createResult.alreadyExists && createResult.document) {
                    const existing = createResult.document;
                    const hasQuantityChange = row.quantity !== undefined && row.quantity !== existing.quantity;
                    const hasMinStockChange = row.minStock !== undefined && row.minStock !== existing.minStock;
                    const hasMaxStockChange = row.maxStock !== undefined && row.maxStock !== existing.maxStock;

                    if (hasQuantityChange || hasMinStockChange || hasMaxStockChange) {
                        await updateOrganizationInventoryItemInDb({
                            inventoryItemId: existing._id.toString(),
                            organizationId: org._id,
                            buyPrice: existing.buyPrice,
                            sellPrice: existing.sellPrice,
                            quantity: row.quantity !== undefined ? row.quantity : existing.quantity,
                            minStock: row.minStock !== undefined ? row.minStock : existing.minStock,
                            maxStock: row.maxStock !== undefined ? row.maxStock : existing.maxStock,
                        });
                        results.push({
                            rowIndex: i,
                            inputName: row.name,
                            status: "updated",
                            resolvedName: existing.name,
                            scUuid: existing.scWikiUuid,
                            message: [
                                hasQuantityChange ? `qty: ${existing.quantity} → ${row.quantity}` : null,
                                hasMinStockChange ? `min: ${existing.minStock ?? "—"} → ${row.minStock}` : null,
                                hasMaxStockChange ? `max: ${existing.maxStock ?? "—"} → ${row.maxStock}` : null,
                            ].filter(Boolean).join(", "),
                        });
                    } else {
                        results.push({
                            rowIndex: i,
                            inputName: row.name,
                            status: "already_exists",
                            resolvedName: existing.name,
                            scUuid: existing.scWikiUuid,
                            message: "No changes detected.",
                        });
                    }
                    await updateImportJobProgress(jobId, i + 1, results);
                    continue;
                }

                if (createResult.document) {
                    await createOrganizationAuditLog({
                        organizationId: org._id,
                        organizationSlug: org.slug,
                        actorUserId: initiatedByUserId,
                        actorUsername: initiatedByUsername,
                        action: "inventory.item_added",
                        entityType: "inventory_item",
                        entityId: createResult.document._id.toString(),
                        message: `Item "${match.name}" was imported via CSV bulk import.`,
                        metadata: {
                            inventoryItemId: createResult.document._id.toString(),
                            itemName: match.name,
                            buyPrice: row.buyPrice ?? 0,
                            sellPrice: row.sellPrice ?? 0,
                            quantity: row.quantity ?? 0,
                            importSource: "csv",
                        },
                    });
                }

                results.push({
                    rowIndex: i,
                    inputName: row.name,
                    status: "success",
                    resolvedName: match.name,
                    scUuid: match.uuid,
                });
            } catch (err) {
                results.push({
                    rowIndex: i,
                    inputName: row.name,
                    status: "error",
                    message: err instanceof Error ? err.message : "Unexpected error.",
                });
            }

            await updateImportJobProgress(jobId, i + 1, results);
        }

        await completeImportJob(jobId, results);
    } catch (err) {
        console.error("[processImportJob] Fatal error", err);
        await failImportJob(jobId);
        return;
    }

    // Send notifications after completion
    const successCount = results.filter((r) => r.status === "success").length;
    const updatedCount = results.filter((r) => r.status === "updated").length;
    const alreadyExistsCount = results.filter((r) => r.status === "already_exists").length;
    const failedCount = results.filter(
        (r) => r.status === "not_found" || r.status === "error"
    ).length;

    // Always push final org state back to sheet after import (bi-directional sync)
    if (org.googleSheetId) {
        triggerGoogleSheetSync(org._id, org.googleSheetId);
    }

    const summary = `${successCount} imported, ${updatedCount} updated, ${alreadyExistsCount} already existed, ${failedCount} failed.`;
    const resultsLink = `/terminal/orgs/${org.slug}/inventory/import/${jobId.toString()}`;

    await notify(
        initiatedByUserId,
        "inventory.import_complete",
        "CSV Import Complete",
        summary,
        resultsLink
    );

    try {
        const discordId = await getDiscordUserId(initiatedByUserId);
        if (discordId) {
            await sendDiscordDm(
                discordId,
                `**CSV Import Complete** — ${org.name}\n✅ ${successCount} imported · 🔄 ${updatedCount} updated · ⏭️ ${alreadyExistsCount} skipped · ❌ ${failedCount} failed`
            );
        }
    } catch {
        // Discord DM failure is non-critical
    }
}
