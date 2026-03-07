import {ObjectId} from "mongodb";

export type OrgSubscription = {
    status: "active" | "trialing" | "past_due" | "unpaid" | "canceled" | "incomplete";
    stripeCustomerId: string;
    stripeSubscriptionId: string;
    stripePriceId: string;
    currentPeriodEnd: Date;
    cancelAtPeriodEnd: boolean;
    updatedAt: Date;
};

export type OrgProOverride = {
    enabled: boolean;
    enabledByUserId: string;
    enabledByUsername: string;
    reason?: string;
    enabledAt: Date;
};

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
    timezone?: string;
    subscription?: OrgSubscription;
    proOverride?: OrgProOverride;
    createdAt: Date;
    updatedAt: Date;
};

export type OrganizationMember = {
    userId: string;
    role: "owner" | "admin" | "hr" | "member";
    joinedAt: Date;
    status?: "active" | "suspended";
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
    role: "owner" | "admin" | "hr" | "member";
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

export type OrgBillingView = {
    isPro: boolean;
    status?: OrgSubscription["status"];
    currentPeriodEnd?: string; // ISO string
    cancelAtPeriodEnd?: boolean;
    proOverride?: boolean;
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
    billing: OrgBillingView;
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
        | "member.rank_assigned"
        | "member.bulk_rank_assigned"
        | "member.suspended"
        | "member.reactivated"
        | "member.profile_updated"
        | "member.exported"
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
        | "integration.google_sheet_disconnected"
        | "billing.checkout_initiated"
        | "billing.subscribed"
        | "billing.canceled"
        | "billing.payment_failed"
        | "billing.pro_override_enabled"
        | "billing.pro_override_disabled"
        | "report.generation_requested"
        | "report.downloaded"
        | "report.regenerated"
        | "rank.created"
        | "rank.updated"
        | "rank.deleted";

    entityType: "organization" | "member" | "item" | "inventory_item" | "inventory" | "transaction" | "auec_transaction" | "report" | "rank";
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

    targetRole: "admin" | "hr" | "member";

    deliveryMethod: "email" | "discord_dm" | "in_app" | "permanent_link";
    maxUses?: number;
    useCount?: number;

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
    targetRole: "admin" | "hr" | "member";
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
    maxUses?: number;
    useCount?: number;
};
