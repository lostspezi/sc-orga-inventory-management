"use server";

import { signIn, signOut } from "@/auth";

type Props = {
    callbackUrl?: string;
};

export async function signInWithDiscord({ callbackUrl }: Readonly<Props>) {
    await signIn("discord", {
        redirectTo: callbackUrl || "/terminal",
    });
}

export async function signOutAction() {
    await signOut({ redirectTo: "/login" });
}