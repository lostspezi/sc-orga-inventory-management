"use client";

import React, { useState } from "react";
import { X, Info, CheckCircle, AlertTriangle } from "lucide-react";

type Variant = "info" | "success" | "error";

type Props = {
    message: string;
    variant?: Variant;
};

const config: Record<Variant, {
    icon: React.ElementType;
    color: string;
    border: string;
    background: string;
    iconColor: string;
}> = {
    success: {
        icon: CheckCircle,
        color: "rgba(74,222,128,0.85)",
        border: "rgba(74,222,128,0.2)",
        background: "rgba(0,30,10,0.25)",
        iconColor: "rgba(74,222,128,0.8)",
    },
    error: {
        icon: AlertTriangle,
        color: "rgba(248,113,113,0.85)",
        border: "rgba(248,113,113,0.2)",
        background: "rgba(30,5,5,0.25)",
        iconColor: "rgba(248,113,113,0.8)",
    },
    info: {
        icon: Info,
        color: "rgba(79,195,220,0.85)",
        border: "rgba(79,195,220,0.2)",
        background: "rgba(7,18,28,0.28)",
        iconColor: "rgba(79,195,220,0.7)",
    },
};

export default function AlertMessage({ message, variant = "info" }: Readonly<Props>) {
    const [visible, setVisible] = useState(true);

    if (!visible) return null;

    const { icon: Icon, color, border, background, iconColor } = config[variant];

    return (
        <div
            className="flex items-start gap-3 rounded-lg border px-4 py-3"
            style={{ borderColor: border, background, color }}
        >
            <Icon size={15} className="mt-0.5 shrink-0" style={{ color: iconColor }} />

            <span
                className="flex-1 text-sm tracking-[0.04em]"
                style={{ fontFamily: "var(--font-mono)" }}
            >
                {message}
            </span>

            <button
                type="button"
                onClick={() => setVisible(false)}
                className="cursor-pointer mt-0.5 shrink-0 opacity-50 transition-opacity hover:opacity-100"
                style={{ color }}
                aria-label="Dismiss"
            >
                <X size={14} />
            </button>
        </div>
    );
}