"use client";

import { useActionState, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
    generatePermanentInviteAction,
    type GeneratePermanentInviteState,
} from "@/lib/actions/generate-permanent-invite-action";
import {
    revokePermanentInviteAction,
    type RevokePermanentInviteState,
} from "@/lib/actions/revoke-permanent-invite-action";

type Props = {
    organizationSlug: string;
    inviteUrl: string | null;
};

const initialState = { success: false, message: "" };

export default function PermanentInviteCard({ organizationSlug, inviteUrl }: Props) {
    const t = useTranslations("orgSettings");
    const router = useRouter();

    const [generateState, generateFormAction, isGenerating] = useActionState<GeneratePermanentInviteState, FormData>(
        async (prev, formData) => {
            const result = await generatePermanentInviteAction(prev, formData);
            if (result.success) router.refresh();
            return result;
        },
        initialState
    );

    const [revokeState, revokeFormAction, isRevoking] = useActionState<RevokePermanentInviteState, FormData>(
        async (prev, formData) => {
            const result = await revokePermanentInviteAction(prev, formData);
            if (result.success) router.refresh();
            return result;
        },
        initialState
    );

    const [copied, setCopied] = useState(false);
    const [, startTransition] = useTransition();

    const isActive = inviteUrl !== null && !(revokeState.success);

    function handleCopy() {
        if (!inviteUrl) return;
        startTransition(async () => {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    }

    const errorMessage = (!generateState.success && generateState.message)
        || (!revokeState.success && revokeState.message)
        || null;

    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(7,18,28,0.28)",
            }}
        >
            <div className="mb-4">
                <div className="flex items-center gap-3">
                    <h3
                        className="text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {t("permanentInvite")}
                    </h3>
                    <span
                        className="text-[10px] uppercase tracking-widest"
                        style={{
                            color: isActive ? "rgba(80,210,120,0.85)" : "rgba(140,140,160,0.65)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {isActive ? t("permanentInviteActive") : t("permanentInviteInactive")}
                    </span>
                </div>
                <p
                    className="mt-2 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("permanentInviteDesc")}
                </p>
            </div>

            {isActive && inviteUrl && (
                <div className="mb-3 flex gap-2">
                    <input
                        readOnly
                        value={inviteUrl}
                        className="sc-input flex-1 select-all"
                        style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
                    />
                    <button
                        type="button"
                        onClick={handleCopy}
                        className="cursor-pointer sc-btn-outline rounded-md border px-3 py-1.5 text-xs"
                        style={{ fontFamily: "var(--font-mono)", minWidth: "4.5rem" }}
                    >
                        {copied ? t("permanentInviteCopied") : t("permanentInviteCopy")}
                    </button>
                </div>
            )}

            {isActive && (
                <p
                    className="mb-3 text-[11px]"
                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                >
                    {t("permanentInviteWarning")}
                </p>
            )}

            {errorMessage && (
                <p
                    className="mb-3 text-sm"
                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}
                >
                    {errorMessage}
                </p>
            )}

            <div className="flex gap-2">
                <form action={generateFormAction}>
                    <input type="hidden" name="organizationSlug" value={organizationSlug} />
                    <button
                        type="submit"
                        className="sc-btn"
                        disabled={isGenerating || isRevoking}
                    >
                        {isActive ? t("permanentInviteRegenerate") : t("permanentInviteGenerate")}
                    </button>
                </form>

                {isActive && (
                    <form action={revokeFormAction}>
                        <input type="hidden" name="organizationSlug" value={organizationSlug} />
                        <button
                            type="submit"
                            disabled={isGenerating || isRevoking}
                            className="cursor-pointer rounded-md border px-3 py-1.5 text-xs disabled:opacity-50"
                            style={{
                                borderColor: "rgba(220,80,80,0.25)",
                                color: "rgba(220,80,80,0.75)",
                                background: "rgba(220,80,80,0.04)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {t("permanentInviteRevoke")}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
