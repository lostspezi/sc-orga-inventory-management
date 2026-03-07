import Link from "next/link";
import { getLocale } from "next-intl/server";
import {
    getAllPublishedAppNews,
    countPublishedAppNews,
    toAppNewsPublicView,
} from "@/lib/repositories/app-news-repository";
import type { NewsLocale } from "@/lib/types/app-news";
import NewsListCard from "@/components/news/news-list-card";

export const revalidate = 3600;

export async function generateMetadata() {
    return {
        title: "News",
        description: "Latest updates and announcements from SC Orga Manager.",
        robots: { index: true, follow: true },
        alternates: { canonical: "/news" },
    };
}

const PAGE_SIZE = 10;

export default async function NewsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string }>;
}) {
    const { page: pageParam } = await searchParams;
    const page = Math.max(1, Number(pageParam ?? 1));

    const [docs, total, locale] = await Promise.all([
        getAllPublishedAppNews(PAGE_SIZE, (page - 1) * PAGE_SIZE),
        countPublishedAppNews(),
        getLocale(),
    ]);

    const posts = docs.map((d) => toAppNewsPublicView(d, locale as NewsLocale));
    const totalPages = Math.ceil(total / PAGE_SIZE);

    return (
        <div className="relative min-h-screen" style={{ background: "var(--background)" }}>
            <div className="scan-overlay" />

            <div className="relative z-10 mx-auto max-w-3xl px-6 py-16 sm:px-10">

                {/* Header */}
                <div className="mb-10">
                    <Link
                        href="/"
                        className="mb-6 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M19 12H5M12 5l-7 7 7 7" />
                        </svg>
                        Home
                    </Link>
                    <h1
                        className="text-3xl font-black uppercase tracking-[0.12em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        News
                    </h1>
                    <p
                        className="mt-2 text-sm"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        {total} post{total !== 1 ? "s" : ""}
                    </p>
                </div>

                {/* Post list */}
                {posts.length === 0 ? (
                    <p
                        className="text-sm"
                        style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                    >
                        No news yet.
                    </p>
                ) : (
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <NewsListCard key={post._id} post={post} />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-10 flex items-center justify-between">
                        {page > 1 ? (
                            <Link
                                href={`/news?page=${page - 1}`}
                                className="sc-btn-outline px-4 py-2 text-xs"
                            >
                                ← Previous
                            </Link>
                        ) : (
                            <span />
                        )}
                        <span
                            className="text-[11px]"
                            style={{ color: "rgba(79,195,220,0.35)", fontFamily: "var(--font-mono)" }}
                        >
                            {page} / {totalPages}
                        </span>
                        {page < totalPages ? (
                            <Link
                                href={`/news?page=${page + 1}`}
                                className="sc-btn-outline px-4 py-2 text-xs"
                            >
                                Next →
                            </Link>
                        ) : (
                            <span />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
