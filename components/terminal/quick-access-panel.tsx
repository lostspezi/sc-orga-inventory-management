import {Boxes, Building2, ScrollText, Users} from "lucide-react";
import TopLine from "@/components/terminal/top-line";
import PanelLabel from "@/components/terminal/panel-label";
import Link from "next/link";
import BottomLine from "@/components/terminal/bottom-line";
import QuickAccessCardContent from "@/components/terminal/quick-access-card-content";

export default function QuickAccessPanel() {
    const items = [
        {
            title: "Organizations",
            description: "Manage orgs, members, and access.",
            href: "/terminal/orgs",
            icon: <Building2 size={16}/>,
            status: "ONLINE",
            active: true,
        },
        {
            title: "Inventory",
            description: "Items, stock, and movement logs.",
            icon: <Boxes size={16}/>,
            status: "SOON",
            active: false,
        },
        {
            title: "Members",
            description: "Cross-org personnel overview.",
            icon: <Users size={16}/>,
            status: "SOON",
            active: false,
        },
        {
            title: "Audit Log",
            description: "Security and activity events.",
            icon: <ScrollText size={16}/>,
            status: "SOON",
            active: false,
        },
    ] as const;

    return (
        <section
            className="hud-panel corner-tr corner-bl relative p-4 sm:p-5"
            style={{background: "rgba(8,16,24,0.55)"}}
        >
            <TopLine/>
            <PanelLabel label="MODULE.ACCESS"/>

            <div className="mb-3">
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)"}}
                >
                    Quick Access
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{color: "var(--accent-primary)", fontFamily: "var(--font-display)"}}
                >
                    Module Launch
                </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
                {items.map((item) =>
                    item.active ? (
                        <Link
                            key={item.title}
                            href={item.href!}
                            className="rounded-lg border p-4 transition hover:-translate-y-px"
                            style={{
                                borderColor: "rgba(79,195,220,0.18)",
                                background: "rgba(7,18,28,0.28)",
                            }}
                        >
                            <QuickAccessCardContent {...item} />
                        </Link>
                    ) : (
                        <div
                            key={item.title}
                            className="rounded-lg border p-4 opacity-85"
                            style={{
                                borderColor: "rgba(79,195,220,0.1)",
                                background: "rgba(7,18,28,0.18)",
                            }}
                        >
                            <QuickAccessCardContent {...item} />
                        </div>
                    )
                )}
            </div>

            <BottomLine/>
        </section>
    );
}