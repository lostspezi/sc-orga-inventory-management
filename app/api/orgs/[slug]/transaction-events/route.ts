import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getTransactionsUpdatedSince } from "@/lib/repositories/organization-transaction-repository";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return new Response("Unauthorized", { status: 401 });
    }

    const { slug } = await params;
    const org = await getOrganizationBySlug(slug);

    if (!org) {
        return new Response("Not Found", { status: 404 });
    }

    const member = org.members.find((m) => m.userId === session.user!.id);

    if (!member) {
        return new Response("Forbidden", { status: 403 });
    }

    const encoder = new TextEncoder();
    let since = new Date(Date.now() - 2000);

    const stream = new ReadableStream({
        start(controller) {
            const send = (data: object) => {
                try {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
                } catch {
                    // Connection closed
                }
            };

            send({ type: "connected" });

            const interval = setInterval(async () => {
                try {
                    const cutoff = since;
                    since = new Date();
                    const updates = await getTransactionsUpdatedSince(org._id, cutoff);
                    for (const tx of updates) {
                        send({ type: "transaction.update", transaction: tx });
                    }
                } catch {
                    // Ignore poll errors — client stays connected
                }
            }, 3000);

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
