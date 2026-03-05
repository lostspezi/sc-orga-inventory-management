import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug, setOrgSubscription } from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { getStripe } from "@/lib/stripe";

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
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const member = org.members.find((m) => m.userId === session.user!.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const subId = org.subscription?.stripeSubscriptionId;
    if (!subId) {
        return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    const stripe = getStripe();

    // Cancel at period end — user keeps access until the billing period is over
    const updated = await stripe.subscriptions.update(subId, {
        cancel_at_period_end: true,
    });

    const item = updated.items.data[0];
    const periodEndTs = (item as unknown as { current_period_end?: number })?.current_period_end
        ?? (updated as unknown as { current_period_end?: number }).current_period_end;

    await setOrgSubscription(org._id, {
        cancelAtPeriodEnd: true,
        updatedAt: new Date(),
        ...(periodEndTs ? { currentPeriodEnd: new Date(periodEndTs * 1000) } : {}),
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "billing.canceled",
        entityType: "organization",
        entityId: org._id.toString(),
        message: `Subscription set to cancel at period end (${subId})`,
    });

    return NextResponse.json({ success: true });
}
