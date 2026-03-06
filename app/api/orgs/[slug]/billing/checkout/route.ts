import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug, setOrgStripeCustomerId } from "@/lib/repositories/organization-repository";
import { getStripe } from "@/lib/stripe";
import { getOrCreateLegalSettings } from "@/lib/repositories/legal-settings-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate consent fields from request body
    let body: { consentTerms?: unknown; consentWithdrawalWaiver?: unknown; consentTimestamp?: unknown } = {};
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    if (!body.consentTerms || !body.consentWithdrawalWaiver || !body.consentTimestamp) {
        return NextResponse.json({ error: "Consent required" }, { status: 400 });
    }

    const consentTimestamp = String(body.consentTimestamp);

    const { slug } = await params;
    const org = await getOrganizationBySlug(slug);
    if (!org) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const member = org.members.find((m) => m.userId === session.user!.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const legalSettings = await getOrCreateLegalSettings();
    const consentLegalVersion = legalSettings.currentVersion;

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    // Reuse or create Stripe customer
    let customerId = org.subscription?.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            name: org.name,
            metadata: { orgId: org._id.toString(), orgSlug: org.slug },
        });
        customerId = customer.id;
        await setOrgStripeCustomerId(org._id, customerId);
    }

    const checkoutSession = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: "subscription",
        line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
        success_url: `${appUrl}/terminal/orgs/${slug}/settings?billing=success`,
        cancel_url: `${appUrl}/terminal/orgs/${slug}/settings?billing=cancelled`,
        subscription_data: {
            metadata: {
                orgId: org._id.toString(),
                orgSlug: slug,
                consentTerms: "true",
                consentWithdrawalWaiver: "true",
                consentTimestamp,
                consentLegalVersion,
            },
        },
        metadata: {
            organizationId: org._id.toString(),
            userId: session.user.id,
            consentTerms: "true",
            consentWithdrawalWaiver: "true",
            consentTimestamp,
            consentLegalVersion,
        },
        allow_promotion_codes: true,
    });

    // Audit log
    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "billing.checkout_initiated",
        entityType: "organization",
        entityId: org._id.toString(),
        message: `Checkout initiated by ${session.user.name ?? session.user.id}`,
        metadata: {
            consentTerms: true,
            consentWithdrawalWaiver: true,
            consentTimestamp,
            legalVersion: consentLegalVersion,
            stripeSessionId: checkoutSession.id,
        },
    });

    return NextResponse.json({ url: checkoutSession.url });
}
