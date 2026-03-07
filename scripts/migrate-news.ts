/**
 * Migrate existing app_news documents to the new schema.
 * Run with: npx tsx scripts/migrate-news.ts
 *
 * Safe to re-run (idempotent — only updates docs missing `status` field).
 */

import { MongoClient } from "mongodb";
// Load .env.local manually
import { readFileSync } from "fs";
import { join } from "path";

try {
    const envPath = join(process.cwd(), ".env.local");
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx === -1) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
    }
} catch { /* .env.local optional */ }

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;

async function main() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    console.log("Migrating app_news documents…");

    // Step 1: Migrate existing docs to new schema
    const newsResult = await db.collection("app_news").updateMany(
        { status: { $exists: false } },
        {
            $set: {
                primaryLocale: "en",
                translations: {},
                status: "published",
                createdBy: process.env.SUPER_ADMIN_DISCORD_USER_ID ?? "legacy",
            },
        }
    );
    console.log(`Updated ${newsResult.modifiedCount} news documents.`);

    // Step 2: Create app_news_settings singleton if it doesn't exist
    const settingsResult = await db.collection("app_news_settings").updateOne(
        {},
        {
            $setOnInsert: {
                discordGuildId: "",
                discordChannelId: "",
                autoPostOnPublish: false,
                updatedAt: new Date(),
            },
        },
        { upsert: true }
    );
    if (settingsResult.upsertedCount > 0) {
        console.log("Created app_news_settings singleton.");
    } else {
        console.log("app_news_settings already exists — skipped.");
    }

    // Step 3: Ensure indexes
    await db.collection("app_news").createIndex(
        { status: 1, publishedAt: -1 },
        { background: true }
    );
    await db.collection("app_news").createIndex(
        { createdAt: -1 },
        { background: true }
    );
    console.log("Indexes ensured on app_news.");

    await client.close();
    console.log("Migration complete.");
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
