import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TerminalHeader from "@/components/terminal/terminal-header";
import TerminalBackground from "@/components/terminal/terminal-background";
import LegalAcceptGate from "@/components/consent/legal-accept-gate";
import LegalFooter from "@/components/ui/legal-footer";
import { getOrCreateLegalSettings } from "@/lib/repositories/legal-settings-repository";
import { getUserLegalAcceptedVersion } from "@/lib/repositories/user-repository";

export const metadata = {
    robots: { index: false, follow: false },
};

type Props = {
    children: React.ReactNode;
};

export default async function TerminalLayout({ children }: Props) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const [legalSettings, acceptedVersion] = await Promise.all([
        getOrCreateLegalSettings(),
        getUserLegalAcceptedVersion(session.user.id),
    ]);

    const needsLegalAccept = acceptedVersion !== legalSettings.currentVersion;

    return (
        <div className="relative min-h-screen overflow-hidden" style={{ background: "var(--background)" }}>
            <TerminalBackground />

            <div className="relative z-10 min-h-screen">
                <TerminalHeader
                    rsiHandle={session.user.rsiHandle ?? null}
                    discordName={session.user.name ?? "Authorized User"}
                    userImage={session.user.image ?? null}
                />

                <div className="px-4 py-4 sm:px-6">
                    {children}
                </div>

                <LegalFooter from="terminal" />
            </div>

            {needsLegalAccept && (
                <LegalAcceptGate
                    currentVersion={legalSettings.currentVersion}
                    changeNote={legalSettings.changeNote}
                />
            )}
        </div>
    );
}