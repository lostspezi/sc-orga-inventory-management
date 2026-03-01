"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { adminLeaveDiscordServerAction } from "@/lib/actions/admin-leave-discord-server-action";

type Props = {
    guildId: string;
    guildName: string;
};

export default function LeaveServerButton({ guildId, guildName }: Props) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const router = useRouter();
    const t = useTranslations("adminComponents");
    const tc = useTranslations("common");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const open = () => {
        setError(null);
        dialogRef.current?.showModal();
    };

    const close = () => {
        dialogRef.current?.close();
        setError(null);
    };

    const handleConfirm = () => {
        setError(null);
        startTransition(async () => {
            const result = await adminLeaveDiscordServerAction(guildId);
            if (!result.success) {
                setError(result.message);
                return;
            }
            dialogRef.current?.close();
            router.refresh();
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={open}
                className="sc-btn sc-btn-outline"
                style={{
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.65rem",
                    borderColor: "rgba(220,50,50,0.35)",
                    color: "rgba(220,80,80,0.85)",
                }}
            >
                {t("leaveServer")}
            </button>

            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(220,50,50,0.25)",
                    background: "rgba(6,12,18,0.96)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                }}
            >
                <div className="relative p-5 sm:p-6">
                    <div
                        className="absolute left-6 right-6 top-0 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(220,50,50,0.45), transparent)",
                        }}
                    />

                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                            <p
                                className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                                style={{ color: "rgba(220,80,80,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("leaveLabel")}
                            </p>
                            <h2
                                className="text-lg font-semibold uppercase tracking-[0.08em]"
                                style={{ color: "rgba(220,80,80,0.9)", fontFamily: "var(--font-display)" }}
                            >
                                {t("leaveTitle")}
                            </h2>
                            <p
                                className="mt-1 text-sm"
                                style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                            >
                                {guildName}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={close}
                            className="cursor-pointer rounded-md border px-2.5 py-1 text-xs"
                            style={{
                                borderColor: "rgba(79,195,220,0.2)",
                                color: "rgba(200,220,232,0.6)",
                                fontFamily: "var(--font-mono)",
                                background: "rgba(79,195,220,0.04)",
                            }}
                        >
                            {tc("close").toUpperCase()}
                        </button>
                    </div>

                    <div
                        className="mb-4 rounded-lg border p-3 text-xs"
                        style={{
                            borderColor: "rgba(220,50,50,0.2)",
                            background: "rgba(220,50,50,0.04)",
                            color: "rgba(220,80,80,0.7)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {t("leaveWarning")}
                    </div>

                    {error && (
                        <p
                            className="mb-4 text-sm"
                            style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}
                        >
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={close} className="sc-btn sc-btn-outline">
                            {tc("cancel")}
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={isPending}
                            className="sc-btn"
                            style={{
                                background: "rgba(220,50,50,0.12)",
                                borderColor: "rgba(220,50,50,0.4)",
                                color: "rgba(220,80,80,0.9)",
                            }}
                        >
                            {isPending ? t("leaving") : t("confirmLeave")}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
