"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import type { NotificationView } from "@/lib/types/notification";

export default function NotificationsPageClient({
    notifications: initial,
}: {
    notifications: NotificationView[];
}) {
    const [notifications, setNotifications] = useState(initial);
    const router = useRouter();
    const t = useTranslations("notifications");
    const format = useFormatter();

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
                    {unreadCount > 0
                        ? t("totalWithUnread", { total: notifications.length, unread: unreadCount })
                        : t("total", { count: notifications.length })}
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
                        {t("markAllRead")}
                    </button>
                )}
            </div>

            {notifications.length === 0 ? (
                <p
                    className="px-5 py-10 text-center text-sm"
                    style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                >
                    {t("empty")}
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
                                                {format.relativeTime(new Date(n.createdAt))}
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
