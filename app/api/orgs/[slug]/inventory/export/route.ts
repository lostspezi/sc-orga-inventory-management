import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { createExportJob } from "@/lib/repositories/export-job-repository";
import { processExportJob } from "@/lib/inventory-export/process-export-job";
import { isProOrg } from "@/lib/billing/is-pro";

export async function POST(
    _req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;

    const org = await getOrganizationBySlug(slug);
    if (!org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
    }

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin"].includes(actor.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!isProOrg(org)) {
        return NextResponse.json({ error: "PRO_REQUIRED" }, { status: 402 });
    }

    const job = await createExportJob({
        organizationId: org._id,
        organizationSlug: org.slug,
        initiatedByUserId: session.user.id,
        initiatedByUsername: session.user.name ?? "Unknown",
    });

    // Fire and forget
    processExportJob(job._id, org, session.user.id).catch((err) => {
        console.error("[export] Background job failed unexpectedly", err);
    });

    return NextResponse.json({ jobId: job._id.toString() });
}
