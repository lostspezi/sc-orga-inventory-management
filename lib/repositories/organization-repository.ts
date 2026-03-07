import {ObjectId} from "mongodb";
import {getDb} from "@/lib/db";
import type {
    OrganizationDocument,
    OrganizationMember,
    OrganizationMemberView,
    OrganizationView,
    OrgSubscription,
    OrgProOverride,
} from "@/lib/types/organization";
import { isProOrg } from "@/lib/billing/is-pro";
import {createOrganizationAuditLog} from "@/lib/repositories/organization-audit-log-repository";
import {auth} from "@/auth";

type UserDocument = {
    _id: ObjectId;
    name?: string | null;
    email?: string | null;
    image?: string | null;
};

const COLLECTION = "organizations";

type CreateOrganizationInput = {
    name: string;
    slug: string;
    starCitizenOrganizationUrl?: string;
    createdByUserId: string;
};

export async function createOrganizationInDb(
    input: CreateOrganizationInput
): Promise<ObjectId> {
    const db = await getDb();
    const now = new Date();

    const ownerMember: OrganizationMember = {
        userId: input.createdByUserId,
        role: "owner",
        joinedAt: now,
    };

    const doc: Omit<OrganizationDocument, "_id"> = {
        name: input.name,
        slug: input.slug,
        starCitizenOrganizationUrl: input.starCitizenOrganizationUrl ?? "",
        createdByUserId: input.createdByUserId,
        members: [ownerMember],
        createdAt: now,
        updatedAt: now,
    };

    const result = await db.collection<Omit<OrganizationDocument, "_id">>(COLLECTION).insertOne(doc);

    const session = await auth();

    await createOrganizationAuditLog({
        organizationId: result.insertedId,
        organizationSlug: input.slug,
        actorUserId: input.createdByUserId,
        actorUsername: session?.user?.name ?? "Unknown User",
        action: "organization.created",
        entityType: "organization",
        entityId: result.insertedId.toString(),
        message: "Organization created.",
        metadata: {
            name: input.name,
            slug: input.slug,
        },
    });

    return result.insertedId;
}

export async function getOrganizationViewsByUserId(
    userId: string
): Promise<OrganizationView[]> {
    const db = await getDb();

    const orgs = await db
        .collection<OrganizationDocument>(COLLECTION)
        .find({"members.userId": userId})
        .sort({createdAt: -1})
        .toArray();

    return Promise.all(orgs.map((org) => mapOrganizationToView(db, org)));
}

export async function getOrganizationById(id: string): Promise<OrganizationDocument | null> {
    if (!ObjectId.isValid(id)) return null;

    const db = await getDb();

    return db
        .collection<OrganizationDocument>(COLLECTION)
        .findOne({_id: new ObjectId(id)});
}

export async function getOrganizationBySlug(slug: string): Promise<OrganizationDocument | null> {
    const db = await getDb();

    return db
        .collection<OrganizationDocument>(COLLECTION)
        .findOne({slug});
}

export async function getOrganizationViewBySlug(
    slug: string
): Promise<OrganizationView | null> {
    const db = await getDb();

    const org = await db
        .collection<OrganizationDocument>(COLLECTION)
        .findOne({slug});

    if (!org) {
        return null;
    }

    return mapOrganizationToView(db, org);
}

