"use client";

import React, { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { ORG_NAV_ITEMS, type OrganizationRole } from "@/components/orgs/details/org-details-nav";

const BTN = 52;            // FAB diameter px
const GAP = 8;             // min distance from screen edge
const DRAG_THRESHOLD = 5;  // px moved before treating as a drag
const POS_KEY = "org-fab-pos";

type Props = { slug: string; currentRole: OrganizationRole; isPro?: boolean };

// Inline clamp used outside a component for lazy state initializer
function clampPos(x: number, y: number) {
    return {
        x: Math.max(GAP, Math.min(x, window.innerWidth - BTN - GAP)),
        y: Math.max(GAP, Math.min(y, window.innerHeight - BTN - GAP)),
    };
}

function getInitialPos() {
    if (typeof window === "undefined") return { x: 0, y: 0 };
    try {
        const saved = JSON.parse(localStorage.getItem(POS_KEY) ?? "null");
        if (typeof saved?.x === "number") return clampPos(saved.x, saved.y);
    } catch { /* ignore */ }
    return clampPos(window.innerWidth - BTN - 16, window.innerHeight - BTN - 80);
}

export default function OrgDetailsMobileNav({ slug, currentRole, isPro = false }: Props) {
    const pathname = usePathname();
    // True, only on the client — no effect or setState needed
    const mounted = useSyncExternalStore(
        () => () => {},  // nothing to subscribe to
        () => true,      // client snapshot
        () => false,     // server snapshot (SSR/hydration)
    );

    const [pos, setPos] = useState(getInitialPos);
    const posRef = useRef(pos);

    const [openedAt, setOpenedAt] = useState<string | null>(null);
    const open = openedAt === pathname;

    const [dragging, setDragging] = useState(false);
    const drag = useRef({ active: false, moved: false, ox: 0, oy: 0, px: 0, py: 0 });

    const applyPos = useCallback((x: number, y: number) => {
        const p = clampPos(x, y);
        posRef.current = p;
        setPos(p);
    }, []);


    useEffect(() => {
        const onResize = () => applyPos(posRef.current.x, posRef.current.y);
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [applyPos]);

    // Close the menu when tapping outside
    useEffect(() => {
        if (!open) return;
        const handler = (e: PointerEvent) => {
            if (!(e.target as HTMLElement).closest("[data-fab]")) setOpenedAt(null);
        };
        document.addEventListener("pointerdown", handler, true);
        return () => document.removeEventListener("pointerdown", handler, true);
    }, [open]);

    function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
        drag.current = {
            active: true, moved: false,
            ox: e.clientX, oy: e.clientY,
            px: posRef.current.x, py: posRef.current.y,
        };
        e.currentTarget.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
        if (!drag.current.active) return;
        const dx = e.clientX - drag.current.ox;
        const dy = e.clientY - drag.current.oy;
        if (!drag.current.moved && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
            drag.current.moved = true;
            setDragging(true);
        }
        if (drag.current.moved) {
            applyPos(drag.current.px + dx, drag.current.py + dy);
        }
    }

    function onPointerUp() {
        drag.current.active = false;
        if (drag.current.moved) {
            setDragging(false);
            localStorage.setItem(POS_KEY, JSON.stringify(posRef.current));
        } else {
            // Toggle: open on the current pathname, or close if already open here
            setOpenedAt((prev) => (prev === pathname ? null : pathname));
        }
        drag.current.moved = false;
    }

    const visibleItems = ORG_NAV_ITEMS.filter(
        (item) => !item.allowedRoles || item.allowedRoles.includes(currentRole)
    );

    const activeItem = visibleItems.find((item) => pathname === item.href(slug));
    const ActiveIcon = activeItem?.icon;

    if (!mounted) return null;

    const openUpward = pos.y > window.innerHeight * 0.55;
    const menuLeft = Math.max(GAP + 96, Math.min(pos.x + BTN / 2, window.innerWidth - GAP - 96));

    return (
        <div className="lg:hidden" data-fab>
            {/* Menu panel */}
            {open && (
                <div
                    data-fab
                    className="fixed z-40 w-48 rounded-xl border shadow-2xl"
                    style={{
                        left: menuLeft,
                        transform: "translateX(-50%)",
                        ...(openUpward
                            ? { bottom: window.innerHeight - pos.y + GAP + 4 }
                            : { top: pos.y + BTN + GAP + 4 }),
                        borderColor: "rgba(79,195,220,0.2)",
                        background: "rgba(6,12,18,0.96)",
                        backdropFilter: "blur(16px)",
                    }}
                >
                    <div
                        className="absolute left-4 right-4 top-0 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                        }}
                    />

                    <div className="p-1.5">
                        {visibleItems.map((item) => {
                            const locked = !!item.requiresPro && !isPro;
                            const href = locked
                                ? `/terminal/orgs/${slug}/settings?tab=pro`
                                : item.href(slug);
                            const isActive = !locked && pathname === item.href(slug);
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.key}
                                    href={href}
                                    className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
                                    style={{
                                        fontFamily: "var(--font-mono)",
                                        fontSize: "0.75rem",
                                        background: isActive ? "rgba(79,195,220,0.1)" : "transparent",
                                        color: isActive
                                            ? "rgba(79,195,220,0.95)"
                                            : locked
                                                ? "rgba(200,220,232,0.4)"
                                                : "rgba(200,220,232,0.6)",
                                    }}
                                >
                                    <Icon size={14} />
                                    <span className="uppercase tracking-[0.12em]">{item.label}</span>
                                    {locked ? (
                                        <span
                                            className="ml-auto rounded px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em]"
                                            style={{
                                                background: "rgba(251,191,36,0.12)",
                                                color: "rgba(251,191,36,0.8)",
                                                border: "1px solid rgba(251,191,36,0.2)",
                                            }}
                                        >
                                            PRO
                                        </span>
                                    ) : isActive && (
                                        <span
                                            className="ml-auto h-1.5 w-1.5 rounded-full"
                                            style={{ background: "var(--accent-primary)" }}
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* FAB button */}
            <button
                data-fab
                type="button"
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
                className="fixed z-50 flex items-center justify-center rounded-full border shadow-xl"
                style={{
                    left: pos.x,
                    top: pos.y,
                    width: BTN,
                    height: BTN,
                    touchAction: "none",
                    userSelect: "none",
                    cursor: dragging ? "grabbing" : "grab",
                    borderColor: open ? "rgba(79,195,220,0.5)" : "rgba(79,195,220,0.22)",
                    background: open ? "rgba(79,195,220,0.15)" : "rgba(6,12,18,0.88)",
                    backdropFilter: "blur(12px)",
                    color: open
                        ? "rgba(79,195,220,0.95)"
                        : activeItem
                            ? "rgba(79,195,220,0.75)"
                            : "rgba(200,220,232,0.6)",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.45), 0 0 0 1px rgba(79,195,220,0.05)",
                    transition: dragging ? "none" : "border-color 0.15s, background 0.15s, color 0.15s",
                }}
            >
                {open ? <X size={20} /> : (ActiveIcon ? <ActiveIcon size={20} /> : <Menu size={20} />)}
            </button>
        </div>
    );
}