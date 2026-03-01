import { getRequestConfig } from "next-intl/server";
import { cookies, headers } from "next/headers";
import { defaultLocale, locales, type Locale } from "./config";

export default getRequestConfig(async () => {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get("NEXT_LOCALE")?.value;

    let locale: Locale = defaultLocale;

    if (cookieLocale && locales.includes(cookieLocale as Locale)) {
        locale = cookieLocale as Locale;
    } else {
        // Fall back to browser Accept-Language
        const headersList = await headers();
        const acceptLanguage = headersList.get("accept-language") ?? "";
        const preferred = acceptLanguage.split(",")[0]?.split("-")[0]?.toLowerCase();
        if (preferred && locales.includes(preferred as Locale)) {
            locale = preferred as Locale;
        }
    }

    return {
        locale,
        messages: (await import(`../messages/${locale}.json`)).default,
    };
});
