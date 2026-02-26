import Link from "next/link";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { addMemberToOrganizationInDb, getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    expireOrganizationInvite,
    getOrganizationInviteByRawToken,
    markOrganizationInviteAccepted,
} from "@/lib/repositories/organization-invite-repository";
import { getDiscordAccountByUserId } from "@/lib/repositories/auth-account-repository";
import { ArrowLeft, LogIn, ShieldAlert, Clock3, Link2Off, CheckCircle2 } from "lucide-react";
import React from "react";
import InviteSuccessRedirect from "@/components/invite/invite-success-redirect";

type Props = {
    params: Promise<{ token: string }>;
};

function isExpired(expiresAt: Date) {
    return expiresAt.getTime() <= Date.now();
}

function createJoinDate() {
    return new Date();
}

export default async function InviteAcceptPage({ params }: Props) {
    const { token } = await params;

    const invite = await getOrganizationInviteByRawToken(token);

    if (!invite) {
        notFound();
    }

    if (invite.status !== "pending") {
        return (
            <InviteStateShell
                eyebrow="INVITE.STATUS"
                title="Invite No Longer Available"
                description="This invite has already been used or is no longer active."
                tone="amber"
                icon={<Link2Off size={18} />}
                actions={
                    <>
                        <Link href="/terminal" className="sc-btn">
                            Open Terminal
                        </Link>
                        <Link href="/" className="sc-btn sc-btn-outline">
                            Back Home
                        </Link>
                    </>
                }
            />
        );
    }

    if (isExpired(invite.expiresAt)) {
        await expireOrganizationInvite(invite._id);

        return (
            <InviteStateShell
                eyebrow="INVITE.EXPIRED"
                title="Invite Expired"
                description="This invite has expired and can no longer be used."
                tone="amber"
                icon={<Clock3 size={18} />}
                actions={
                    <>
                        <Link href="/terminal" className="sc-btn">
                            Open Terminal
                        </Link>
                        <Link href="/" className="sc-btn sc-btn-outline">
                            Back Home
                        </Link>
                    </>
                }
            />
        );
    }

    const session = await auth();

    if (!session?.user?.id) {
        return (
            <InviteStateShell
                eyebrow="INVITE.AUTH"
                title="Authentication Required"
                description="You need to sign in with the invited Discord account before this invite can be accepted."
                tone="cyan"
                icon={<LogIn size={18} />}
                actions={
                    <>
                        <Link
                            href={`/login?callbackUrl=${encodeURIComponent(`/invite/${token}`)}`}
                            className="sc-btn"
                        >
                            Sign In
                        </Link>
                        <Link href="/" className="sc-btn sc-btn-outline">
                            Back Home
                        </Link>
                    </>
                }
            />
        );
    }

    if (invite.discordUserId) {
        const discordAccount = await getDiscordAccountByUserId(session.user.id);

        if (!discordAccount || discordAccount.providerAccountId !== invite.discordUserId) {
            return (
                <InviteStateShell
                    eyebrow="INVITE.MISMATCH"
                    title="Invite Mismatch"
                    description="This invite was sent to a different Discord account. Please sign in with the correct account."
                    tone="amber"
                    icon={<ShieldAlert size={18} />}
                    actions={
                        <>
                            <Link href="/login" className="sc-btn">
                                Switch Account
                            </Link>
                            <Link href="/terminal" className="sc-btn sc-btn-outline">
                                Open Terminal
                            </Link>
                        </>
                    }
                />
            );
        }
    }

    const org = await getOrganizationBySlug(invite.organizationSlug);

    if (!org) {
        notFound();
    }

    const alreadyMember = org.members.some((m) => m.userId === session?.user?.id);

    if (!alreadyMember) {
        await addMemberToOrganizationInDb(org._id.toString(), {
            userId: session.user.id,
            role: invite.targetRole,
            joinedAt: createJoinDate(),
        });
    }

    await markOrganizationInviteAccepted(invite._id);

    const targetUrl = `/terminal/orgs/${org.slug}`;

    return (
        <>
            <InviteSuccessRedirect to={targetUrl} delayMs={5000} />
            <InviteStateShell
                eyebrow="INVITE.ACCEPTED"
                title={alreadyMember ? "Already a Member" : "Invite Accepted"}
                description={
                    alreadyMember
                        ? `Your account is already linked to ${org.name}. Redirecting you to the org area.`
                        : `You have successfully joined ${org.name} as ${invite.targetRole}. Redirecting you to the org area.`
                }
                tone="cyan"
                icon={<CheckCircle2 size={18} />}
                actions={
                    <>
                        <Link href={targetUrl} className="sc-btn">
                            Open Org Now
                        </Link>
                        <Link href={`/terminal/orgs/${org.slug}`} className="sc-btn sc-btn-outline">
                            Open Organization
                        </Link>
                    </>
                }
                statusLines={
                    <>
                        [INVITE] Validation complete
                        <br />
                        [MEMBER] Access granted
                        <br />
                        [ROUTE] Redirecting in 5 seconds<span style={{ animation: "blink-cursor 1s steps(1) infinite" }}>_</span>
                    </>
                }
            />
        </>
    );
}

