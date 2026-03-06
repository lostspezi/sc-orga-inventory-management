"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Settings, LogOut, ChevronDown, Bell, Globe } from "lucide-react";
import { signOutAction } from "@/lib/actions";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "@/components/ui/language-switcher";

type Props = {
    rsiHandle: string | null;
    discordName: string;
    userImage: string | null;
};

export default function UserDropdown({ rsiHandle, discordName, userImage }: Props) {
    const displayName = rsiHandle ?? discordName;
    const [open, setOpen] = useState(false);
    const t = useTranslations("userMenu");
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: PointerEvent) => {
            if (!containerRef.current?.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("pointerdown", handler, true);
        return () => document.removeEventListener("pointerdown", handler, true);
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(false);
        };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [open]);

    return (
        <div ref={containerRef} className="relative">
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="cursor-pointer flex items-center gap-2.5 rounded-lg border px-2.5 py-1.5 transition-colors"
                style={{
                    borderColor: open ? "rgba(79,195,220,0.35)" : "rgba(79,195,220,0.15)",
                    background: open ? "rgba(79,195,220,0.08)" : "rgba(79,195,220,0.03)",
                    color: "rgba(200,220,232,0.85)",
                }}
            >
                {/* Avatar */}
                {userImage ? (
                    <Image
                        src={userImage}
                        alt={displayName}
                        width={28}
                        height={28}
                        className="rounded-full"
                        style={{ objectFit: "cover" }}
                    />
                ) : (
                    <div
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                        style={{
                            background: "rgba(79,195,220,0.15)",
                            color: "rgba(79,195,220,0.8)",
                            border: "1px solid rgba(79,195,220,0.2)",
                        }}
                    >
                        {displayName.charAt(0).toUpperCase()}
                    </div>
                )}

                {/* Name */}
                <span
                    className="hidden max-w-30 truncate text-xs sm:block"
                    style={{ fontFamily: "var(--font-mono)" }}
                >
                    {displayName}
                </span>

                <ChevronDown
                    size={13}
                    style={{
                        color: "rgba(79,195,220,0.5)",
                        transform: open ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.15s",
                    }}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="absolute right-0 top-full z-50 mt-1.5 w-52 rounded-xl border shadow-2xl"
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

                    {/* User info header */}
                    <div
                        className="border-b px-4 py-3"
                        style={{ borderColor: "rgba(79,195,220,0.1)" }}
                    >
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("signedInAs")}
                        </p>
                        <p
                            className="mt-0.5 truncate text-sm font-medium"
                            style={{ color: "rgba(200,220,232,0.9)", fontFamily: "var(--font-mono)" }}
                        >
                            {displayName}
                        </p>
                        {rsiHandle && (
                            <p
                                className="mt-0.5 truncate text-[10px]"
                                style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                            >
                                Discord: {discordName}
                            </p>
                        )}
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">
                        <Link
                            href="/terminal/notifications"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors text-[rgba(200,220,232,0.65)] hover:bg-[rgba(79,195,220,0.07)] hover:text-[rgba(200,220,232,0.9)]"
                            style={{ fontFamily: "var(--font-mono)" }}
                        >
                            <Bell size={14} style={{ color: "rgba(79,195,220,0.55)" }} />
                            <span className="uppercase tracking-widest">{t("notifications")}</span>
                        </Link>

                        <Link
                            href="/terminal/settings"
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors text-[rgba(200,220,232,0.65)] hover:bg-[rgba(79,195,220,0.07)] hover:text-[rgba(200,220,232,0.9)]"
                            style={{ fontFamily: "var(--font-mono)" }}
                        >
                            <Settings size={14} style={{ color: "rgba(79,195,220,0.55)" }} />
                            <span className="uppercase tracking-widest">{t("settings")}</span>
                        </Link>

                        <form action={signOutAction}>
                            <button
                                type="submit"
                                className="cursor-pointer flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors text-[rgba(200,220,232,0.65)] hover:bg-[rgba(220,50,50,0.08)] hover:text-[rgba(220,80,80,0.9)]"
                                style={{ fontFamily: "var(--font-mono)" }}
                            >
                                <LogOut size={14} style={{ color: "rgba(200,80,80,0.55)" }} />
                                <span className="uppercase tracking-widest">{t("logout")}</span>
                            </button>
                        </form>
                    </div>

                    {/* Language */}
                    <div
                        className="border-t px-3 py-2"
                        style={{ borderColor: "rgba(79,195,220,0.1)" }}
                    >
                        <div className="flex items-center gap-2.5">
                            <Globe size={14} style={{ color: "rgba(79,195,220,0.45)", flexShrink: 0 }} />
                            <LanguageSwitcher />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
