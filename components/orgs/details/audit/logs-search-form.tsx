"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

type Props = {
    initialQuery?: string;
};

export default function LogsSearchForm({ initialQuery = "" }: Props) {
    const t = useTranslations("logs");
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [value, setValue] = useState(initialQuery);

    const currentQuery = searchParams.get("q") ?? "";

    const normalizedValue = useMemo(() => value.trim(), [value]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (normalizedValue === currentQuery) {
                return;
            }

            const params = new URLSearchParams(searchParams.toString());

            if (normalizedValue) {
                params.set("q", normalizedValue);
            } else {
                params.delete("q");
            }

            const nextQueryString = params.toString();
            const nextUrl = nextQueryString
                ? `${pathname}?${nextQueryString}`
                : pathname;

            router.replace(nextUrl, { scroll: false });
        }, 250);

        return () => clearTimeout(timeout);
    }, [normalizedValue, currentQuery, pathname, router, searchParams]);

    return (
        <div
            className="rounded-lg border p-3"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(7,18,28,0.28)",
            }}
        >
            <label
                htmlFor="q"
                className="mb-2 block text-[10px] uppercase tracking-[0.22em]"
                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
            >
                {t("searchLabel")}
            </label>

            <div className="relative">
                <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(79,195,220,0.45)" }}
                />
                <input
                    id="q"
                    name="q"
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={t("searchPlaceholder")}
                    className="sc-input w-full"
                    style={{ paddingLeft: "2.75rem" }}
                />
            </div>
        </div>
    );
}