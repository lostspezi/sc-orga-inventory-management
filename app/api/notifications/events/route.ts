import { NextRequest } from "next/server";
import { auth } from "@/auth";
import {
    getNotificationsForUser,
    getUnreadCountForUser,
    getNotificationsCreatedSince,
} from "@/lib/repositories/notification-repository";
import type { NotificationDocument } from "@/lib/types/notification";
import type { NotificationView } from "@/lib/types/notification";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function toView(doc: NotificationDocument): NotificationView {
    return {
        _id: doc._id.toString(),
        type: doc.type,
        title: doc.title,
        message: doc.message,
        link: doc.link,
        read: doc.read,
        createdAt: doc.createdAt.toISOString(),
    };
}

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const userId = session.user.id;
    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const send = (data: object) => {
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                } catch { /* connection closed */ }
            };

            // Send initial state immediately
            const [notifications, unreadCount] = await Promise.all([
                getNotificationsForUser(userId, 20),
                getUnreadCountForUser(userId),
            ]);

            send({
                type: "init",
                notifications: notifications.map(toView),
                unreadCount,
            });

            let since = new Date();

            const interval = setInterval(async () => {
                try {
                    const fresh = await getNotificationsCreatedSince(userId, since);
                    if (fresh.length > 0) {
                        since = new Date();
                        const unread = await getUnreadCountForUser(userId);
                        send({
                            type: "new",
                            notifications: fresh.map(toView),
                            unreadCount: unread,
                        });
                    }
                } catch { /* ignore poll errors */ }
            }, 5000);

            req.signal.addEventListener("abort", () => {
                clearInterval(interval);
                try { controller.close(); } catch { /* already closed */ }
            });
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    });
}
