"use client";

import { useEffect, useRef, useState } from "react";
import {
    Search, Database, Globe, Loader2, X,
    Layers, ChevronDown, ChevronUp, Check
} from "lucide-react";
import type { ItemSearchResult } from "@/app/api/sc-items/search/route";

type SiblingVariant = {
    uuid: string;
    name: string;
    type?: string;
    description?: string;
    manufacturer?: string;
};

export type SelectedItemWithVariants = {
    item: ItemSearchResult;
    importAllVariants: boolean;
    variants: SiblingVariant[];
    selectedVariants: SiblingVariant[];
};

type Props = {
    onSelectAction: (selection: SelectedItemWithVariants | null) => void;
    disabled?: boolean;
    excludeShopItems?: boolean;
};

export default function ScItemAutocomplete({ onSelectAction, disabled, excludeShopItems = false }: Props) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<ItemSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [selected, setSelected] = useState<ItemSearchResult | null>(null);

    const [siblings, setSiblings] = useState<SiblingVariant[]>([]);
    const [siblingsLoading, setSiblingsLoading] = useState(false);
    const [baseName, setBaseName] = useState<string>("");
    const [siblingsExpanded, setSiblingsExpanded] = useState(false);

    const [checkedUuids, setCheckedUuids] = useState<Set<string>>(new Set());
    const [allChecked, setAllChecked] = useState(false);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Re-trigger search when excludeShopItems changes, and we already have a query
    useEffect(() => {
        if (selected || query.length < 2) return;
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({ q: query });
                if (excludeShopItems) params.set("excludeShopItems", "true");
                const res = await fetch(`/api/sc-items/search?${params}`);
                const json = await res.json();
                setResults(json.results ?? []);
                setOpen(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
    }, [query, selected, excludeShopItems]);

    function emitSelection(
        item: ItemSearchResult,
        all: boolean,
        checked: Set<string>,
        allSiblings: SiblingVariant[]
    ) {
        const selectedVariants = all
            ? allSiblings
            : allSiblings.filter((s) => checked.has(s.uuid));
        onSelectAction({ item, importAllVariants: all, variants: allSiblings, selectedVariants });
    }

    async function fetchSiblings(item: ItemSearchResult, itemName: string) {
        setSiblingsLoading(true);
        setSiblings([]);
        setBaseName("");
        setCheckedUuids(new Set());
        setAllChecked(false);
        setSiblingsExpanded(false);

        try {
            const params = new URLSearchParams({ siblingsFor: itemName });
            if (excludeShopItems) params.set("excludeShopItems", "true");
            const res = await fetch(`/api/sc-items/search?${params}`);
            const json = await res.json();
            const fetched: SiblingVariant[] = json.siblings ?? [];
            setSiblings(fetched);
            setBaseName(json.baseName ?? itemName);
            emitSelection(item, false, new Set(), fetched);
        } catch {
            setSiblings([]);
        } finally {
            setSiblingsLoading(false);
        }
    }

    function handleSelect(item: ItemSearchResult) {
        setSelected(item);
        setQuery(item.name);
        setOpen(false);

        if (item.source === "sc_wiki") {
            fetchSiblings(item, item.name);
        } else {
            setSiblings([]);
            setBaseName("");
            onSelectAction({ item, importAllVariants: false, variants: [], selectedVariants: [] });
        }
    }

    function handleToggleAll(checked: boolean) {
        setAllChecked(checked);
        const next = checked ? new Set(siblings.map((s) => s.uuid)) : new Set<string>();
        setCheckedUuids(next);
        if (selected) emitSelection(selected, checked, next, siblings);
    }

    function handleToggleOne(uuid: string, checked: boolean) {
        const next = new Set(checkedUuids);
        if (checked) next.add(uuid); else next.delete(uuid);
        setCheckedUuids(next);
        const nowAll = next.size === siblings.length;
        setAllChecked(nowAll);
        if (selected) emitSelection(selected, nowAll, next, siblings);
    }

    function handleClear() {
        setSelected(null);
        setQuery("");
        setResults([]);
        setOpen(false);
        setSiblings([]);
        setBaseName("");
        setCheckedUuids(new Set());
        setAllChecked(false);
        setSiblingsExpanded(false);
        onSelectAction(null);
    }

    const someChecked = checkedUuids.size > 0 && !allChecked;

    return (
        <div ref={containerRef} className="relative w-full space-y-2">
            {/* Input */}
            <div className="relative">
                {loading ? (
                    <Loader2 size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 animate-spin" style={{ color: "rgba(79,195,220,0.45)" }} />
                ) : (
                    <Search size={14} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "rgba(79,195,220,0.45)" }} />
                )}
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        if (selected) { setSelected(null); setSiblings([]); setBaseName(""); setCheckedUuids(new Set()); setAllChecked(false); onSelectAction(null); }
                        setQuery(e.target.value);
                    }}
                    placeholder="Search Star Citizen items..."
                    className="sc-input w-full pl-9! pr-8!"
                    autoComplete="off"
                    disabled={disabled}
                />
                {query && (
                    <button type="button" onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity" style={{ color: "rgba(200,220,232,0.6)" }}>
                        <X size={13} />
                    </button>
                )}
            </div>

            {/* Source badge */}
            {selected && (
                <div
                    className="flex items-center gap-2 rounded px-2 py-1 text-[10px] w-fit"
                    style={{
                        background: selected.source === "local" ? "rgba(74,222,128,0.08)" : "rgba(79,195,220,0.08)",
                        border: `1px solid ${selected.source === "local" ? "rgba(74,222,128,0.2)" : "rgba(79,195,220,0.2)"}`,
                        color: selected.source === "local" ? "rgba(74,222,128,0.8)" : "rgba(79,195,220,0.8)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {selected.source === "local" ? <Database size={10} /> : <Globe size={10} />}
                    {selected.source === "local" ? "From local database" : "From Star Citizen Wiki"}
                </div>
            )}

            {/* Variants section */}
            {selected?.source === "sc_wiki" && (
                <div className="rounded-lg border p-3 space-y-2" style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(7,18,28,0.35)" }}>
                    {siblingsLoading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 size={12} className="animate-spin" style={{ color: "rgba(79,195,220,0.5)" }} />
                            <span className="text-[10px]" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>Searching for variants...</span>
                        </div>
                    ) : siblings.length === 0 ? (
                        <p className="text-[10px]" style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}>No other variants found for this item.</p>
                    ) : (
                        <>
                            {baseName && baseName !== selected.name && (
                                <p className="text-[10px]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
                                    Grouped by: <span style={{ color: "rgba(79,195,220,0.7)" }}>{baseName}</span>
                                </p>
                            )}

                            {/* Header row: Select All + toggle */}
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2.5 cursor-pointer">
                                    <div
                                        className="relative flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors"
                                        style={{
                                            borderColor: (allChecked || someChecked) ? "rgba(79,195,220,0.6)" : "rgba(79,195,220,0.25)",
                                            background: (allChecked || someChecked) ? "rgba(79,195,220,0.15)" : "transparent",
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="absolute inset-0 opacity-0 cursor-pointer"
                                            checked={allChecked}
                                            ref={(el) => { if (el) el.indeterminate = someChecked; }}
                                            onChange={(e) => handleToggleAll(e.target.checked)}
                                            disabled={disabled}
                                        />
                                        {allChecked && <Check size={10} style={{ color: "rgba(79,195,220,0.9)" }} />}
                                        {someChecked && <span style={{ color: "rgba(79,195,220,0.9)", fontSize: 10, lineHeight: 1 }}>–</span>}
                                    </div>
                                    <span className="text-xs" style={{ color: allChecked ? "rgba(200,220,232,0.8)" : "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}>
                                        {allChecked ? "All variants selected" : someChecked ? `${checkedUuids.size} of ${siblings.length} selected` : "Select variants to import"}
                                    </span>
                                    <span className="text-[10px]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
                                        <Layers size={9} className="inline mr-1 -mt-0.5" />
                                        {siblings.length}
                                    </span>
                                </label>

                                <button
                                    type="button"
                                    onClick={() => setSiblingsExpanded((v) => !v)}
                                    className="flex items-center gap-1 text-[10px] transition-opacity hover:opacity-80"
                                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                                >
                                    {siblingsExpanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                                    {siblingsExpanded ? "Hide" : "Show"}
                                </button>
                            </div>

                            {/* Individual variant list */}
                            {siblingsExpanded && (
                                <div className="space-y-1 pt-1 max-h-52 overflow-y-auto pr-1">
                                    {siblings.map((v) => {
                                        const isChecked = checkedUuids.has(v.uuid);
                                        return (
                                            <label
                                                key={v.uuid}
                                                className="flex items-center gap-2.5 rounded px-2 py-1.5 cursor-pointer transition-colors"
                                                style={{
                                                    background: isChecked ? "rgba(79,195,220,0.07)" : "rgba(79,195,220,0.02)",
                                                    borderLeft: `2px solid ${isChecked ? "rgba(79,195,220,0.35)" : "rgba(79,195,220,0.1)"}`,
                                                }}
                                            >
                                                <div
                                                    className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors"
                                                    style={{
                                                        borderColor: isChecked ? "rgba(79,195,220,0.6)" : "rgba(79,195,220,0.2)",
                                                        background: isChecked ? "rgba(79,195,220,0.15)" : "transparent",
                                                    }}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                                        checked={isChecked}
                                                        onChange={(e) => handleToggleOne(v.uuid, e.target.checked)}
                                                        disabled={disabled}
                                                    />
                                                    {isChecked && <Check size={9} style={{ color: "rgba(79,195,220,0.9)" }} />}
                                                </div>

                                                <span
                                                    className="flex-1 text-[11px] truncate"
                                                    style={{
                                                        color: isChecked ? "rgba(200,220,232,0.8)" : "rgba(200,220,232,0.5)",
                                                        fontFamily: "var(--font-mono)",
                                                    }}
                                                >
                                                    {v.name}
                                                </span>

                                                {v.manufacturer && (
                                                    <span className="shrink-0 text-[9px] uppercase" style={{ color: "rgba(79,195,220,0.3)", fontFamily: "var(--font-mono)" }}>
                                                        {v.manufacturer}
                                                    </span>
                                                )}
                                            </label>
                                        );
                                    })}
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}

            {/* Dropdown */}
            {open && results.length > 0 && (
                <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-xl" style={{ borderColor: "rgba(79,195,220,0.18)", background: "rgba(7,14,24,0.98)", backdropFilter: "blur(12px)" }}>
                    {results.map((item, i) => (
                        <button
                            key={item.source === "local" ? item.localId : item.scUuid}
                            type="button"
                            onClick={() => handleSelect(item)}
                            className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors"
                            style={{ borderBottom: i < results.length - 1 ? "1px solid rgba(79,195,220,0.07)" : "none" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(79,195,220,0.06)"; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                        >
                            <div className="mt-0.5 shrink-0 rounded p-1" style={{ background: item.source === "local" ? "rgba(74,222,128,0.08)" : "rgba(79,195,220,0.08)" }}>
                                {item.source === "local"
                                    ? <Database size={11} style={{ color: "rgba(74,222,128,0.7)" }} />
                                    : <Globe size={11} style={{ color: "rgba(79,195,220,0.7)" }} />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                    <span className="truncate text-xs font-semibold uppercase tracking-[0.05em]" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                                        {item.name}
                                    </span>
                                    {item.category && (
                                        <span className="shrink-0 text-[9px] uppercase tracking-[0.1em]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
                                            {item.category}
                                        </span>
                                    )}
                                </div>
                                {item.manufacturer && (
                                    <p className="mt-0.5 text-[10px]" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                                        {item.manufacturer}
                                    </p>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {open && results.length === 0 && !loading && query.length >= 2 && (
                <div className="absolute z-50 mt-1 w-full rounded-lg border px-3 py-3 text-[11px]" style={{ borderColor: "rgba(79,195,220,0.14)", background: "rgba(7,14,24,0.98)", color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                    No items found for &quot;{query}&quot;
                </div>
            )}
        </div>
    );
}