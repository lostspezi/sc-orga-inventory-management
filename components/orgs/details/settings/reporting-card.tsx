import Link from "next/link";
import { BarChart3, ArrowRight } from "lucide-react";

type Props = {
    organizationSlug: string;
    isPro: boolean;
    labels: {
        label: string;
        activeStatus: string;
        lockedStatus: string;
        title: string;
        desc: string;
        feature1: string;
        feature2: string;
        feature3: string;
        feature4: string;
        openBtn: string;
        upgradeNote: string;
    };
};

export default function ReportingCard({ organizationSlug, isPro, labels }: Props) {
    const borderColor = isPro ? "rgba(79,195,220,0.18)" : "rgba(251,191,36,0.15)";
    const bg = isPro ? "rgba(6,16,24,0.18)" : "rgba(20,16,4,0.14)";
    const accentColor = isPro ? "rgba(79,195,220,0.85)" : "rgba(251,191,36,0.8)";
    const accentBorder = isPro ? "rgba(79,195,220,0.2)" : "rgba(251,191,36,0.2)";
    const accentBg = isPro ? "rgba(79,195,220,0.06)" : "rgba(251,191,36,0.06)";

    return (
        <div
            className="rounded-lg border p-4"
            style={{ borderColor, background: bg }}
        >
            <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                    style={{ borderColor: accentBorder, color: accentColor, background: accentBg }}
                >
                    <BarChart3 size={18} />
                </div>

                <div className="flex-1 min-w-0">
                    {/* Eyebrow + status pill */}
                    <div className="flex flex-wrap items-center gap-2">
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: accentColor, fontFamily: "var(--font-mono)", opacity: 0.8 }}
                        >
                            {labels.label}
                        </p>
                        <span
                            className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                            style={{
                                borderColor: accentBorder,
                                color: accentColor,
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {isPro ? labels.activeStatus : labels.lockedStatus}
                        </span>
                    </div>

                    {/* Title */}
                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: accentColor, fontFamily: "var(--font-display)" }}
                    >
                        {labels.title}
                    </h3>

                    {/* Description */}
                    <p
                        className="mt-2 text-sm leading-relaxed"
                        style={{ color: "rgba(200,220,232,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        {labels.desc}
                    </p>

                    {/* Feature list */}
                    <ul className="mt-3 space-y-1.5">
                        {[labels.feature1, labels.feature2, labels.feature3, labels.feature4].map((f, i) => (
                            <li
                                key={i}
                                className="flex items-center gap-2 text-xs"
                                style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                <span
                                    className="h-1 w-1 shrink-0 rounded-full"
                                    style={{ background: accentColor }}
                                />
                                {f}
                            </li>
                        ))}
                    </ul>

                    {/* CTA */}
                    <div className="mt-4">
                        {isPro ? (
                            <Link
                                href={`/terminal/orgs/${organizationSlug}/reports`}
                                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors"
                                style={{
                                    borderColor: "rgba(79,195,220,0.25)",
                                    color: "rgba(79,195,220,0.85)",
                                    background: "rgba(79,195,220,0.05)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {labels.openBtn}
                                <ArrowRight size={12} />
                            </Link>
                        ) : (
                            <p
                                className="text-xs"
                                style={{ color: "rgba(251,191,36,0.6)", fontFamily: "var(--font-mono)" }}
                            >
                                {labels.upgradeNote}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
