"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

type Tab = "members" | "ranks" | "invitations";

type Props = {
    canManageRanks: boolean;
};

export default function MembersTabNav({ canManageRanks }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const activeTab = (searchParams.get("tab") as Tab) ?? "members";
    const t = useTranslations("members");

    const tabs: { key: Tab; label: string; show: boolean }[] = [
        { key: "members", label: t("tabMembers"), show: true },
        { key: "ranks", label: t("tabRanks"), show: canManageRanks },
        { key: "invitations", label: t("tabInvitations"), show: true },
    ];

    const handleTab = (tab: Tab) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div
            className="flex gap-1 rounded-md border p-1"
            style={{ borderColor: "rgba(79,195,220,0.14)", background: "rgba(7,18,28,0.35)" }}
        >
            {tabs
                .filter((t) => t.show)
                .map((tab) => {
                    const isActive = activeTab === tab.key;
                    return (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => handleTab(tab.key)}
                            className="rounded px-3 py-1.5 text-[11px] uppercase tracking-[0.12em] transition"
                            style={{
                                fontFamily: "var(--font-mono)",
                                color: isActive ? "rgba(6,12,18,0.95)" : "rgba(200,220,232,0.55)",
                                background: isActive ? "var(--accent-primary)" : "transparent",
                                cursor: "pointer",
                            }}
                        >
                            {tab.label}
                        </button>
                    );
                })}
        </div>
    );
}
