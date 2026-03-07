import { ObjectId } from "mongodb";

export type MemberStatus = "active" | "inactive" | "suspended";

export type RoleHistoryEntry = {
    fromRole: string;
    toRole: string;
    changedBy: string;
    changedByUsername: string;
    changedAt: Date;
    reason?: string;
};

export type RankHistoryEntry = {
    fromRankId?: string;
    toRankId?: string;
    assignedBy: string;
    assignedByUsername: string;
    assignedAt: Date;
    reason?: string;
};

export type RoleHistoryEntryView = {
    fromRole: string;
    toRole: string;
    changedBy: string;
    changedByUsername: string;
    changedAt: string; // ISO
    reason?: string;
};

export type RankHistoryEntryView = {
    fromRankId?: string;
    toRankId?: string;
    assignedBy: string;
    assignedByUsername: string;
    assignedAt: string; // ISO
    reason?: string;
};

export type OrgMemberDocument = {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;
    userId: string;
    role: "owner" | "admin" | "hr" | "member";
    status: MemberStatus;
    joinedAt: Date;
    invitedBy: string; // userId or "permanent_link" or "unknown"
    rankId?: string;
    displayName?: string;
    notes?: string;
    tags?: string[];
    roleHistory: RoleHistoryEntry[];
    rankHistory: RankHistoryEntry[];
    createdAt: Date;
    updatedAt: Date;
};

export type OrgMemberView = {
    _id: string;
    organizationId: string;
    organizationSlug: string;
    userId: string;
    username: string;
    userImage?: string;
    role: "owner" | "admin" | "hr" | "member";
    status: MemberStatus;
    joinedAt: string; // ISO
    invitedBy: string;
    rankId?: string;
    rankName?: string;
    rankColor?: string;
    displayName?: string;
    notes?: string;
    tags?: string[];
    roleHistory: RoleHistoryEntryView[];
    rankHistory: RankHistoryEntryView[];
    auecBalance?: number;
    createdAt: string;
    updatedAt: string;
};
