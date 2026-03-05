import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
    getOrgByStripeCustomerId,
    getOrgByStripeSubscriptionId,
    setOrgSubscription,
} from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature");
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
        return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 });
    }

    let event: Stripe.Event;
    try {
        event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
    } catch (err) {
        console.error("[stripe webhook] signature verification failed:", err);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    try {
        switch (event.type) {
            case "customer.subscription.created":
            case "customer.subscription.updated": {
                const sub = event.data.object as Stripe.Subscription;
                const org = await getOrgByStripeCustomerId(sub.customer as string);
                if (!org) break;

                const item = sub.items.data[0];
                const priceId = item?.price.id ?? "";
                // current_period_end moved to subscription item in API 2026-02-25.clover
                const periodEndTs = (item as unknown as { current_period_end?: number })?.current_period_end
                    ?? (sub as unknown as { current_period_end?: number }).current_period_end;
                const currentPeriodEnd = periodEndTs
                    ? new Date(periodEndTs * 1000)
                    : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000); // fallback: 31 days

                await setOrgSubscription(org._id, {
                    status: sub.status as "active" | "trialing" | "past_due" | "unpaid" | "canceled" | "incomplete",
                    stripeCustomerId: sub.customer as string,
                    stripeSubscriptionId: sub.id,
                    stripePriceId: priceId,
                    currentPeriodEnd,
                    cancelAtPeriodEnd: sub.cancel_at_period_end,
                    updatedAt: new Date(),
                });

                if (event.type === "customer.subscription.created") {
                    await createOrganizationAuditLog({
                        organizationId: org._id,
                        organizationSlug: org.slug,
                        actorUserId: "stripe",
                        actorUsername: "Stripe",
                        action: "billing.subscribed",
                        entityType: "organization",
                        entityId: org._id.toString(),
                        message: `Subscription activated (${sub.id})`,
                    });
                }
                break;
            }

            case "customer.subscription.deleted": {
                const sub = event.data.object as Stripe.Subscription;
                const org = await getOrgByStripeCustomerId(sub.customer as string);
                if (!org) break;

                const delItem = sub.items.data[0];
                const delPriceId = delItem?.price.id ?? "";
                const delPeriodEndTs = (delItem as unknown as { current_period_end?: number })?.current_period_end
                    ?? (sub as unknown as { current_period_end?: number }).current_period_end;
                const delPeriodEnd = delPeriodEndTs ? new Date(delPeriodEndTs * 1000) : new Date();

                await setOrgSubscription(org._id, {
                    status: "canceled",
                    stripeCustomerId: sub.customer as string,
                    stripeSubscriptionId: sub.id,
                    stripePriceId: delPriceId,
                    currentPeriodEnd: delPeriodEnd,
                    cancelAtPeriodEnd: sub.cancel_at_period_end,
                    updatedAt: new Date(),
                });

                await createOrganizationAuditLog({
                    organizationId: org._id,
                    organizationSlug: org.slug,
                    actorUserId: "stripe",
                    actorUsername: "Stripe",
                    action: "billing.canceled",
                    entityType: "organization",
                    entityId: org._id.toString(),
                    message: `Subscription canceled (${sub.id})`,
                });
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const subId = (invoice as Stripe.Invoice & { subscription?: string }).subscription;
                if (!subId) break;

                const org = await getOrgByStripeSubscriptionId(subId);
                if (!org) break;

                await createOrganizationAuditLog({
                    organizationId: org._id,
                    organizationSlug: org.slug,
                    actorUserId: "stripe",
                    actorUsername: "Stripe",
                    action: "billing.payment_failed",
                    entityType: "organization",
                    entityId: org._id.toString(),
                    message: `Payment failed for invoice ${invoice.id}`,
                });
                break;
            }
        }
    } catch (err) {
        console.error("[stripe webhook] handler error:", err);
        return NextResponse.json({ error: "Handler error" }, { status: 500 });
    }

    return NextResponse.json({ received: true });
}
