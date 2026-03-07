import Link from "next/link";
import { getAllAppNews, toAppNewsView } from "@/lib/repositories/app-news-repository";
import { getOrCreateNewsSettings, toNewsSettingsView } from "@/lib/repositories/app-news-settings-repository";
import { DeleteNewsButton } from "@/components/admin/news-admin-panel";
import NewsSettingsCard from "@/components/admin/news-settings-card";
import type { NewsStatus } from "@/lib/types/app-news";

export const metadata = { title: "Admin · News" };

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

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export default async function AdminNewsPage() {
    const [docs, settingsDoc] = await Promise.all([
        getAllAppNews(),
        getOrCreateNewsSettings(),
    ]);
    const posts = docs.map(toAppNewsView);
    const settings = toNewsSettingsView(settingsDoc);

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-7xl space-y-4"
                style={{ animation: "slide-in-up 0.45s ease forwards" }}
            >
                {/* Page header */}
                <section
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.55)" }}
                >
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.6), transparent)" }}
                    />
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p
                                className="mb-1 text-xs uppercase tracking-[0.35em]"
                                style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-display)" }}
                            >
                                Super Admin
                            </p>
                            <h1
                                className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                                style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                            >
                                News &amp; Updates
                            </h1>
                            <p
                                className="mt-1 text-sm"
                                style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                            >
                                {posts.length} {posts.length === 1 ? "post" : "posts"} total
                            </p>
                        </div>
                        <div className="shrink-0 pt-1">
                            <Link href="/terminal/admin/news/new" className="sc-btn">
                                New Post
                            </Link>
                        </div>
                    </div>
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.2), transparent)" }}
                    />
                </section>

                {/* Posts list */}
                <section
                    className="hud-panel overflow-hidden"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    {posts.length === 0 ? (
                        <p
                            className="p-6 text-sm"
                            style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                        >
                            No posts yet. Create the first one.
                        </p>
                    ) : (
                        <ul className="divide-y" style={{ borderColor: "rgba(79,195,220,0.08)" }}>
                            {posts.map((post) => (
                                <li
                                    key={post._id}
                                    className="flex items-start gap-4 px-5 py-4"
                                >
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                            <p
                                                className="truncate text-sm font-semibold uppercase tracking-[0.06em]"
                                                style={{
                                                    color: "rgba(200,220,232,0.85)",
                                                    fontFamily: "var(--font-display)",
                                                }}
                                            >
                                                {post.title}
                                            </p>
                                            <span
                                                className="shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.2em]"
                                                style={{
                                                    background: STATUS_COLORS[post.status],
                                                    color: "rgba(6,12,18,0.9)",
                                                    fontFamily: "var(--font-mono)",
                                                }}
                                            >
                                                {STATUS_LABELS[post.status]}
                                            </span>
                                        </div>
                                        <p
                                            className="text-[11px]"
                                            style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {post.publishedAt ? formatDate(post.publishedAt) : formatDate(post.createdAt)} · {post.primaryLocale.toUpperCase()}
                                        </p>
                                        <p
                                            className="mt-1.5 line-clamp-2 text-xs"
                                            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                                        >
                                            {post.body}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <Link
                                            href={`/terminal/admin/news/${post._id}/edit`}
                                            className="sc-btn sc-btn-outline"
                                            style={{ fontSize: "0.75rem", padding: "0.25rem 0.65rem" }}
                                        >
                                            Edit
                                        </Link>
                                        <DeleteNewsButton postId={post._id} postTitle={post.title} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {/* Discord settings */}
                <NewsSettingsCard initialSettings={settings} />
            </div>
        </main>
    );
}
