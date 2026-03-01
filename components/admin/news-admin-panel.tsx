"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { AppNewsView } from "@/lib/types/app-news";
import {
    createAppNewsAction,
    updateAppNewsAction,
    deleteAppNewsAction,
} from "@/lib/actions/app-news-actions";

/* ── Shared dialog shell ── */

function DialogShell({
    dialogRef,
    title,
    onClose,
    children,
}: {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}) {
    const t = useTranslations("news.admin");
    const tc = useTranslations("common");

    return (
        <dialog
            ref={dialogRef}
            className="fixed left-1/2 top-1/2 m-0 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
            style={{
                borderColor: "rgba(240,165,0,0.25)",
                background: "rgba(6,12,18,0.96)",
                boxShadow: "0 0 40px rgba(0,0,0,0.5)",
            }}
        >
            <div className="relative p-5 sm:p-6">
                <div
                    className="absolute left-6 right-6 top-0 h-px"
                    style={{
                        background:
                            "linear-gradient(90deg, transparent, rgba(240,165,0,0.5), transparent)",
                    }}
                />

                <div className="mb-5 flex items-start justify-between gap-3">
                    <div>
                        <p
                            className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                            style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("label")}
                        </p>
                        <h2
                            className="text-lg font-semibold uppercase tracking-[0.08em]"
                            style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                        >
                            {title}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-md border px-2.5 py-1 text-xs"
                        style={{
                            borderColor: "rgba(79,195,220,0.2)",
                            color: "rgba(200,220,232,0.6)",
                            fontFamily: "var(--font-mono)",
                            background: "rgba(79,195,220,0.04)",
                        }}
                    >
                        {tc("close").toUpperCase()}
                    </button>
                </div>

                {children}
            </div>
        </dialog>
    );
}

/* ── Shared form fields ── */

function NewsForm({
    defaultTitle,
    defaultBody,
    isPending,
    error,
    onSubmit,
    onCancel,
    submitLabel,
}: {
    defaultTitle?: string;
    defaultBody?: string;
    isPending: boolean;
    error: string | null;
    onSubmit: (formData: FormData) => void;
    onCancel: () => void;
    submitLabel: string;
}) {
    const t = useTranslations("news.admin");
    const tc = useTranslations("common");

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                onSubmit(new FormData(e.currentTarget));
            }}
            className="space-y-4"
        >
            <div>
                <label
                    htmlFor="news-title"
                    className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    {t("titleLabel")}
                </label>
                <input
                    id="news-title"
                    name="title"
                    type="text"
                    required
                    defaultValue={defaultTitle}
                    className="sc-input w-full"
                    placeholder={t("titlePlaceholder")}
                />
            </div>

            <div>
                <label
                    htmlFor="news-body"
                    className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    {t("bodyLabel")}
                </label>
                <textarea
                    id="news-body"
                    name="body"
                    required
                    defaultValue={defaultBody}
                    rows={6}
                    className="sc-input w-full resize-y"
                    placeholder={t("bodyPlaceholder")}
                />
            </div>

            {error && (
                <p
                    className="text-sm"
                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}
                >
                    {error}
                </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
                <button
                    type="button"
                    onClick={onCancel}
                    className="sc-btn sc-btn-outline"
                >
                    {tc("cancel")}
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="sc-btn"
                    style={{
                        background: isPending ? "rgba(240,165,0,0.3)" : "rgba(240,165,0,0.15)",
                        borderColor: "rgba(240,165,0,0.4)",
                        color: "rgba(240,165,0,0.9)",
                    }}
                >
                    {isPending ? tc("saving") : submitLabel}
                </button>
            </div>
        </form>
    );
}

/* ── Create dialog ── */

