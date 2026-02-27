"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

type Props = {
    title: string;
    eyebrow?: string;
    description?: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
};

export default function HudAccordion({
                                         title,
                                         eyebrow,
                                         description,
                                         children,
                                         defaultOpen = false,
                                     }: Props) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div
            className="rounded-lg border"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(7,18,28,0.28)",
            }}
        >
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-4 p-4 text-left cursor-pointer"
            >
                <div>
                    {eyebrow && (
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {eyebrow}
                        </p>
                    )}

                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {title}
                    </h3>

                    {description && (
                        <p
                            className="mt-1 text-sm"
                            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {description}
                        </p>
                    )}
                </div>

                <ChevronDown
                    size={18}
                    className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                    style={{ color: "rgba(79,195,220,0.7)" }}
                />
            </button>

            {open && (
                <div
                    className="border-t p-4 pt-0"
                    style={{ borderColor: "rgba(79,195,220,0.08)" }}
                >
                    {children}
                </div>
            )}
        </div>
    );
}