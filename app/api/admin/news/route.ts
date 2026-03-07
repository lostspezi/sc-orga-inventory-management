import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { createAppNews, getAllAppNews, toAppNewsView } from "@/lib/repositories/app-news-repository";
import type { NewsLocale } from "@/lib/types/app-news";

const VALID_LOCALES: NewsLocale[] = ["en", "de", "fr"];

async function guardSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    if (!(await isSuperAdmin(session.user.id))) return null;
    return session;
}

export async function GET() {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const docs = await getAllAppNews();
    return NextResponse.json(docs.map(toAppNewsView));
}

export async function POST(req: NextRequest) {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json() as { primaryLocale?: string; title?: string; body?: string };

    if (!body.title?.trim() || !body.body?.trim()) {
        return NextResponse.json({ error: "title and body are required" }, { status: 400 });
    }
    if (!body.primaryLocale || !VALID_LOCALES.includes(body.primaryLocale as NewsLocale)) {
        return NextResponse.json({ error: "Valid primaryLocale (en|de|fr) is required" }, { status: 400 });
    }

    const doc = await createAppNews({
        primaryLocale: body.primaryLocale as NewsLocale,
        title: body.title.trim(),
        body: body.body.trim(),
        createdBy: session.user.id ?? "unknown",
    });

    return NextResponse.json(toAppNewsView(doc), { status: 201 });
}
