import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import { getReportById } from "@/lib/repositories/report-repository";
import { openReportDownloadStream } from "@/lib/reporting/storage";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type RouteCtx = { params: Promise<{ slug: string; reportId: string }> };

/** GET /api/orgs/[slug]/reports/[reportId]/download — stream the PDF */
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
    if (
        !report ||
        report.organizationId.toString() !== org._id.toString() ||
        report.status !== "ready" ||
        !report.fileId
    ) {
        return NextResponse.json({ error: "Report not ready or not found" }, { status: 404 });
    }

    // Stream from GridFS
    const downloadStream = await openReportDownloadStream(report.fileId);

    // Collect chunks into a buffer (Node.js stream → Web ReadableStream)
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
        downloadStream.on("data", (chunk: Buffer) => chunks.push(chunk));
        downloadStream.on("end", resolve);
        downloadStream.on("error", reject);
    });

    const pdfBuffer = Buffer.concat(chunks);
    const filename = `SCOIM-Report-${report.weekLabel}-v${report.version}.pdf`;

    // Audit log (fire-and-forget)
    createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        action: "report.downloaded",
        entityType: "report",
        entityId: reportId,
        message: `Downloaded report for ${report.weekLabel}`,
    }).catch(console.error);

    return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${filename}"`,
            "Content-Length": String(pdfBuffer.length),
            "Cache-Control": "private, max-age=900",
        },
    });
}
