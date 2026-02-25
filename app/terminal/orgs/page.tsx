import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {getOrganizationViewsByUserId} from "@/lib/repositories/organization-repository";
import OrgsPageHeader from "@/components/orgs/orgs-page-header";
import OrgsList from "@/components/orgs/orgs-list";
import {OrganizationView} from "@/lib/types/organization";

export default async function TerminalOrgsPage() {
    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const userId = session.user.id;
    if (!userId) {
        redirect("/login");
    }

    const userOrganizations: OrganizationView[] = await getOrganizationViewsByUserId(userId);

    return (
        <main className="min-h-screen px-4 py-8 sm:px-6">
            <div className="mx-auto w-full max-w-6xl space-y-6" style={{animation: "slide-in-up 0.55s ease forwards"}}>
                <OrgsPageHeader/>
                <OrgsList organizations={userOrganizations}/>
            </div>
        </main>
    );
}