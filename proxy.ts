import {NextRequest, NextResponse} from "next/server";
import {auth} from "@/auth";

export async function proxy(req: NextRequest) {
    const session = await auth()
    const isLoggedIn = !!session
    const isTerminal = req.nextUrl.pathname.startsWith("/terminal")

    if (isTerminal && !isLoggedIn) {
        const loginUrl = new URL("/login", req.nextUrl.origin)
        loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname)
        return NextResponse.redirect(loginUrl)
    }

    // Gate: force RSI handle setup before accessing any terminal page except settings
    const isSettingsPage = req.nextUrl.pathname.startsWith("/terminal/settings")
    const hasRsiHandle = !!session?.user?.rsiHandle

    if (isTerminal && isLoggedIn && !hasRsiHandle && !isSettingsPage) {
        const settingsUrl = new URL("/terminal/settings", req.nextUrl.origin)
        settingsUrl.searchParams.set("setup", "rsi")
        return NextResponse.redirect(settingsUrl)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/terminal/:path*"],
}