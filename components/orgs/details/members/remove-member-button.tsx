"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { removeOrgMemberAction } from "@/lib/actions/remove-org-member-action";
import ConfirmDialog from "@/components/ui/confirm-dialog";

type Props = {
    organizationSlug: string;
    targetUserId: string;
    targetLabel?: string;
    disabled?: boolean;
};

const initialState = {
    success: false,
    message: "",
};

export default function RemoveMemberButton({
                                               organizationSlug,
                                               targetUserId,
                                               targetLabel,
                                               disabled = false,
                                           }: Props) {
    const router = useRouter();
    const t = useTranslations("members");
    const tc = useTranslations("common");
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(removeOrgMemberAction, initialState);

    useEffect(() => {
        if (!state.success) return;

        let cancelled = false;

        queueMicrotask(() => {
            if (cancelled) return;

            setOpen(false);
            router.refresh();
        });

        return () => {
            cancelled = true;
        };
    }, [state.success, router]);

    const handleConfirm = async () => {
        const formData = new FormData();
        formData.set("organizationSlug", organizationSlug);
        formData.set("targetUserId", targetUserId);

        startTransition(async () => {
            await formAction(formData);
        });
    };

    return (
        <>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(true)}
                className={`${disabled ? "" : "cursor-pointer"} rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] disabled:opacity-50`}
                style={{
                    borderColor: "rgba(240,165,0,0.2)",
                    color: "rgba(240,165,0,0.85)",
                    fontFamily: "var(--font-mono)",
                    background: "rgba(240,165,0,0.05)",
                }}
            >
                {t("removeMember")}
            </button>

            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={handleConfirm}
                tone="danger"
                title={t("removeMemberTitle")}
                description={t("removeMemberConfirm", { name: targetLabel ?? "this member" })}
                confirmLabel={t("removeMemberButton")}
                cancelLabel={tc("cancel")}
                isLoading={isPending}
            />

            {state.message && (
                <p
                    className="mt-1 text-[10px] text-right"
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
        </>
    );
}