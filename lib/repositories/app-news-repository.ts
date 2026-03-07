import { ObjectId } from "mongodb";
import type { Db } from "mongodb";
import { getDb } from "@/lib/db";
import type {
    AppNewsDocument,
    AppNewsView,
    AppNewsPublicView,
    NewsLocale,
    NewsStatus,
    NewsTranslation,
    DiscordPostResult,
} from "@/lib/types/app-news";

const COLLECTION = "app_news";

// ── Slug generation ───────────────────────────────────────────────────────────

function slugifyNewsTitle(title: string): string {
    return title
        .toLowerCase()
        .replace(/[äàáâãå]/g, "a").replace(/[ëèéê]/g, "e")
        .replace(/[ïìíî]/g, "i").replace(/[öòóôõ]/g, "o")
        .replace(/[üùúû]/g, "u").replace(/ß/g, "ss")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim().replace(/\s+/g, "-").replace(/-+/g, "-")
        .slice(0, 80);
}

export async function generateUniqueNewsSlug(title: string, db?: Db): Promise<string> {
    const conn = db ?? await getDb();
    const base = slugifyNewsTitle(title) || `news-${Date.now()}`;
    let slug = base;
    let counter = 2;
    while (await conn.collection(COLLECTION).findOne({ slug })) {
        slug = `${base}-${counter++}`;
    }
    return slug;
}

// ── Create ───────────────────────────────────────────────────────────────────

export async function createAppNews(data: {
    primaryLocale: NewsLocale;
    title: string;
    body: string;
    createdBy: string;
}): Promise<AppNewsDocument> {
    const db = await getDb();
    const now = new Date();
    const slug = await generateUniqueNewsSlug(data.title, db);
    const doc = {
        slug,
        primaryLocale: data.primaryLocale,
        title: data.title,
        body: data.body,
        translations: {} as Partial<Record<NewsLocale, NewsTranslation>>,
        status: "draft" as NewsStatus,
        createdBy: data.createdBy,
        createdAt: now,
        updatedAt: now,
    };
    const result = await db.collection(COLLECTION).insertOne(doc);
    return { ...doc, _id: result.insertedId } as AppNewsDocument;
}

// ── Read ─────────────────────────────────────────────────────────────────────

export async function getAllAppNews(): Promise<AppNewsDocument[]> {
    const db = await getDb();
    return db
        .collection<AppNewsDocument>(COLLECTION)
        .find()
        .sort({ createdAt: -1 })
        .toArray();
}

export async function getAppNewsById(id: string): Promise<AppNewsDocument | null> {
    if (!ObjectId.isValid(id)) return null;
    const db = await getDb();
    return db.collection<AppNewsDocument>(COLLECTION).findOne({ _id: new ObjectId(id) });
}

export async function getLatestPublishedAppNews(limit: number): Promise<AppNewsDocument[]> {
    const db = await getDb();
    return db
        .collection<AppNewsDocument>(COLLECTION)
        .find({ status: "published" })
        .sort({ publishedAt: -1 })
        .limit(limit)
        .toArray();
}

// Backward-compat alias used by org dashboard page
export const getLatestAppNews = getLatestPublishedAppNews;

export async function getAllPublishedAppNews(limit: number, skip = 0): Promise<AppNewsDocument[]> {
    const db = await getDb();
    return db
        .collection<AppNewsDocument>(COLLECTION)
        .find({ status: "published" })
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();
}

export async function countPublishedAppNews(): Promise<number> {
    const db = await getDb();
    return db.collection(COLLECTION).countDocuments({ status: "published" });
}

export async function getPublishedAppNewsBySlug(slug: string): Promise<AppNewsDocument | null> {
    const db = await getDb();
    return db.collection<AppNewsDocument>(COLLECTION).findOne({ slug, status: "published" });
}

// ── Update content ────────────────────────────────────────────────────────────

export async function updateAppNewsContent(
    id: string,
    data: { title?: string; body?: string; primaryLocale?: NewsLocale }
): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const db = await getDb();

    const current = await db.collection<AppNewsDocument>(COLLECTION).findOne({ _id: new ObjectId(id) });
    if (!current) return false;

    const setFields: Record<string, unknown> = { updatedAt: new Date() };
    if (data.title !== undefined) setFields.title = data.title;
    if (data.body !== undefined) setFields.body = data.body;
    if (data.primaryLocale !== undefined) setFields.primaryLocale = data.primaryLocale;

    // Editing published/ready_to_publish content resets to draft
    if (current.status === "published" || current.status === "ready_to_publish") {
        setFields.status = "draft";
    }

    const result = await db.collection<AppNewsDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: setFields }
    );
    return result.modifiedCount > 0;
}

