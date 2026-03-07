"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { leaveOrganizationAction } from "@/lib/actions/leave-organization-action";

type Props = {
    orgSlug: string;
    orgName: string;
    role: "owner" | "admin" | "hr" | "member";
    memberCount: number;
};

export default function LeaveOrgButton({ orgSlug, orgName, role, memberCount }: Props) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const router = useRouter();
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const isSoleOwner = role === "owner" && memberCount === 1;
    const isOwnerWithMembers = role === "owner" && memberCount > 1;

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
            const result = await leaveOrganizationAction(orgSlug);
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
                    fontSize: "0.7rem",
                    padding: "0.2rem 0.6rem",
                    borderColor: "rgba(220,50,50,0.3)",
                    color: "rgba(220,80,80,0.8)",
                }}
            >
                Leave
            </button>

            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(220,50,50,0.22)",
                    background: "rgba(6,12,18,0.97)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                }}
            >
                <div className="relative p-5 sm:p-6">
                    <div
                        className="absolute left-6 right-6 top-0 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(220,50,50,0.4), transparent)",
                        }}
                    />

                    <div className="mb-4 flex items-start justify-between gap-3">
                        <div>
                            <p
                                className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                                style={{ color: "rgba(220,80,80,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                Leave Organization
                            </p>
                            <h2
                                className="text-lg font-semibold uppercase tracking-[0.06em]"
                                style={{ color: "rgba(220,80,80,0.9)", fontFamily: "var(--font-display)" }}
                            >
                                {orgName}
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

                    {/* Context-specific warning */}
                    <div
                        className="mb-4 rounded-lg border p-3 text-xs leading-relaxed"
                        style={{
                            borderColor: "rgba(220,50,50,0.18)",
                            background: "rgba(220,50,50,0.05)",
                            color: "rgba(220,80,80,0.75)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {isSoleOwner ? (
                            <>
                                You are the <strong>only member</strong>. Leaving will permanently delete this organization and all its data — inventory, transactions, audit logs, and invites.
                            </>
                        ) : isOwnerWithMembers ? (
                            <>
                                You are the <strong>owner</strong>. Before you leave, the most senior remaining member will be automatically promoted to owner.
                            </>
                        ) : (
                            <>You will be removed from this organization.</>
                        )}
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
                            Cancel
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
                            {isPending
                                ? "Leaving…"
                                : isSoleOwner
                                    ? "Delete & Leave"
                                    : "Leave Organization"}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
