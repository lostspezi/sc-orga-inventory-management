/**
 * All idempotent migrations run automatically on server startup via instrumentation.ts.
 * Each migration is safe to re-run — use $setOnInsert, upsert, or existence checks.
 */

import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { generateUniqueNewsSlug } from "@/lib/repositories/app-news-repository";

async function migrateMembers() {
    const db = await getDb();

    // Indexes
    await db.collection("organization_members").createIndex(
        { organizationId: 1, userId: 1 },
        { unique: true, background: true }
    );
    await db.collection("organization_members").createIndex(
        { organizationId: 1, status: 1 },
        { background: true }
    );
    await db.collection("organization_members").createIndex(
        { organizationId: 1, role: 1 },
        { background: true }
    );
    await db.collection("organization_members").createIndex(
        { organizationId: 1, rankId: 1 },
        { background: true }
    );
    await db.collection("organization_ranks").createIndex(
        { organizationId: 1, order: 1 },
        { background: true }
    );
    await db.collection("organization_ranks").createIndex(
        { organizationId: 1, isDefault: 1 },
        { background: true }
    );
    await db.collection("organizations").createIndex(
        { createdByUserId: 1 },
        { background: true }
    );

    // Backfill organization_members from org.members[]
    const orgs = await db.collection("organizations").find({}).toArray();
    let inserted = 0;

    for (const org of orgs) {
        const members: Array<{ userId: string; role: string; joinedAt?: Date }> = org.members ?? [];
        for (const member of members) {
            const now = new Date();
            const result = await db.collection("organization_members").updateOne(
                { organizationId: org._id as ObjectId, userId: member.userId },
                {
                    $setOnInsert: {
                        organizationId: org._id as ObjectId,
                        organizationSlug: org.slug as string,
                        userId: member.userId,
                        role: member.role,
                        status: "active",
                        joinedAt: member.joinedAt ?? now,
                        invitedBy: "unknown",
                        roleHistory: [],
                        rankHistory: [],
                        createdAt: member.joinedAt ?? now,
                        updatedAt: now,
                    },
                },
                { upsert: true }
            );
            if (result.upsertedCount > 0) inserted++;
        }
    }

    if (inserted > 0) {
        console.log(`[migration] organization_members: inserted ${inserted} records`);
    }
}

async function migrateNews() {
    const db = await getDb();

    // Backfill existing news docs with new schema fields
    const result = await db.collection("app_news").updateMany(
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
    if (result.modifiedCount > 0) {
        console.log(`[migration] app_news: migrated ${result.modifiedCount} documents`);
    }

    // Create app_news_settings singleton if missing
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
        console.log("[migration] app_news_settings: created singleton");
    }

    // Indexes
    await db.collection("app_news").createIndex(
        { status: 1, publishedAt: -1 },
        { background: true }
    );
    await db.collection("app_news").createIndex(
        { createdAt: -1 },
        { background: true }
    );
    await db.collection("app_news").createIndex(
        { slug: 1 },
        { unique: true, sparse: true, background: true }
    );

    // Backfill slug for existing docs missing the field
    const noSlug = await db.collection("app_news").find({ slug: { $exists: false } }).toArray();
    if (noSlug.length > 0) {
        for (const doc of noSlug) {
            const slug = await generateUniqueNewsSlug(
                (doc as { title?: string }).title ?? "news",
                db
            );
            await db.collection("app_news").updateOne({ _id: doc._id }, { $set: { slug } });
        }
        console.log(`[migration] app_news: backfilled slug for ${noSlug.length} documents`);
    }
}

export async function runAllMigrations() {
    try {
        await migrateMembers();
        await migrateNews();
    } catch (err) {
        // Log but never crash the server — migrations are best-effort on startup
        console.error("[migration] error during startup migrations:", err);
    }
}
