import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getActivePermanentInviteByOrgId } from "@/lib/repositories/organization-invite-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import OrgSettingsForm from "@/components/orgs/details/settings/org-settings-form";
import DiscordServerCard from "@/components/orgs/details/settings/discord-server-card";
import PermanentInviteCard from "@/components/orgs/details/settings/permanent-invite-card";
import GoogleSheetCard from "@/components/orgs/details/settings/google-sheet-card";
import BillingCard from "@/components/orgs/details/settings/billing-card";
import BillingSuccessAnimation from "@/components/orgs/details/settings/billing-success-animation";
import SettingsTabNav from "@/components/orgs/details/settings/settings-tab-nav";

type SettingsTab = "general" | "discord" | "pro";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ discordInstall?: string; billing?: string; tab?: string }>;
};

export default async function OrgSettingsPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { discordInstall, billing, tab } = await searchParams;

    const activeTab: SettingsTab =
        discordInstall ? "discord"
        : billing      ? "pro"
        : tab === "discord" ? "discord"
        : tab === "pro"     ? "pro"
        : "general";

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
            {billing === "success" && <BillingSuccessAnimation />}

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

            <SettingsTabNav
                slug={org.slug}
                activeTab={activeTab}
                labels={{
                    general: t("tabGeneral"),
                    discord: t("tabDiscord"),
                    pro: t("tabPro"),
                }}
            />

            {activeTab === "general" && (
                <PermanentInviteCard
                    organizationSlug={org.slug}
                    inviteUrl={inviteUrl}
                />
            )}

            {activeTab === "discord" && (
                <>
                    <DiscordServerCard
                        organizationSlug={org.slug}
                        discordGuildId={org.discordGuildId}
                        installStatus={discordInstall}
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
                </>
            )}

            {activeTab === "pro" && (
                <>
                    <BillingCard
                        organizationSlug={org.slug}
                        billing={{
                            isPro: isProOrg(org),
                            status: org.subscription?.status,
                            currentPeriodEnd: org.subscription?.currentPeriodEnd?.toISOString(),
                            cancelAtPeriodEnd: org.subscription?.cancelAtPeriodEnd,
                            proOverride: org.proOverride?.enabled,
                        }}
                        isAdminOrOwner={true}
                        labels={{
                            label: t("billingLabel"),
                            freeStatus: t("billingFreeStatus"),
                            proStatus: t("billingProStatus"),
                            proTitle: t("billingProTitle"),
                            freeTitle: t("billingFreeTitle"),
                            proDesc: t("billingProDesc"),
                            freeDesc: t("billingFreeDesc"),
                            renewsOn: t("billingRenewsOn"),
                            cancelsOn: t("billingCancelsOn"),
                            cancelAtPeriodEnd: t("billingCancelAtPeriodEnd"),
                            manageBtn: t("billingManageBtn"),
                            upgradeBtn: t("billingUpgradeBtn"),
                            proOverrideNote: t("billingProOverrideNote"),
                            errorCheckout: t("billingErrorCheckout"),
                            errorPortal: t("billingErrorPortal"),
                            featuresTitle: t("billingFeaturesTitle"),
                            features: [
                                t("billingFeature1"),
                                t("billingFeature2"),
                                t("billingFeature3"),
                                t("billingFeature4"),
                                t("billingFeature5"),
                            ],
                        }}
                    />

                    {isProOrg(org) && (
                        <GoogleSheetCard
                            organizationSlug={org.slug}
                            googleSheetId={org.googleSheetId}
                            googleSheetLastSyncedAt={org.googleSheetLastSyncedAt?.toISOString()}
                            labels={{
                                label: t("googleSheetLabel"),
                                connectedStatus: t("connected"),
                                notConnectedStatus: t("notConnected"),
                                connectedTitle: t("googleSheetConnectedTitle"),
                                notConnectedTitle: t("googleSheetNotConnectedTitle"),
                                desc: t("googleSheetDesc"),
                                urlPlaceholder: t("googleSheetUrlPlaceholder"),
                                save: t("googleSheetSave"),
                                disconnect: t("disconnect"),
                                syncNow: t("googleSheetSyncNow"),
                                lastSynced: t("googleSheetLastSynced"),
                                never: t("googleSheetNever"),
                                syncStarted: t("googleSheetSyncStarted"),
                                syncPushed: t("googleSheetSyncPushed"),
                                howItWorksTitle: t("googleSheetHowItWorksTitle"),
                                howItWorksShare: t("googleSheetHowItWorksShare"),
                                serviceAccountEmail: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? "",
                                howItWorksSync: t("googleSheetHowItWorksSync"),
                                howItWorksAuto: t("googleSheetHowItWorksAuto"),
                                howItWorksFormat: t("googleSheetHowItWorksFormat"),
                                syncError: t("googleSheetSyncError"),
                                saveError: t("googleSheetSaveError"),
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}
