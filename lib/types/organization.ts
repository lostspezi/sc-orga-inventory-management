import {ObjectId} from "mongodb";

export type OrganizationDocument = {
    _id: ObjectId;
    name: string;
    slug: string;
    starCitizenOrganizationUrl: string;
    createdByUserId: string;
    members: OrganizationMember[];
    discordGuildId?: string;
    discordTransactionChannelId?: string;
    auecBalance?: number;
    googleSheetId?: string;
    googleSheetLastSyncedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type OrganizationMember = {
    userId: string;
    role: "owner" | "admin" | "member";
    joinedAt: Date;
};

export type OrganizationInventoryItemDocument = {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;
    name: string;
    normalizedName: string;
    category?: string;
    scWikiUuid?: string;
    unit?: string;

    buyPrice: number;
    sellPrice: number;
    quantity: number;
    minStock?: number;
    maxStock?: number;

    createdAt: Date;
    updatedAt: Date;
};

export type OrganizationMemberView = {
    userId: string;
    username: string;
    role: "owner" | "admin" | "member";
    joinedAt: Date;
};

export type OrganizationInventoryItemView = {
    inventoryItemId: ObjectId;
    name: string;
    normalizedName: string;
    category?: string;
    scWikiUuid?: string;
    unit?: string;
    buyPrice: number;
    sellPrice: number;
    quantity: number;
    minStock?: number;
    maxStock?: number;
    createdAt: Date;
    updatedAt: Date;
};

export type OrganizationView = {
    _id: ObjectId;
    name: string;
    slug: string;
    starCitizenOrganizationUrl: string;
    createdByUsername?: string;
    members: OrganizationMemberView[];
    discordGuildId?: string;
    discordTransactionChannelId?: string;
    auecBalance?: number;
    googleSheetId?: string;
    googleSheetLastSyncedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
};

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
        | "member.role_changed"
        | "integration.discord_disconnected"
        | "integration.discord_connected"
        | "item.created"
        | "inventory.item_added"
        | "inventory.item_removed"
        | "inventory.item_updated"
        | "transaction.requested"
        | "transaction.approved"
        | "transaction.rejected"
        | "transaction.confirmed"
        | "transaction.completed"
        | "transaction.cancelled"
        | "member.permanent_invite_created"
        | "member.permanent_invite_revoked"
        | "member.joined_via_permanent_link"
        | "auec.settings_updated"
        | "auec_transaction.requested"
        | "auec_transaction.approved"
        | "auec_transaction.rejected"
        | "auec_transaction.confirmed"
        | "auec_transaction.completed"
        | "auec_transaction.cancelled"
        | "inventory.cleared"
        | "integration.google_sheet_connected"
        | "integration.google_sheet_disconnected";

    entityType: "organization" | "member" | "item" | "inventory_item" | "inventory" | "transaction" | "auec_transaction";
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

    deliveryMethod: "email" | "discord_dm" | "in_app" | "permanent_link";

    inviteToken: string;
    email?: string;
    discordUserId?: string;
    targetUserId?: string;

    isPermanent?: boolean;
    permanentRawToken?: string;

    status: "pending" | "accepted" | "declined" | "expired" | "revoked";

    expiresAt: Date;
    acceptedAt?: Date;
    declinedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
};

export type OrganizationInviteView = {
    id: string;
    organizationSlug: string;
    invitedByUserId: string;
    invitedByUsername?: string;
    targetRole: "admin" | "member";
    deliveryMethod: "email" | "discord_dm" | "in_app" | "permanent_link";
    inviteToken: string;
    email?: string;
    discordUserId?: string;
    targetUserId?: string;
    isPermanent?: boolean;
    permanentRawToken?: string;
    status: "pending" | "accepted" | "declined" | "expired" | "revoked";
    expiresAt: string;
    createdAt: string;
};
