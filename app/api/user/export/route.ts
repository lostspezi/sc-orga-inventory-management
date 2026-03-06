import { auth } from "@/auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import type { OrganizationDocument } from "@/lib/types/organization";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const userId = session.user.id;
    const db = await getDb();

    if (!ObjectId.isValid(userId)) {
        return new Response(JSON.stringify({ error: "Invalid user ID" }), { status: 400 });
    }

    const oid = new ObjectId(userId);

    const [user, orgs, notifications] = await Promise.all([
        db.collection("users").findOne({ _id: oid }, { projection: { _id: 1, name: 1, email: 1, image: 1, rsiHandle: 1, auecBalance: 1, createdAt: 1, updatedAt: 1 } }),
        db.collection<OrganizationDocument>("organizations").find(
            { "members.userId": userId },
            { projection: { _id: 1, name: 1, slug: 1, "members.$": 1, createdAt: 1 } }
        ).toArray(),
        db.collection("notifications").find(
            { userId: oid },
            { projection: { _id: 1, type: 1, title: 1, body: 1, createdAt: 1, readAt: 1 } }
        ).toArray(),
    ]);

    const payload = {
        exportedAt: new Date().toISOString(),
        schemaVersion: "1.0",
        user: user ? {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
            rsiHandle: user.rsiHandle ?? null,
            auecBalance: user.auecBalance ?? 0,
            createdAt: user.createdAt?.toISOString() ?? null,
            updatedAt: user.updatedAt?.toISOString() ?? null,
        } : null,
        memberships: orgs.map((org) => {
            const member = org.members.find((m) => m.userId === userId);
            return {
                organizationId: org._id.toString(),
                organizationName: org.name,
                organizationSlug: org.slug,
                role: member?.role ?? "member",
                joinedAt: member?.joinedAt?.toISOString() ?? null,
            };
        }),
        notifications: notifications.map((n) => ({
            id: n._id.toString(),
            type: n.type,
            title: n.title,
            body: n.body,
            createdAt: n.createdAt?.toISOString() ?? null,
            readAt: n.readAt?.toISOString() ?? null,
        })),
    };

    return new Response(JSON.stringify(payload, null, 2), {
        status: 200,
        headers: {
            "Content-Type": "application/json",
            "Content-Disposition": `attachment; filename="my-data-${new Date().toISOString().slice(0, 10)}.json"`,
        },
    });
}
