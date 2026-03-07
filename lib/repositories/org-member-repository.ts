import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import type {
    OrgMemberDocument,
    OrgMemberView,
    RoleHistoryEntry,
    RankHistoryEntry,
    MemberStatus,
} from "@/lib/types/org-member";
import type { OrgRankDocument } from "@/lib/types/org-rank";

const COLLECTION = "organization_members";

type CreateOrgMemberInput = {
    organizationId: ObjectId;
    organizationSlug: string;
    userId: string;
    role: "owner" | "admin" | "hr" | "member";
    joinedAt: Date;
    invitedBy: string;
    rankId?: string;
};

type UserDoc = {
    _id: ObjectId;
    name?: string | null;
    image?: string | null;
    auecBalance?: number;
};

export async function createOrgMember(input: CreateOrgMemberInput): Promise<void> {
    const db = await getDb();
    const now = new Date();

    const doc: Omit<OrgMemberDocument, "_id"> = {
        organizationId: input.organizationId,
        organizationSlug: input.organizationSlug,
        userId: input.userId,
        role: input.role,
        status: "active",
        joinedAt: input.joinedAt,
        invitedBy: input.invitedBy,
        rankId: input.rankId,
        roleHistory: [],
        rankHistory: [],
        createdAt: now,
        updatedAt: now,
    };

    await db
        .collection<Omit<OrgMemberDocument, "_id">>(COLLECTION)
        .updateOne(
            { organizationId: input.organizationId, userId: input.userId },
            { $setOnInsert: doc },
            { upsert: true }
        );
}

export async function getOrgMemberByUserId(
    organizationId: ObjectId,
    userId: string
): Promise<OrgMemberDocument | null> {
    const db = await getDb();
    return db
        .collection<OrgMemberDocument>(COLLECTION)
        .findOne({ organizationId, userId });
}

type GetMembersFilters = {
    status?: MemberStatus;
    role?: string;
    rankId?: string;
};

export async function getOrgMembersByOrganizationId(
    organizationId: ObjectId,
    filters?: GetMembersFilters
): Promise<OrgMemberDocument[]> {
    const db = await getDb();

    const query: Record<string, unknown> = { organizationId };
    if (filters?.status) query.status = filters.status;
    if (filters?.role) query.role = filters.role;
    if (filters?.rankId) query.rankId = filters.rankId;

    return db
        .collection<OrgMemberDocument>(COLLECTION)
        .find(query)
        .sort({ joinedAt: 1 })
        .toArray();
}

export async function updateOrgMemberRole(
    organizationId: ObjectId,
    userId: string,
    newRole: "admin" | "hr" | "member",
    historyEntry: RoleHistoryEntry
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection<OrgMemberDocument>(COLLECTION).updateOne(
        { organizationId, userId },
        {
            $set: { role: newRole, updatedAt: new Date() },
            $push: { roleHistory: historyEntry },
        }
    );

    return result.modifiedCount > 0;
}

export async function updateOrgMemberRank(
    organizationId: ObjectId,
    userId: string,
    newRankId: string | null,
    historyEntry: RankHistoryEntry
): Promise<boolean> {
    const db = await getDb();

    const setFields: Record<string, unknown> = { updatedAt: new Date() };
    if (newRankId) {
        setFields.rankId = newRankId;
    } else {
        // unset rankId
    }

    const update = newRankId
        ? {
              $set: { rankId: newRankId, updatedAt: new Date() },
              $push: { rankHistory: historyEntry },
          }
        : {
              $unset: { rankId: 1 as const },
              $set: { updatedAt: new Date() },
              $push: { rankHistory: historyEntry },
          };

    const result = await db.collection<OrgMemberDocument>(COLLECTION).updateOne(
        { organizationId, userId },
        update
    );

    return result.modifiedCount > 0;
}

