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

    return NextResponse.next()
}

export const config = {
    matcher: ["/terminal/:path*"],
}