"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { locales, type Locale } from "@/i18n/config";

export async function setLocaleAction(locale: string): Promise<void> {
    if (!locales.includes(locale as Locale)) return;

    const cookieStore = await cookies();
    cookieStore.set("NEXT_LOCALE", locale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365, // 1 year
        sameSite: "lax",
    });

    revalidatePath("/", "layout");
}
