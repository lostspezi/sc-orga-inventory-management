import { NextRequest, NextResponse } from "next/server";
import { getAppNewsById, toAppNewsPublicView } from "@/lib/repositories/app-news-repository";
import type { NewsLocale } from "@/lib/types/app-news";

const VALID_LOCALES: NewsLocale[] = ["en", "de", "fr"];

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const doc = await getAppNewsById(id);
    if (!doc || doc.status !== "published") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const rawLocale = searchParams.get("locale") ?? "en";
    const locale: NewsLocale = VALID_LOCALES.includes(rawLocale as NewsLocale) ? (rawLocale as NewsLocale) : "en";

    return NextResponse.json(toAppNewsPublicView(doc, locale));
}
