"use client";

import Link from "next/link";
import { useRef, useEffect, useSyncExternalStore, useState } from "react";

const COOKIE_NAME = "sc_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function hasConsent(): boolean {
    return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
}

function setConsent() {
    document.cookie = `${COOKIE_NAME}=1; max-age=${COOKIE_MAX_AGE}; path=/; samesite=lax`;
}

// useSyncExternalStore: server snapshot = false (hidden), client snapshot = actual cookie check.
// This avoids hydration mismatch — server always renders nothing, client re-evaluates after mount.
const subscribe = () => () => {};
const getClientSnapshot = () => !hasConsent();
const getServerSnapshot = () => false;

export default function CookieNotice() {
    const needsConsent = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
    const [dismissed, setDismissed] = useState(false);
    const dialogRef = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        if (needsConsent && !dismissed) {
            dialogRef.current?.showModal();
        }
    }, [needsConsent, dismissed]);

    function dismiss() {
        setConsent();
        setDismissed(true);
        dialogRef.current?.close();
    }

    if (!needsConsent || dismissed) return null;

    return (
        <dialog
            ref={dialogRef}
            onCancel={(e) => e.preventDefault()}
            className="backdrop:bg-black/70"
            style={{
                background: "transparent",
                border: "none",
                padding: 0,
                maxWidth: "min(90vw, 480px)",
                width: "100%",
            }}
        >
            <div
                className="hud-panel relative max-h-[90dvh] overflow-y-auto p-7"
                style={{ background: "rgba(4,10,18,0.97)" }}
            >
                {/* top accent */}
                <div
                    className="absolute -top-px left-8 right-8 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }}
                />
                <div
                    className="absolute -top-5 left-1/2 -translate-x-1/2 px-3 text-[10px] tracking-[0.3em] uppercase"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-mono)", background: "var(--background)" }}
                >
                    PRIVACY.NOTICE
                </div>

                <h2
                    className="mb-3 text-base font-black uppercase tracking-widest"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    Cookie Notice
                </h2>

                <p
                    className="mb-3 text-sm leading-relaxed"
                    style={{ color: "rgba(200,220,232,0.6)", fontFamily: "var(--font-ui)" }}
                >
                    SC Orga Manager uses <strong style={{ color: "rgba(200,220,232,0.85)" }}>essential cookies only</strong> —
                    for login sessions, CSRF protection, and your language preference.
                    No tracking, no analytics, no third-party advertising cookies.
                </p>

                <Link
                    href="/legal/cookies"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] uppercase tracking-[0.15em] underline transition-colors hover:text-cyan-300"
                    style={{ color: "rgba(79,195,220,0.6)", fontFamily: "var(--font-mono)" }}
                >
                    View Cookie Information ↗
                </Link>

                <button
                    onClick={dismiss}
                    className="sc-btn mt-5 w-full py-3 text-sm uppercase tracking-[0.2em]"
                >
                    Understood — Continue
                </button>

                {/* bottom accent */}
                <div
                    className="absolute -bottom-px left-8 right-8 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.3), transparent)" }}
                />
            </div>
        </dialog>
    );
}
