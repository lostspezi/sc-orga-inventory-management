"use client";

import { useTransition } from "react";
import { useLocale } from "next-intl";
import { ChevronDown } from "lucide-react";
import { setLocaleAction } from "@/lib/actions/set-locale-action";
import { locales, localeLabels, type Locale } from "@/i18n/config";

export default function LanguageSwitcher() {
    const locale = useLocale() as Locale;
    const [isPending, startTransition] = useTransition();

    return (
        <div className="relative">
            <select
                value={locale}
                disabled={isPending}
                onChange={(e) =>
                    startTransition(() => setLocaleAction(e.target.value as Locale))
                }
                className="cursor-pointer appearance-none rounded-lg border py-1 pl-2.5 pr-7 text-[10px] uppercase tracking-[0.2em] transition-colors disabled:cursor-default disabled:opacity-50"
                style={{
                    fontFamily: "var(--font-mono)",
                    borderColor: "rgba(79,195,220,0.15)",
                    background: "rgba(79,195,220,0.05)",
                    color: "rgba(79,195,220,0.9)",
                    outline: "none",
                }}
            >
                {locales.map((l) => (
                    <option
                        key={l}
                        value={l}
                        style={{
                            background: "rgba(6,12,18,1)",
                            color: "rgba(200,220,232,0.9)",
                        }}
                    >
                        {localeLabels[l]}
                    </option>
                ))}
            </select>
            <ChevronDown
                size={11}
                className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2"
                style={{ color: "rgba(79,195,220,0.55)" }}
            />
        </div>
    );
}
