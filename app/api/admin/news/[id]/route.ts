import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import {
    getAppNewsById,
    updateAppNewsContent,
    setAppNewsTranslation,
    deleteAppNews,
    toAppNewsView,
} from "@/lib/repositories/app-news-repository";
import type { NewsLocale, NewsTranslation } from "@/lib/types/app-news";

const VALID_LOCALES: NewsLocale[] = ["en", "de", "fr"];

async function guardSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    if (!(await isSuperAdmin(session.user.id))) return null;
    return session;
}

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const doc = await getAppNewsById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(toAppNewsView(doc));
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const doc = await getAppNewsById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json() as {
        title?: string;
        body?: string;
        primaryLocale?: NewsLocale;
        translations?: Partial<Record<NewsLocale, { title: string; body: string }>>;
    };

    // Update primary content if provided
    const contentChanged = body.title !== undefined || body.body !== undefined || body.primaryLocale !== undefined;
    if (contentChanged) {
        if (body.primaryLocale && !VALID_LOCALES.includes(body.primaryLocale)) {
            return NextResponse.json({ error: "Invalid primaryLocale" }, { status: 400 });
        }
        await updateAppNewsContent(id, {
            title: body.title,
            body: body.body,
            primaryLocale: body.primaryLocale,
        });
    }

    // Update translation edits (status → edited)
    if (body.translations) {
        for (const [locale, t] of Object.entries(body.translations)) {
            if (!VALID_LOCALES.includes(locale as NewsLocale) || !t) continue;
            const existing = doc.translations?.[locale as NewsLocale];
            const updated: NewsTranslation = {
                title: t.title,
                body: t.body,
                status: "edited",
                translatedAt: existing?.translatedAt,
                editedAt: new Date(),
                modelUsed: existing?.modelUsed,
            };
            await setAppNewsTranslation(id, locale as NewsLocale, updated);
        }
    }

    const updated = await getAppNewsById(id);
    return NextResponse.json(toAppNewsView(updated!));
}

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const deleted = await deleteAppNews(id);
    if (!deleted) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true });
}
