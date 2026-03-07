"use client";

import Link from "next/link";
import { useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { acceptLegalAction } from "@/lib/actions/accept-legal-action";

export default function LegalAcceptGate({
    currentVersion,
    changeNote,
}: {
    currentVersion: string;
    changeNote: string;
}) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    function handleAccept() {
        startTransition(async () => {
            await acceptLegalAction(currentVersion);
            dialogRef.current?.close();
            router.refresh();
        });
    }

    return (
        <dialog
            ref={dialogRef}
            onCancel={(e) => e.preventDefault()}
            className="fixed left-1/2 top-1/2 m-0 w-[min(90vw,540px)] -translate-x-1/2 -translate-y-1/2 overflow-hidden backdrop:bg-black/70"
            style={{ background: "transparent", border: "none", padding: 0 }}
        >
            <div
                className="hud-panel relative max-h-[90dvh] overflow-y-auto p-7 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                style={{ background: "rgba(4,10,18,0.97)" }}
            >
                {/* top accent */}
                <div
                    className="absolute -top-px left-8 right-8 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.8), transparent)" }}
                />
                <div
                    className="absolute -top-5 left-1/2 -translate-x-1/2 px-3 text-[10px] tracking-[0.3em] uppercase"
                    style={{ color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-mono)", background: "var(--background)" }}
                >
                    LEGAL.UPDATE
                </div>

                <h2
                    className="mb-1 text-lg font-black uppercase tracking-widest"
                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                >
                    Legal Documents Updated
                </h2>
                <p
                    className="mb-1 text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                >
                    Version {currentVersion}
                </p>

                {changeNote && (
                    <p
                        className="mt-3 text-sm leading-relaxed"
                        style={{ color: "rgba(200,220,232,0.6)", fontFamily: "var(--font-ui)" }}
                    >
                        {changeNote}
                    </p>
                )}

                <p
                    className="mt-4 text-sm leading-relaxed"
                    style={{ color: "rgba(200,220,232,0.55)", fontFamily: "var(--font-ui)" }}
                >
                    Our legal documents have been updated. Please review and accept the terms to continue
                    using SC Orga Manager.
                </p>

                <div className="mt-4 flex flex-wrap gap-3">
                    {[
                        { label: "Privacy Policy", href: "/legal/privacy" },
                        { label: "Terms", href: "/legal/terms" },
                        { label: "Imprint", href: "/legal/imprint" },
                        { label: "Cookie Info", href: "/legal/cookies" },
                    ].map(({ label, href }) => (
                        <Link
                            key={href}
                            href={href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] uppercase tracking-[0.15em] underline transition-colors hover:text-cyan-300"
                            style={{ color: "rgba(79,195,220,0.6)", fontFamily: "var(--font-mono)" }}
                        >
                            {label} ↗
                        </Link>
                    ))}
                </div>

                <button
                    onClick={handleAccept}
                    disabled={isPending}
                    className="sc-btn mt-6 w-full py-3 text-sm uppercase tracking-[0.2em]"
                    style={{
                        background: isPending ? "rgba(240,165,0,0.1)" : undefined,
                        borderColor: "rgba(240,165,0,0.5)",
                        color: "rgba(240,165,0,0.9)",
                    }}
                >
                    {isPending ? "Processing…" : "I Accept the Updated Terms"}
                </button>

                {/* bottom accent */}
                <div
                    className="absolute -bottom-px left-8 right-8 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.3), transparent)" }}
                />
            </div>
        </dialog>
    );
}
