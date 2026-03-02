import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface Session {
        user: {
            rsiHandle?: string | null;
        } & DefaultSession["user"];
    }

    interface User {
        rsiHandle?: string | null;
    }
}
