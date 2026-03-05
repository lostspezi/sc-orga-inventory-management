import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
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

    const customerId = org.subscription?.stripeCustomerId;
    if (!customerId) {
        return NextResponse.json({ error: "No billing account found" }, { status: 400 });
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

    const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${appUrl}/terminal/orgs/${slug}/settings`,
    });

    return NextResponse.json({ url: portalSession.url });
}
