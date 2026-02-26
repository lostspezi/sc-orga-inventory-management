import {ObjectId} from "mongodb";

export type OrganizationDocument = {
    _id: ObjectId
    name: string;
    slug: string;
    starCitizenOrganizationUrl: string;
    createdByUserId: string;
    members: OrganizationMember[];
    discordGuildId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type OrganizationMember = {
    userId: string;
    role: "owner" | "admin" | "member";
    joinedAt: Date;
}

export type OrganizationView = {
    _id: ObjectId
    name: string;
    slug: string;
    starCitizenOrganizationUrl: string;
    createdByUsername: string;
    members: OrganizationMemberView[];
    discordGuildId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export type OrganizationMemberView = {
    userId: string;
    username: string;
    role: "owner" | "admin" | "member";
    joinedAt: Date;
}

/* AUDIT */
export type OrganizationAuditLogDocument = {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;

    actorUserId: string;
    actorUsername?: string;

    action:
        | "organization.created"
        | "member.invited_discord"
        | "member.added"
        | "member.removed"
        | "member.role_changed";

    entityType: "organization" | "member";
    entityId?: string;

    message: string;

    metadata?: Record<string, unknown>;

    createdAt: Date;
};

/* INVITE */
export type OrganizationInviteDocument = {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;

    invitedByUserId: string;
    invitedByUsername?: string;

    targetRole: "admin" | "member";

    deliveryMethod: "email" | "discord_dm" | "in_app";

    inviteToken: string;
    email?: string;
    discordUserId?: string;
    targetUserId?: string;

    status: "pending" | "accepted" | "declined" | "expired" | "revoked";

    expiresAt: Date;
    acceptedAt?: Date;
    declinedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
};
