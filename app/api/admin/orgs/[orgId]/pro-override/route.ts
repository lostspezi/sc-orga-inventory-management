import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import {
    getOrganizationById,
    setOrgProOverride,
} from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { ObjectId } from "mongodb";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orgId: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!(await isSuperAdmin(session.user.id))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { orgId } = await params;
    if (!ObjectId.isValid(orgId)) {
        return NextResponse.json({ error: "Invalid org ID" }, { status: 400 });
    }

    const org = await getOrganizationById(orgId);
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json() as { enabled: boolean; reason?: string };
    const actorName = session.user.name ?? session.user.id;

    await setOrgProOverride(org._id, {
        enabled: body.enabled,
        enabledByUserId: session.user.id,
        enabledByUsername: actorName,
        reason: body.reason,
        enabledAt: new Date(),
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: actorName,
        action: body.enabled ? "billing.pro_override_enabled" : "billing.pro_override_disabled",
        entityType: "organization",
        entityId: org._id.toString(),
        message: body.enabled
            ? `PRO override enabled${body.reason ? `: ${body.reason}` : ""}`
            : "PRO override disabled",
    });

    return NextResponse.json({ success: true });
}
