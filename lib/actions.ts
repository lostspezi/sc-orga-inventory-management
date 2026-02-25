"use server"
import { signIn, signOut } from "@/auth"

export async function signInWithDiscord() {
    await signIn("discord", { redirectTo: "/terminal" })
}

export async function signOutAction() {
    await signOut({ redirectTo: "/login" })
}