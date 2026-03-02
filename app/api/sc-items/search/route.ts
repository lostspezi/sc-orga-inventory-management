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
    description_data: { name: string; value: string; type: string }[] | null;
    is_base_variant: boolean;
    uex_prices: { price_buy: number; price_sell: number; terminal_name: string }[];
};

export type ItemSearchResult = {
    source: "local" | "sc_wiki";
    localId?: string;
    scUuid?: string;
    name: string;
    category?: string;
    description?: string;
    manufacturer?: string;
    itemClass?: string;
    grade?: string;
    size?: string;
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

    if (siblingsFor) {
        const candidates = getBaseNameCandidates(siblingsFor);

        for (const baseName of candidates) {
            if (baseName.length < 3) continue;

            const items = await fetchScWikiItems(baseName, 30);
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
                if (localNames.has(normalized)) return false;
                return !(excludeShopItems && isSoldInShops(item));

            })
            .slice(0, 8)
            .map((item) => {
                const dd = item.description_data ?? [];
                const findVal = (n: string) => dd.find((e) => e.name === n)?.value;
                return {
                    source: "sc_wiki" as const,
                    scUuid: item.uuid,
                    name: item.name,
                    category: item.type !== "UNDEFINED" ? item.type : undefined,
                    description: item.description?.en_EN?.slice(0, 300),
                    manufacturer: item.manufacturer?.name,
                    itemClass: findVal("Class"),
                    grade: findVal("Grade"),
                    size: findVal("Size"),
                };
            });
    } catch {
        // SC wiki unreachable
    }

    return NextResponse.json({
        results: [...localResults, ...wikiResults].slice(0, 12),
    });
}