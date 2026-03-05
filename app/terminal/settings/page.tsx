import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Image from "next/image";
import { getOrganizationViewsByUserId } from "@/lib/repositories/organization-repository";
import { getUserAuecBalance } from "@/lib/repositories/user-repository";
import LeaveOrgButton from "@/components/settings/leave-org-button";
import DeleteAccountButton from "@/components/settings/delete-account-button";
import RsiHandleForm from "@/components/settings/rsi-handle-form";
import AuecBalanceForm from "@/components/settings/auec-balance-form";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "User Settings" };

export default async function SettingsPage({
    searchParams,
}: {
    searchParams: Promise<{ setup?: string }>;
}) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const { setup } = await searchParams;
    const setupRequired = setup === "rsi";

    const [orgs, t, userAuecBalance] = await Promise.all([
        getOrganizationViewsByUserId(session.user.id),
        getTranslations("settings"),
        getUserAuecBalance(session.user.id),
    ]);

    const rsiHandle = session.user.rsiHandle ?? null;
    const discordName = session.user.name ?? "Authorized User";
    const displayName = rsiHandle ?? discordName;
    const userImage = session.user.image ?? null;

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-3xl space-y-6"
                style={{ animation: "slide-in-up 0.45s ease forwards" }}
            >
                {/* Page header */}
                <section
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.55)" }}
                >
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, var(--accent-primary), transparent)",
                        }}
                    />
                    <p
                        className="mb-1 text-xs uppercase tracking-[0.35em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-display)" }}
                    >
                        {t("eyebrow")}
                    </p>
                    <h1
                        className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {t("title")}
                    </h1>
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(79,195,220,0.22), transparent)",
                        }}
                    />
                </section>

                {/* RSI handle setup banner */}
                {setupRequired && !rsiHandle && (
                    <section
                        className="hud-panel p-5 sm:p-6"
                        style={{
                            background: "rgba(240,165,0,0.06)",
                            borderColor: "rgba(240,165,0,0.25)",
                        }}
                    >
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: "rgba(240,165,0,0.7)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("rsiHandleRequired")}
                        </p>
                        <p
                            className="mt-1 text-sm"
                            style={{ color: "rgba(200,220,232,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("rsiHandleRequiredDesc")}
                        </p>
                    </section>
                )}

                {/* RSI Handle */}
                <section
                    className="hud-panel p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    <p
                        className="mb-1 text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("rsiHandleSection")}
                    </p>
                    <p
                        className="mb-4 text-xs"
                        style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("rsiHandleDesc")}
                    </p>
                    <RsiHandleForm currentHandle={rsiHandle} />
                </section>

                {/* aUEC Balance */}
                <AuecBalanceForm
                    currentBalance={userAuecBalance}
                    sectionLabel={t("auecBalanceSection")}
                    sectionDesc={t("auecBalanceDesc")}
                    balanceLabel={t("auecBalanceLabel")}
                    saveLabel={t("auecBalanceSave")}
                    savingLabel={t("saving")}
                />

                {/* Profile */}
                <section
                    className="hud-panel p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    <p
                        className="mb-4 text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("profileLabel")}
                    </p>
                    <div className="flex items-center gap-4">
                        {userImage ? (
                            <Image
                                src={userImage}
                                alt={displayName}
                                width={56}
                                height={56}
                                className="rounded-full"
                                style={{ objectFit: "cover", border: "1px solid rgba(79,195,220,0.2)" }}
                            />
                        ) : (
                            <div
                                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl font-semibold"
                                style={{
                                    background: "rgba(79,195,220,0.1)",
                                    color: "rgba(79,195,220,0.7)",
                                    border: "1px solid rgba(79,195,220,0.2)",
                                }}
                            >
                                {displayName.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div>
                            <p
                                className="text-base font-semibold"
                                style={{ color: "rgba(200,220,232,0.9)", fontFamily: "var(--font-mono)" }}
                            >
                                {displayName}
                            </p>
                            {rsiHandle ? (
                                <p
                                    className="mt-0.5 text-xs"
                                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                >
                                    Discord: {discordName}
                                </p>
                            ) : (
                                <p
                                    className="mt-0.5 text-xs"
                                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                >
                                    {t("profileVia")}
                                </p>
                            )}
                        </div>
                    </div>
                </section>

                {/* Organizations */}
                <section
                    className="hud-panel overflow-hidden"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    <div className="border-b p-5 sm:p-6" style={{ borderColor: "rgba(79,195,220,0.1)" }}>
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("orgsLabel")}
                        </p>
                        <p
                            className="mt-0.5 text-xs"
                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("orgCount", { count: orgs.length })}
                        </p>
                    </div>

                    {orgs.length === 0 ? (
                        <p
                            className="p-5 text-sm"
                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("noOrgs")}
                        </p>
                    ) : (
                        <ul>
                            {orgs.map((org) => {
                                const self = org.members.find(
                                    (m) => m.userId === session.user!.id
                                );
                                const role = self?.role ?? "member";

                                return (
                                    <li
                                        key={org._id.toString()}
                                        className="flex items-center justify-between gap-4 px-5 py-4"
                                        style={{ borderBottom: "1px solid rgba(79,195,220,0.07)" }}
                                    >
                                        <div className="min-w-0">
                                            <p
                                                className="truncate font-medium"
                                                style={{
                                                    color: "rgba(200,220,232,0.85)",
                                                    fontFamily: "var(--font-mono)",
                                                    fontSize: "0.875rem",
                                                }}
                                            >
                                                {org.name}
                                            </p>
                                            <p
                                                className="mt-0.5 text-xs uppercase tracking-[0.15em]"
                                                style={{
                                                    color:
                                                        role === "owner"
                                                            ? "rgba(240,165,0,0.65)"
                                                            : role === "admin"
                                                                ? "rgba(79,195,220,0.55)"
                                                                : "rgba(200,220,232,0.3)",
                                                    fontFamily: "var(--font-mono)",
                                                }}
                                            >
                                                {role} · {t("memberCount", { count: org.members.length })}
                                            </p>
                                        </div>

                                        <LeaveOrgButton
                                            orgSlug={org.slug}
                                            orgName={org.name}
                                            role={role}
                                            memberCount={org.members.length}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>

                {/* Danger zone */}
                <section
                    className="hud-panel overflow-hidden"
                    style={{
                        background: "rgba(8,16,24,0.45)",
                        borderColor: "rgba(220,50,50,0.18)",
                    }}
                >
                    <div className="border-b p-5 sm:p-6" style={{ borderColor: "rgba(220,50,50,0.12)" }}>
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: "rgba(220,80,80,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("dangerZone")}
                        </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
                        <div>
                            <p
                                className="text-sm font-medium"
                                style={{ color: "rgba(220,80,80,0.85)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("deleteAccount")}
                            </p>
                            <p
                                className="mt-0.5 text-xs leading-relaxed"
                                style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("deleteDescription")}
                            </p>
                        </div>

                        <div className="shrink-0">
                            <DeleteAccountButton userName={displayName} />
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}
