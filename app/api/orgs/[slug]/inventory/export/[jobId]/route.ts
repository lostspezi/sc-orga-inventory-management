import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getExportJobById } from "@/lib/repositories/export-job-repository";

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string; jobId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug, jobId } = await params;

    const org = await getOrganizationBySlug(slug);
    if (!org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const isMember = org.members.some((m) => m.userId === session.user!.id);
    if (!isMember) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const job = await getExportJobById(jobId);
    if (!job || job.organizationId.toString() !== org._id.toString()) {
        return NextResponse.json({ error: "Export job not found" }, { status: 404 });
    }

    if (job.status !== "completed" || !job.csvContent) {
        return NextResponse.json({ error: "Export not ready yet" }, { status: 202 });
    }

    const filename = `${org.slug}-inventory-${new Date(job.createdAt).toISOString().slice(0, 10)}.csv`;

    return new NextResponse(job.csvContent, {
        status: 200,
        headers: {
            "Content-Type": "text/csv; charset=utf-8",
            "Content-Disposition": `attachment; filename="${filename}"`,
        },
    });
}
