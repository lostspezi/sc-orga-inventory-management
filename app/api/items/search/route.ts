import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { searchItemsByName } from "@/lib/repositories/item-repository";

export const runtime = "nodejs";

export async function GET(req: Request) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";

    if (!q) {
        return NextResponse.json({ results: [] }, { status: 200 });
    }

    const items = await searchItemsByName(q);

    const results = items.map((item) => ({
        id: item._id.toString(),
        name: item.name,
        normalizedName: item.normalizedName,
        category: item.category ?? null,
        description: item.description ?? null,
    }));

    return NextResponse.json({ results }, { status: 200 });
}