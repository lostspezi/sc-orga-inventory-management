import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug, setOrgStripeCustomerId } from "@/lib/repositories/organization-repository";
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
            metadata: { orgId: org._id.toString(), orgSlug: slug },
        },
        allow_promotion_codes: true,
    });

    return NextResponse.json({ url: checkoutSession.url });
}
