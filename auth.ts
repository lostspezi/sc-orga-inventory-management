import NextAuth from "next-auth"
import Discord from "@auth/core/providers/discord";
import {MongoDBAdapter} from "@auth/mongodb-adapter";
import client from "@/lib/db";
import { sendEmail } from "@/lib/email/send-email";
import { renderWelcomeEmail } from "@/lib/email/templates/welcome";

export const { handlers, signIn, signOut, auth } = NextAuth({
    adapter: MongoDBAdapter(client),
    providers: [Discord],
    callbacks: {
        session({ session, user }) {
            session.user.rsiHandle = (user as { rsiHandle?: string | null }).rsiHandle ?? null;
            return session;
        },
    },
    events: {
        async createUser({ user }) {
            if (!user.email) return;

            const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sc-orga.app";
            const { html, text } = renderWelcomeEmail({
                userName: user.name ?? user.email,
                appUrl,
            });

            try {
                await sendEmail({
                    to: user.email,
                    subject: "Welcome to SC Orga Manager — your command hub is ready",
                    html,
                    text,
                });
            } catch (err) {
                console.error("[auth] failed to send welcome email:", err);
            }
        },
    },
})