import type { ObjectId } from "mongodb";

export type SocialSettingsDocument = {
    _id?: ObjectId;
    discord?: string;
    github?: string;
    twitter?: string;
    reddit?: string;
    youtube?: string;
};

export type SocialSettingsView = {
    discord: string;
    github: string;
    twitter: string;
    reddit: string;
    youtube: string;
};
