"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { AppNewsView, NewsLocale, NewsStatus, TranslationStatus } from "@/lib/types/app-news";
import type { AppNewsSettingsView } from "@/lib/types/app-news-settings";

// ── Constants ─────────────────────────────────────────────────────────────────

const LOCALES: NewsLocale[] = ["en", "de", "fr"];
const LOCALE_LABELS: Record<NewsLocale, string> = { en: "EN", de: "DE", fr: "FR" };
const LOCALE_NAMES: Record<NewsLocale, string> = { en: "English", de: "German", fr: "French" };

const STATUS_COLORS: Record<NewsStatus, string> = {
    draft:               "rgba(200,220,232,0.4)",
    translation_pending: "rgba(240,165,0,0.8)",
    ready_to_publish:    "rgba(80,210,120,0.8)",
    published:           "rgba(80,210,120,1.0)",
    archived:            "rgba(200,220,232,0.25)",
};

const STATUS_LABELS: Record<NewsStatus, string> = {
    draft:               "DRAFT",
    translation_pending: "TRANSLATING…",
    ready_to_publish:    "READY",
    published:           "PUBLISHED",
    archived:            "ARCHIVED",
};

const TRANSLATION_STATUS_COLORS: Record<TranslationStatus, string> = {
    missing:    "rgba(200,220,232,0.35)",
    generating: "rgba(240,165,0,0.75)",
    ready:      "rgba(80,210,120,0.8)",
    edited:     "rgba(79,195,220,0.8)",
    error:      "rgba(220,60,60,0.8)",
};

const TRANSLATION_STATUS_LABELS: Record<TranslationStatus, string> = {
    missing:    "MISSING",
    generating: "GENERATING…",
    ready:      "READY",
    edited:     "EDITED",
    error:      "ERROR",
};

const TITLE_MAX = 120;
const BODY_MAX = 4000;

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
    initialPost?: AppNewsView;
    settings: AppNewsSettingsView;
    hasOpenAiKey: boolean;
};

type LocalTranslation = {
    title: string;
    body: string;
    dirty: boolean; // unsaved local edits
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: NewsStatus }) {
    return (
        <span
            className="rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{
                background: STATUS_COLORS[status],
                color: "rgba(6,12,18,0.9)",
                fontFamily: "var(--font-mono)",
            }}
        >
            {STATUS_LABELS[status]}
        </span>
    );
}

