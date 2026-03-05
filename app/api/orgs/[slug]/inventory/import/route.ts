import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { createImportJob } from "@/lib/repositories/import-job-repository";
import { processImportJob } from "@/lib/inventory-import/process-import-job";
import { ImportRowInput } from "@/lib/types/import-job";
import { isProOrg } from "@/lib/billing/is-pro";

export async function POST(
    req: NextRequest,
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

    let rows: ImportRowInput[];
    try {
        const body = await req.json();
        rows = body.rows;
        if (!Array.isArray(rows) || rows.length === 0) {
            return NextResponse.json({ error: "No rows provided" }, { status: 400 });
        }
        if (rows.length > 500) {
            return NextResponse.json(
                { error: "Maximum 500 rows per import" },
                { status: 400 }
            );
        }
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const job = await createImportJob({
        organizationId: org._id,
        organizationSlug: org.slug,
        initiatedByUserId: session.user.id,
        initiatedByUsername: session.user.name ?? "Unknown",
        rows,
    });

    // Fire and forget — do not await
    processImportJob(
        job._id,
        rows,
        org,
        session.user.id,
        session.user.name ?? "Unknown"
    ).catch((err) => {
        console.error("[import] Background job failed unexpectedly", err);
    });

    return NextResponse.json({ jobId: job._id.toString() });
}
