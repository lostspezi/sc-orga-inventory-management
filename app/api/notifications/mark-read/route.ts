import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { markNotificationReadInDb } from "@/lib/repositories/notification-repository";

export async function POST(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await req.json();

    if (!id || typeof id !== "string") {
        return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await markNotificationReadInDb(id, session.user.id);

    return NextResponse.json({ ok: true });
}