// ── Update translation for a locale ──────────────────────────────────────────

export async function setAppNewsTranslation(
    id: string,
    locale: NewsLocale,
    translation: NewsTranslation
): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    const db = await getDb();
    await db.collection<AppNewsDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: { [`translations.${locale}`]: translation, updatedAt: new Date() } }
    );
}

// ── Status transitions ────────────────────────────────────────────────────────

export async function setAppNewsStatus(
    id: string,
    status: NewsStatus,
    extra?: { publishedAt?: Date; archivedAt?: Date }
): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const db = await getDb();
    const setFields: Record<string, unknown> = { status, updatedAt: new Date() };
    if (extra?.publishedAt) setFields.publishedAt = extra.publishedAt;
    if (extra?.archivedAt) setFields.archivedAt = extra.archivedAt;
    const result = await db.collection<AppNewsDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: setFields }
    );
    return result.modifiedCount > 0;
}

// ── Store Discord post result ─────────────────────────────────────────────────

export async function setAppNewsDiscord(id: string, discord: DiscordPostResult): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    const db = await getDb();
    await db.collection<AppNewsDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: { discord, updatedAt: new Date() } }
    );
}

export async function setAppNewsDiscordFailure(id: string, reason: string): Promise<void> {
    if (!ObjectId.isValid(id)) return;
    const db = await getDb();
    await db.collection<AppNewsDocument>(COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: { "discord.failureReason": reason, updatedAt: new Date() } }
    );
}

// ── Delete ────────────────────────────────────────────────────────────────────

export async function deleteAppNews(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const db = await getDb();
    const result = await db.collection<AppNewsDocument>(COLLECTION).deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
}

// ── Legacy aliases (keep old actions working) ─────────────────────────────────

export async function createAppNewsInDb(title: string, body: string): Promise<void> {
    await createAppNews({ primaryLocale: "en", title, body, createdBy: "legacy" });
}

export async function updateAppNewsInDb(id: string, title: string, body: string): Promise<boolean> {
    return updateAppNewsContent(id, { title, body });
}

export const deleteAppNewsInDb = deleteAppNews;

// ── Serialization ─────────────────────────────────────────────────────────────

export function toAppNewsView(doc: AppNewsDocument): AppNewsView {
    const translations: AppNewsView["translations"] = {};
    for (const [locale, t] of Object.entries(doc.translations ?? {})) {
        if (!t) continue;
        translations[locale as NewsLocale] = {
            title: t.title,
            body: t.body,
            status: t.status,
            translatedAt: t.translatedAt?.toISOString(),
            editedAt: t.editedAt?.toISOString(),
            modelUsed: t.modelUsed,
            errorMessage: t.errorMessage,
        };
    }

    return {
        _id: doc._id.toString(),
        slug: doc.slug ?? "",
        primaryLocale: doc.primaryLocale,
        title: doc.title,
        body: doc.body,
        translations,
        status: doc.status,
        publishedAt: doc.publishedAt?.toISOString(),
        archivedAt: doc.archivedAt?.toISOString(),
        discord: doc.discord
            ? {
                guildId: doc.discord.guildId,
                channelId: doc.discord.channelId,
                messageId: doc.discord.messageId,
                postedAt: doc.discord.postedAt.toISOString(),
                updatedAt: doc.discord.updatedAt?.toISOString(),
                failureReason: doc.discord.failureReason,
              }
            : undefined,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}

export function toAppNewsPublicView(doc: AppNewsDocument, locale: NewsLocale): AppNewsPublicView {
    const translation = doc.translations?.[locale];
    const useTranslation = translation && (translation.status === "ready" || translation.status === "edited");
    return {
        _id: doc._id.toString(),
        slug: doc.slug ?? "",
        title: useTranslation ? translation.title : doc.title,
        body: useTranslation ? translation.body : doc.body,
        locale: useTranslation ? locale : doc.primaryLocale,
        publishedAt: doc.publishedAt!.toISOString(),
    };
}
