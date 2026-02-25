import NextAuth from "next-auth"
import Discord from "@auth/core/providers/discord";
import {MongoDBAdapter} from "@auth/mongodb-adapter";
import client from "@/lib/db";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(client),
    providers: [Discord],
})