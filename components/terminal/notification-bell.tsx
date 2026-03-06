"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { useTranslations, useFormatter, useNow } from "next-intl";
import type { NotificationView } from "@/lib/types/notification";

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<NotificationView[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const t = useTranslations("notifications");
    const format = useFormatter();
    const now = useNow({ updateInterval: 60_000 });

    // SSE subscription
    useEffect(() => {
        const es = new EventSource("/api/notifications/events");

        es.onmessage = (e) => {
            const data = JSON.parse(e.data as string);

            if (data.type === "init") {
                setNotifications(data.notifications as NotificationView[]);
                setUnreadCount(data.unreadCount as number);
            } else if (data.type === "new") {
                setNotifications((prev) => {
                    const ids = new Set(prev.map((n) => n._id));
                    const fresh = (data.notifications as NotificationView[]).filter(
                        (n) => !ids.has(n._id)
                    );
                    return [...fresh, ...prev].slice(0, 50);
                });
                setUnreadCount(data.unreadCount as number);
            }
        };

        return () => es.close();
    }, []);

    // Close on outside click
    useEffect(() => {
        if (!open) return;
        const handler = (e: PointerEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("pointerdown", handler, true);
        return () => document.removeEventListener("pointerdown", handler, true);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    const markRead = useCallback(async (id: string) => {
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        await fetch("/api/notifications/mark-read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id }),
        });
    }, []);

    const markAllRead = useCallback(async () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        await fetch("/api/notifications/mark-all-read", { method: "POST" });
    }, []);

    const handleClick = useCallback(
        async (n: NotificationView) => {
            if (!n.read) await markRead(n._id);
            setOpen(false);
            if (n.link) router.push(n.link);
        },
        [markRead, router]
    );

    const preview = notifications.slice(0, 8);

    return (
        <div ref={containerRef} className="relative">
            {/* Bell button */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Notifications"
                className="relative cursor-pointer flex items-center justify-center rounded-lg border p-2 transition-colors"
                style={{
                    borderColor: open ? "rgba(79,195,220,0.35)" : "rgba(79,195,220,0.15)",
                    background: open ? "rgba(79,195,220,0.08)" : "rgba(79,195,220,0.03)",
                }}
            >
                <Bell
                    size={16}
                    style={{
                        color: unreadCount > 0
                            ? "rgba(79,195,220,0.9)"
                            : "rgba(79,195,220,0.4)",
                    }}
                />
                {unreadCount > 0 && (
                    <span
                        className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full px-0.5 text-[9px] font-bold"
                        style={{
                            background: "rgba(79,195,220,0.9)",
                            color: "#050d14",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="fixed right-2 top-[3.75rem] z-50 w-[min(20rem,calc(100vw-1rem))] rounded-xl border shadow-2xl sm:absolute sm:right-0 sm:top-full sm:mt-1.5"
                    style={{
                        borderColor: "rgba(79,195,220,0.18)",
                        background: "rgba(6,12,18,0.97)",
                        backdropFilter: "blur(16px)",
                    }}
                >
                    {/* Top glow */}
                    <div
                        className="absolute left-4 right-4 top-0 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                        }}
                    />

                    {/* Header */}
                    <div
                        className="flex items-center justify-between border-b px-4 py-3"
                        style={{ borderColor: "rgba(79,195,220,0.1)" }}
                    >
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: "rgba(79,195,220,0.6)", fontFamily: "var(--font-mono)" }}
                        >
                            {unreadCount > 0 ? t("unread", { count: unreadCount }) : t("title")}
                        </p>
                        {unreadCount > 0 && (
                            <button
                                type="button"
                                onClick={markAllRead}
                                className="cursor-pointer text-[10px] uppercase tracking-[0.15em] transition-colors text-[rgba(79,195,220,0.5)] hover:text-[rgba(79,195,220,0.85)]"
                                style={{ fontFamily: "var(--font-mono)" }}
                            >
                                {t("markAllRead")}
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="max-h-[22rem] overflow-y-auto">
                        {preview.length === 0 ? (
                            <p
                                className="px-4 py-8 text-center text-xs"
                                style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("empty")}
                            </p>
                        ) : (
                            <ul>
                                {preview.map((n) => (
                                    <li key={n._id}>
                                        <button
                                            type="button"
                                            onClick={() => handleClick(n)}
                                            className="w-full cursor-pointer px-4 py-3 text-left"
                                            style={{
                                                background: n.read
                                                    ? "transparent"
                                                    : "rgba(79,195,220,0.04)",
                                                borderBottom: "1px solid rgba(79,195,220,0.06)",
                                            }}
                                            onMouseEnter={(e) => {
                                                (e.currentTarget as HTMLElement).style.background =
                                                    "rgba(79,195,220,0.09)";
                                            }}
                                            onMouseLeave={(e) => {
                                                (e.currentTarget as HTMLElement).style.background =
                                                    n.read ? "transparent" : "rgba(79,195,220,0.04)";
                                            }}
                                        >
                                            <div className="flex items-start gap-2.5">
                                                {/* Unread dot */}
                                                <span
                                                    className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full"
                                                    style={{
                                                        background: n.read
                                                            ? "transparent"
                                                            : "rgba(79,195,220,0.8)",
                                                    }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <p
                                                        className="truncate text-xs font-medium"
                                                        style={{
                                                            color: n.read
                                                                ? "rgba(200,220,232,0.45)"
                                                                : "rgba(200,220,232,0.85)",
                                                            fontFamily: "var(--font-mono)",
                                                        }}
                                                    >
                                                        {n.title}
                                                    </p>
                                                    <p
                                                        className="mt-0.5 line-clamp-2 text-[11px]"
                                                        style={{
                                                            color: "rgba(200,220,232,0.35)",
                                                            fontFamily: "var(--font-mono)",
                                                        }}
                                                    >
                                                        {n.message}
                                                    </p>
                                                    <p
                                                        className="mt-1 text-[10px]"
                                                        style={{
                                                            color: "rgba(79,195,220,0.35)",
                                                            fontFamily: "var(--font-mono)",
                                                        }}
                                                    >
                                                        {format.relativeTime(new Date(n.createdAt), now)}
                                                    </p>
                                                </div>
                                            </div>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Footer */}
                    <div
                        className="border-t p-2"
                        style={{ borderColor: "rgba(79,195,220,0.1)" }}
                    >
                        <Link
                            href="/terminal/notifications"
                            onClick={() => setOpen(false)}
                            className="block rounded-lg px-3 py-2 text-center text-[11px] uppercase tracking-[0.2em] transition-colors text-[rgba(79,195,220,0.5)] hover:bg-[rgba(79,195,220,0.07)] hover:text-[rgba(79,195,220,0.85)]"
                            style={{ fontFamily: "var(--font-mono)" }}
                        >
                            {t("viewAll")}
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
