import { ObjectId } from "mongodb";

export type AuecTransactionDocument = {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;
    memberId: string;
    memberUsername: string;
    direction: "member_to_org" | "org_to_member";
    auecAmount: number;
    status: "requested" | "approved" | "completed" | "rejected" | "cancelled";
    note?: string;
    memberConfirmed: boolean;
    adminConfirmed: boolean;
    adminConfirmedByUsername?: string;
    discordChannelId?: string;
    discordMessageId?: string;
    createdAt: Date;
    updatedAt: Date;
};

export type AuecTransactionView = {
    _id: string;
    organizationId: string;
    organizationSlug: string;
    memberId: string;
    memberUsername: string;
    direction: "member_to_org" | "org_to_member";
    auecAmount: number;
    status: "requested" | "approved" | "completed" | "rejected" | "cancelled";
    note?: string;
    memberConfirmed: boolean;
    adminConfirmed: boolean;
    adminConfirmedByUsername?: string;
    discordChannelId?: string;
    discordMessageId?: string;
    createdAt: string;
    updatedAt: string;
};
