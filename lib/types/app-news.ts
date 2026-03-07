import type { ObjectId } from "mongodb";

export type NewsLocale = "en" | "de" | "fr";
export type TranslationStatus = "missing" | "generating" | "ready" | "edited" | "error";
export type NewsStatus = "draft" | "translation_pending" | "ready_to_publish" | "published" | "archived";

export type NewsTranslation = {
    title: string;
    body: string;
    status: TranslationStatus;
    translatedAt?: Date;
    editedAt?: Date;
    modelUsed?: string;
    errorMessage?: string;
};

export type DiscordPostResult = {
    guildId: string;
    channelId: string;
    messageId: string;
    postedAt: Date;
    updatedAt?: Date;
    failureReason?: string;
};

export type AppNewsDocument = {
    _id: ObjectId;
    slug: string;
    primaryLocale: NewsLocale;
    title: string;
    body: string;
    translations: Partial<Record<NewsLocale, NewsTranslation>>;
    status: NewsStatus;
    publishedAt?: Date;
    archivedAt?: Date;
    discord?: DiscordPostResult;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
};

export type NewsTranslationView = {
    title: string;
    body: string;
    status: TranslationStatus;
    translatedAt?: string;
    editedAt?: string;
    modelUsed?: string;
    errorMessage?: string;
};

export type AppNewsView = {
    _id: string;
    slug: string;
    primaryLocale: NewsLocale;
    title: string;
    body: string;
    translations: Partial<Record<NewsLocale, NewsTranslationView>>;
    status: NewsStatus;
    publishedAt?: string;
    archivedAt?: string;
    discord?: {
        guildId: string;
        channelId: string;
        messageId: string;
        postedAt: string;
        updatedAt?: string;
        failureReason?: string;
    };
    createdAt: string;
    updatedAt: string;
};

// Locale-resolved view for user-facing components
export type AppNewsPublicView = {
    _id: string;
    slug: string;
    title: string;
    body: string;
    locale: NewsLocale;
    publishedAt: string;
};
