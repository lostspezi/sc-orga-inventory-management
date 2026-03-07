import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import {
    getOrgMembersByOrganizationId,
    buildOrgMemberViews,
} from "@/lib/repositories/org-member-repository";
import {
    getOrgRanksByOrganizationId,
    toOrgRankView,
} from "@/lib/repositories/org-rank-repository";
import {
    getPendingOrganizationInvitesByOrganizationId,
} from "@/lib/repositories/organization-invite-repository";
import MemberList from "@/components/orgs/details/members/member-list";
import RanksManagement from "@/components/orgs/details/members/ranks-management";
import InvitationsPanel from "@/components/orgs/details/members/invitations-panel";
import MembersTabNav from "@/components/orgs/details/members/members-tab-nav";
import type { OrganizationInviteView } from "@/lib/types/organization";

type Tab = "members" | "ranks" | "invitations";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ tab?: string }>;
};

export default async function OrgMembersPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { tab } = await searchParams;
    const activeTab: Tab = (tab === "ranks" || tab === "invitations") ? tab : "members";

    const session = await auth();
    if (!session?.user) redirect("/login");

    const org = await getOrganizationBySlug(slug);
    if (!org) notFound();

    const currentMember = org.members.find((m) => m.userId === session.user!.id);
    const t = await getTranslations("members");

    const canAccess = currentMember && ["owner", "admin", "hr"].includes(currentMember.role);
    if (!currentMember || !canAccess) {
        return (
            <div
                className="rounded-lg border p-6"
                style={{ borderColor: "rgba(240,165,0,0.18)", background: "rgba(20,14,6,0.12)" }}
            >
                <h2 className="text-lg font-semibold uppercase tracking-[0.08em]" style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}>
                    {t("forbidden")}
                </h2>
                <p className="mt-2 text-sm" style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}>
                    {t("forbiddenMessage")}
                </p>
            </div>
        );
    }

    const actorRole = currentMember.role as "owner" | "admin" | "hr" | "member";
    const canManageRanks = ["owner", "admin"].includes(actorRole);
    const isPro = isProOrg(org);

    // Fetch ranks for all tabs (used in multiple places)
    const rankDocs = await getOrgRanksByOrganizationId(org._id);
    const ranks = rankDocs.map(toOrgRankView);

    return (
        <div className="space-y-4">
            {/* Page header */}
            <div>
                <p className="text-[10px] uppercase tracking-[0.25em]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
                    {t("eyebrow")}
                </p>
                <h2 className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                    {t("title")}
                </h2>
                <p className="mt-1 text-sm" style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}>
                    {t("description")}
                </p>
            </div>

            {/* Tab nav */}
            <MembersTabNav canManageRanks={canManageRanks} />

            {/* Tab content */}
            <div
                className="rounded-lg border p-4"
                style={{ borderColor: "rgba(79,195,220,0.14)", background: "rgba(7,18,28,0.28)" }}
            >
                {activeTab === "members" && (
                    <MembersTabContent
                        orgId={org._id}
                        organizationSlug={org.slug}
                        rankDocs={rankDocs}
                        ranks={ranks}
                        actorRole={actorRole}
                        isPro={isPro}
                    />
                )}

                {activeTab === "ranks" && canManageRanks && (
                    <RanksManagement ranks={ranks} organizationSlug={org.slug} />
                )}

                {activeTab === "invitations" && (
                    <InvitationsTabContent
                        orgId={org._id}
                        organizationSlug={org.slug}
                        discordGuildId={org.discordGuildId}
                        actorRole={actorRole}
                    />
                )}
            </div>
        </div>
    );
}

// Separate async component for members tab to enable data fetching
async function MembersTabContent({
    orgId,
    organizationSlug,
    rankDocs,
    ranks,
    actorRole,
    isPro,
}: {
    orgId: import("mongodb").ObjectId;
    organizationSlug: string;
    rankDocs: import("@/lib/types/org-rank").OrgRankDocument[];
    ranks: import("@/lib/types/org-rank").OrgRankView[];
    actorRole: "owner" | "admin" | "hr" | "member";
    isPro: boolean;
}) {
    const memberDocs = await getOrgMembersByOrganizationId(orgId);
    const memberViews = await buildOrgMemberViews(memberDocs, rankDocs);

    return (
        <MemberList
            members={memberViews}
            ranks={ranks}
            organizationSlug={organizationSlug}
            actorRole={actorRole}
            isPro={isPro}
        />
    );
}

async function InvitationsTabContent({
    orgId,
    organizationSlug,
    discordGuildId,
    actorRole,
}: {
    orgId: import("mongodb").ObjectId;
    organizationSlug: string;
    discordGuildId?: string;
    actorRole: "owner" | "admin" | "hr" | "member";
}) {
    const pendingDocs = await getPendingOrganizationInvitesByOrganizationId(orgId);
    const invites: OrganizationInviteView[] = pendingDocs.map((doc) => ({
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
        isPermanent: doc.isPermanent,
        permanentRawToken: doc.permanentRawToken,
        status: doc.status,
        expiresAt: doc.expiresAt.toISOString(),
        createdAt: doc.createdAt.toISOString(),
        maxUses: doc.maxUses,
        useCount: doc.useCount,
    }));

    return (
        <InvitationsPanel
            invites={invites}
            organizationSlug={organizationSlug}
            discordGuildId={discordGuildId}
            actorRole={actorRole}
        />
    );
}
