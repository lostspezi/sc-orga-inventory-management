"use client";

import { useTranslations } from "next-intl";
import type { OrganizationInviteView } from "@/lib/types/organization";

type Props = {
    invites: OrganizationInviteView[];
};

export default function PendingOrgInvitesList({ invites }: Props) {
    const t = useTranslations("members");

    if (invites.length === 0) {
        return (
            <div
                className="rounded-lg border border-dashed p-6 text-center"
                style={{
                    borderColor: "rgba(240,165,0,0.22)",
                    background: "rgba(20,14,6,0.10)",
                }}
            >
                <p
                    className="text-sm uppercase tracking-[0.12em]"
                    style={{ color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-display)" }}
                >
                    {t("noPendingInvites")}
                </p>
                <p
                    className="mt-2 text-xs"
                    style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                >
                    {t("noPendingInvitesDesc")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {invites.map((invite) => (
                <PendingInviteCard key={invite.id} invite={invite} />
            ))}
        </div>
    );
}

function PendingInviteCard({ invite }: { invite: OrganizationInviteView }) {
    const t = useTranslations("members");

    const expiresAt = new Date(invite.expiresAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(7,18,28,0.26)",
            }}
        >
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div
                    className="text-sm uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    {invite.deliveryMethod === "discord_dm" ? t("discordDmInvite") : t("invite")}
                </div>

                <span
                    className="rounded border px-2 py-0.5 text-[10px] uppercase"
                    style={{
                        borderColor: "rgba(79,195,220,0.18)",
                        color: "rgba(79,195,220,0.6)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {invite.targetRole}
                </span>
            </div>

            <div className="space-y-1 text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
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
    );
}
