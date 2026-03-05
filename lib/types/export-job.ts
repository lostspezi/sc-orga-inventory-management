import { ObjectId } from "mongodb";

export type ExportJobDocument = {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;
    initiatedByUserId: string;
    initiatedByUsername: string;
    status: "pending" | "processing" | "completed" | "failed";
    itemCount?: number;
    csvContent?: string;
    createdAt: Date;
    completedAt?: Date;
};

export type ExportJobView = {
    id: string;
    organizationSlug: string;
    status: "pending" | "processing" | "completed" | "failed";
    itemCount?: number;
    createdAt: string;
    completedAt?: string;
};
