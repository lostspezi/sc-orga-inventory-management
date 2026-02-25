import TopLine from "@/components/terminal/top-line";
import PanelLabel from "@/components/terminal/panel-label";
import StatusRow from "@/components/terminal/status-row";
import {Activity, Building2, Cpu, ShieldCheck} from "lucide-react";
import BottomLine from "@/components/terminal/bottom-line";

export default function SystemStatusPanel({ orgCount }: { orgCount: number }) {
    return (
        <section
            className="hud-panel corner-tr corner-bl relative p-4"
            style={{ background: "rgba(8,16,24,0.55)" }}
        >
            <TopLine />
            <PanelLabel label="SYS.STATUS" />

            <div className="space-y-3">
                <StatusRow icon={<ShieldCheck size={14} />} label="Auth Gateway" value="OK" tone="cyan" />
                <StatusRow icon={<Cpu size={14} />} label="Terminal Shell" value="OK" tone="cyan" />
                <StatusRow icon={<Activity size={14} />} label="Modules" value="PARTIAL" tone="amber" />
                <StatusRow icon={<Building2 size={14} />} label="Organizations" value={String(orgCount)} tone="cyan" />
            </div>

            <BottomLine />
        </section>
    );
}