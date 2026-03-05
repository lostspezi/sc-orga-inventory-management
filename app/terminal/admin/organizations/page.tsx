import { getAllOrganizationsForAdmin } from "@/lib/repositories/organization-repository";
import TransferOwnerDialog from "@/components/admin/transfer-owner-dialog";
import ProOverrideToggle from "@/components/admin/pro-override-toggle";
import { isProOrg } from "@/lib/billing/is-pro";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "Admin · Organizations" };

function formatDate(date: Date) {
    return date.toISOString().slice(0, 10);
}

export default async function AdminOrganizationsPage() {
    const [rows, t] = await Promise.all([
        getAllOrganizationsForAdmin(),
        getTranslations("adminOrgs"),
    ]);

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-7xl space-y-4"
                style={{ animation: "slide-in-up 0.45s ease forwards" }}
            >
                <section
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.55)" }}
                >
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.6), transparent)",
                        }}
                    />
                    <p
                        className="mb-1 text-xs uppercase tracking-[0.35em]"
                        style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-display)" }}
                    >
                        {t("eyebrow")}
                    </p>
                    <h1
                        className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                        style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                    >
                        {t("title")}
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("orgCount", { count: rows.length })}
                    </p>
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.2), transparent)",
                        }}
                    />
                </section>

                <section
                    className="hud-panel overflow-hidden"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    {rows.length === 0 ? (
                        <p
                            className="p-6 text-sm"
                            style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("noOrgs")}
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table
                                className="w-full text-sm"
                                style={{ fontFamily: "var(--font-mono)" }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom: "1px solid rgba(79,195,220,0.12)",
                                            color: "rgba(79,195,220,0.5)",
                                        }}
                                    >
                                        {[t("colName"), t("colSlug"), t("colOwner"), t("colMembers"), t("colDiscord"), t("colCreated"), "PRO", ""].map(
                                            (h) => (
                                                <th
                                                    key={h}
                                                    className={`px-4 py-3 text-[10px] uppercase tracking-[0.22em] ${h === "" ? "text-right" : "text-left"}`}
                                                >
                                                    {h}
                                                </th>
                                            )
                                        )}
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map(({ org, ownerUsername, memberCount, memberViews }) => (
                                        <tr
                                            key={org._id.toString()}
                                            style={{
                                                borderBottom: "1px solid rgba(79,195,220,0.07)",
                                                color: "rgba(200,220,232,0.75)",
                                            }}
                                        >
                                            <td className="px-4 py-3 font-medium">{org.name}</td>
                                            <td
                                                className="px-4 py-3"
                                                style={{ color: "rgba(79,195,220,0.6)" }}
                                            >
                                                {org.slug}
                                            </td>
                                            <td className="px-4 py-3">
                                                {ownerUsername ?? (
                                                    <span style={{ color: "rgba(200,220,232,0.3)" }}>
                                                        {t("unknownOwner")}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">{memberCount}</td>
                                            <td className="px-4 py-3">
                                                {org.discordGuildId ? (
                                                    <span style={{ color: "rgba(88,196,120,0.8)" }}>
                                                        {t("connected")}
                                                    </span>
                                                ) : (
                                                    <span style={{ color: "rgba(200,220,232,0.25)" }}>
                                                        —
                                                    </span>
                                                )}
                                            </td>
                                            <td
                                                className="px-4 py-3"
                                                style={{ color: "rgba(200,220,232,0.45)" }}
                                            >
                                                {formatDate(org.createdAt)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <ProOverrideToggle
                                                    orgId={org._id.toString()}
                                                    orgName={org.name}
                                                    isPro={isProOrg(org)}
                                                    currentOverride={!!org.proOverride?.enabled}
                                                />
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <TransferOwnerDialog
                                                    orgSlug={org.slug}
                                                    orgName={org.name}
                                                    members={memberViews}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
