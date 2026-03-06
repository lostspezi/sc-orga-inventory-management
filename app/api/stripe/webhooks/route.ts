import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import {
    getOrgByStripeCustomerId,
    getOrgByStripeSubscriptionId,
    setOrgSubscription,
} from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { getUserById } from "@/lib/repositories/user-repository";
import { sendEmail, type EmailAttachment } from "@/lib/email/send-email";
import { renderProWelcomeEmail } from "@/lib/email/templates/pro-welcome";
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

            case "invoice.payment_succeeded": {
                const invoice = event.data.object as Stripe.Invoice;

                // In API 2026-02-25.clover, subscription moved to invoice.parent.subscription_details.subscription
                const subRef = invoice.parent?.subscription_details?.subscription;
                const invoiceSubId = typeof subRef === "string" ? subRef : subRef?.id;
                if (!invoiceSubId) break;

                // Only send welcome email on the first invoice (new subscription)
                if (invoice.billing_reason !== "subscription_create") break;

                const invoiceOrg = await getOrgByStripeSubscriptionId(invoiceSubId);
                if (!invoiceOrg) break;

                // Find org owner to send email to
                const ownerMember = invoiceOrg.members.find((m) => m.role === "owner");
                if (!ownerMember) break;

                const ownerUser = await getUserById(ownerMember.userId);
                if (!ownerUser?.email) break;

                const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://sc-orga.app";
                const billingSettingsUrl = `${appUrl}/terminal/orgs/${invoiceOrg.slug}/settings?tab=pro`;

                const periodEndTs = invoice.period_end ?? null;

                // Fetch Stripe-generated PDF invoice as attachment
                const attachments: EmailAttachment[] = [];
                if (invoice.invoice_pdf) {
                    try {
                        const pdfRes = await fetch(invoice.invoice_pdf);
                        if (pdfRes.ok) {
                            const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
                            const filename = invoice.number
                                ? `Invoice-${invoice.number}.pdf`
                                : "Invoice.pdf";
                            attachments.push({ filename, content: pdfBuffer, contentType: "application/pdf" });
                        }
                    } catch (pdfErr) {
                        console.error("[stripe webhook] failed to fetch invoice PDF:", pdfErr);
                    }
                }

                const { html, text } = renderProWelcomeEmail({
                    orgName: invoiceOrg.name,
                    ownerName: ownerUser.name ?? ownerUser.email,
                    invoiceNumber: invoice.number ?? undefined,
                    invoiceDate: invoice.created
                        ? new Date(invoice.created * 1000).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                          })
                        : undefined,
                    amount: invoice.amount_paid != null ? String(invoice.amount_paid) : undefined,
                    currency: invoice.currency ?? undefined,
                    invoiceUrl: invoice.hosted_invoice_url ?? undefined,
                    periodEnd: periodEndTs
                        ? new Date(periodEndTs * 1000).toLocaleDateString("en-US", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                          })
                        : undefined,
                    appUrl,
                    billingSettingsUrl,
                });

                try {
                    await sendEmail({
                        to: ownerUser.email,
                        subject: `Welcome to SC Orga Manager PRO – ${invoiceOrg.name}`,
                        html,
                        text,
                        attachments,
                    });
                } catch (emailErr) {
                    // Email errors must not fail the webhook response
                    console.error("[stripe webhook] failed to send PRO welcome email:", emailErr);
                }
                break;
            }

            case "invoice.payment_failed": {
                const invoice = event.data.object as Stripe.Invoice;
                const failedSubRef = invoice.parent?.subscription_details?.subscription;
                const subId = typeof failedSubRef === "string" ? failedSubRef : failedSubRef?.id;
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