function TranslationBadge({ status }: { status: TranslationStatus }) {
    return (
        <span
            className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em]"
            style={{
                background: TRANSLATION_STATUS_COLORS[status],
                color: "rgba(6,12,18,0.9)",
                fontFamily: "var(--font-mono)",
            }}
        >
            {TRANSLATION_STATUS_LABELS[status]}
        </span>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function NewsEditor({ initialPost, settings, hasOpenAiKey }: Props) {
    const router = useRouter();

    // Primary content state
    const [post, setPost] = useState<AppNewsView | null>(initialPost ?? null);
    const [primaryLocale, setPrimaryLocale] = useState<NewsLocale>(initialPost?.primaryLocale ?? "en");
    const [title, setTitle] = useState(initialPost?.title ?? "");
    const [body, setBody] = useState(initialPost?.body ?? "");
    const [bodyTab, setBodyTab] = useState<"edit" | "preview">("edit");

    // Translation state
    const [activeTranslationLocale, setActiveTranslationLocale] = useState<NewsLocale | null>(null);
    const [localTranslations, setLocalTranslations] = useState<Partial<Record<NewsLocale, LocalTranslation>>>({});

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [isTranslating, setIsTranslating] = useState(false);
    const [isActioning, setIsActioning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [showPublishDialog, setShowPublishDialog] = useState(false);
    const [postToDiscord, setPostToDiscord] = useState(settings.autoPostOnPublish);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const publishDialogRef = useRef<HTMLDialogElement | null>(null);
    const deleteDialogRef = useRef<HTMLDialogElement | null>(null);

    // Sync dialog state with ref
    useEffect(() => {
        if (showPublishDialog) publishDialogRef.current?.showModal();
        else publishDialogRef.current?.close();
    }, [showPublishDialog]);

    useEffect(() => {
        if (showDeleteDialog) deleteDialogRef.current?.showModal();
        else deleteDialogRef.current?.close();
    }, [showDeleteDialog]);

    // Initialize local translations from post
    useEffect(() => {
        if (!initialPost) return;
        const init: Partial<Record<NewsLocale, LocalTranslation>> = {};
        for (const locale of LOCALES) {
            if (locale === initialPost.primaryLocale) continue;
            const t = initialPost.translations?.[locale];
            if (t) {
                init[locale] = { title: t.title, body: t.body, dirty: false };
            }
        }
        setLocalTranslations(init);
    }, [initialPost]);

    // Auto-set active translation tab
    useEffect(() => {
        const translationLocales = LOCALES.filter((l) => l !== primaryLocale);
        if (!activeTranslationLocale || activeTranslationLocale === primaryLocale) {
            setActiveTranslationLocale(translationLocales[0] ?? null);
        }
    }, [primaryLocale, activeTranslationLocale]);

    // Polling while translation_pending
    const pollPost = useCallback(async (id: string) => {
        const res = await fetch(`/api/admin/news/${id}`);
        if (!res.ok) return;
        const updated: AppNewsView = await res.json();
        setPost(updated);
        // Sync local translation state with new data
        setLocalTranslations((prev) => {
            const next = { ...prev };
            for (const locale of LOCALES) {
                if (locale === updated.primaryLocale) continue;
                const t = updated.translations?.[locale];
                if (t && !prev[locale]?.dirty) {
                    next[locale] = { title: t.title, body: t.body, dirty: false };
                }
            }
            return next;
        });
    }, []);

    useEffect(() => {
        if (!post?._id || post.status !== "translation_pending") return;
        const interval = setInterval(() => pollPost(post._id), 2000);
        return () => clearInterval(interval);
    }, [post?._id, post?.status, pollPost]);

    // ── Actions ───────────────────────────────────────────────────────────────

    function showSuccess(msg: string) {
        setSuccessMsg(msg);
        setError(null);
        setTimeout(() => setSuccessMsg(null), 3000);
    }

    async function handleSave() {
        if (!title.trim() || !body.trim()) {
            setError("Title and body are required.");
            return;
        }
        setIsSaving(true);
        setError(null);

        try {
            if (!post) {
                // Create
                const res = await fetch("/api/admin/news", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ primaryLocale, title: title.trim(), body: body.trim() }),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error ?? "Failed to create post");
                }
                const created: AppNewsView = await res.json();
                setPost(created);
                router.replace(`/terminal/admin/news/${created._id}/edit`);
                showSuccess("Draft saved.");
            } else {
                // Update
                const payload: Record<string, unknown> = {};
                if (title.trim() !== post.title) payload.title = title.trim();
                if (body.trim() !== post.body) payload.body = body.trim();
                if (primaryLocale !== post.primaryLocale) payload.primaryLocale = primaryLocale;

                if (Object.keys(payload).length === 0) {
                    showSuccess("No changes to save.");
                    return;
                }

                const res = await fetch(`/api/admin/news/${post._id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                });
                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.error ?? "Failed to save post");
                }
                const updated: AppNewsView = await res.json();
                setPost(updated);
                showSuccess("Draft saved.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleSaveTranslation(locale: NewsLocale) {
        if (!post) return;
        const lt = localTranslations[locale];
        if (!lt?.title || !lt?.body) {
            setError("Translation title and body are required.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/news/${post._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ translations: { [locale]: { title: lt.title, body: lt.body } } }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "Failed to save translation");
            }
            const updated: AppNewsView = await res.json();
            setPost(updated);
            setLocalTranslations((prev) => ({
                ...prev,
                [locale]: { title: lt.title, body: lt.body, dirty: false },
            }));
            showSuccess("Translation saved.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleTranslate() {
        if (!post) return;
        setIsTranslating(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/news/${post._id}/translate`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Translation failed");
            setPost(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Translation trigger failed.");
        } finally {
            setIsTranslating(false);
        }
    }

    async function handleRetryTranslation(locale: NewsLocale) {
        if (!post) return;
        // Reset locale to missing so translate picks it up
        const existing = post.translations?.[locale];
        if (existing) {
            await fetch(`/api/admin/news/${post._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ translations: { [locale]: { title: existing.title ?? "", body: existing.body ?? "", status: "missing" } } }),
            });
        }
        await handleTranslate();
    }

    async function handleMarkReady() {
        if (!post) return;
        setIsActioning(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/news/${post._id}/mark-ready`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            setPost(data);
            showSuccess("Marked as ready to publish.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed.");
        } finally {
            setIsActioning(false);
        }
    }

    async function handlePublish() {
        if (!post) return;
        setIsActioning(true);
        setError(null);
        setShowPublishDialog(false);
        try {
            const res = await fetch(`/api/admin/news/${post._id}/publish`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postToDiscord }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Publish failed");
            setPost(data);
            if (data.discordWarning) {
                setError(`Published. Discord warning: ${data.discordWarning}`);
            } else {
                showSuccess("Published successfully.");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Publish failed.");
        } finally {
            setIsActioning(false);
        }
    }

    async function handleArchive() {
        if (!post) return;
        setIsActioning(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/news/${post._id}/archive`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            setPost(data);
            showSuccess("Post archived.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed.");
        } finally {
            setIsActioning(false);
        }
    }

    async function handleRestore() {
        if (!post) return;
        setIsActioning(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/news/${post._id}/restore`, { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Failed");
            setPost(data);
            showSuccess("Restored to draft.");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed.");
        } finally {
            setIsActioning(false);
        }
    }

    async function handleDelete() {
        if (!post) return;
        setIsActioning(true);
        setError(null);
        setShowDeleteDialog(false);
        try {
            const res = await fetch(`/api/admin/news/${post._id}`, { method: "DELETE" });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error ?? "Failed");
            }
            router.push("/terminal/admin/news");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed.");
            setIsActioning(false);
        }
    }

    // ── Derived values ────────────────────────────────────────────────────────

    const translationLocales = LOCALES.filter((l) => l !== primaryLocale);
    const isEditing = !!post;
    const isPending = isSaving || isActioning;
    const canTranslate = isEditing && post!.status !== "translation_pending";
    const hasDiscord = !!(settings.discordGuildId && settings.discordChannelId);

    function getTranslationStatus(locale: NewsLocale): TranslationStatus {
        const t = post?.translations?.[locale];
        return t?.status ?? "missing";
    }

    const hasMissingTranslations = translationLocales.some(
        (l) => getTranslationStatus(l) === "missing"
    );

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="space-y-4">
            {/* ── Header bar ── */}
            <section
                className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                style={{ background: "rgba(8,16,24,0.55)" }}
            >
                <div
                    className="absolute -top-px left-8 right-8 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.6), transparent)" }}
                />
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <a
                            href="/terminal/admin/news"
                            className="text-xs"
                            style={{ color: "rgba(79,195,220,0.6)", fontFamily: "var(--font-mono)" }}
                        >
                            ← News List
                        </a>
                        {post && <StatusBadge status={post.status} />}
                    </div>
                    <p
                        className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-mono)" }}
                    >
                        {isEditing ? "Edit Post" : "New Post"}
                    </p>
                </div>
                <div
                    className="absolute -bottom-px left-8 right-8 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.2), transparent)" }}
                />
            </section>

            {/* ── Status / error messages ── */}
            {error && (
                <div
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        borderColor: "rgba(220,60,60,0.35)",
                        background: "rgba(220,60,60,0.08)",
                        color: "rgba(220,100,100,0.9)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {error}
                </div>
            )}
            {successMsg && (
                <div
                    className="rounded-lg border px-4 py-3 text-sm"
                    style={{
                        borderColor: "rgba(80,210,120,0.35)",
                        background: "rgba(80,210,120,0.08)",
                        color: "rgba(80,210,120,0.9)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {successMsg}
                </div>
            )}

            {/* ── Primary language selector ── */}
            <section
                className="hud-panel p-4 sm:p-5"
                style={{ background: "rgba(8,16,24,0.45)" }}
            >
                <label
                    className="mb-2 block text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    Primary Language
                </label>
                <div className="flex gap-2">
                    {LOCALES.map((locale) => (
                        <button
                            key={locale}
                            type="button"
                            onClick={() => {
                                if (post?.status === "published" || post?.status === "archived") return;
                                setPrimaryLocale(locale);
                            }}
                            className="rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] transition-colors"
                            style={{
                                borderColor: primaryLocale === locale ? "rgba(240,165,0,0.6)" : "rgba(79,195,220,0.15)",
                                background: primaryLocale === locale ? "rgba(240,165,0,0.12)" : "transparent",
                                color: primaryLocale === locale ? "rgba(240,165,0,0.9)" : "rgba(200,220,232,0.5)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {LOCALE_NAMES[locale]}
                        </button>
                    ))}
                </div>
            </section>

            {/* ── Primary content editor ── */}
            <section
                className="hud-panel p-4 sm:p-5 space-y-4"
                style={{ background: "rgba(8,16,24,0.45)" }}
            >
                {/* Title */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            Title
                        </label>
                        <span
                            className="text-[10px]"
                            style={{
                                color: title.length > TITLE_MAX ? "rgba(220,60,60,0.8)" : "rgba(200,220,232,0.3)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {title.length}/{TITLE_MAX}
                        </span>
                    </div>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={TITLE_MAX}
                        placeholder="Post title…"
                        className="sc-input w-full"
                    />
                </div>

                {/* Body with Edit/Preview tabs */}
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex gap-2">
                            {(["edit", "preview"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setBodyTab(tab)}
                                    className="text-[10px] uppercase tracking-[0.25em] transition-colors"
                                    style={{
                                        color: bodyTab === tab ? "rgba(79,195,220,0.9)" : "rgba(79,195,220,0.4)",
                                        fontFamily: "var(--font-mono)",
                                        borderBottom: bodyTab === tab ? "1px solid rgba(79,195,220,0.5)" : "none",
                                        paddingBottom: "2px",
                                    }}
                                >
                                    {tab === "edit" ? "Edit" : "Preview"}
                                </button>
                            ))}
                        </div>
                        <span
                            className="text-[10px]"
                            style={{
                                color: body.length > BODY_MAX ? "rgba(220,60,60,0.8)" : "rgba(200,220,232,0.3)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {body.length}/{BODY_MAX}
                        </span>
                    </div>

                    {bodyTab === "edit" ? (
                        <textarea
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            maxLength={BODY_MAX}
                            rows={12}
                            placeholder="Post content (Markdown supported)…"
                            className="sc-input w-full resize-y font-mono text-sm"
                        />
                    ) : (
                        <div
                            className="min-h-[12rem] rounded border p-4"
                            style={{
                                borderColor: "rgba(79,195,220,0.15)",
                                background: "rgba(6,12,18,0.6)",
                            }}
                        >
                            {body ? (
                                <div className="prose prose-invert prose-sm max-w-none">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        rehypePlugins={[rehypeSanitize]}
                                    >
                                        {body}
                                    </ReactMarkdown>
                                </div>
                            ) : (
                                <p
                                    className="text-sm italic"
                                    style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                                >
                                    Nothing to preview yet.
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* ── Translations ── */}
            {isEditing && (
                <section
                    className="hud-panel p-4 sm:p-5"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                        >
                            Translations
                        </p>
                        <div className="flex flex-col items-end gap-1">
                            <button
                                type="button"
                                onClick={handleTranslate}
                                disabled={!canTranslate || isTranslating}
                                className="sc-btn sc-btn-outline text-xs disabled:cursor-not-allowed disabled:opacity-40"
                                style={{ fontSize: "0.7rem", padding: "0.3rem 0.75rem" }}
                            >
                                {isTranslating || post?.status === "translation_pending"
                                    ? "Translating…"
                                    : "Generate Translations"}
                            </button>
                            {!hasOpenAiKey && (
                                <span
                                    className="text-[9px] uppercase tracking-[0.15em]"
                                    style={{ color: "rgba(220,100,100,0.6)", fontFamily: "var(--font-mono)" }}
                                >
                                    OPENAI_API_KEY not configured
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Locale tabs */}
                    <div className="mb-4 flex gap-2">
                        {translationLocales.map((locale) => {
                            const tStatus = getTranslationStatus(locale);
                            return (
                                <button
                                    key={locale}
                                    type="button"
                                    onClick={() => setActiveTranslationLocale(locale)}
                                    className="flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-colors"
                                    style={{
                                        borderColor: activeTranslationLocale === locale
                                            ? "rgba(79,195,220,0.5)"
                                            : "rgba(79,195,220,0.15)",
                                        background: activeTranslationLocale === locale
                                            ? "rgba(79,195,220,0.08)"
                                            : "transparent",
                                        color: "rgba(200,220,232,0.7)",
                                        fontFamily: "var(--font-mono)",
                                    }}
                                >
                                    <span className="font-bold">{LOCALE_LABELS[locale]}</span>
                                    <TranslationBadge status={tStatus} />
                                </button>
                            );
                        })}
                    </div>

                    {/* Active locale editor */}
                    {activeTranslationLocale && activeTranslationLocale !== primaryLocale && (() => {
                        const locale = activeTranslationLocale;
                        const tStatus = getTranslationStatus(locale);
                        const lt = localTranslations[locale];
                        const remoteT = post?.translations?.[locale];

                        return (
                            <div className="space-y-3">
                                {/* Status + retry */}
                                <div className="flex items-center gap-2">
                                    <TranslationBadge status={tStatus} />
                                    {tStatus === "error" && (
                                        <>
                                            <span
                                                className="text-xs"
                                                style={{ color: "rgba(220,100,100,0.7)", fontFamily: "var(--font-mono)" }}
                                            >
                                                {remoteT?.errorMessage}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => handleRetryTranslation(locale)}
                                                disabled={isTranslating}
                                                className="sc-btn-outline text-xs rounded border px-2 py-0.5 disabled:cursor-not-allowed disabled:opacity-40"
                                                style={{
                                                    fontSize: "0.65rem",
                                                    borderColor: "rgba(240,165,0,0.4)",
                                                    color: "rgba(240,165,0,0.8)",
                                                }}
                                            >
                                                ↺ Retry
                                            </button>
                                        </>
                                    )}
                                    {tStatus === "generating" && (
                                        <span
                                            className="text-xs"
                                            style={{ color: "rgba(240,165,0,0.7)", fontFamily: "var(--font-mono)" }}
                                        >
                                            AI is translating…
                                        </span>
                                    )}
                                    {(tStatus === "ready" || tStatus === "edited") && (
                                        <span
                                            className="text-xs"
                                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                        >
                                            Manual edits are preserved on regenerate.
                                        </span>
                                    )}
                                </div>

                                {/* Translation title */}
                                <div>
                                    <label
                                        className="mb-1 block text-[10px] uppercase tracking-[0.2em]"
                                        style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}
                                    >
                                        {LOCALE_NAMES[locale]} Title
                                    </label>
                                    <input
                                        type="text"
                                        value={lt?.title ?? remoteT?.title ?? ""}
                                        onChange={(e) => setLocalTranslations((prev) => ({
                                            ...prev,
                                            [locale]: { title: e.target.value, body: prev[locale]?.body ?? remoteT?.body ?? "", dirty: true },
                                        }))}
                                        placeholder="Translated title…"
                                        className="sc-input w-full text-sm"
                                        disabled={tStatus === "generating"}
                                    />
                                </div>

                                {/* Translation body */}
                                <div>
                                    <label
                                        className="mb-1 block text-[10px] uppercase tracking-[0.2em]"
                                        style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}
                                    >
                                        {LOCALE_NAMES[locale]} Body
                                    </label>
                                    <textarea
                                        value={lt?.body ?? remoteT?.body ?? ""}
                                        onChange={(e) => setLocalTranslations((prev) => ({
                                            ...prev,
                                            [locale]: { title: prev[locale]?.title ?? remoteT?.title ?? "", body: e.target.value, dirty: true },
                                        }))}
                                        rows={8}
                                        placeholder="Translated body…"
                                        className="sc-input w-full resize-y text-sm font-mono"
                                        disabled={tStatus === "generating"}
                                    />
                                </div>

                                {lt?.dirty && (
                                    <div className="flex justify-end">
                                        <button
                                            type="button"
                                            onClick={() => handleSaveTranslation(locale)}
                                            disabled={isSaving}
                                            className="sc-btn text-xs"
                                            style={{
                                                fontSize: "0.7rem",
                                                padding: "0.3rem 0.75rem",
                                                background: "rgba(79,195,220,0.12)",
                                                borderColor: "rgba(79,195,220,0.4)",
                                                color: "rgba(79,195,220,0.9)",
                                            }}
                                        >
                                            {isSaving ? "Saving…" : `Save ${LOCALE_LABELS[locale]} Translation`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })()}
                </section>
            )}

            {/* ── Action buttons ── */}
            <section
                className="hud-panel p-4 sm:p-5"
                style={{ background: "rgba(8,16,24,0.45)" }}
            >
                <div className="flex flex-wrap gap-2">
                    {/* Save Draft */}
                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={isPending || isSaving}
                        className="sc-btn"
                        style={{
                            background: "rgba(79,195,220,0.1)",
                            borderColor: "rgba(79,195,220,0.35)",
                            color: "rgba(79,195,220,0.9)",
                        }}
                    >
                        {isSaving ? "Saving…" : "Save Draft"}
                    </button>

                    {isEditing && post!.status !== "published" && post!.status !== "archived" && post!.status !== "ready_to_publish" && (
                        <button
                            type="button"
                            onClick={handleMarkReady}
                            disabled={isPending}
                            className="sc-btn sc-btn-outline"
                        >
                            Mark Ready
                        </button>
                    )}

                    {isEditing && (post!.status === "draft" || post!.status === "ready_to_publish" || post!.status === "translation_pending") && (
                        <button
                            type="button"
                            onClick={() => setShowPublishDialog(true)}
                            disabled={isPending}
                            className="sc-btn"
                            style={{
                                background: "rgba(80,210,120,0.12)",
                                borderColor: "rgba(80,210,120,0.4)",
                                color: "rgba(80,210,120,0.9)",
                            }}
                        >
                            Publish
                        </button>
                    )}

                    {isEditing && post!.status === "published" && (
                        <button
                            type="button"
                            onClick={() => setShowPublishDialog(true)}
                            disabled={isPending}
                            className="sc-btn sc-btn-outline"
                            style={{
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.65rem",
                                borderColor: "rgba(79,195,220,0.3)",
                                color: "rgba(79,195,220,0.8)",
                            }}
                        >
                            Update Discord
                        </button>
                    )}

                    {isEditing && post!.status === "published" && (
                        <button
                            type="button"
                            onClick={handleArchive}
                            disabled={isPending}
                            className="sc-btn sc-btn-outline"
                            style={{
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.65rem",
                                borderColor: "rgba(200,220,232,0.2)",
                                color: "rgba(200,220,232,0.5)",
                            }}
                        >
                            Archive
                        </button>
                    )}

                    {isEditing && post!.status === "archived" && (
                        <button
                            type="button"
                            onClick={handleRestore}
                            disabled={isPending}
                            className="sc-btn sc-btn-outline"
                        >
                            Restore to Draft
                        </button>
                    )}

                    {isEditing && (
                        <button
                            type="button"
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={isPending}
                            className="sc-btn sc-btn-outline ml-auto"
                            style={{
                                fontSize: "0.75rem",
                                padding: "0.25rem 0.65rem",
                                borderColor: "rgba(220,60,60,0.3)",
                                color: "rgba(220,100,100,0.7)",
                            }}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </section>

            {/* ── Publish dialog ── */}
            <dialog
                ref={publishDialogRef}
                onClose={() => setShowPublishDialog(false)}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(80,210,120,0.25)",
                    background: "rgba(6,12,18,0.96)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                }}
            >
                <div className="p-5 sm:p-6 space-y-4">
                    <h2
                        className="text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "rgba(80,210,120,0.9)", fontFamily: "var(--font-display)" }}
                    >
                        {post?.status === "published" ? "Update Discord Embed" : "Publish Post"}
                    </h2>

                    {hasMissingTranslations && post?.status !== "published" && (
                        <p
                            className="text-xs rounded border px-3 py-2"
                            style={{
                                borderColor: "rgba(240,165,0,0.3)",
                                background: "rgba(240,165,0,0.06)",
                                color: "rgba(240,165,0,0.8)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            ⚠ Some translations are still missing. Post will include only available languages.
                        </p>
                    )}

                    {hasDiscord && (
                        <div>
                            <p
                                className="mb-2 text-[10px] uppercase tracking-[0.2em]"
                                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                Discord
                            </p>
                            <label className="flex cursor-pointer items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={postToDiscord}
                                    onChange={(e) => setPostToDiscord(e.target.checked)}
                                    className="rounded"
                                />
                                <span
                                    className="text-sm"
                                    style={{ color: "rgba(200,220,232,0.75)", fontFamily: "var(--font-mono)" }}
                                >
                                    {post?.status === "published"
                                        ? "Update Discord embed now"
                                        : "Post to Discord now"}
                                </span>
                            </label>
                            {postToDiscord && post?.discord?.messageId && post.status === "published" && (
                                <p
                                    className="mt-1 text-[10px]"
                                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                >
                                    Will edit existing Discord message.
                                </p>
                            )}
                        </div>
                    )}

                    {!hasDiscord && (
                        <p
                            className="text-xs"
                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                        >
                            Discord not configured — configure it in the news list page.
                        </p>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setShowPublishDialog(false)}
                            className="sc-btn sc-btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handlePublish}
                            disabled={isPending}
                            className="sc-btn"
                            style={{
                                background: "rgba(80,210,120,0.12)",
                                borderColor: "rgba(80,210,120,0.4)",
                                color: "rgba(80,210,120,0.9)",
                            }}
                        >
                            {isPending ? "Publishing…" : post?.status === "published" ? "Update" : "Publish"}
                        </button>
                    </div>
                </div>
            </dialog>

            {/* ── Delete confirm dialog ── */}
            <dialog
                ref={deleteDialogRef}
                onClose={() => setShowDeleteDialog(false)}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(220,60,60,0.25)",
                    background: "rgba(6,12,18,0.96)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                }}
            >
                <div className="p-5 space-y-4">
                    <h2
                        className="text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "rgba(220,100,100,0.9)", fontFamily: "var(--font-display)" }}
                    >
                        Delete Post
                    </h2>
                    <p
                        className="text-sm"
                        style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}
                    >
                        &quot;{post?.title}&quot; will be permanently removed.
                    </p>
                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => setShowDeleteDialog(false)} className="sc-btn sc-btn-outline">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="sc-btn"
                            style={{
                                background: "rgba(220,60,60,0.12)",
                                borderColor: "rgba(220,60,60,0.4)",
                                color: "rgba(220,100,100,0.9)",
                            }}
                        >
                            {isPending ? "Deleting…" : "Delete"}
                        </button>
                    </div>
                </div>
            </dialog>
        </div>
    );
}
