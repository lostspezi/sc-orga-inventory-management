import FeatureRow from "@/components/terminal/feature-row";
import BottomLine from "@/components/terminal/bottom-line";
import PanelLabel from "@/components/terminal/panel-label";
import TopLine from "@/components/terminal/top-line";

export default function BuildProgressPanel() {
    return (
        <section
            className="hud-panel corner-tr corner-bl relative p-4"
            style={{ background: "rgba(8,16,24,0.55)" }}
        >
            <TopLine />
            <PanelLabel label="BUILD.PROGRESS" />

            <div className="mb-3 flex items-center justify-between">
                <span
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                >
                    Deployment Progress
                </span>
                <span
                    className="text-[10px]"
                    style={{ color: "rgba(79,195,220,0.35)", fontFamily: "var(--font-mono)" }}
                >
                    24%
                </span>
            </div>

            <div
                className="relative h-2 overflow-hidden rounded-sm border"
                style={{
                    borderColor: "rgba(79,195,220,0.2)",
                    background: "rgba(79,195,220,0.04)",
                }}
            >
                <div
                    className="absolute inset-y-0 left-0"
                    style={{
                        width: "24%",
                        background: "linear-gradient(90deg, rgba(79,195,220,0.25), rgba(79,195,220,0.9))",
                    }}
                />
                <div
                    className="absolute inset-y-0 left-0"
                    style={{
                        width: "35%",
                        background: "linear-gradient(90deg, rgba(79,195,220,0.02), rgba(79,195,220,0.4), rgba(79,195,220,0.02))",
                        animation: "loading-sweep 1.8s ease-in-out infinite",
                    }}
                />
            </div>

            <div className="mt-4 space-y-2">
                <FeatureRow label="Organization Directory" status="done" />
                <FeatureRow label="Organization Details Layout" status="building" />
                <FeatureRow label="Members Module" status="planned" />
                <FeatureRow label="Inventory Module" status="planned" />
            </div>

            <BottomLine />
        </section>
    );
}