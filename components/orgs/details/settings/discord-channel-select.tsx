"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Hash, Search, X } from "lucide-react";

type ChannelOption = {
    id: string;
    name: string;
};

type Props = {
    organizationSlug: string;
    currentChannelId: string;
};

export default function DiscordChannelSelect({ organizationSlug, currentChannelId }: Props) {
    const [channels, setChannels] = useState<ChannelOption[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<ChannelOption | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const rootRef = useRef<HTMLDivElement | null>(null);

    // Load all channels once on mount
    useEffect(() => {
        let cancelled = false;

        (async () => {
            try {
                const res = await fetch(
                    `/api/discord/guild-channels?orgSlug=${encodeURIComponent(organizationSlug)}`,
                    { cache: "no-store" }
                );
                const data: { channels?: ChannelOption[]; message?: string } = await res.json();

                if (cancelled) return;

                if (!res.ok) {
                    setErrorMessage(data.message ?? "Could not load channels.");
                    return;
                }

                const list = data.channels ?? [];
                setChannels(list);

                // Pre-select the current channel if one is saved
                if (currentChannelId) {
                    const match = list.find((c) => c.id === currentChannelId);
                    if (match) {
                        setSelected(match);
                        setQuery(match.name);
                    }
                }
            } catch {
                if (!cancelled) setErrorMessage("Could not load channels.");
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        })();

        return () => { cancelled = true; };
    }, [organizationSlug, currentChannelId]);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = useMemo(() => {
        const q = query.toLowerCase();
        return channels.filter((c) => c.name.toLowerCase().includes(q));
    }, [channels, query]);

    const handleSelect = (channel: ChannelOption) => {
        setSelected(channel);
        setQuery(channel.name);
        setIsOpen(false);
    };

    const handleClear = () => {
        setSelected(null);
        setQuery("");
        setIsOpen(channels.length > 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelected(null);
        setQuery(e.target.value);
        setIsOpen(true);
    };

    return (
        <div ref={rootRef}>
            <label
                htmlFor="channelSearch"
                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
            >
                Discord Notification Channel
            </label>

            <input
                type="hidden"
                name="discordTransactionChannelId"
                value={selected?.id ?? ""}
            />

            <div className="relative">
                <Search
                    size={14}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "rgba(79,195,220,0.45)" }}
                />

                <input
                    id="channelSearch"
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => { if (!selected && channels.length > 0) setIsOpen(true); }}
                    placeholder={isLoading ? "Loading channels…" : "Search channels…"}
                    disabled={isLoading || !!errorMessage}
                    autoComplete="off"
                    className="w-full rounded-md border bg-transparent px-3 py-2 text-sm outline-none transition-colors focus:border-[rgba(79,195,220,0.5)] disabled:opacity-50"
                    style={{
                        paddingLeft: "2.75rem",
                        paddingRight: "2.5rem",
                        borderColor: "rgba(79,195,220,0.2)",
                        color: "rgba(200,220,232,0.85)",
                        fontFamily: "var(--font-mono)",
                    }}
                />

                {(query || selected) && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1"
                        style={{ color: "rgba(200,220,232,0.45)" }}
                        aria-label="Clear selection"
                    >
                        <X size={14} />
                    </button>
                )}

                {isOpen && filtered.length > 0 && (
                    <div
                        className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-lg border"
                        style={{
                            borderColor: "rgba(79,195,220,0.14)",
                            background: "rgba(6,12,18,0.98)",
                            boxShadow: "0 12px 28px rgba(0,0,0,0.35)",
                        }}
                    >
                        {filtered.map((channel) => (
                            <button
                                key={channel.id}
                                type="button"
                                onClick={() => handleSelect(channel)}
                                className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left transition hover:bg-white/5"
                            >
                                <Hash
                                    size={13}
                                    style={{ color: "rgba(79,195,220,0.5)", flexShrink: 0 }}
                                />
                                <span
                                    className="text-sm"
                                    style={{
                                        color: "rgba(200,220,232,0.75)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    {channel.name}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-2 text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                {errorMessage ? (
                    <span style={{ color: "rgba(240,165,0,0.85)" }}>{errorMessage}</span>
                ) : selected ? (
                    <span style={{ color: "rgba(79,195,220,0.7)" }}>
                        Selected: #{selected.name}
                    </span>
                ) : (
                    <span style={{ color: "rgba(200,220,232,0.35)" }}>
                        Leave empty to disable transaction notifications.
                    </span>
                )}
            </div>
        </div>
    );
}
