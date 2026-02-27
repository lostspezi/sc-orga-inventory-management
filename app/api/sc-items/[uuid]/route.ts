// app/api/sc-items/[uuid]/route.ts
import { NextRequest, NextResponse } from "next/server";

export type ScWikiItemVariant = {
    uuid: string;
    name: string;
    type: string;
    sub_type: string;
    classification: string | null;
    description: { en_EN?: string } | null;
    manufacturer: { name: string } | null;
};

export type ScWikiItemDetail = {
    uuid: string;
    name: string;
    type: string;
    sub_type: string;
    classification: string | null;
    description: { en_EN?: string } | null;
    manufacturer: { name: string } | null;
    is_base_variant: boolean;
    variants: ScWikiItemVariant[];
};

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ uuid: string }> }
) {
    const { uuid } = await params;

    if (!uuid || uuid.length < 10) {
        return NextResponse.json({ error: "Invalid UUID" }, { status: 400 });
    }

    try {
        const res = await fetch(
            `https://api.star-citizen.wiki/api/items/${uuid}?locale=en_EN`,
            {
                headers: { Accept: "application/json" },
                next: { revalidate: 300 },
            }
        );

        if (!res.ok) {
            return NextResponse.json({ error: "Item not found" }, { status: 404 });
        }

        const json = await res.json();
        const item: ScWikiItemDetail = json.data ?? json;

        return NextResponse.json({ item });
    } catch {
        return NextResponse.json({ error: "Failed to fetch item" }, { status: 500 });
    }
}