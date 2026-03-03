"use client";

import Link from "next/link";

type Props = {
    slug: string;
    activeTab: "items" | "auec";
    tabItemsLabel: string;
    tabAuecLabel: string;
};

export default function InventoryTabNav({ slug, activeTab, tabItemsLabel, tabAuecLabel }: Props) {
    return (
        <div
            className="flex gap-0 border-b"
            style={{ borderColor: "rgba(79,195,220,0.14)" }}
        >
            <Link
                href={`/terminal/orgs/${slug}/inventory?tab=items`}
                className="px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors"
                style={{
                    fontFamily: "var(--font-mono)",
                    color: activeTab === "items" ? "var(--accent-primary)" : "rgba(200,220,232,0.45)",
                    borderBottom: activeTab === "items" ? "2px solid var(--accent-primary)" : "2px solid transparent",
                    marginBottom: "-1px",
                }}
            >
                {tabItemsLabel}
            </Link>
            <Link
                href={`/terminal/orgs/${slug}/inventory?tab=auec`}
                className="px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors"
                style={{
                    fontFamily: "var(--font-mono)",
                    color: activeTab === "auec" ? "var(--accent-primary)" : "rgba(200,220,232,0.45)",
                    borderBottom: activeTab === "auec" ? "2px solid var(--accent-primary)" : "2px solid transparent",
                    marginBottom: "-1px",
                }}
            >
                {tabAuecLabel}
            </Link>
        </div>
    );
}
