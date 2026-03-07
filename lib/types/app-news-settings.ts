import type { ObjectId } from "mongodb";

export type AppNewsSettingsDocument = {
    _id?: ObjectId;
    discordGuildId: string;
    discordChannelId: string;
    autoPostOnPublish: boolean;
    lastTestPostedAt?: Date;
    lastTestResult?: "success" | "failure";
    lastTestError?: string;
    updatedAt: Date;
};

export type AppNewsSettingsView = {
    discordGuildId: string;
    discordChannelId: string;
    autoPostOnPublish: boolean;
    lastTestPostedAt?: string;
    lastTestResult?: "success" | "failure";
    lastTestError?: string;
    updatedAt: string;
};