export function CreateNewsDialog() {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const router = useRouter();
    const t = useTranslations("news.admin");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const open = () => {
        setError(null);
        dialogRef.current?.showModal();
    };

    const close = () => {
        dialogRef.current?.close();
        setError(null);
    };

    const handleSubmit = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await createAppNewsAction(formData);
            if (!result.success) {
                setError(result.message);
                return;
            }
            dialogRef.current?.close();
            router.refresh();
        });
    };

    return (
        <>
            <button type="button" onClick={open} className="sc-btn">
                {t("newPost")}
            </button>

            <DialogShell dialogRef={dialogRef} title={t("createTitle")} onClose={close}>
                <NewsForm
                    isPending={isPending}
                    error={error}
                    onSubmit={handleSubmit}
                    onCancel={close}
                    submitLabel={t("createPost")}
                />
            </DialogShell>
        </>
    );
}

/* ── Edit dialog ── */

export function EditNewsDialog({ post }: { post: AppNewsView }) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const router = useRouter();
    const t = useTranslations("news.admin");
    const tc = useTranslations("common");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const open = () => {
        setError(null);
        dialogRef.current?.showModal();
    };

    const close = () => {
        dialogRef.current?.close();
        setError(null);
    };

    const handleSubmit = (formData: FormData) => {
        setError(null);
        startTransition(async () => {
            const result = await updateAppNewsAction(post._id.toString(), formData);
            if (!result.success) {
                setError(result.message);
                return;
            }
            dialogRef.current?.close();
            router.refresh();
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={open}
                className="sc-btn sc-btn-outline"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}
            >
                {tc("edit")}
            </button>

            <DialogShell dialogRef={dialogRef} title={t("editTitle")} onClose={close}>
                <NewsForm
                    defaultTitle={post.title}
                    defaultBody={post.body}
                    isPending={isPending}
                    error={error}
                    onSubmit={handleSubmit}
                    onCancel={close}
                    submitLabel={t("saveChanges")}
                />
            </DialogShell>
        </>
    );
}

/* ── Delete button with confirm dialog ── */

export function DeleteNewsButton({ post }: { post: AppNewsView }) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const router = useRouter();
    const t = useTranslations("news.admin");
    const tc = useTranslations("common");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const open = () => {
        setError(null);
        dialogRef.current?.showModal();
    };

    const close = () => {
        dialogRef.current?.close();
        setError(null);
    };

    const handleDelete = () => {
        setError(null);
        startTransition(async () => {
            const result = await deleteAppNewsAction(post._id.toString());
            if (!result.success) {
                setError(result.message);
                return;
            }
            dialogRef.current?.close();
            router.refresh();
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={open}
                className="sc-btn sc-btn-outline"
                style={{
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.65rem",
                    borderColor: "rgba(220,60,60,0.35)",
                    color: "rgba(220,100,100,0.85)",
                }}
            >
                {tc("delete")}
            </button>

            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(220,60,60,0.25)",
                    background: "rgba(6,12,18,0.96)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                }}
            >
                <div className="p-5 sm:p-6 space-y-4">
                    <div>
                        <p
                            className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                            style={{ color: "rgba(220,60,60,0.6)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("confirmDelete")}
                        </p>
                        <h2
                            className="text-base font-semibold uppercase tracking-[0.08em]"
                            style={{ color: "rgba(220,100,100,0.9)", fontFamily: "var(--font-display)" }}
                        >
                            {t("deleteTitle")}
                        </h2>
                        <p
                            className="mt-2 text-sm"
                            style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("deleteWarning", { title: post.title })}
                        </p>
                    </div>

                    {error && (
                        <p
                            className="text-sm"
                            style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}
                        >
                            {error}
                        </p>
                    )}

                    <div className="flex justify-end gap-2">
                        <button type="button" onClick={close} className="sc-btn sc-btn-outline">
                            {tc("cancel")}
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="sc-btn"
                            style={{
                                background: isPending ? "rgba(220,60,60,0.2)" : "rgba(220,60,60,0.12)",
                                borderColor: "rgba(220,60,60,0.4)",
                                color: "rgba(220,100,100,0.9)",
                            }}
                        >
                            {isPending ? tc("deleting") : tc("delete")}
                        </button>
                    </div>
                </div>
            </dialog>
        </>
    );
}
