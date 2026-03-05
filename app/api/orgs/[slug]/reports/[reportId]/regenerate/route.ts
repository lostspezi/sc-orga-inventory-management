import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import { getReportById, resetReportForRegeneration } from "@/lib/repositories/report-repository";
import { processReport } from "@/lib/reporting/process-report";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type RouteCtx = { params: Promise<{ slug: string; reportId: string }> };

/** POST /api/orgs/[slug]/reports/[reportId]/regenerate */
export async function POST(_req: NextRequest, { params }: RouteCtx) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, reportId } = await params;
    const org = await getOrganizationBySlug(slug);
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const currentMember = org.members.find((m) => m.userId === session.user!.id);
    if (!currentMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!["owner", "admin"].includes(currentMember.role)) {
        return NextResponse.json({ error: "Admin or owner required" }, { status: 403 });
    }

    if (!isProOrg(org)) {
        return NextResponse.json({ error: "PRO subscription required" }, { status: 403 });
    }

    const report = await getReportById(reportId);
    if (!report || report.organizationId.toString() !== org._id.toString()) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (report.status === "generating" || report.status === "pending") {
        return NextResponse.json({ error: "Report is already being generated" }, { status: 409 });
    }

    const reset = await resetReportForRegeneration(reportId);
    if (!reset) {
        return NextResponse.json({ error: "Could not reset report" }, { status: 500 });
    }

    // Fire-and-forget
    processReport(reportId).catch(console.error);

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        action: "report.regenerated",
        entityType: "report",
        entityId: reportId,
        message: `Regenerated report for ${report.weekLabel}`,
    });

    return NextResponse.json({ reportId, message: "Regeneration started" });
}