export async function bulkUpdateOrgMemberRank(
    organizationId: ObjectId,
    userIds: string[],
    newRankId: string,
    historyEntry: RankHistoryEntry
): Promise<number> {
    const db = await getDb();

    const result = await db.collection<OrgMemberDocument>(COLLECTION).updateMany(
        { organizationId, userId: { $in: userIds } },
        {
            $set: { rankId: newRankId, updatedAt: new Date() },
            $push: { rankHistory: historyEntry },
        }
    );

    return result.modifiedCount;
}

export async function updateOrgMemberProfile(
    organizationId: ObjectId,
    userId: string,
    updates: { displayName?: string; notes?: string; tags?: string[] }
): Promise<boolean> {
    const db = await getDb();

    const setFields: Record<string, unknown> = { updatedAt: new Date() };
    if (updates.displayName !== undefined) setFields.displayName = updates.displayName;
    if (updates.notes !== undefined) setFields.notes = updates.notes;
    if (updates.tags !== undefined) setFields.tags = updates.tags;

    const result = await db.collection<OrgMemberDocument>(COLLECTION).updateOne(
        { organizationId, userId },
        { $set: setFields }
    );

    return result.modifiedCount > 0;
}

export async function updateOrgMemberStatus(
    organizationId: ObjectId,
    userId: string,
    status: MemberStatus
): Promise<boolean> {
    const db = await getDb();

    const result = await db.collection<OrgMemberDocument>(COLLECTION).updateOne(
        { organizationId, userId },
        { $set: { status, updatedAt: new Date() } }
    );

    return result.modifiedCount > 0;
}

export async function removeOrgMemberDocument(
    organizationId: ObjectId,
    userId: string
): Promise<void> {
    const db = await getDb();
    await db.collection<OrgMemberDocument>(COLLECTION).deleteOne({ organizationId, userId });
}

export async function countMembersWithRank(
    organizationId: ObjectId,
    rankId: string
): Promise<number> {
    const db = await getDb();
    return db.collection<OrgMemberDocument>(COLLECTION).countDocuments({ organizationId, rankId });
}

export function toOrgMemberView(
    doc: OrgMemberDocument,
    username: string,
    rankName?: string,
    rankColor?: string,
    userImage?: string,
    auecBalance?: number
): OrgMemberView {
    return {
        _id: doc._id.toString(),
        organizationId: doc.organizationId.toString(),
        organizationSlug: doc.organizationSlug,
        userId: doc.userId,
        username,
        userImage,
        role: doc.role,
        status: doc.status,
        joinedAt: doc.joinedAt.toISOString(),
        invitedBy: doc.invitedBy,
        rankId: doc.rankId,
        rankName,
        rankColor,
        displayName: doc.displayName,
        notes: doc.notes,
        tags: doc.tags,
        roleHistory: doc.roleHistory.map((e) => ({
            ...e,
            changedAt: e.changedAt.toISOString(),
        })),
        rankHistory: doc.rankHistory.map((e) => ({
            ...e,
            assignedAt: e.assignedAt.toISOString(),
        })),
        auecBalance,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
    };
}

export async function buildOrgMemberViews(
    docs: OrgMemberDocument[],
    ranks: OrgRankDocument[]
): Promise<OrgMemberView[]> {
    if (docs.length === 0) return [];

    const db = await getDb();

    const userIds = docs
        .filter((d) => ObjectId.isValid(d.userId))
        .map((d) => new ObjectId(d.userId));

    const users = userIds.length
        ? await db
              .collection<UserDoc>("users")
              .find({ _id: { $in: userIds } })
              .project({ _id: 1, name: 1, image: 1, auecBalance: 1 })
              .toArray()
        : [];

    const userById = new Map(users.map((u) => [u._id.toString(), u]));
    const rankById = new Map(ranks.map((r) => [r._id.toString(), r]));

    return docs.map((doc) => {
        const user = userById.get(doc.userId);
        const rank = doc.rankId ? rankById.get(doc.rankId) : undefined;
        return toOrgMemberView(
            doc,
            user?.name ?? doc.userId,
            rank?.name,
            rank?.color,
            user?.image ?? undefined,
            user?.auecBalance
        );
    });
}
