import type { ObjectId } from "mongodb";

export type LegalDocEntry = {
    lastUpdated: string;
};

export type LegalDocDates = {
    privacy: LegalDocEntry;
    terms: LegalDocEntry;
    imprint: LegalDocEntry;
    cookies: LegalDocEntry;
};

export type LegalSettingsDocument = {
    _id?: ObjectId;
    currentVersion: string;        // date string e.g. "2026-03-06" — users must accept this
    publishedAt: Date;
    publishedByUsername: string;
    changeNote: string;
    documents: LegalDocDates;
};

export type LegalSettingsView = {
    currentVersion: string;
    publishedAt: string;           // ISO string
    publishedByUsername: string;
    changeNote: string;
    documents: LegalDocDates;
};
