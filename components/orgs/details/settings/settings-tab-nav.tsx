"use client";

import Link from "next/link";

type Tab = "general" | "discord" | "pro";

type Props = {
    slug: string;
    activeTab: Tab;
    labels: { general: string; discord: string; pro: string };
};

export default function SettingsTabNav({ slug, activeTab, labels }: Props) {
    const base = `/terminal/orgs/${slug}/settings`;
    const tabs = [
        { key: "general" as Tab, label: labels.general, href: `${base}?tab=general` },
        { key: "discord" as Tab, label: labels.discord, href: `${base}?tab=discord` },
        { key: "pro" as Tab, label: labels.pro, href: `${base}?tab=pro` },
    ];
    return (
        <div className="flex gap-0 border-b" style={{ borderColor: "rgba(79,195,220,0.14)" }}>
            {tabs.map(({ key, label, href }) => {
                const isActive = activeTab === key;
                return (
                    <Link
                        key={key}
                        href={href}
                        className="px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors"
                        style={{
                            fontFamily: "var(--font-mono)",
                            color: isActive ? "var(--accent-primary)" : "rgba(200,220,232,0.45)",
                            borderBottom: isActive ? "2px solid var(--accent-primary)" : "2px solid transparent",
                            marginBottom: "-1px",
                        }}
                    >
                        {label}
                    </Link>
                );
            })}
        </div>
    );
}
