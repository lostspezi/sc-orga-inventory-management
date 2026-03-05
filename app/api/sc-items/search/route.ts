// app/api/sc-items/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export type ScWikiItem = {
    uuid: string;
    name: string;
    type: string;
    sub_type: string;
    classification: string | null;
    manufacturer: { name: string } | null;
    description: { en_EN?: string } | null;
    description_data: { name: string; value: string; type: string }[] | null;
    is_base_variant: boolean;
    uex_prices: { price_buy: number; price_sell: number; terminal_name: string }[];
    resource_container?: {
        capacity?: { unit_name?: string };
    } | null;
};

export type ItemSearchResult = {
    source: "sc_wiki";
    scUuid?: string;
    name: string;
    category?: string;
    description?: string;
    manufacturer?: string;
    unit?: string;
};

async function fetchScWikiItems(query: string, limit = 10, commoditiesOnly = false): Promise<ScWikiItem[]> {
    let url = `https://api.star-citizen.wiki/api/items?filter[name]=${encodeURIComponent(query)}&page[size]=${limit}&locale=en_EN`;
    if (commoditiesOnly) url += "&filter[type]=Cargo";
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
 * e.g. "Morozov-CH Backpack Brushdrift" → tries "Morozov-CH Backpack", "Morozov-CH"
 */
function getBaseNameCandidates(name: string): string[] {
    const words = name.trim().split(/\s+/);
    const candidates: string[] = [];
    for (let drop = 1; drop <= Math.min(3, words.length - 1); drop++) {
        candidates.push(words.slice(0, words.length - drop).join(" "));
    }
    return candidates;
}

function isSoldInShops(item: ScWikiItem): boolean {
    return Array.isArray(item.uex_prices) && item.uex_prices.length > 0;
}

export async function GET(request: NextRequest) {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const siblingsFor = request.nextUrl.searchParams.get("siblingsFor")?.trim() ?? "";
    const excludeShopItems = request.nextUrl.searchParams.get("excludeShopItems") === "true";
    const commoditiesOnly = request.nextUrl.searchParams.get("commoditiesOnly") === "true";

    if (siblingsFor) {
        const candidates = getBaseNameCandidates(siblingsFor);

        for (const baseName of candidates) {
            if (baseName.length < 3) continue;

            const items = await fetchScWikiItems(baseName, 30, commoditiesOnly);
            if (items.length > 1) {
                const siblings = items
                    .filter((item) => item.name !== siblingsFor)
                    .filter((item) => !excludeShopItems || !isSoldInShops(item))
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

        return NextResponse.json({ baseName: siblingsFor, siblings: [] });
    }

    // Normal search
    if (!q || q.length < 2) {
        return NextResponse.json({ results: [] });
    }

    let results: ItemSearchResult[] = [];
    try {
        const items = await fetchScWikiItems(q, 12, commoditiesOnly);
        results = items
            .filter((item) => !(excludeShopItems && isSoldInShops(item)))
            .slice(0, 12)
            .map((item) => ({
                source: "sc_wiki" as const,
                scUuid: item.uuid,
                name: item.name,
                category: item.type !== "UNDEFINED" ? item.type : undefined,
                description: item.description?.en_EN?.slice(0, 300),
                manufacturer: item.manufacturer?.name,
                unit: item.resource_container?.capacity?.unit_name ?? undefined,
            }));
    } catch {
        // SC wiki unreachable
    }

    return NextResponse.json({ results });
}