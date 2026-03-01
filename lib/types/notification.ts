import { ObjectId } from "mongodb";

export type NotificationDocument = {
    _id: ObjectId;
    userId: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: Date;
};

export type NotificationView = {
    _id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
};
