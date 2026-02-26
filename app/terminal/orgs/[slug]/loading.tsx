import { TerminalSquare, Wrench, Users } from "lucide-react";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function OrgDetailsPage({ params }: Props) {
    const { slug } = await params;

    return (
        <div className="space-y-4">
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Dashboard
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    Organization Overview
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Core modules for {slug} are being prepared. Initial features will be available soon.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <StatusCard
                    icon={<TerminalSquare size={16} />}
                    title="Dashboard Core"
                    status="Online"
                    description="Base organization shell and routing are active."
                />
                <StatusCard
                    icon={<Users size={16} />}
                    title="Members Module"
                    status="Planned"
                    description="Member management UI is being integrated."
                />
                <StatusCard
                    icon={<Wrench size={16} />}
                    title="Admin Tools"
                    status="In Progress"
                    description="Permissions and actions are under construction."
                />
            </div>

            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.35)",
                }}
            >
                <p
                    className="text-[11px] leading-5"
                    style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                >
                    [ORG] Organization dashboard initialized
                    <br />
                    [NAV] Sidebar module loaded
                    <br />
                    [MOD] dashboard.core ........ ready
                    <br />
                    [MOD] members.ui ........... pending
                    <br />
                    [SYS] Awaiting next deployment phase<span style={{ animation: "blink-cursor 1s steps(1) infinite" }}>_</span>
                </p>
            </div>
        </div>
    );
}

function StatusCard({
                        icon,
                        title,
                        status,
                        description,
                    }: {
    icon: React.ReactNode;
    title: string;
    status: string;
    description: string;
}) {
    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(7,18,28,0.28)",
            }}
        >
            <div className="mb-2 flex items-center justify-between gap-2">
                <div
                    className="inline-flex items-center gap-2 text-sm uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    {icon}
                    {title}
                </div>
                <span
                    className="rounded border px-2 py-0.5 text-[10px] uppercase"
                    style={{
                        borderColor: "rgba(79,195,220,0.18)",
                        color: "rgba(79,195,220,0.6)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {status}
                </span>
            </div>
            <p
                className="text-xs"
                style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
            >
                {description}
            </p>
        </div>
    );
}