"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import { createDiscordOrgInviteAction } from "@/lib/actions/create-discord-org-invite-action";
import DiscordMemberAutocomplete from "./discord-member-autocomplete";

type Props = {
    organizationSlug: string;
    discordGuildId?: string;
    actorRole: "owner" | "admin" | "hr" | "member";
    onClose: () => void;
};

const initialState = { success: false, message: "", fieldErrors: {} };

export default function InviteCreateDialog({ organizationSlug, discordGuildId, actorRole, onClose }: Props) {
    const t = useTranslations("members");
    const router = useRouter();
    const formRef = useRef<HTMLFormElement | null>(null);
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [state, formAction, isPending] = useActionState(createDiscordOrgInviteAction, initialState);

    const isHr = actorRole === "hr";

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            router.refresh();
            onClose();
        }
    }, [state.success, router, onClose]);

    useEffect(() => {
        dialogRef.current?.showModal();
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    };

    return (
        <dialog
            ref={dialogRef}
            onKeyDown={handleKeyDown}
            className="fixed left-1/2 top-1/2 z-50 m-0 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-5 backdrop:bg-black/60"
            style={{ borderColor: "rgba(79,195,220,0.2)", background: "rgba(6,14,22,0.98)" }}
        >
                {/* Header */}
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
                            {t("inviteDelivery")}
                        </p>
                        <h3 className="mt-0.5 text-base font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                            {t("discordDm")}
                        </h3>
                    </div>
                    <button type="button" onClick={onClose} className="rounded p-1 opacity-60 hover:opacity-100 transition" style={{ color: "rgba(200,220,232,0.7)" }}>
                        <X size={16} />
                    </button>
                </div>

                {!discordGuildId ? (
                    <p className="text-sm" style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}>
                        {t("discordNotConnected")}
                    </p>
                ) : (
                    <form ref={formRef} action={formAction} className="space-y-4">
                        <input type="hidden" name="organizationSlug" value={organizationSlug} />

                        <DiscordMemberAutocomplete organizationSlug={organizationSlug} />

                        {state.fieldErrors?.discordUserId && (
                            <p className="-mt-2 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                {state.fieldErrors.discordUserId}
                            </p>
                        )}

                        <div>
                            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                                {t("inviteTargetRole")}
                            </label>
                            <select
                                name="targetRole"
                                className="sc-input w-full"
                                defaultValue="member"
                                disabled={isHr}
                                required
                            >
                                <option value="member">{t("roleMember")}</option>
                                {!isHr && <option value="hr">{t("roleHr")}</option>}
                                {!isHr && <option value="admin">{t("roleAdmin")}</option>}
                            </select>
                            {isHr && (
                                <p className="mt-1 text-[10px]" style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                                    HR can only invite as member.
                                </p>
                            )}
                            {state.fieldErrors?.targetRole && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.targetRole}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                                {t("inviteExpiry")} (optional)
                            </label>
                            <input
                                type="date"
                                name="expiresAt"
                                className="sc-input w-full"
                                min={new Date().toISOString().slice(0, 10)}
                            />
                        </div>

                        {state.message && (
                            <div
                                className="rounded-md border px-3 py-2"
                                style={{
                                    borderColor: state.success ? "rgba(79,195,220,0.2)" : "rgba(240,165,0,0.2)",
                                    background: state.success ? "rgba(79,195,220,0.04)" : "rgba(240,165,0,0.05)",
                                }}
                            >
                                <p className="text-xs" style={{ color: state.success ? "rgba(79,195,220,0.75)" : "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}>
                                    {state.message}
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={onClose} className="sc-btn sc-btn-outline text-xs">
                                Cancel
                            </button>
                            <button type="submit" disabled={isPending} className="sc-btn text-xs disabled:opacity-50">
                                {isPending ? t("sending") : t("sendInvite")}
                            </button>
                        </div>
                    </form>
                )}
        </dialog>
    );
}
