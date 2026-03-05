import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import { getReportById, toReportView } from "@/lib/repositories/report-repository";

type RouteCtx = { params: Promise<{ slug: string; reportId: string }> };

/** GET /api/orgs/[slug]/reports/[reportId] — metadata + kpiSnapshot */
export async function GET(_req: NextRequest, { params }: RouteCtx) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, reportId } = await params;
    const org = await getOrganizationBySlug(slug);
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const isMember = org.members.some((m) => m.userId === session.user!.id);
    if (!isMember) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!isProOrg(org)) {
        return NextResponse.json({ error: "PRO subscription required" }, { status: 403 });
    }

    const report = await getReportById(reportId);
    if (!report || report.organizationId.toString() !== org._id.toString()) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(toReportView(report));
}
