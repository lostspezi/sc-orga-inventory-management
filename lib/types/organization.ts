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
    raidHelperApiKey?: string;
    auecBalance?: number;
    auecBuyPriceDkp?: number;
    auecBuyPriceAuec?: number;
    auecSellPriceDkp?: number;
    auecSellPriceAuec?: number;
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
    itemId: ObjectId;

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
    itemId: ObjectId;
    name: string;
    normalizedName: string;
    description?: string;
    category?: string;
    itemClass?: string;
    grade?: string;
    size?: string;
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
    raidHelperApiKey?: string;
    auecBalance?: number;
    auecBuyPriceDkp?: number;
    auecBuyPriceAuec?: number;
    auecSellPriceDkp?: number;
    auecSellPriceAuec?: number;
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
        | "integration.raidhelper_connected"
        | "integration.raidhelper_disconnected"
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
        | "auec_transaction.cancelled";

    entityType: "organization" | "member" | "item" | "inventory_item" | "transaction" | "auec_transaction";
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
