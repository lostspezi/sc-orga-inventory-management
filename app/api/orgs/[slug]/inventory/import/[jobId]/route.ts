import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getImportJobById, toImportJobView } from "@/lib/repositories/import-job-repository";

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

    const member = org.members.find((m) => m.userId === session.user!.id);
    if (!member) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const job = await getImportJobById(jobId);
    if (!job || job.organizationSlug !== slug) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(toImportJobView(job));
}
