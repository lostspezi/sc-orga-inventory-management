import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { getAppNewsById, setAppNewsStatus, toAppNewsView } from "@/lib/repositories/app-news-repository";

async function guardSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id) return null;
    if (!(await isSuperAdmin(session.user.id))) return null;
    return session;
}

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await guardSuperAdmin();
    if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await params;
    const doc = await getAppNewsById(id);
    if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (doc.status === "published" || doc.status === "archived") {
        return NextResponse.json({ error: `Cannot mark ready from ${doc.status}` }, { status: 409 });
    }

    await setAppNewsStatus(id, "ready_to_publish");
    const updated = await getAppNewsById(id);
    return NextResponse.json(toAppNewsView(updated!));
}
