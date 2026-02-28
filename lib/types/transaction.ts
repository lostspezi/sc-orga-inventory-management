import { ObjectId } from "mongodb";

export type OrganizationTransactionDocument = {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;

    inventoryItemId: ObjectId;
    itemId: ObjectId;
    itemName: string;

    direction: "member_to_org" | "org_to_member";
    initiatedBy: "member" | "admin";

    memberId: string;
    memberUsername: string;

    quantity: number;
    pricePerUnit: number;
    totalPrice: number;

    status: "requested" | "approved" | "completed" | "rejected" | "cancelled";
    memberConfirmed: boolean;
    adminConfirmed: boolean;

    note?: string;

    createdAt: Date;
    updatedAt: Date;
};

export type OrganizationTransactionView = {
    _id: string;
    organizationId: string;
    organizationSlug: string;

    inventoryItemId: string;
    itemId: string;
    itemName: string;

    direction: "member_to_org" | "org_to_member";
    initiatedBy: "member" | "admin";

    memberId: string;
    memberUsername: string;

    quantity: number;
    pricePerUnit: number;
    totalPrice: number;

    status: "requested" | "approved" | "completed" | "rejected" | "cancelled";
    memberConfirmed: boolean;
    adminConfirmed: boolean;

    note?: string;

    createdAt: string;
    updatedAt: string;
};
