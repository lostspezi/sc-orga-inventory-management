"use client";

import { startTransition, useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Plus, X } from "lucide-react";
import type { OrganizationInviteView } from "@/lib/types/organization";
import { revokeOrgInviteAction } from "@/lib/actions/revoke-org-invite-action";
import InviteCreateDialog from "./invite-create-dialog";

type Props = {
    invites: OrganizationInviteView[];
    organizationSlug: string;
    discordGuildId?: string;
    actorRole: "owner" | "admin" | "hr" | "member";
};

const revokeInit = { success: false, message: "" };

export default function InvitationsPanel({ invites, organizationSlug, discordGuildId, actorRole }: Props) {
    const t = useTranslations("members");
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);
    const [revokeState, revokeFormAction, revokePending] = useActionState(revokeOrgInviteAction, revokeInit);

    const canRevoke = ["owner", "admin"].includes(actorRole);

    useEffect(() => {
        if (revokeState.success) router.refresh();
    }, [revokeState.success, router]);

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
                    {t("openInvites")} · {invites.length}
                </p>
                <button
                    type="button"
                    onClick={() => setShowCreate(true)}
                    className="sc-btn sc-btn-outline flex items-center gap-1.5 py-1 text-xs"
                >
                    <Plus size={12} />
                    {t("newInvite")}
                </button>
            </div>

            {invites.length === 0 && (
                <div
                    className="rounded-lg border border-dashed p-6 text-center"
                    style={{ borderColor: "rgba(240,165,0,0.22)", background: "rgba(20,14,6,0.10)" }}
                >
                    <p className="text-sm uppercase tracking-[0.12em]" style={{ color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-display)" }}>
                        {t("noPendingInvites")}
                    </p>
                    <p className="mt-2 text-xs" style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                        {t("noPendingInvitesDesc")}
                    </p>
                </div>
            )}

            <div className="space-y-2">
                {invites.map((invite) => {
                    const expiresAt = new Date(invite.expiresAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
                    return (
                        <div
                            key={invite.id}
                            className="rounded-lg border p-3"
                            style={{ borderColor: "rgba(79,195,220,0.14)", background: "rgba(7,18,28,0.26)" }}
                        >
                            <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className="text-xs uppercase tracking-[0.08em]" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                                            {invite.deliveryMethod === "discord_dm" ? t("discordDmInvite") : t("permanentInviteLabel")}
                                        </span>
                                        <span className="rounded border px-1.5 py-0.5 text-[9px] uppercase" style={{ borderColor: "rgba(79,195,220,0.18)", color: "rgba(79,195,220,0.6)", fontFamily: "var(--font-mono)" }}>
                                            {invite.targetRole}
                                        </span>
                                        {invite.maxUses != null && (
                                            <span className="rounded border px-1.5 py-0.5 text-[9px]" style={{ borderColor: "rgba(200,220,232,0.15)", color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}>
                                                {t("inviteUseCount", { used: invite.useCount ?? 0, max: invite.maxUses })}
                                            </span>
                                        )}
                                    </div>
                                    <div className="space-y-0.5 text-[10px]" style={{ fontFamily: "var(--font-mono)" }}>
                                        {invite.discordUserId && (
                                            <p style={{ color: "rgba(200,220,232,0.5)" }}>
                                                {t("discordUserIdLabel")}: {invite.discordUserId}
                                            </p>
                                        )}
                                        <p style={{ color: "rgba(200,220,232,0.42)" }}>
                                            {t("invitedByLabel")}: {invite.invitedByUsername ?? invite.invitedByUserId}
                                        </p>
                                        <p style={{ color: "rgba(200,220,232,0.35)" }}>
                                            {t("expiresLabel")}: {expiresAt}
                                        </p>
                                    </div>
                                </div>
                                {canRevoke && (
                                    <form action={(fd) => {
                                        fd.set("organizationSlug", organizationSlug);
                                        fd.set("inviteId", invite.id);
                                        startTransition(async () => { await revokeFormAction(fd); });
                                    }}>
                                        <input type="hidden" name="organizationSlug" value={organizationSlug} />
                                        <input type="hidden" name="inviteId" value={invite.id} />
                                        <button
                                            type="submit"
                                            disabled={revokePending}
                                            className="rounded p-1 opacity-60 hover:opacity-100 transition disabled:opacity-30"
                                            style={{ color: "rgba(240,80,80,0.8)" }}
                                            title={t("revokeInvite")}
                                        >
                                            <X size={14} />
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {revokeState.message && !revokeState.success && (
                <p className="text-xs" style={{ color: "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                    {revokeState.message}
                </p>
            )}

            {/* Create invite dialog */}
            {showCreate && (
                <InviteCreateDialog
                    organizationSlug={organizationSlug}
                    discordGuildId={discordGuildId}
                    actorRole={actorRole}
                    onClose={() => setShowCreate(false)}
                />
            )}
        </div>
    );
}
