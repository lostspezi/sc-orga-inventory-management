"use client";

import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type Props = {
    initialQuery?: string;
};

export default function LogsSearchForm({ initialQuery = "" }: Props) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [value, setValue] = useState(initialQuery);

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());

            if (value.trim()) {
                params.set("q", value.trim());
            } else {
                params.delete("q");
            }

            router.replace(`${pathname}?${params.toString()}`, { scroll: false });
        }, 250);

        return () => clearTimeout(timeout);
    }, [value, pathname, router, searchParams]);

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
                Search Logs
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
                    placeholder="Search by action, user, message..."
                    className="sc-input w-full"
                    style={{ paddingLeft: "2.75rem" }}
                />
            </div>
        </div>
    );
}