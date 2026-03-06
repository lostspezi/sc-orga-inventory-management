import { getDb } from "@/lib/db";
import type { SocialSettingsDocument, SocialSettingsView } from "@/lib/types/social-settings";

const COLLECTION = "app_social_settings";

export async function getOrCreateSocialSettings(): Promise<SocialSettingsDocument> {
    const db = await getDb();
    const existing = await db.collection<SocialSettingsDocument>(COLLECTION).findOne({});
    if (existing) return existing;

    const defaults: SocialSettingsDocument = {
        discord: "https://discord.gg/tuKg67Kutu",
        github: "",
        twitter: "",
        reddit: "",
        youtube: "",
    };
    const result = await db.collection<SocialSettingsDocument>(COLLECTION).insertOne(defaults as SocialSettingsDocument);
    return { ...defaults, _id: result.insertedId };
}

export async function saveSocialSettings(data: Omit<SocialSettingsDocument, "_id">): Promise<void> {
    const db = await getDb();
    await db.collection<SocialSettingsDocument>(COLLECTION).updateOne(
        {},
        { $set: data },
        { upsert: true }
    );
}

export function toSocialSettingsView(doc: SocialSettingsDocument): SocialSettingsView {
    return {
        discord: doc.discord ?? "",
        github: doc.github ?? "",
        twitter: doc.twitter ?? "",
        reddit: doc.reddit ?? "",
        youtube: doc.youtube ?? "",
    };
}
