import { ObjectId } from "mongodb";

export type AppNewsDocument = {
    _id: ObjectId;
    title: string;
    body: string;
    publishedAt: Date;
    createdAt: Date;
    updatedAt: Date;
};

export type AppNewsView = {
    _id: string;
    title: string;
    body: string;
    publishedAt: string;
};
