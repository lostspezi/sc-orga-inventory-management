import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { isProOrg } from "@/lib/billing/is-pro";
import OrgDetailsShell from "@/components/orgs/details/org-details-shell";
import {OrganizationRole} from "@/components/orgs/details/org-details-nav";

type Props = {
    children: React.ReactNode;
    params: Promise<{ slug: string }>;
};

export default async function OrgLayout({ children, params }: Props) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const { slug } = await params;
    const org = await getOrganizationBySlug(slug);

    if (!org) {
        notFound();
    }

    // Access check: only members can access
    const isMember = org.members.some((m) => m.userId === session.user!.id);
    if (!isMember) {
        notFound();
    }

    const currentMember = org.members.find((m) => m.userId === session?.user?.id);

    if (!currentMember) {
        notFound();
    }

    // Suspension check
    if (currentMember.status === "suspended") {
        redirect("/terminal?reason=suspended");
    }

    const currentRole = currentMember.role as OrganizationRole;
    const isPro = isProOrg(org);

    return (
        <OrgDetailsShell
            slug={org.slug}
            orgName={org.name}
            orgRsiUrl={org.starCitizenOrganizationUrl}
            currentRole={currentRole}
            isPro={isPro}
        >
            {children}
        </OrgDetailsShell>
    );
}