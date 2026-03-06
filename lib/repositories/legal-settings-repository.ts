import { getDb } from "@/lib/db";
import type { LegalSettingsDocument, LegalDocDates, LegalSettingsView } from "@/lib/types/legal-settings";

const COLLECTION = "app_legal_settings";
const DEFAULT_VERSION = "2026-03-06";

const DEFAULT_SETTINGS: Omit<LegalSettingsDocument, "_id"> = {
    currentVersion: DEFAULT_VERSION,
    publishedAt: new Date("2026-03-06T00:00:00.000Z"),
    publishedByUsername: "system",
    changeNote: "Initial legal documents published.",
    documents: {
        privacy: { lastUpdated: DEFAULT_VERSION },
        terms: { lastUpdated: DEFAULT_VERSION },
        imprint: { lastUpdated: DEFAULT_VERSION },
        cookies: { lastUpdated: DEFAULT_VERSION },
    },
};

export async function getOrCreateLegalSettings(): Promise<LegalSettingsDocument> {
    const db = await getDb();
    const existing = await db.collection<LegalSettingsDocument>(COLLECTION).findOne({});
    if (existing) return existing;

    const result = await db.collection<LegalSettingsDocument>(COLLECTION).insertOne(
        DEFAULT_SETTINGS as LegalSettingsDocument
    );
    return { ...DEFAULT_SETTINGS, _id: result.insertedId };
}

export async function updateLegalDocDates(
    dates: LegalDocDates,
    changeNote: string
): Promise<void> {
    const db = await getDb();
    await db.collection<LegalSettingsDocument>(COLLECTION).updateOne(
        {},
        {
            $set: {
                "documents.privacy": dates.privacy,
                "documents.terms": dates.terms,
                "documents.imprint": dates.imprint,
                "documents.cookies": dates.cookies,
                changeNote,
            },
        },
        { upsert: true }
    );
}

export async function publishNewLegalVersion(
    version: string,
    publishedByUsername: string,
    note: string,
    dates: LegalDocDates
): Promise<void> {
    const db = await getDb();
    await db.collection<LegalSettingsDocument>(COLLECTION).updateOne(
        {},
        {
            $set: {
                currentVersion: version,
                publishedAt: new Date(),
                publishedByUsername,
                changeNote: note,
                "documents.privacy": dates.privacy,
                "documents.terms": dates.terms,
                "documents.imprint": dates.imprint,
                "documents.cookies": dates.cookies,
            },
        },
        { upsert: true }
    );
}

export function toLegalSettingsView(doc: LegalSettingsDocument): LegalSettingsView {
    return {
        currentVersion: doc.currentVersion,
        publishedAt: doc.publishedAt.toISOString(),
        publishedByUsername: doc.publishedByUsername,
        changeNote: doc.changeNote,
        documents: doc.documents,
    };
}
