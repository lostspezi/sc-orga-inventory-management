"use client";

import { startTransition, useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { changeOrgMemberRoleAction } from "@/lib/actions/change-org-member-role-action";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type Props = {
    organizationSlug: string;
    targetUserId: string;
    targetLabel?: string;
    currentRole: "owner" | "admin" | "member";
    actorRole: "owner" | "admin" | "member";
    disabled?: boolean;
};

const initialState = {
    success: false,
    message: "",
};

export default function ChangeMemberRoleControl({
                                                    organizationSlug,
                                                    targetUserId,
                                                    targetLabel,
                                                    currentRole,
                                                    actorRole,
                                                    disabled = false,
                                                }: Props) {
    const router = useRouter();
    const t = useTranslations("members");
    const tc = useTranslations("common");

    const [selectedRole, setSelectedRole] = useState<"admin" | "member">(
        currentRole === "admin" ? "admin" : "member"
    );
    const [open, setOpen] = useState(false);

    const [state, formAction, isPending] = useActionState(
        changeOrgMemberRoleAction,
        initialState
    );

    const canManage =
        actorRole === "owner" || (actorRole === "admin" && currentRole === "member");

    const roleChanged = useMemo(() => {
        if (currentRole === "owner") return false;
        return selectedRole !== currentRole;
    }, [selectedRole, currentRole]);

    useEffect(() => {
        if (!state.success) return;

        queueMicrotask(() => {
            setOpen(false);
            router.refresh();
        });
    }, [state.success, router]);

    const handleConfirm = async () => {
        const formData = new FormData();
        formData.set("organizationSlug", organizationSlug);
        formData.set("targetUserId", targetUserId);
        formData.set("newRole", selectedRole);

        startTransition(async () => {
            await formAction(formData);
        });
    };

    if (currentRole === "owner") {
        return (
            <span
                className="rounded border px-2 py-0.5 text-[10px] uppercase"
                style={{
                    borderColor: "rgba(79,195,220,0.18)",
                    color: "rgba(79,195,220,0.65)",
                    fontFamily: "var(--font-mono)",
                }}
            >
                owner
            </span>
        );
    }

    return (
        <div className="flex flex-col items-end gap-1">
            <div className="flex flex-wrap items-center gap-2">
                <div
                    className="inline-flex overflow-hidden rounded-md border"
                    style={{
                        borderColor: "rgba(79,195,220,0.18)",
                        background: "rgba(7,18,28,0.35)",
                    }}
                >
                    {(["member", "admin"] as const).map((role) => {
                        const isActive = selectedRole === role;

                        return (
                            <button
                                key={role}
                                type="button"
                                onClick={() => setSelectedRole(role)}
                                disabled={disabled || !canManage || isPending}
                                className="min-w-19.5 px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] transition disabled:opacity-50"
                                style={{
                                    fontFamily: "var(--font-mono)",
                                    color: isActive
                                        ? "rgba(6,12,18,0.95)"
                                        : "rgba(200,220,232,0.7)",
                                    background: isActive
                                        ? role === "admin"
                                            ? "rgba(79,195,220,0.95)"
                                            : "rgba(240,165,0,0.88)"
                                        : "transparent",
                                    borderRight:
                                        role === "member"
                                            ? "1px solid rgba(79,195,220,0.12)"
                                            : "none",
                                    boxShadow: isActive
                                        ? role === "admin"
                                            ? "inset 0 0 12px rgba(79,195,220,0.25)"
                                            : "inset 0 0 12px rgba(240,165,0,0.2)"
                                        : "none",
                                    cursor:
                                        disabled || !canManage || isPending
                                            ? "default"
                                            : "pointer",
                                }}
                            >
                                {role}
                            </button>
                        );
                    })}
                </div>

                <button
                    type="button"
                    disabled={disabled || !canManage || !roleChanged || isPending}
                    onClick={() => setOpen(true)}
                    className={`${disabled ? "" : "cursor-pointer"} rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] disabled:opacity-50`}
                    style={{
                        borderColor: "rgba(79,195,220,0.2)",
                        color: "rgba(79,195,220,0.85)",
                        fontFamily: "var(--font-mono)",
                        background: "rgba(79,195,220,0.05)",
                    }}
                >
                    {t("changeRole")}
                </button>
            </div>

            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={handleConfirm}
                tone="default"
                isLoading={isPending}
                title={t("changeRoleTitle")}
                description={t("changeRoleDesc", { name: targetLabel ?? "this member", from: currentRole, to: selectedRole })}
                confirmLabel={t("applyRole")}
                cancelLabel={tc("cancel")}
            />

            {state.message && (
                <p
                    className="text-[10px] text-right"
                    style={{
                        color: state.success
                            ? "rgba(79,195,220,0.7)"
                            : "rgba(240,165,0,0.85)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {state.message}
                </p>
            )}
        </div>
    );
}