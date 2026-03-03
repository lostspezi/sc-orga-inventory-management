import { ObjectId } from "mongodb";
import { ImportRowInput, ImportRowResult } from "@/lib/types/import-job";
import { OrganizationDocument } from "@/lib/types/organization";
import { createItemInDb } from "@/lib/repositories/item-repository";
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

                const dd = match.description_data ?? [];
                const findVal = (n: string) => dd.find((e) => e.name === n)?.value;

                const item = await createItemInDb({
                    name: match.name,
                    category: match.type !== "UNDEFINED" ? match.type : undefined,
                    description: match.description?.en_EN?.slice(0, 300),
                    itemClass: findVal("Class"),
                    grade: findVal("Grade"),
                    size: findVal("Size"),
                });

                const createResult = await createOrganizationInventoryItemInDb({
                    organizationId: org._id,
                    organizationSlug: org.slug,
                    itemId: item._id,
                    buyPrice: row.buyPrice ?? 0,
                    sellPrice: row.sellPrice ?? 0,
                    quantity: row.quantity ?? 0,
                });

                if (createResult.alreadyExists) {
                    results.push({
                        rowIndex: i,
                        inputName: row.name,
                        status: "already_exists",
                        resolvedName: match.name,
                        scUuid: match.uuid,
                        message: "Item already exists in organization inventory.",
                    });
                    await updateImportJobProgress(jobId, i + 1, results);
                    continue;
                }

                // Apply minStock/maxStock if provided
                if (
                    (row.minStock !== undefined || row.maxStock !== undefined) &&
                    createResult.document
                ) {
                    await updateOrganizationInventoryItemInDb({
                        inventoryItemId: createResult.document._id.toString(),
                        organizationId: org._id,
                        buyPrice: row.buyPrice ?? 0,
                        sellPrice: row.sellPrice ?? 0,
                        quantity: row.quantity ?? 0,
                        minStock: row.minStock,
                        maxStock: row.maxStock,
                    });
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
                        message: `Item "${item.name}" was imported via CSV bulk import.`,
                        metadata: {
                            inventoryItemId: createResult.document._id.toString(),
                            itemId: item._id.toString(),
                            itemName: item.name,
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
    const alreadyExistsCount = results.filter((r) => r.status === "already_exists").length;
    const failedCount = results.filter(
        (r) => r.status === "not_found" || r.status === "error"
    ).length;

    const summary = `${successCount} imported, ${alreadyExistsCount} already existed, ${failedCount} failed.`;
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
                `**CSV Import Complete** — ${org.name}\n✅ ${successCount} imported · ⏭️ ${alreadyExistsCount} already existed · ❌ ${failedCount} failed`
            );
        }
    } catch {
        // Discord DM failure is non-critical
    }
}
