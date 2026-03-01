"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";

export default function BackButton() {
    const router = useRouter();
    const t = useTranslations("common");

    return (
        <button
            type="button"
            onClick={() => router.back()}
            className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors"
            style={{
                borderColor: "rgba(79,195,220,0.18)",
                color: "rgba(200,220,232,0.5)",
                fontFamily: "var(--font-mono)",
                background: "rgba(79,195,220,0.03)",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(79,195,220,0.35)";
                (e.currentTarget as HTMLElement).style.color = "rgba(200,220,232,0.85)";
                (e.currentTarget as HTMLElement).style.background = "rgba(79,195,220,0.07)";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(79,195,220,0.18)";
                (e.currentTarget as HTMLElement).style.color = "rgba(200,220,232,0.5)";
                (e.currentTarget as HTMLElement).style.background = "rgba(79,195,220,0.03)";
            }}
        >
            <ArrowLeft size={13} />
            {t("back")}
        </button>
    );
}
