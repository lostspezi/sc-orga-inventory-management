// app/api/sc-items/search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { searchItemsByName } from "@/lib/repositories/item-repository";

export type ScWikiItem = {
    uuid: string;
    name: string;
    type: string;
    sub_type: string;
    classification: string | null;
    manufacturer: { name: string } | null;
    description: { en_EN?: string } | null;
    is_base_variant: boolean;
};

export type ItemSearchResult = {
    source: "local" | "sc_wiki";
    localId?: string;
    scUuid?: string;
    name: string;
    category?: string;
    description?: string;
    manufacturer?: string;
};

async function fetchScWikiItems(query: string, limit = 10): Promise<ScWikiItem[]> {
    const url = `https://api.star-citizen.wiki/api/items?filter[name]=${encodeURIComponent(query)}&page[size]=${limit}&locale=en_EN`;
    const res = await fetch(url, {
        headers: { Accept: "application/json" },
        next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data ?? [];
}

/**
 * Extracts the base name from an item name by trying progressively shorter prefixes.
 * e.g. "Morozov-CH Backpack Brushdrift" → tries "Morozov-CH Backpack Brushdrift",
 *      "Morozov-CH Backpack", "Morozov-CH" until we find multiple matches.
 */
function getBaseNameCandidates(name: string): string[] {
    const words = name.trim().split(/\s+/);
    const candidates: string[] = [];
    // Try removing 1, 2, 3 words from the end
    for (let drop = 1; drop <= Math.min(3, words.length - 1); drop++) {
        candidates.push(words.slice(0, words.length - drop).join(" "));
    }
    return candidates;
}

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    // Optional: if "siblings" mode is requested, find sibling variants for a selected item
    const siblingsFor = request.nextUrl.searchParams.get("siblingsFor")?.trim() ?? "";

    if (siblingsFor) {
        // Find all SC wiki items that share the same base name
        const candidates = getBaseNameCandidates(siblingsFor);

        for (const baseName of candidates) {
            if (baseName.length < 3) continue;

            const items = await fetchScWikiItems(baseName, 30);
            // Only consider it a match if we find more than 1 item (otherwise it's not really a variant group)
            if (items.length > 1) {
                const siblings = items
                    .filter((item) => item.name !== siblingsFor) // exclude the selected item itself
                    .map((item) => ({
                        uuid: item.uuid,
                        name: item.name,
                        type: item.type,
                        description: item.description?.en_EN?.slice(0, 200),
                        manufacturer: item.manufacturer?.name,
                    }));

                return NextResponse.json({ baseName, siblings });
            }
        }

        // No sibling group found
        return NextResponse.json({ baseName: siblingsFor, siblings: [] });
    }

    // Normal search
    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    // 1. Local DB
    const localItems = await searchItemsByName(q);
    const localResults: ItemSearchResult[] = localItems.map((item) => ({
        source: "local",
        localId: item._id.toString(),
        name: item.name,
        category: item.category,
        description: item.description,
    }));

    const localNames = new Set(localItems.map((i) => i.normalizedName));

    // 2. SC Wiki
    let wikiResults: ItemSearchResult[] = [];
    try {
        const items = await fetchScWikiItems(q, 10);
        wikiResults = items
            .filter((item) => {
                const normalized = item.name.trim().toLowerCase().replace(/\s+/g, " ");
                return !localNames.has(normalized);
            })
            .slice(0, 8)
            .map((item) => ({
                source: "sc_wiki",
                scUuid: item.uuid,
                name: item.name,
                category: item.type !== "UNDEFINED" ? item.type : undefined,
                description: item.description?.en_EN?.slice(0, 300),
                manufacturer: item.manufacturer?.name,
            }));
    } catch {
        // SC wiki unreachable
    }

    return NextResponse.json({
        results: [...localResults, ...wikiResults].slice(0, 12),
    });
}