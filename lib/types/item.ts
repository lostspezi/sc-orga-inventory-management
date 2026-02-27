import {ObjectId} from "mongodb";

export type ItemDocument = {
    _id: ObjectId;
    name: string;
    normalizedName: string;
    description?: string;
    category?: string;
    createdAt: Date;
    updatedAt: Date;
}
