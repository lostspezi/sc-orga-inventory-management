import {ObjectId} from "mongodb";

export type ItemDocument = {
    _id: ObjectId;
    name: string;
    normalizedName: string;
    description?: string;
    category?: string;
    itemClass?: string;
    grade?: string;
    size?: string;
    createdAt: Date;
    updatedAt: Date;
}
