import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getActivePermanentInviteByOrgId } from "@/lib/repositories/organization-invite-repository";
import OrgSettingsForm from "@/components/orgs/details/settings/org-settings-form";
import DiscordServerCard from "@/components/orgs/details/settings/discord-server-card";
import RaidHelperCard from "@/components/orgs/details/settings/raid-helper-card";
import PermanentInviteCard from "@/components/orgs/details/settings/permanent-invite-card";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ discordInstall?: string }>;
};

export default async function OrgSettingsPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { discordInstall } = await searchParams;

    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const org = await getOrganizationBySlug(slug);

    if (!org) {
        notFound();
    }

    const currentMember = org.members.find((m) => m.userId === session.user!.id);
    const isAdminOrOwner = currentMember && ["owner", "admin"].includes(currentMember.role);

    const permanentInvite = isAdminOrOwner
        ? await getActivePermanentInviteByOrgId(org._id)
        : null;

    const inviteUrl = permanentInvite?.permanentRawToken
        ? `${process.env.NEXT_PUBLIC_APP_URL}/invite/${permanentInvite.permanentRawToken}`
        : null;

    const t = await getTranslations("orgSettings");

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
                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                >
                    {t("forbidden")}
                </h2>
                <p
                    className="mt-2 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("forbiddenMessage")}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("eyebrow")}
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    {t("title")}
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("description")}
                </p>
            </div>

            <DiscordServerCard
                organizationSlug={org.slug}
                discordGuildId={org.discordGuildId}
                installStatus={discordInstall}
            />

            <RaidHelperCard
                organizationSlug={org.slug}
                hasApiKey={!!org.raidHelperApiKey}
            />

            <PermanentInviteCard
                organizationSlug={org.slug}
                inviteUrl={inviteUrl}
            />

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
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("discordIntegration")}
                    </p>
                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {t("transactionNotifications")}
                    </h3>
                </div>

                <OrgSettingsForm
                    organizationSlug={org.slug}
                    currentChannelId={org.discordTransactionChannelId ?? ""}
                    hasDiscord={!!org.discordGuildId}
                />
            </div>
        </div>
    );
}
