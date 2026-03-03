import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import { getOrganizationViewBySlug } from "@/lib/repositories/organization-repository";
import { getImportJobById, toImportJobView } from "@/lib/repositories/import-job-repository";
import CsvImportResultsClient from "@/components/orgs/details/items/csv-import-results-client";
import BackButton from "@/components/ui/back-button";

type Props = {
    params: Promise<{ slug: string; jobId: string }>;
};

export default async function ImportResultsPage({ params }: Props) {
    const { slug, jobId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const org = await getOrganizationViewBySlug(slug);
    if (!org) notFound();

    const isMember = org.members.some((m) => m.userId === session.user!.id);
    if (!isMember) notFound();

    const job = await getImportJobById(jobId);
    if (!job || job.organizationSlug !== slug) notFound();

    const t = await getTranslations("csvImport");

    const labels = {
        statusPending: t("statusPending"),
        statusProcessing: t("statusProcessing"),
        statusCompleted: t("statusCompleted"),
        statusFailed: t("statusFailed"),
        progress: t("progress"),
        colRow: t("colRow"),
        colInput: t("colInput"),
        colResolved: t("colResolved"),
        colStatus: t("colStatus"),
        colMessage: t("colMessage"),
        statusSuccess: t("statusSuccess"),
        statusNotFound: t("statusNotFound"),
        statusAlreadyExists: t("statusAlreadyExists"),
        statusError: t("statusError"),
        initiatedBy: t("initiatedBy"),
        startedAt: t("startedAt"),
        completedAt: t("completedAt"),
        backToInventory: t("backToInventory"),
        viewAllImports: t("viewAllImports"),
        summary: t("summary"),
        summaryImported: t("summaryImported"),
        summarySkipped: t("summarySkipped"),
        summaryFailed: t("summaryFailed"),
        downloadFailed: t("downloadFailed"),
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <BackButton />
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("eyebrow")}
                    </p>
                    <h2
                        className="mt-0.5 text-lg font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {t("resultsTitle")}
                    </h2>
                </div>
            </div>

            <CsvImportResultsClient
                initialJob={toImportJobView(job)}
                organizationSlug={slug}
                labels={labels}
            />
        </div>
    );
}
