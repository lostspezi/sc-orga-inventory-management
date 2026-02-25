import Link from "next/link";
import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {signOutAction} from "@/lib/actions";
import {getOrganizationViewsByUserId} from "@/lib/repositories/organization-repository";
import TerminalFeedPanel from "@/components/terminal/terminal-feed-panel";
import RecentOrganizationsPanel from "@/components/terminal/recent-organizations-panel";
import SessionPanel from "@/components/terminal/session-panel";
import BuildProgressPanel from "@/components/terminal/build-progress-panel";
import QuickAccessPanel from "@/components/terminal/quick-access-panel";
import SystemStatusPanel from "@/components/terminal/system-status-panel";

export default async function TerminalPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const orgs = await getOrganizationViewsByUserId(session.user.id);
    const recentOrgs = orgs.slice(0, 3);

    return (
        <main className="min-h-screen px-4 py-6 sm:px-6">
            <div className="mx-auto w-full max-w-7xl space-y-4" style={{animation: "slide-in-up 0.6s ease forwards"}}>
                {/* Header */}
                <header
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{animation: "slide-in-up 0.45s ease forwards"}}
                >
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)"}}
                    />
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p
                                className="mb-1 text-xs uppercase tracking-[0.35em]"
                                style={{color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-display)"}}
                            >
                                United Empire of Earth
                            </p>
                            <h1
                                className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                                style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                            >
                                Inventory Terminal
                            </h1>
                            <p
                                className="mt-1 text-sm"
                                style={{color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)"}}
                            >
                                Operations hub, system status, and module access.
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <Link href="/" className="sc-btn sc-btn-outline">
                                Home
                            </Link>
                            <form action={signOutAction}>
                                <button type="submit" className="sc-btn">
                                    Logout
                                </button>
                            </form>
                        </div>
                    </div>
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.25), transparent)"}}
                    />
                </header>

                {/* Main Grid */}
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <QuickAccessPanel/>
                        <RecentOrganizationsPanel organizations={recentOrgs} totalCount={orgs.length}/>
                        <TerminalFeedPanel/>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <SessionPanel
                            userName={session.user.name ?? "Authorized User"}
                            userEmail={session.user.email ?? undefined}
                        />
                        <SystemStatusPanel orgCount={orgs.length}/>
                        <BuildProgressPanel/>
                    </div>
                </div>
            </div>
        </main>
    );
}
