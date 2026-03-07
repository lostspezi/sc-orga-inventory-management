"use client";

import { useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import type { AppNewsPublicView } from "@/lib/types/app-news";

type Props = {
    posts: AppNewsPublicView[];
    updatesLabel: string;
    closeLabel: string;
};

function formatDate(isoDate: string) {
    return new Date(isoDate).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export default function NewsFeed({ posts, updatesLabel, closeLabel }: Props) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const [activePost, setActivePost] = useState<AppNewsPublicView | null>(null);

    if (posts.length === 0) return null;

    const open = (post: AppNewsPublicView) => {
        setActivePost(post);
        dialogRef.current?.showModal();
    };

    const close = () => {
        dialogRef.current?.close();
    };

    return (
        <>
            <div>
                <p
                    className="mb-2 text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {updatesLabel}
                </p>
                <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3">
                    {posts.map((post) => (
                        <button
                            key={post._id}
                            type="button"
                            onClick={() => open(post)}
                            className="hud-panel w-[min(16rem,80vw)] shrink-0 cursor-pointer p-4 text-left transition-colors hover:brightness-125 sm:w-auto"
                            style={{ background: "rgba(8,16,24,0.45)" }}
                        >
                            <p
                                className="truncate text-sm font-semibold uppercase tracking-[0.06em]"
                                style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                            >
                                {post.title}
                            </p>
                            <p
                                className="mt-1 text-[11px]"
                                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                {formatDate(post.publishedAt)}
                            </p>
                        </button>
                    ))}
                </div>
            </div>

            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(79,195,220,0.2)",
                    background: "rgba(6,12,18,0.97)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.5)",
                }}
            >
                {activePost && (
                    <div className="relative max-h-[90dvh] overflow-y-auto p-5 sm:p-6">
                        <div
                            className="absolute left-6 right-6 top-0 h-px"
                            style={{
                                background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.35), transparent)",
                            }}
                        />

                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                                <p
                                    className="mb-1 text-[11px]"
                                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                                >
                                    {formatDate(activePost.publishedAt)}
                                </p>
                                <h2
                                    className="text-lg font-semibold uppercase tracking-[0.08em]"
                                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                                >
                                    {activePost.title}
                                </h2>
                            </div>

                            <button
                                type="button"
                                onClick={close}
                                className="cursor-pointer rounded-md border px-2.5 py-1 text-xs shrink-0"
                                style={{
                                    borderColor: "rgba(79,195,220,0.2)",
                                    color: "rgba(200,220,232,0.6)",
                                    fontFamily: "var(--font-mono)",
                                    background: "rgba(79,195,220,0.04)",
                                }}
                            >
                                {closeLabel.toUpperCase()}
                            </button>
                        </div>

                        <div
                            className="prose prose-invert prose-sm max-w-none"
                            style={{ color: "rgba(200,220,232,0.75)" }}
                        >
                            <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                rehypePlugins={[rehypeSanitize]}
                            >
                                {activePost.body}
                            </ReactMarkdown>
                        </div>
                    </div>
                )}
            </dialog>
        </>
    );
}