export async function updateOrganizationInDb(
    id: string,
    updates: Partial<Pick<OrganizationDocument, "name" | "slug" | "starCitizenOrganizationUrl">>
): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;

    const db = await getDb();

    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        {_id: new ObjectId(id)},
        {
            $set: {
                ...updates,
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

export async function deleteOrganizationInDb(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;

    const db = await getDb();

    const result = await db
        .collection<OrganizationDocument>(COLLECTION)
        .deleteOne({_id: new ObjectId(id)});

    return result.deletedCount > 0;
}

export async function addMemberToOrganizationInDb(
    organizationId: string,
    member: OrganizationMember
): Promise<boolean> {
    if (!ObjectId.isValid(organizationId)) return false;

    const db = await getDb();

    // Verhindert doppelte Members mit gleicher userId nicht vollständig bei Objektvergleich,
    // darum besser über Filter sicherstellen:
    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        {
            _id: new ObjectId(organizationId),
            "members.userId": {$ne: member.userId},
        },
        {
            $push: {members: member},
            $set: {updatedAt: new Date()},
        }
    );

    return result.modifiedCount > 0;
}

export async function setOrganizationDiscordGuildId(
    slug: string,
    discordGuildId: string
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        {slug},
        {
            $set: {
                discordGuildId,
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

export async function removeMemberFromOrganizationInDb(
    organizationId: string,
    userId: string
): Promise<boolean> {
    if (!ObjectId.isValid(organizationId)) return false;

    const db = await getDb();

    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        {_id: new ObjectId(organizationId)},
        {
            $pull: {
                members: {userId},
            },
            $set: {
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

export async function clearOrganizationDiscordGuildId(
    discordGuildId: string
): Promise<number> {
    const db = await getDb();

    const result = await db.collection<OrganizationDocument>(COLLECTION).updateMany(
        {discordGuildId},
        {
            $unset: {
                discordGuildId: "",
            },
            $set: {
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount;
}

export async function getOrganizationsByDiscordGuildId(
    discordGuildId: string
): Promise<OrganizationDocument[]> {
    const db = await getDb();

    return db
        .collection<OrganizationDocument>(COLLECTION)
        .find({discordGuildId})
        .toArray();
}

export async function getOrganizationByDiscordGuildId(
    discordGuildId: string
): Promise<OrganizationDocument | null> {
    const db = await getDb();

    return db
        .collection<OrganizationDocument>(COLLECTION)
        .findOne({discordGuildId});
}

export async function changeRoleForOrgMemberInDb(
    organizationId: string,
    memberId: string,
    role: "admin" | "hr" | "member"
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection(COLLECTION).updateOne(
        {
            _id: new ObjectId(organizationId),
            "members.userId": memberId,
        },
        {
            $set: {
                "members.$.role": role,
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

export async function updateMemberStatusInOrg(
    organizationId: string,
    userId: string,
    status: "active" | "suspended"
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection(COLLECTION).updateOne(
        {
            _id: new ObjectId(organizationId),
            "members.userId": userId,
        },
        {
            $set: {
                "members.$.status": status,
                updatedAt: new Date(),
            },
        }
    );

    return result.modifiedCount > 0;
}

async function mapOrganizationToView(
    db: Awaited<ReturnType<typeof getDb>>,
    org: OrganizationDocument
): Promise<OrganizationView> {
    const allUserIds = Array.from(
        new Set([
            org.createdByUserId,
            ...org.members.map((m) => m.userId),
        ])
    );

    const objectIds = allUserIds
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

    const users = objectIds.length
        ? await db
            .collection<UserDocument>("users")
            .find({_id: {$in: objectIds}})
            .project({_id: 1, name: 1})
            .toArray()
        : [];

    const usernameByUserId = new Map(
        users.map((u) => [u._id.toString(), u.name ?? undefined])
    );

    return {
        _id: org._id,
        name: org.name,
        slug: org.slug,
        starCitizenOrganizationUrl: org.starCitizenOrganizationUrl,
        createdByUserId: org.createdByUserId,
        createdByUsername: usernameByUserId.get(org.createdByUserId),
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        members: org.members.map<OrganizationMemberView>((m): OrganizationMemberView => ({
            userId: m.userId,
            username: usernameByUserId.get(m.userId),
            role: m.role,
            joinedAt: m.joinedAt,
        })),
        discordGuildId: org.discordGuildId,
        discordTransactionChannelId: org.discordTransactionChannelId,
        auecBalance: org.auecBalance,
        googleSheetId: org.googleSheetId,
        googleSheetLastSyncedAt: org.googleSheetLastSyncedAt,
        billing: {
            isPro: isProOrg(org),
            status: org.subscription?.status,
            currentPeriodEnd: org.subscription?.currentPeriodEnd?.toISOString(),
            cancelAtPeriodEnd: org.subscription?.cancelAtPeriodEnd,
            proOverride: org.proOverride?.enabled,
        },
    };
}

/* ─── Billing helpers ───────────────────────────────────────────────────── */

export async function setOrgStripeCustomerId(
    orgId: ObjectId,
    stripeCustomerId: string
): Promise<void> {
    const db = await getDb();
    await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: orgId },
        { $set: { "subscription.stripeCustomerId": stripeCustomerId, updatedAt: new Date() } }
    );
}

export async function setOrgSubscription(
    orgId: ObjectId,
    patch: Partial<OrgSubscription>
): Promise<void> {
    const db = await getDb();
    const setFields: Record<string, unknown> = { updatedAt: new Date() };
    for (const [k, v] of Object.entries(patch)) {
        setFields[`subscription.${k}`] = v;
    }
    await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: orgId },
        { $set: setFields }
    );
}

export async function getOrgByStripeCustomerId(
    stripeCustomerId: string
): Promise<OrganizationDocument | null> {
    const db = await getDb();
    return db
        .collection<OrganizationDocument>(COLLECTION)
        .findOne({ "subscription.stripeCustomerId": stripeCustomerId });
}

export async function getOrgByStripeSubscriptionId(
    stripeSubscriptionId: string
): Promise<OrganizationDocument | null> {
    const db = await getDb();
    return db
        .collection<OrganizationDocument>(COLLECTION)
        .findOne({ "subscription.stripeSubscriptionId": stripeSubscriptionId });
}

export async function setOrgProOverride(
    orgId: ObjectId,
    override: OrgProOverride
): Promise<void> {
    const db = await getDb();
    await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: orgId },
        { $set: { proOverride: override, updatedAt: new Date() } }
    );
}

/* ─── Google Sheets helpers ─────────────────────────────────────────────── */

export async function setOrgGoogleSheetId(
    orgId: ObjectId,
    sheetId: string
): Promise<void> {
    const db = await getDb();
    await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: orgId },
        { $set: { googleSheetId: sheetId, updatedAt: new Date() } }
    );
}

export async function clearOrgGoogleSheetId(orgId: ObjectId): Promise<void> {
    const db = await getDb();
    await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: orgId },
        { $unset: { googleSheetId: "", googleSheetLastSyncedAt: "" }, $set: { updatedAt: new Date() } }
    );
}

export async function setOrgGoogleSheetLastSynced(orgId: ObjectId): Promise<void> {
    const db = await getDb();
    await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: orgId },
        { $set: { googleSheetLastSyncedAt: new Date(), updatedAt: new Date() } }
    );
}

export async function unsetOrganizationDiscordGuildId(slug: string): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { slug },
        {
            $unset: { discordGuildId: "" },
            $set: { updatedAt: new Date() },
        }
    );

    return result.modifiedCount > 0;
}

