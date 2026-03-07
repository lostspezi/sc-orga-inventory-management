/**
 * Migration: Populate organization_members from organizations.members[]
 *
 * Run: npx tsx scripts/migrate-members.ts
 *
 * Safe to re-run — uses upsert on { organizationId, userId } unique index.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { MongoClient, ObjectId } from "mongodb";

// Load .env.local manually (no dotenv dependency needed)
try {
    const envPath = resolve(process.cwd(), ".env.local");
    const content = readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx < 0) continue;
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[key]) process.env[key] = val;
    }
} catch {
    // .env.local not found — env vars must be set externally
}

const MONGODB_URI = process.env.MONGODB_URI!;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME!;

if (!MONGODB_URI || !MONGODB_DB_NAME) {
    console.error("MONGODB_URI and MONGODB_DB_NAME must be set in environment.");
    process.exit(1);
}

async function main() {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB_NAME);

    console.log("Connected to MongoDB.");

    const orgs = await db.collection("organizations").find({}).toArray();
    console.log(`Found ${orgs.length} organizations.`);

    // Ensure indexes on organization_members
    await db.collection("organization_members").createIndex(
        { organizationId: 1, userId: 1 },
        { unique: true }
    );
    await db.collection("organization_members").createIndex({ organizationId: 1, status: 1 });
    await db.collection("organization_members").createIndex({ organizationId: 1, role: 1 });
    await db.collection("organization_members").createIndex({ organizationId: 1, rankId: 1 });

    // Ensure indexes on organization_ranks
    await db.collection("organization_ranks").createIndex({ organizationId: 1, order: 1 });
    await db.collection("organization_ranks").createIndex({ organizationId: 1, isDefault: 1 });

    console.log("Indexes created.");

    let totalInserted = 0;
    let totalSkipped = 0;

    for (const org of orgs) {
        const members: Array<{ userId: string; role: string; joinedAt: Date }> = org.members ?? [];

        for (const member of members) {
            const now = new Date();

            const doc = {
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
            };

            const result = await db.collection("organization_members").updateOne(
                { organizationId: org._id, userId: member.userId },
                { $setOnInsert: doc },
                { upsert: true }
            );

            if (result.upsertedCount > 0) {
                totalInserted++;
            } else {
                totalSkipped++;
            }
        }
    }

    console.log(`Migration complete: ${totalInserted} inserted, ${totalSkipped} skipped (already exist).`);
    await client.close();
}

main().catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
});
