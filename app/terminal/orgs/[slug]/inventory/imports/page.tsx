import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Clock, ChevronRight, History } from "lucide-react";
import { getOrganizationViewBySlug, getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getImportJobsByOrg, toImportJobView } from "@/lib/repositories/import-job-repository";
import BackButton from "@/components/ui/back-button";
import { ImportJobView } from "@/lib/types/import-job";

type Props = {
    params: Promise<{ slug: string }>;
};

function StatusChip({ status }: { status: ImportJobView["status"] }) {
    const config = {
        pending: { icon: <Clock size={11} />, label: "Pending", color: "rgba(200,220,232,0.5)" },
        processing: { icon: <Loader2 size={11} className="animate-spin" />, label: "Processing", color: "var(--accent-primary)" },
        completed: { icon: <CheckCircle size={11} />, label: "Completed", color: "rgba(79,195,120,1)" },
        failed: { icon: <XCircle size={11} />, label: "Failed", color: "rgba(220,79,79,1)" },
    }[status];

    return (
        <span
            className="inline-flex items-center gap-1 text-xs font-medium"
            style={{ color: config.color, fontFamily: "var(--font-mono)" }}
        >
            {config.icon}
            {config.label}
        </span>
    );
}

export default async function ImportHistoryPage({ params }: Props) {
    const { slug } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const [orgView, org] = await Promise.all([
        getOrganizationViewBySlug(slug),
        getOrganizationBySlug(slug),
    ]);

    if (!orgView || !org) notFound();

    const isMember = orgView.members.some((m) => m.userId === session.user!.id);
    if (!isMember) notFound();

    const t = await getTranslations("csvImport");

    const jobDocs = await getImportJobsByOrg(org._id, 50);
    const jobs = jobDocs.map(toImportJobView);

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
                        {t("historyTitle")}
                    </h2>
                </div>
            </div>

            {jobs.length === 0 ? (
                <div
                    className="rounded-lg border px-6 py-12 text-center"
                    style={{ borderColor: "rgba(79,195,220,0.1)", background: "rgba(7,18,28,0.2)" }}
                >
                    <History size={32} className="mx-auto mb-3" style={{ color: "rgba(79,195,220,0.3)" }} />
                    <p
                        className="text-sm"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("historyNoImports")}
                    </p>
                </div>
            ) : (
                <div
                    className="overflow-x-auto rounded-lg border"
                    style={{ borderColor: "rgba(79,195,220,0.1)" }}
                >
                    <table className="w-full text-sm" style={{ fontFamily: "var(--font-mono)" }}>
                        <thead>
                            <tr
                                style={{
                                    borderBottom: "1px solid rgba(79,195,220,0.1)",
                                    background: "rgba(7,18,28,0.5)",
                                }}
                            >
                                {[
                                    t("historyDate"),
                                    t("historyBy"),
                                    t("historyStatus"),
                                    t("historyRows"),
                                    t("summaryImported"),
                                    t("summarySkipped"),
                                    t("summaryFailed"),
                                    "",
                                ].map((col, i) => (
                                    <th
                                        key={i}
                                        className="px-4 py-2.5 text-left text-xs uppercase tracking-wider"
                                        style={{ color: "rgba(79,195,220,0.6)" }}
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {jobs.map((job) => {
                                const successCount = job.results.filter((r) => r.status === "success").length;
                                const skippedCount = job.results.filter((r) => r.status === "already_exists").length;
                                const failedCount = job.results.filter(
                                    (r) => r.status === "not_found" || r.status === "error"
                                ).length;

                                return (
                                    <tr
                                        key={job.id}
                                        style={{ borderBottom: "1px solid rgba(79,195,220,0.05)" }}
                                        className="group"
                                    >
                                        <td
                                            className="px-4 py-3 text-xs"
                                            style={{ color: "rgba(200,220,232,0.5)" }}
                                        >
                                            {new Date(job.createdAt).toLocaleString()}
                                        </td>
                                        <td
                                            className="px-4 py-3"
                                            style={{ color: "rgba(200,220,232,0.7)" }}
                                        >
                                            {job.initiatedByUsername}
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusChip status={job.status} />
                                        </td>
                                        <td
                                            className="px-4 py-3"
                                            style={{ color: "rgba(200,220,232,0.6)" }}
                                        >
                                            {job.totalRows}
                                        </td>
                                        <td
                                            className="px-4 py-3"
                                            style={{ color: job.results.length > 0 ? "rgba(79,195,120,0.9)" : "rgba(200,220,232,0.3)" }}
                                        >
                                            {job.results.length > 0 ? successCount : "—"}
                                        </td>
                                        <td
                                            className="px-4 py-3"
                                            style={{ color: job.results.length > 0 ? "rgba(120,160,220,0.9)" : "rgba(200,220,232,0.3)" }}
                                        >
                                            {job.results.length > 0 ? skippedCount : "—"}
                                        </td>
                                        <td
                                            className="px-4 py-3"
                                            style={{ color: failedCount > 0 ? "rgba(220,100,100,0.9)" : "rgba(200,220,232,0.3)" }}
                                        >
                                            {job.results.length > 0 ? failedCount : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <Link
                                                href={`/terminal/orgs/${slug}/inventory/import/${job.id}`}
                                                className="inline-flex items-center gap-1 text-xs transition-colors"
                                                style={{ color: "rgba(79,195,220,0.5)" }}
                                            >
                                                {t("historyView")}
                                                <ChevronRight size={12} />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
