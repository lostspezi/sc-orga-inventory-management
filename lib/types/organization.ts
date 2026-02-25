import {ObjectId} from "mongodb";

export type OrganizationDocument = {
    _id: ObjectId
    name: string;
    slug: string;
    starCitizenOrganizationUrl: string;
    createdByUserId: string;
    members: OrganizationMember[];
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
    createdAt: Date;
    updatedAt: Date;
}

export type OrganizationMemberView = {
    username: string;
    role: "owner" | "admin" | "member";
    joinedAt: Date;
}