function InviteStateShell({
                              eyebrow,
                              title,
                              description,
                              actions,
                              tone = "cyan",
                              icon,
                              statusLines,
                          }: Readonly<{
    eyebrow: string;
    title: string;
    description: string;
    actions: React.ReactNode;
    tone?: "cyan" | "amber";
    icon?: React.ReactNode;
    statusLines?: React.ReactNode;
}>) {
    const isAmber = tone === "amber";

    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
            <div className="w-full max-w-2xl" style={{ animation: "slide-in-up 0.55s ease forwards" }}>
                <div className="mb-6 text-center" style={{ animation: "slide-in-up 0.4s ease forwards" }}>
                    <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center">
                        <div
                            className="absolute inset-0 rounded-full border"
                            style={{
                                borderColor: isAmber ? "rgba(240,165,0,0.22)" : "rgba(79,195,220,0.22)",
                                animation: "rotate-slow 16s linear infinite",
                            }}
                        />
                        <div
                            className="absolute inset-2 rounded-full border"
                            style={{
                                borderColor: isAmber ? "rgba(240,165,0,0.14)" : "rgba(79,195,220,0.14)",
                                animation: "rotate-slow 10s linear infinite reverse",
                            }}
                        />
                        <div
                            className="relative flex h-9 w-9 items-center justify-center rotate-45 border-2"
                            style={{
                                borderColor: isAmber ? "rgba(240,165,0,0.9)" : "var(--accent-primary)",
                            }}
                        >
                            <div
                                className="-rotate-45"
                                style={{
                                    color: isAmber ? "rgba(240,165,0,0.85)" : "var(--accent-primary)",
                                }}
                            >
                                {icon}
                            </div>
                        </div>
                    </div>

                    <p
                        className="mb-1 text-xs uppercase tracking-[0.35em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-display)" }}
                    >
                        United Empire of Earth
                    </p>

                    <h1
                        className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                        style={{
                            color: isAmber ? "rgba(240,165,0,0.9)" : "var(--accent-primary)",
                            fontFamily: "var(--font-display)",
                        }}
                    >
                        Organization Invite
                    </h1>

                    <p
                        className="mt-1 text-xs uppercase tracking-[0.2em]"
                        style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                    >
                        Secure Acceptance Portal
                    </p>
                </div>

                <div
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.55)" }}
                >
                    <TopLine color={isAmber ? "rgba(240,165,0,0.45)" : "rgba(79,195,220,0.35)"} />

                    <div
                        className="absolute -top-5 left-4 px-3 text-[10px] uppercase tracking-[0.3em]"
                        style={{
                            color: isAmber ? "rgba(240,165,0,0.9)" : "var(--accent-primary)",
                            fontFamily: "var(--font-mono)",
                            background: "var(--background)",
                        }}
                    >
                        {eyebrow}
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h2
                                className="text-lg font-semibold uppercase tracking-[0.08em]"
                                style={{
                                    color: isAmber ? "rgba(240,165,0,0.9)" : "var(--accent-primary)",
                                    fontFamily: "var(--font-display)",
                                }}
                            >
                                {title}
                            </h2>

                            <p
                                className="mt-2 text-sm leading-6"
                                style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                            >
                                {description}
                            </p>
                        </div>

                        <div
                            className="rounded-lg border p-4"
                            style={{
                                borderColor: isAmber ? "rgba(240,165,0,0.14)" : "rgba(79,195,220,0.14)",
                                background: isAmber ? "rgba(20,14,6,0.12)" : "rgba(7,18,28,0.28)",
                            }}
                        >
                            <p
                                className="text-[11px] leading-5"
                                style={{ color: "rgba(200,220,232,0.38)", fontFamily: "var(--font-mono)" }}
                            >
                                {statusLines ?? (
                                    <>
                                        [INVITE] Route validation complete
                                        <br />
                                        [AUTH] Session state checked
                                        <br />
                                        [STATUS] Awaiting next user action<span style={{ animation: "blink-cursor 1s steps(1) infinite" }}>_</span>
                                    </>
                                )}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            {actions}
                        </div>

                        <div className="pt-2">
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em]"
                                style={{ color: "rgba(200,220,232,0.38)", fontFamily: "var(--font-mono)" }}
                            >
                                <ArrowLeft size={14} />
                                Return to public entry
                            </Link>
                        </div>
                    </div>

                    <BottomLine color={isAmber ? "rgba(240,165,0,0.22)" : "rgba(79,195,220,0.2)"} />
                </div>
            </div>
        </main>
    );
}

function TopLine({ color }: Readonly<{ color: string }>) {
    return (
        <div
            className="absolute -top-px left-8 right-8 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
    );
}

function BottomLine({ color }: Readonly<{ color: string }>) {
    return (
        <div
            className="absolute -bottom-px left-8 right-8 h-px"
            style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
        />
    );
}