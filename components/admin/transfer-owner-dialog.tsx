"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { OrganizationMemberView } from "@/lib/types/organization";
import { superAdminTransferOwnerAction } from "@/lib/actions/super-admin-transfer-owner-action";

type Props = {
    orgSlug: string;
    orgName: string;
    members: OrganizationMemberView[];
};

export default function TransferOwnerDialog({ orgSlug, orgName, members }: Props) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const router = useRouter();
    const t = useTranslations("adminComponents");
    const tc = useTranslations("common");

    const nonOwners = members.filter((m) => m.role !== "owner");

    const [selectedUserId, setSelectedUserId] = useState(nonOwners[0]?.userId ?? "");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const open = () => {
        setError(null);
        setSelectedUserId(nonOwners[0]?.userId ?? "");
        dialogRef.current?.showModal();
    };

    const close = () => {
        dialogRef.current?.close();
        setError(null);
    };

    const handleConfirm = () => {
        if (!selectedUserId) return;
        setError(null);

        startTransition(async () => {
            const result = await superAdminTransferOwnerAction(orgSlug, selectedUserId);

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
                disabled={nonOwners.length === 0}
                className="sc-btn sc-btn-outline"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}
            >
                {t("transferOwner")}
            </button>

            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(240,165,0,0.25)",
                    background: "rgba(6,12,18,0.96)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                }}
            >
                <div className="relative p-5 sm:p-6">
                    <div
                        className="absolute left-6 right-6 top-0 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.5), transparent)",
                        }}
                    />

                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                            <p
                                className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                                style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("transferLabel")}
                            </p>
                            <h2
                                className="text-lg font-semibold uppercase tracking-[0.08em]"
                                style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                            >
                                {t("transferTitle")}
                            </h2>
                            <p
                                className="mt-1 text-sm"
                                style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                            >
                                {orgName}
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

                    {nonOwners.length === 0 ? (
                        <p
                            className="text-sm"
                            style={{ color: "rgba(240,165,0,0.7)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("noEligibleMembers")}
                        </p>
                    ) : (
                        <div className="space-y-4">
                            <div>
                                <label
                                    htmlFor="transfer-target"
                                    className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                    style={{
                                        color: "rgba(79,195,220,0.55)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    {t("newOwner")}
                                </label>
                                <select
                                    id="transfer-target"
                                    value={selectedUserId}
                                    onChange={(e) => setSelectedUserId(e.target.value)}
                                    className="sc-input w-full"
                                >
                                    {nonOwners.map((m) => (
                                        <option key={m.userId} value={m.userId}>
                                            {m.username ?? m.userId} ({m.role})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {error && (
                                <p
                                    className="text-sm"
                                    style={{
                                        color: "rgba(240,165,0,0.9)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    {error}
                                </p>
                            )}

                            <div
                                className="rounded-lg border p-3 text-xs"
                                style={{
                                    borderColor: "rgba(240,165,0,0.2)",
                                    background: "rgba(240,165,0,0.04)",
                                    color: "rgba(240,165,0,0.7)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {t("transferWarning")}
                            </div>

                            <div className="flex justify-end gap-2 pt-1">
                                <button
                                    type="button"
                                    onClick={close}
                                    className="sc-btn sc-btn-outline"
                                >
                                    {tc("cancel")}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleConfirm}
                                    disabled={isPending || !selectedUserId}
                                    className="sc-btn"
                                    style={{
                                        background: isPending
                                            ? "rgba(240,165,0,0.3)"
                                            : "rgba(240,165,0,0.15)",
                                        borderColor: "rgba(240,165,0,0.4)",
                                        color: "rgba(240,165,0,0.9)",
                                    }}
                                >
                                    {isPending ? t("transferring") : t("confirmTransfer")}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </dialog>
        </>
    );
}
