import { NextResponse } from "next/server";

export const runtime = "nodejs";

function sanitizeHandle(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9_-]/g, "");
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const raw = searchParams.get("handle") ?? "";
    const handle = sanitizeHandle(raw);

    if (!handle) {
        return NextResponse.json({ exists: false, handle, url: null }, { status: 200 });
    }

    const url = `https://robertsspaceindustries.com/en/orgs/${handle}`;

    try {
        const res = await fetch(url, {
            method: "GET",
            redirect: "manual",
            // Cache aus, damit du nicht alte Ergebnisse bekommst
            cache: "no-store",
            headers: {
                "User-Agent": "Mozilla/5.0",
                "Accept": "text/html,application/xhtml+xml",
            },
        });

        const exists = res.status === 200;

        return NextResponse.json(
            { exists, handle, url: exists ? url : null, status: res.status },
            { status: 200 }
        );
    } catch {
        return NextResponse.json(
            { exists: false, handle, url: null, status: "error" },
            { status: 200 }
        );
    }
}