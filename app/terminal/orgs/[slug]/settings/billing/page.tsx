import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import { getStripe } from "@/lib/stripe";
import BillingManagePage from "@/components/orgs/details/settings/billing-manage-page";
import type Stripe from "stripe";

export const metadata = { title: "Billing" };

type Props = {
    params: Promise<{ slug: string }>;
};

export type InvoiceRow = {
    id: string;
    date: string;        // ISO
    description: string;
    amount: number;      // in cents
    currency: string;
    status: string;
    pdfUrl: string | null;
    hostedUrl: string | null;
};

export default async function OrgBillingPage({ params }: Props) {
    const { slug } = await params;

    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const org = await getOrganizationBySlug(slug);
    if (!org) notFound();

    const member = org.members.find((m) => m.userId === session.user!.id);
    if (!member || !["owner", "admin"].includes(member.role)) {
        redirect(`/terminal/orgs/${slug}/settings`);
    }

    const [t, isPro, sub] = [
        await getTranslations("billing"),
        isProOrg(org),
        org.subscription,
    ] as const;
    const customerId = sub?.stripeCustomerId;

    let invoices: InvoiceRow[] = [];
    let stripeStatus: string | null = null;
    let cancelAtPeriodEnd = false;
    let currentPeriodEnd: string | null = null;
    let fetchError: string | null = null;

    if (customerId) {
        try {
            const stripe = getStripe();

            const [invoiceList, stripeSub] = await Promise.all([
                stripe.invoices.list({ customer: customerId, limit: 24 }),
                sub?.stripeSubscriptionId
                    ? stripe.subscriptions.retrieve(sub.stripeSubscriptionId)
                    : Promise.resolve(null),
            ]);

            invoices = invoiceList.data.map((inv: Stripe.Invoice) => ({
                id: inv.id ?? "",
                date: new Date((inv.created ?? 0) * 1000).toISOString(),
                description: inv.lines?.data[0]?.description ?? inv.number ?? "Invoice",
                amount: inv.amount_due ?? 0,
                currency: inv.currency ?? "eur",
                status: inv.status ?? "unknown",
                pdfUrl: inv.invoice_pdf ?? null,
                hostedUrl: inv.hosted_invoice_url ?? null,
            }));

            if (stripeSub) {
                stripeStatus = stripeSub.status;
                cancelAtPeriodEnd = stripeSub.cancel_at_period_end;
                const item = stripeSub.items.data[0];
                const periodEndTs = (item as unknown as { current_period_end?: number })?.current_period_end
                    ?? (stripeSub as unknown as { current_period_end?: number }).current_period_end;
                if (periodEndTs) currentPeriodEnd = new Date(periodEndTs * 1000).toISOString();
            }
        } catch (err) {
            console.error("[billing page] Stripe fetch error:", err);
            fetchError = t("fetchError");
        }
    }

    return (
        <BillingManagePage
            organizationSlug={slug}
            organizationName={org.name}
            isPro={isPro}
            customerId={customerId ?? null}
            subscriptionId={sub?.stripeSubscriptionId ?? null}
            stripeStatus={stripeStatus ?? sub?.status ?? null}
            cancelAtPeriodEnd={cancelAtPeriodEnd || (sub?.cancelAtPeriodEnd ?? false)}
            currentPeriodEnd={currentPeriodEnd ?? sub?.currentPeriodEnd?.toISOString() ?? null}
            invoices={invoices}
            fetchError={fetchError}
            labels={{
                backToSettings: t("backToSettings"),
                eyebrow: t("eyebrow"),
                subscriptionTitle: t("subscriptionTitle"),
                planLabel: t("planLabel"),
                cancelsAtPeriodEnd: t("cancelsAtPeriodEnd"),
                proPlan: t("proPlan"),
                freePlan: t("freePlan"),
                accessUntil: t("accessUntil"),
                renews: t("renews"),
                cancelPlanBtn: t("cancelPlanBtn"),
                stripePortalBtn: t("stripePortalBtn"),
                opening: t("opening"),
                portalError: t("portalError"),
                cancelError: t("cancelError"),
                invoicesTitle: t("invoicesTitle"),
                noInvoices: t("noInvoices"),
                colDate: t("colDate"),
                colDescription: t("colDescription"),
                colAmount: t("colAmount"),
                colStatus: t("colStatus"),
                downloadPdf: t("downloadPdf"),
                viewInvoice: t("viewInvoice"),
                subscriptionIdLabel: t("subscriptionIdLabel"),
                cancelDialogTitle: t("cancelDialogTitle"),
                cancelDialogDesc: t("cancelDialogDesc"),
                keepPlanBtn: t("keepPlanBtn"),
                yesCancelBtn: t("yesCancelBtn"),
                cancelling: t("cancelling"),
            }}
        />
    );
}
