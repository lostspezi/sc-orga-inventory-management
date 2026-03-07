import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import {
    getAppNewsById,
    setAppNewsTranslation,
    setAppNewsStatus,
    toAppNewsView,
} from "@/lib/repositories/app-news-repository";
import { translateNewsPost } from "@/lib/translations/translate-news";
import type { NewsLocale } from "@/lib/types/app-news";

async function guardSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    if (!(await isSuperAdmin(session.user.id))) return null;
    return session;
}

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!process.env.OPENAI_API_KEY) {
        return NextResponse.json({ error: "Translation API not configured" }, { status: 503 });
    }

    const { id } = await params;
    const doc = await getAppNewsById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Guard: already translating
    if (doc.status === "translation_pending") {
        return NextResponse.json({ error: "Translation already in progress" }, { status: 409 });
    }

    const allLocales: NewsLocale[] = ["en", "de", "fr"];
    const targetLocales = allLocales.filter((l) => {
        if (l === doc.primaryLocale) return false;
        const t = doc.translations?.[l];
        return !t || t.status === "missing" || t.status === "error";
    });

    if (targetLocales.length === 0) {
        return NextResponse.json({ error: "No locales require translation" }, { status: 400 });
    }

    // Mark all target locales as generating
    for (const locale of targetLocales) {
        const existing = doc.translations?.[locale];
        await setAppNewsTranslation(id, locale, {
            title: existing?.title ?? "",
            body: existing?.body ?? "",
            status: "generating",
        });
    }

    // Transition status to translation_pending
    await setAppNewsStatus(id, "translation_pending");

    // Fire-and-forget translation pipeline (no await)
    translateNewsPost(id, targetLocales).catch(console.error);

    const updated = await getAppNewsById(id);
    return NextResponse.json(toAppNewsView(updated!));
}
