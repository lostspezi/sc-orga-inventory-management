import { auth } from "@/auth";
import { redirect } from "next/navigation";
import TerminalHeader from "@/components/terminal/terminal-header";
import TerminalBackground from "@/components/terminal/terminal-background";

type Props = {
    children: React.ReactNode;
};

export default async function TerminalLayout({ children }: Props) {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

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
            </div>
        </div>
    );
}