export async function deleteOrganizationAndAllData(orgId: ObjectId): Promise<void> {
    const db = await getDb();

    await Promise.all([
        db.collection("organization_inventory_items").deleteMany({ organizationId: orgId }),
        db.collection("organization_transactions").deleteMany({ organizationId: orgId }),
        db.collection("organization_audit_logs").deleteMany({ organizationId: orgId }),
        db.collection("organization_invites").deleteMany({ organizationId: orgId }),
    ]);

    await db.collection("organizations").deleteOne({ _id: orgId });
}

export async function getAllOrganizationsForAdmin(): Promise<
    {
        org: OrganizationDocument;
        ownerUsername: string | undefined;
        memberCount: number;
        memberViews: OrganizationMemberView[];
    }[]
> {
    const db = await getDb();

    const orgs = await db
        .collection<OrganizationDocument>(COLLECTION)
        .find({})
        .sort({ createdAt: -1 })
        .toArray();

    if (orgs.length === 0) return [];

    // Collect all unique member userIds across all orgs
    const allMemberIds = Array.from(
        new Set(orgs.flatMap((o) => o.members.map((m) => m.userId)))
    )
        .filter((id) => ObjectId.isValid(id))
        .map((id) => new ObjectId(id));

    const users = allMemberIds.length
        ? await db
              .collection<UserDocument>("users")
              .find({ _id: { $in: allMemberIds } })
              .project({ _id: 1, name: 1 })
              .toArray()
        : [];

    const usernameById = new Map(users.map((u) => [u._id.toString(), u.name ?? undefined]));

    return orgs.map((org) => {
        const ownerMember = org.members.find((m) => m.role === "owner");
        const memberViews: OrganizationMemberView[] = org.members.map((m) => ({
            userId: m.userId,
            username: usernameById.get(m.userId) ?? m.userId,
            role: m.role,
            joinedAt: m.joinedAt,
        }));
        return {
            org,
            ownerUsername: ownerMember ? usernameById.get(ownerMember.userId) : undefined,
            memberCount: org.members.length,
            memberViews,
        };
    });
}

export async function transferOrganizationOwnership(
    orgId: string,
    newOwnerId: string
): Promise<boolean> {
    if (!ObjectId.isValid(orgId)) return false;

    const db = await getDb();
    const oid = new ObjectId(orgId);

    // Demote current owner → admin
    await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: oid, "members.role": "owner" },
        { $set: { "members.$.role": "admin", updatedAt: new Date() } }
    );

    // Promote new owner → owner
    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: oid, "members.userId": newOwnerId },
        { $set: { "members.$.role": "owner", updatedAt: new Date() } }
    );

    return result.modifiedCount > 0;
}

export async function updateOrgAuecSettings(
    orgId: ObjectId,
    patch: {
        auecBalance?: number;
    }
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: orgId },
        { $set: { ...patch, updatedAt: new Date() } }
    );

    return result.modifiedCount > 0;
}

export async function adjustOrgAuecBalance(
    orgId: ObjectId,
    delta: number
): Promise<void> {
    const db = await getDb();

    await db.collection<OrganizationDocument>(COLLECTION).updateOne(
        { _id: orgId },
        {
            $inc: { auecBalance: delta },
            $set: { updatedAt: new Date() },
        }
    );
}

export async function countOrganizationsCreatedByUser(userId: string): Promise<number> {
    if (!ObjectId.isValid(userId)) return 0;
    const db = await getDb();
    return db.collection("organizations").countDocuments({ createdByUserId: userId });
}

export async function setOrganizationDiscordTransactionChannelId(
    slug: string,
    channelId: string
): Promise<boolean> {
    const db = await getDb();

    const update = channelId
        ? { $set: { discordTransactionChannelId: channelId, updatedAt: new Date() } }
        : { $unset: { discordTransactionChannelId: 1 as const }, $set: { updatedAt: new Date() } };

    const result = await db
        .collection<OrganizationDocument>(COLLECTION)
        .updateOne({ slug }, update);

    return result.modifiedCount > 0;
}