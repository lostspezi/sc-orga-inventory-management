import { NextRequest, NextResponse } from "next/server";
import { getLatestPublishedAppNews, toAppNewsPublicView } from "@/lib/repositories/app-news-repository";
import type { NewsLocale } from "@/lib/types/app-news";

const VALID_LOCALES: NewsLocale[] = ["en", "de", "fr"];

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit") ?? "10"), 50);
    const rawLocale = searchParams.get("locale") ?? req.headers.get("accept-language")?.split(",")[0]?.split("-")[0] ?? "en";
    const locale: NewsLocale = VALID_LOCALES.includes(rawLocale as NewsLocale) ? (rawLocale as NewsLocale) : "en";

    const docs = await getLatestPublishedAppNews(limit);
    return NextResponse.json(docs.map((doc) => toAppNewsPublicView(doc, locale)));
}
