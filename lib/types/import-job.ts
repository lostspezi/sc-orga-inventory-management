import { ObjectId } from "mongodb";

export type ImportRowInput = {
    name: string;
    buyPrice?: number;
    sellPrice?: number;
    quantity?: number;
    minStock?: number;
    maxStock?: number;
};

export type ImportRowResult = {
    rowIndex: number;
    inputName: string;
    status: "success" | "not_found" | "already_exists" | "error";
    resolvedName?: string;
    scUuid?: string;
    message?: string;
};

export type ImportJobDocument = {
    _id: ObjectId;
    organizationId: ObjectId;
    organizationSlug: string;
    initiatedByUserId: string;
    initiatedByUsername: string;
    status: "pending" | "processing" | "completed" | "failed";
    totalRows: number;
    processedRows: number;
    rows: ImportRowInput[];
    results: ImportRowResult[];
    createdAt: Date;
    completedAt?: Date;
};

export type ImportJobView = {
    id: string;
    organizationSlug: string;
    initiatedByUsername: string;
    status: "pending" | "processing" | "completed" | "failed";
    totalRows: number;
    processedRows: number;
    rows: ImportRowInput[];
    results: ImportRowResult[];
    createdAt: string;
    completedAt?: string;
};
