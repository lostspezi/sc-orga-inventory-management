import { notFound } from "next/navigation";
import { FileText, User, Clock3 } from "lucide-react";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getOrganizationAuditLogsByOrganizationId } from "@/lib/repositories/organization-audit-log-repository";
import React from "react";
import LogsSearchForm from "@/components/orgs/details/logs-search-form";

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
                <div className="space-y-3">
                    {logs.map((log) => (
                        <AuditLogCard key={log._id.toString()} log={log} />
                    ))}
                </div>
            )}
        </div>
    );
}

function AuditLogCard({
                          log,
                      }: {
    log: {
        action: string;
        message: string;
        actorUsername?: string;
        actorUserId: string;
        entityType: string;
        entityId?: string;
        createdAt: Date;
    };
}) {
    const actor = log.actorUsername ?? log.actorUserId;
    const createdAt = new Date(log.createdAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
    });

    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(7,18,28,0.26)",
            }}
        >
            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    <FileText size={16} />
                    {log.action}
                </div>

                <span
                    className="rounded border px-2 py-0.5 text-[10px] uppercase"
                    style={{
                        borderColor: "rgba(79,195,220,0.18)",
                        color: "rgba(79,195,220,0.6)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {log.entityType}
                </span>
            </div>

            <p
                className="text-sm"
                style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}
            >
                {log.message}
            </p>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <InfoRow icon={<User size={14} />} label="Actor" value={actor} />
                <InfoRow icon={<Clock3 size={14} />} label="Time" value={createdAt} />
            </div>

            {log.entityId && (
                <div className="mt-2">
                    <p
                        className="text-[11px]"
                        style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                    >
                        Entity ID: {log.entityId}
                    </p>
                </div>
            )}
        </div>
    );
}

function InfoRow({
                     icon,
                     label,
                     value,
                 }: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
            <span style={{ color: "rgba(79,195,220,0.65)" }}>{icon}</span>
            <span style={{ color: "rgba(200,220,232,0.35)" }}>{label}</span>
            <span
                className="ml-auto text-right"
                style={{ color: "rgba(200,220,232,0.6)" }}
            >
                {value}
            </span>
        </div>
    );
}