import BottomLine from "@/components/terminal/bottom-line";
import PanelLabel from "@/components/terminal/panel-label";
import TopLine from "@/components/terminal/top-line";

export default function SessionPanel({ userName, userEmail }: { userName: string; userEmail?: string }) {
    return (
        <section
            className="hud-panel corner-tr corner-bl relative p-4"
            style={{ background: "rgba(8,16,24,0.55)" }}
        >
            <TopLine />
            <PanelLabel label="SESSION.USER" />

            <div className="mb-3 flex items-center gap-2">
                <span
                    style={{
                        width: 8,
                        height: 8,
                        borderRadius: "9999px",
                        background: "var(--accent-primary)",
                        boxShadow: "0 0 10px rgba(79,195,220,0.45)",
                        animation: "pulse-soft 1.6s ease-in-out infinite",
                    }}
                />
                <p
                    className="text-[10px] uppercase tracking-[0.2em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Clearance Active
                </p>
            </div>

            <div className="space-y-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                <div className="flex items-center justify-between gap-2">
                    <span style={{ color: "rgba(200,220,232,0.35)" }}>User</span>
                    <span className="text-right" style={{ color: "rgba(200,220,232,0.65)" }}>
                        {userName}
                    </span>
                </div>
                {userEmail && (
                    <div className="flex items-center justify-between gap-2">
                        <span style={{ color: "rgba(200,220,232,0.35)" }}>Email</span>
                        <span className="truncate text-right" style={{ color: "rgba(200,220,232,0.55)" }} title={userEmail}>
                            {userEmail}
                        </span>
                    </div>
                )}
                <div className="flex items-center justify-between gap-2">
                    <span style={{ color: "rgba(200,220,232,0.35)" }}>Session</span>
                    <span style={{ color: "rgba(79,195,220,0.65)" }}>ONLINE</span>
                </div>
            </div>

            <BottomLine />
        </section>
    );
}