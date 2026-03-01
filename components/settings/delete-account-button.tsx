"use client";

import { useRef, useState, useTransition } from "react";
import { deleteAccountAction } from "@/lib/actions/delete-account-action";

type Props = {
    userName: string;
};

export default function DeleteAccountButton({ userName }: Props) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [confirmInput, setConfirmInput] = useState("");
    const [isPending, startTransition] = useTransition();

    const confirmed = confirmInput === userName;

    const open = () => {
        setConfirmInput("");
        dialogRef.current?.showModal();
    };

    const close = () => {
        dialogRef.current?.close();
        setConfirmInput("");
    };

    const handleConfirm = () => {
        if (!confirmed) return;
        startTransition(async () => {
            await deleteAccountAction();
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={open}
                className="sc-btn"
                style={{
                    background: "rgba(220,50,50,0.1)",
                    borderColor: "rgba(220,50,50,0.4)",
                    color: "rgba(220,80,80,0.9)",
                }}
            >
                Delete My Account
            </button>

            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(220,50,50,0.25)",
                    background: "rgba(6,12,18,0.97)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                }}
            >
                <div className="relative p-5 sm:p-6">
                    <div
                        className="absolute left-6 right-6 top-0 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(220,50,50,0.5), transparent)",
                        }}
                    />

                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <p
                                className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                                style={{ color: "rgba(220,80,80,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                Irreversible Action
                            </p>
                            <h2
                                className="text-lg font-semibold uppercase tracking-[0.06em]"
                                style={{ color: "rgba(220,80,80,0.9)", fontFamily: "var(--font-display)" }}
                            >
                                Delete Account
                            </h2>
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
                            CLOSE
                        </button>
                    </div>

                    <div
                        className="mb-5 rounded-lg border p-3 text-xs leading-relaxed"
                        style={{
                            borderColor: "rgba(220,50,50,0.18)",
                            background: "rgba(220,50,50,0.05)",
                            color: "rgba(220,80,80,0.75)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        This will permanently:
                        <ul className="mt-1.5 list-inside list-disc space-y-1">
                            <li>Delete all organizations you own (including inventory, transactions, and logs)</li>
                            <li>Remove you from all other organizations</li>
                            <li>Delete your account and sign you out</li>
                        </ul>
                    </div>

                    <div className="mb-4">
                        <label
                            htmlFor="confirm-username"
                            className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            Type <span style={{ color: "rgba(220,80,80,0.8)" }}>{userName}</span> to confirm
                        </label>
                        <input
                            id="confirm-username"
                            type="text"
                            className="sc-input w-full"
                            value={confirmInput}
                            onChange={(e) => setConfirmInput(e.target.value)}
                            autoComplete="off"
                            autoCorrect="off"
                            spellCheck={false}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={close} className="sc-btn sc-btn-outline">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={!confirmed || isPending}
                            className="sc-btn"
                            style={{
                                background: confirmed ? "rgba(220,50,50,0.15)" : "rgba(220,50,50,0.05)",
                                borderColor: confirmed ? "rgba(220,50,50,0.45)" : "rgba(220,50,50,0.2)",
                                color: confirmed ? "rgba(220,80,80,0.9)" : "rgba(220,80,80,0.35)",
                            }}
                        >
                            {isPending ? "Deleting…" : "Permanently Delete"}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
