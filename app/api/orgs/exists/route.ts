import {NextResponse} from "next/server";
import {getDb} from "@/lib/db";

export const runtime = "nodejs";

function sanitizeHandle(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9_-]/g, "");
}

export async function GET(req: Request) {
    const {searchParams} = new URL(req.url);
    const raw = searchParams.get("handle") ?? "";
    const handle = sanitizeHandle(raw);

    if (!handle) {
        return NextResponse.json({exists: false, handle}, {status: 200});
    }

    const db = await getDb();

    const existing = await db.collection("organizations").findOne(
        {slug: handle},
        {projection: {_id: 1}}
    );

    return NextResponse.json({exists: Boolean(existing), handle}, {status: 200});
}