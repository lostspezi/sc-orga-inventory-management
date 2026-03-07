import { ObjectId } from "mongodb";

export type OrgRankDocument = {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;
    name: string;
    description?: string;
    order: number; // lower = lower in hierarchy (1=Recruit, 100=Commander)
    color?: string; // hex, e.g. "#4fc3dc"
    isDefault: boolean;
    createdBy: string; // userId
    createdAt: Date;
    updatedAt: Date;
};

export type OrgRankView = {
    _id: string;
    organizationId: string;
    name: string;
    description?: string;
    order: number;
    color?: string;
    isDefault: boolean;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
};
