import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getOrganizationViewsByUserId } from "@/lib/repositories/organization-repository";
import OrgCard from "@/components/orgs/org-card";
import CreateOrgDialog from "@/components/orgs/create-org-dialog";
import Link from "next/link";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { getTranslations } from "next-intl/server";

export default async function TerminalPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const [orgs, superAdmin, t] = await Promise.all([
        getOrganizationViewsByUserId(session.user.id),
        isSuperAdmin(session.user.id),
        getTranslations("terminal"),
    ]);

    const atLimit = orgs.filter(o => o.createdByUserId === session.user.id).length >= 3;

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-7xl space-y-4"
                style={{animation: "slide-in-up 0.45s ease forwards"}}
            >
                {(superAdmin || orgs.length > 0) && (
                    <section className="flex justify-end gap-2">
                        {superAdmin && (
                            <Link
                                href="/terminal/admin"
                                className="sc-btn sc-btn-outline"
                                style={{fontSize: "0.75rem", padding: "0.3rem 0.75rem"}}
                            >
                                {t("adminPanel")}
                            </Link>
                        )}
                        {orgs.length > 0 && <CreateOrgDialog atLimit={atLimit}/>}
                    </section>
                )}
                <section
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{background: "rgba(8,16,24,0.55)"}}
                >
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)"}}
                    />

                    <p
                        className="mb-1 text-xs uppercase tracking-[0.35em]"
                        style={{color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-display)"}}
                    >
                        {t("eyebrow")}
                    </p>

                    <h1
                        className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                        style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                    >
                        {t("title")}
                    </h1>

                    <p
                        className="mt-2 text-sm"
                        style={{color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)"}}
                    >
                        {t("description")}
                    </p>

                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.22), transparent)"}}
                    />
                </section>

                {orgs.length === 0 ? (
                    <section
                        className="rounded-lg border border-dashed p-8 text-center"
                        style={{
                            borderColor: "rgba(240,165,0,0.22)",
                            background: "rgba(20,14,6,0.10)",
                        }}
                    >
                        <p
                            className="text-sm uppercase tracking-[0.12em]"
                            style={{color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-display)"}}
                        >
                            {t("noOrgs")}
                        </p>
                        <p
                            className="mt-2 mb-2 text-xs"
                            style={{color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)"}}
                        >
                            {t("noOrgsDescription")}
                        </p>
                        <CreateOrgDialog atLimit={atLimit}/>
                    </section>
                ) : (
                    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {orgs.map((org) => (
                            <OrgCard key={org._id.toString()} organization={org}/>
                        ))}
                    </section>
                )}
            </div>
        </main>
    );
}
