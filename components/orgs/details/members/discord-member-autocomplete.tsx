"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { useTranslations } from "next-intl";

type DiscordGuildMemberOption = {
    userId: string;
    username: string;
    globalName?: string;
    nickname?: string;
    displayLabel: string;
    avatarUrl?: string;
};

type Props = {
    organizationSlug: string;
    name?: string; // hidden input name
    required?: boolean;
};

export default function DiscordMemberAutocomplete({
                                                      organizationSlug,
                                                      name = "discordUserId",
                                                      required = true,
                                                  }: Props) {
    const t = useTranslations("members");
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<DiscordGuildMemberOption[]>([]);
    const [selected, setSelected] = useState<DiscordGuildMemberOption | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>("");

    const rootRef = useRef<HTMLDivElement | null>(null);

    const trimmedQuery = useMemo(() => query.trim(), [query]);

    useEffect(() => {
        if (selected || !trimmedQuery) {
            setResults([]);
            setIsOpen(false);
            setIsLoading(false);
            return;
        }

        let isCancelled = false;

        const timeout = setTimeout(async () => {
            try {
                setIsLoading(true);
                setErrorMessage("");

                const res = await fetch(
                    `/api/discord/guild-members/search?orgSlug=${encodeURIComponent(
                        organizationSlug
                    )}&q=${encodeURIComponent(trimmedQuery)}`,
                    {
                        method: "GET",
                        cache: "no-store",
                    }
                );

                const data: {
                    results?: DiscordGuildMemberOption[];
                    message?: string;
                } = await res.json();

                if (isCancelled) return;

                if (!res.ok) {
                    setResults([]);
                    setIsOpen(false);
                    setErrorMessage(
                        data.message ?? t("loadError")
                    );
                    return;
                }

                const nextResults = (data.results ?? []).slice(0, 10);
                setResults(nextResults);
                setIsOpen(nextResults.length > 0);
            } catch {
                if (isCancelled) return;
                setResults([]);
                setIsOpen(false);
                setErrorMessage(t("loadError"));
            } finally {
                if (!isCancelled) {
                    setIsLoading(false);
                }
            }
        }, 250);

        return () => {
            isCancelled = true;
            clearTimeout(timeout);
        };
    }, [trimmedQuery, organizationSlug, selected, t]);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (!rootRef.current) return;
            if (!rootRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (member: DiscordGuildMemberOption) => {
        setSelected(member);
        setQuery(member.displayLabel);
        setResults([]);
        setIsOpen(false);
        setErrorMessage("");
    };

    const handleClear = () => {
        setSelected(null);
        setQuery("");
        setResults([]);
        setIsOpen(false);
        setErrorMessage("");
    };

    return (
        <div ref={rootRef}>
            <label
                htmlFor="discordMemberSearch"
                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
            >
                {t("discordMemberLabel")}
            </label>

            {/* hidden submitted value */}
            <input
                type="hidden"
                name={name}
                value={selected?.userId ?? ""}
                required={required}
            />

            <div className="relative">
                <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(79,195,220,0.45)" }}
                />

                <input
                    id="discordMemberSearch"
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setSelected(null);
                        setQuery(e.target.value);
                        setErrorMessage("");
                    }}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder={t("searchMembers")}
                    className="sc-input w-full"
                    style={{ paddingLeft: "2.75rem", paddingRight: "2.5rem" }}
                    autoComplete="off"
                />

                {(query || selected) && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 rounded p-1"
                        style={{ color: "rgba(200,220,232,0.45)" }}
                        aria-label="Clear selection"
                    >
                        <X size={14} />
                    </button>
                )}

                {isOpen && (
                    <div
                        className="absolute z-20 mt-2 max-h-72 w-full overflow-y-auto rounded-lg border"
                        style={{
                            borderColor: "rgba(79,195,220,0.14)",
                            background: "rgba(6,12,18,0.98)",
                            boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
                        }}
                    >
                        {results.map((member) => (
                            <button
                                key={member.userId}
                                type="button"
                                onClick={() => handleSelect(member)}
                                className=" cursor-pointer flex w-full items-center gap-3 px-3 py-2 text-left transition hover:bg-white/5"
                            >
                                {member.avatarUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={member.avatarUrl}
                                        alt={member.displayLabel}
                                        className="h-8 w-8 rounded-full"
                                    />
                                ) : (
                                    <div
                                        className="flex h-8 w-8 items-center justify-center rounded-full border text-[10px]"
                                        style={{
                                            borderColor: "rgba(79,195,220,0.14)",
                                            color: "rgba(79,195,220,0.55)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        @{member.username.slice(0, 2).toUpperCase()}
                                    </div>
                                )}

                                <div className="min-w-0">
                                    <p
                                        className="truncate text-sm"
                                        style={{
                                            color: "rgba(200,220,232,0.7)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        {member.displayLabel}
                                    </p>
                                    <p
                                        className="truncate text-[11px]"
                                        style={{
                                            color: "rgba(200,220,232,0.35)",
                                            fontFamily: "var(--font-mono)",
                                        }}
                                    >
                                        ID: {member.userId}
                                    </p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-2 text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                {selected && (
                    <span style={{ color: "rgba(79,195,220,0.7)" }}>
                        Selected: {selected.displayLabel}
                    </span>
                )}

                {!selected && isLoading && (
                    <span style={{ color: "rgba(79,195,220,0.55)" }}>
                        {t("searchingMembers")}
                    </span>
                )}

                {!selected && !isLoading && !errorMessage && trimmedQuery && results.length === 0 && (
                    <span style={{ color: "rgba(240,165,0,0.8)" }}>
                        {t("noMembersFound")}
                    </span>
                )}

                {!selected && !isLoading && !trimmedQuery && (
                    <span style={{ color: "rgba(200,220,232,0.35)" }}>
                        {t("startTyping")}
                    </span>
                )}

                {errorMessage && (
                    <span style={{ color: "rgba(240,165,0,0.85)" }}>
                        {errorMessage}
                    </span>
                )}
            </div>
        </div>
    );
}