import { getDb } from "@/lib/db";
import type { AppNewsSettingsDocument, AppNewsSettingsView } from "@/lib/types/app-news-settings";

const COLLECTION = "app_news_settings";

const DEFAULTS: Omit<AppNewsSettingsDocument, "_id"> = {
    discordGuildId: "",
    discordChannelId: "",
    autoPostOnPublish: false,
    updatedAt: new Date(),
};

export async function getOrCreateNewsSettings(): Promise<AppNewsSettingsDocument> {
    const db = await getDb();
    const existing = await db.collection<AppNewsSettingsDocument>(COLLECTION).findOne({});
    if (existing) return existing;

    const result = await db.collection<AppNewsSettingsDocument>(COLLECTION).insertOne({
        ...DEFAULTS,
    } as AppNewsSettingsDocument);
    return { ...DEFAULTS, _id: result.insertedId };
}

export async function saveNewsSettings(
    data: Pick<AppNewsSettingsDocument, "discordGuildId" | "discordChannelId" | "autoPostOnPublish">
): Promise<void> {
    const db = await getDb();
    await db.collection<AppNewsSettingsDocument>(COLLECTION).updateOne(
        {},
        { $set: { ...data, updatedAt: new Date() } },
        { upsert: true }
    );
}

export async function recordNewsSettingsTest(
    result: "success" | "failure",
    error?: string
): Promise<void> {
    const db = await getDb();
    const setFields: Partial<AppNewsSettingsDocument> = {
        lastTestPostedAt: new Date(),
        lastTestResult: result,
        updatedAt: new Date(),
    };
    if (error !== undefined) setFields.lastTestError = error;
    await db.collection<AppNewsSettingsDocument>(COLLECTION).updateOne(
        {},
        { $set: setFields },
        { upsert: true }
    );
}

export function toNewsSettingsView(doc: AppNewsSettingsDocument): AppNewsSettingsView {
    return {
        discordGuildId: doc.discordGuildId ?? "",
        discordChannelId: doc.discordChannelId ?? "",
        autoPostOnPublish: doc.autoPostOnPublish ?? false,
        lastTestPostedAt: doc.lastTestPostedAt?.toISOString(),
        lastTestResult: doc.lastTestResult,
        lastTestError: doc.lastTestError,
        updatedAt: doc.updatedAt.toISOString(),
    };
}
