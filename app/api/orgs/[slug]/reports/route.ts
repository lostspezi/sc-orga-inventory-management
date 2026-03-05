import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import {
    createReportDoc,
    getReportsByOrg,
    getReportByWeekLabel,
    toReportView,
} from "@/lib/repositories/report-repository";
import { processReport } from "@/lib/reporting/process-report";
import { getWeekBoundaries } from "@/lib/reporting/week-utils";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type RouteCtx = { params: Promise<{ slug: string }> };

/** GET /api/orgs/[slug]/reports — paginated list */
export async function GET(req: NextRequest, { params }: RouteCtx) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const org = await getOrganizationBySlug(slug);
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isMember = org.members.some((m) => m.userId === session.user!.id);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!isProOrg(org)) {
        return NextResponse.json({ error: "PRO subscription required" }, { status: 403 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get("limit") ?? "20", 10)));

    const { reports, total } = await getReportsByOrg(org._id, page, limit);
    return NextResponse.json({ reports, total, page, limit });
}

/** POST /api/orgs/[slug]/reports — create / on-demand generate */
export async function POST(req: NextRequest, { params }: RouteCtx) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
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

    const body = await req.json().catch(() => ({}));
    const weekStartInput: string | undefined = body.weekStart;

    // Compute boundaries from the supplied date, or default to current week
    const tz = org.timezone ?? "UTC";
    const refDate = weekStartInput ? new Date(weekStartInput) : new Date();
    if (isNaN(refDate.getTime())) {
        return NextResponse.json({ error: "Invalid weekStart date" }, { status: 400 });
    }
    const { weekStart, weekEnd, weekLabel } = getWeekBoundaries(refDate, tz);

    // Idempotency check
    const existing = await getReportByWeekLabel(org._id, weekLabel);
    if (existing) {
        if (existing.status === "ready") {
            return NextResponse.json(
                { error: "Report already exists", existing: toReportView(existing) },
                { status: 409 }
            );
        }
        if (existing.status === "generating" || existing.status === "pending") {
            return NextResponse.json(
                { error: "Report generation already in progress", reportId: existing._id.toString() },
                { status: 409 }
            );
        }
        // Failed — reset and re-queue
        const { getDb } = await import("@/lib/db");
        const db = await getDb();
        await db.collection("organization_reports").updateOne(
            { _id: existing._id },
            { $set: { status: "pending", errorMessage: null, retryCount: 0 } }
        );
        const reportId = existing._id.toString();
        processReport(reportId).catch(console.error);

        await createOrganizationAuditLog({
            organizationId: org._id,
            organizationSlug: org.slug,
            actorUserId: session.user.id,
            action: "report.generation_requested",
            entityType: "report",
            entityId: reportId,
            message: `Requested report regeneration for ${weekLabel}`,
        });

        return NextResponse.json({ reportId }, { status: 200 });
    }

    // Create new report doc
    const reportId = await createReportDoc({
        organizationId: org._id,
        organizationSlug: org.slug,
        weekStart,
        weekEnd,
        weekLabel,
        timezone: tz,
        createdBy: session.user.id,
    });

    // Fire-and-forget
    processReport(reportId).catch(console.error);

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        action: "report.generation_requested",
        entityType: "report",
        entityId: reportId,
        message: `Requested report generation for ${weekLabel}`,
    });

    return NextResponse.json({ reportId }, { status: 201 });
}
