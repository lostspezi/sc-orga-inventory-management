import { notFound } from "next/navigation";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getOrganizationAuditLogsByOrganizationId } from "@/lib/repositories/organization-audit-log-repository";
import LogsSearchForm from "@/components/orgs/details/logs-search-form";
import AuditLogList from "@/components/orgs/details/audit-log-list";

type Props = {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ q?: string }>;
};

export default async function OrgLogsPage({ params, searchParams }: Props) {
    const { slug } = await params;
    const { q } = await searchParams;

    const org = await getOrganizationBySlug(slug);

    if (!org) {
        notFound();
    }

    const logs = await getOrganizationAuditLogsByOrganizationId(
        org._id.toString(),
        q
    );

    const serializedLogs = logs.map((log) => ({
        _id: log._id.toString(),
        action: log.action,
        message: log.message,
        actorUsername: log.actorUsername,
        actorUserId: log.actorUserId,
        entityType: log.entityType,
        entityId: log.entityId,
        metadata: log.metadata ?? null,
        createdAt: log.createdAt.toISOString(),
    }));

    return (
        <div className="space-y-4">
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Logs
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    Audit Log
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Review who did what and when inside this organization.
                </p>
            </div>

            <LogsSearchForm initialQuery={q ?? ""} />

            {logs.length === 0 ? (
                <div
                    className="rounded-lg border border-dashed p-8 text-center"
                    style={{
                        borderColor: "rgba(240,165,0,0.28)",
                        background: "rgba(20,14,6,0.12)",
                    }}
                >
                    <p
                        className="text-sm uppercase tracking-[0.12em]"
                        style={{ color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-display)" }}
                    >
                        No Matching Logs
                    </p>
                    <p
                        className="mt-2 text-xs"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        {q
                            ? "No audit log entries matched your search."
                            : "No audit log entries have been recorded yet."}
                    </p>
                </div>
            ) : (
                <AuditLogList logs={serializedLogs} />
            )}
        </div>
    );
}