"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { NotificationView } from "@/lib/types/notification";

function timeAgo(iso: string): string {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "just now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotificationsPageClient({
    notifications: initial,
}: {
    notifications: NotificationView[];
}) {
    const [notifications, setNotifications] = useState(initial);
    const router = useRouter();

    const unreadCount = notifications.filter((n) => !n.read).length;

    const markRead = useCallback(async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        await fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
    }, []);

    const markAllRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        await fetch("/api/notifications/mark-all-read", { method: "POST" });
    }, []);

    const handleClick = useCallback(
        async (n: NotificationView) => {
            if (!n.read) await markRead(n._id);
            if (n.link) router.push(n.link);
        },
        [markRead, router]
    );

    return (
        <section
            className="hud-panel overflow-hidden"
            style={{ background: "rgba(8,16,24,0.45)" }}
        >
            {/* Section header */}
            <div
                className="flex items-center justify-between border-b px-5 py-3"
                style={{ borderColor: "rgba(79,195,220,0.1)" }}
            >
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                >
                    {notifications.length} total
                    {unreadCount > 0 && ` · ${unreadCount} unread`}
                </p>
                {unreadCount > 0 && (
                    <button
                        type="button"
                        onClick={markAllRead}
                        className="cursor-pointer text-[10px] uppercase tracking-[0.15em] transition-colors"
                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                        onMouseEnter={(e) => {
                            (e.currentTarget as HTMLElement).style.color = "rgba(79,195,220,0.85)";
                        }}
                        onMouseLeave={(e) => {
                            (e.currentTarget as HTMLElement).style.color = "rgba(79,195,220,0.5)";
                        }}
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <p
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                >
                    No notifications yet.
                </p>
            ) : (
                <ul className="divide-y" style={{ borderColor: "rgba(79,195,220,0.07)" }}>
                    {notifications.map((n) => (
                        <li key={n._id}>
                            <button
                                type="button"
                                onClick={() => handleClick(n)}
                                className="w-full cursor-pointer px-5 py-4 text-left transition-colors"
                                style={{
                                    background: n.read ? "transparent" : "rgba(79,195,220,0.03)",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLElement).style.background =
                                        "rgba(79,195,220,0.07)";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLElement).style.background = n.read
                                        ? "transparent"
                                        : "rgba(79,195,220,0.03)";
                                }}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Unread dot */}
                                    <span
                                        className="mt-[5px] h-2 w-2 shrink-0 rounded-full"
                                        style={{
                                            background: n.read
                                                ? "rgba(79,195,220,0.12)"
                                                : "rgba(79,195,220,0.8)",
                                        }}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-baseline justify-between gap-3">
                                            <p
                                                className="truncate text-sm font-medium"
                                                style={{
                                                    color: n.read
                                                        ? "rgba(200,220,232,0.5)"
                                                        : "rgba(200,220,232,0.88)",
                                                    fontFamily: "var(--font-mono)",
                                                }}
                                            >
                                                {n.title}
                                            </p>
                                            <span
                                                className="shrink-0 text-[10px]"
                                                style={{
                                                    color: "rgba(79,195,220,0.35)",
                                                    fontFamily: "var(--font-mono)",
                                                }}
                                            >
                                                {timeAgo(n.createdAt)}
                                            </span>
                                        </div>
                                        <p
                                            className="mt-0.5 text-xs"
                                            style={{
                                                color: "rgba(200,220,232,0.38)",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {n.message}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
