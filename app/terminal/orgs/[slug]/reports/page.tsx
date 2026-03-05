import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { BarChart3, Lock } from "lucide-react";
import Link from "next/link";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import { getReportsByOrg } from "@/lib/repositories/report-repository";
import { getCurrentWeekBoundaries } from "@/lib/reporting/week-utils";
import ReportList from "@/components/orgs/details/reports/report-list";
import GenerateReportButton from "@/components/orgs/details/reports/generate-report-button";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function OrgReportsPage({ params }: Props) {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const org = await getOrganizationBySlug(slug);
    if (!org) notFound();

    const currentMember = org.members.find((m) => m.userId === session.user!.id);
    if (!currentMember) notFound();

    const t = await getTranslations("reports");
    const isAdminOrOwner = ["owner", "admin"].includes(currentMember.role);

    // Non-PRO: show upgrade CTA
    if (!isProOrg(org)) {
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
                </div>

                <div
                    className="rounded-lg border p-8 text-center space-y-4"
                    style={{
                        borderColor: "rgba(79,195,220,0.15)",
                        background: "rgba(7,18,28,0.35)",
                    }}
                >
                    <div
                        className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border"
                        style={{
                            borderColor: "rgba(79,195,220,0.2)",
                            background: "rgba(79,195,220,0.05)",
                        }}
                    >
                        <Lock size={24} style={{ color: "rgba(79,195,220,0.5)" }} />
                    </div>
                    <div>
                        <h3
                            className="text-base font-semibold uppercase tracking-[0.08em]"
                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                        >
                            {t("proRequired")}
                        </h3>
                        <p
                            className="mt-2 text-sm max-w-sm mx-auto"
                            style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("proRequiredDesc")}
                        </p>
                    </div>
                    {isAdminOrOwner && (
                        <Link
                            href={`/terminal/orgs/${slug}/settings?tab=pro`}
                            className="sc-btn inline-flex items-center gap-2"
                        >
                            <BarChart3 size={15} />
                            {t("upgradeBtn")}
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    // PRO org — fetch reports
    const { reports, total } = await getReportsByOrg(org._id);
    const tz = org.timezone ?? "UTC";
    const { weekLabel: currentWeekLabel } = getCurrentWeekBoundaries(tz);

    const statusLabels = {
        ready: t("statusReady"),
        generating: t("statusGenerating"),
        pending: t("statusPending"),
        failed: t("statusFailed"),
    };

    const regenerateLabels = {
        button: t("regenerate"),
        confirmTitle: t("regenerateConfirmTitle"),
        confirmMessage: t("regenerateConfirmMessage"),
        confirm: t("regenerateConfirm"),
        cancel: t("cancel"),
        regenerating: t("regenerating"),
    };

    const listLabels = {
        weekRange: t("colWeekRange"),
        status: t("colStatus"),
        generated: t("colGenerated"),
        actions: t("colActions"),
        download: t("download"),
        noReports: t("noReports"),
        noReportsDesc: t("noReportsDesc"),
        statusLabels,
        regenerate: regenerateLabels,
        errorDetails: t("errorDetails"),
        generatedAt: t("colGenerated"),
        neverGenerated: t("neverGenerated"),
        version: t("version"),
        size: t("size"),
        bytes: t("bytes"),
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
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

                {isAdminOrOwner && (
                    <div className="flex flex-col items-start gap-1">
                        <GenerateReportButton
                            slug={org.slug}
                            currentWeekLabel={currentWeekLabel}
                            labels={{
                                button: t("generateBtn"),
                                confirmTitle: t("generateConfirmTitle"),
                                confirmMessage: t("generateConfirmMessage"),
                                confirm: t("generateConfirm"),
                                cancel: t("cancel"),
                                generating: t("generating"),
                                alreadyExists: t("alreadyExists"),
                            }}
                        />
                        <p
                            className="text-[10px]"
                            style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("currentWeek", { week: currentWeekLabel })}
                        </p>
                    </div>
                )}
            </div>

            {/* Stats row */}
            <div
                className="flex gap-6 rounded-lg border px-4 py-3"
                style={{
                    borderColor: "rgba(79,195,220,0.1)",
                    background: "rgba(7,18,28,0.2)",
                }}
            >
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("totalReports")}
                    </p>
                    <p
                        className="text-xl font-semibold mt-0.5"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {total}
                    </p>
                </div>
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("currentWeekTz")}
                    </p>
                    <p
                        className="text-xl font-semibold mt-0.5"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {currentWeekLabel}
                    </p>
                </div>
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.18em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("timezone")}
                    </p>
                    <p
                        className="text-xl font-semibold mt-0.5"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {tz}
                    </p>
                </div>
            </div>

            {/* Auto-generation note */}
            <div
                className="rounded-lg border px-4 py-3 text-xs"
                style={{
                    borderColor: "rgba(79,195,220,0.08)",
                    background: "rgba(79,195,220,0.03)",
                    color: "rgba(200,220,232,0.45)",
                    fontFamily: "var(--font-mono)",
                }}
            >
                {t("autoNote")}
            </div>

            {/* Report list */}
            <ReportList
                slug={org.slug}
                initialReports={reports}
                total={total}
                isAdminOrOwner={isAdminOrOwner}
                labels={listLabels}
            />
        </div>
    );
}
