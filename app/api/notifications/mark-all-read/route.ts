import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { markAllNotificationsReadInDb } from "@/lib/repositories/notification-repository";

export async function POST() {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await markAllNotificationsReadInDb(session.user.id);

    return NextResponse.json({ ok: true });
}
