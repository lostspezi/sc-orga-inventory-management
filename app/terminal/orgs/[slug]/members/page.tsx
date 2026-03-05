import {notFound, redirect} from "next/navigation";
import {getOrganizationViewBySlug} from "@/lib/repositories/organization-repository";
import {getPendingOrganizationInvitesByOrganizationId} from "@/lib/repositories/organization-invite-repository";
import {getTranslations} from "next-intl/server";
import DiscordInviteForm from "@/components/orgs/details/members/discord-invite-form";
import PendingOrgInvitesList from "@/components/orgs/details/members/pending-org-invites-list";
import {auth} from "@/auth";
import Link from "next/link";
import RemoveMemberButton from "@/components/orgs/details/members/remove-member-button";
import ChangeMemberRoleControl from "@/components/orgs/details/members/change-member-role-control";
import { getUsersByIds } from "@/lib/repositories/user-repository";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function OrgMembersPage({params}: Props) {
    const {slug} = await params;

    const session = await auth();

    if (!session?.user) {
        redirect("/login")
    }

    const org = await getOrganizationViewBySlug(slug);

    if (!org) {
        notFound();
    }

    const currentMember = org.members.find((m) => m.userId === session?.user?.id);

    const isAdminOrOwner = currentMember && (currentMember.role === "admin" || currentMember.role === "owner");
    const t = await getTranslations("members");

    if (!currentMember || !isAdminOrOwner) {
        return (
            <div
                className="rounded-lg border p-6"
                style={{
                    borderColor: "rgba(240,165,0,0.18)",
                    background: "rgba(20,14,6,0.12)",
                }}
            >
                <h2
                    className="text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)"}}
                >
                    {t("forbidden")}
                </h2>
                <p
                    className="mt-2 text-sm"
                    style={{color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)"}}
                >
                    {t("forbiddenMessage")}
                </p>
            </div>
        );
    }

    const pendingInviteDocs = await getPendingOrganizationInvitesByOrganizationId(org._id);
    const pendingInvites = pendingInviteDocs.map((doc) => ({
        id: doc._id.toString(),
        organizationSlug: doc.organizationSlug,
        invitedByUserId: doc.invitedByUserId,
        invitedByUsername: doc.invitedByUsername,
        targetRole: doc.targetRole,
        deliveryMethod: doc.deliveryMethod,
        inviteToken: doc.inviteToken,
        email: doc.email,
        discordUserId: doc.discordUserId,
        targetUserId: doc.targetUserId,
        status: doc.status,
        expiresAt: doc.expiresAt.toISOString(),
        createdAt: doc.createdAt.toISOString(),
    }));

    // Fetch aUEC balances for all members
    const memberUserIds = org.members.map((m) => m.userId);
    const memberUsers = await getUsersByIds(memberUserIds);
    const auecByUserId: Map<string, number> = new Map(
        memberUsers
            .filter((u) => u.auecBalance != null)
            .map((u) => [u._id.toString(), u.auecBalance!])
    );

    return (
        <div className="space-y-4">
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)"}}
                >
                    {t("eyebrow")}
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                >
                    {t("title")}
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)"}}
                >
                    {t("description")}
                </p>
            </div>

            {/* Current members */}
            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.28)",
                }}
            >
                <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)"}}
                        >
                            {t("activeMembers")}
                        </p>
                        <h3
                            className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                            style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                        >
                            {t("activeMembersCount", { count: org.members.length })}
                        </h3>
                    </div>
                </div>

                <div className="space-y-2">
                    {org.members.map((member) => (
                        <div
                            key={`${member.userId}-${member.joinedAt.toString()}`}
                            className="rounded-md border px-3 py-2"
                            style={{
                                borderColor: "rgba(79,195,220,0.10)",
                                background: "rgba(7,18,28,0.18)",
                            }}
                        >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className="text-xs"
                                    style={{color: "rgba(200,220,232,0.55)", fontFamily: "var(--font-mono)"}}
                                >
                                    {member.username}
                                </span>
                                    <span
                                        className="rounded border px-2 py-0.5 text-[10px] uppercase"
                                        style={{
                                            borderColor: "rgba(79,195,220,0.18)",
                                            color: "rgba(79,195,220,0.65)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                    {member.role}
                                </span>
                                    {auecByUserId.has(member.userId) && (
                                        <span
                                            className="rounded border px-2 py-0.5 text-[10px]"
                                            style={{
                                                borderColor: "rgba(80,210,120,0.25)",
                                                color: "rgba(80,210,120,0.75)",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {auecByUserId.get(member.userId)!.toLocaleString()} {t("auec")}
                                        </span>
                                    )}
                                </div>
                                {isAdminOrOwner &&
                                    <>
                                        <ChangeMemberRoleControl
                                            organizationSlug={org.slug}
                                            targetUserId={member.userId}
                                            targetLabel={member.username}
                                            currentRole={member.role}
                                            actorRole={currentMember.role}
                                        />
                                        <RemoveMemberButton
                                            organizationSlug={org.slug}
                                            targetUserId={member.userId}
                                            disabled={member.role === "owner"}
                                            targetLabel={member.username}
                                        />
                                    </>
                                }
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {isAdminOrOwner && <>
                {/* Invite via Discord */}
                {org.discordGuildId ? (
                    <DiscordInviteForm organizationSlug={org.slug}/>
                ) : (
                    <div
                        className="rounded-lg border p-4"
                        style={{
                            borderColor: "rgba(79,195,220,0.12)",
                            background: "rgba(7,18,28,0.18)",
                        }}
                    >
                        <p
                            className="text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("discordInvites")}
                        </p>
                        <p
                            className="mt-2 text-sm"
                            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("discordNotConnected")}{" "}
                            <Link
                                href={`/terminal/orgs/${org.slug}/settings`}
                                className="underline underline-offset-2"
                                style={{ color: "rgba(79,195,220,0.7)" }}
                            >
                                {t("goToSettings")}
                            </Link>
                        </p>
                    </div>
                )}

                {/* Pending invites */}
                <div
                    className="rounded-lg border p-4"
                    style={{
                        borderColor: "rgba(79,195,220,0.14)",
                        background: "rgba(7,18,28,0.28)",
                    }}
                >
                    <div className="mb-4">
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)"}}
                        >
                            {t("pendingInvitations")}
                        </p>
                        <h3
                            className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                            style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                        >
                            {t("openInvites")}
                        </h3>
                    </div>

                    <PendingOrgInvitesList invites={pendingInvites}/>

                </div>
            </>}
        </div>
    );
}