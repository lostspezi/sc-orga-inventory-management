import Link from "next/link";
import { getLocale } from "next-intl/server";
import {
    getLatestPublishedAppNews,
    toAppNewsPublicView,
} from "@/lib/repositories/app-news-repository";
import type { NewsLocale } from "@/lib/types/app-news";
import { stripMarkdown } from "@/lib/utils/strip-markdown";

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export default async function HomeNewsFeed() {
    const [docs, locale] = await Promise.all([
        getLatestPublishedAppNews(3),
        getLocale(),
    ]);

    if (docs.length === 0) return null;

    const posts = docs.map((d) => toAppNewsPublicView(d, locale as NewsLocale));

    return (
        <section className="px-6 pb-20 sm:px-10">
            <div className="mx-auto max-w-5xl">
                <div className="mb-6 flex items-center gap-4">
                    <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.15))" }} />
                    <span
                        className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        Latest Updates
                    </span>
                    <div className="h-px flex-1" style={{ background: "linear-gradient(90deg, rgba(79,195,220,0.15), transparent)" }} />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {posts.map((post) => {
                        const excerpt = stripMarkdown(post.body).slice(0, 120);
                        return (
                            <Link
                                key={post._id}
                                href={`/news/${post.slug}`}
                                className="hud-panel block p-5 transition-colors hover:brightness-125"
                                style={{ background: "rgba(8,16,24,0.45)" }}
                            >
                                <p
                                    className="mb-1 text-[11px]"
                                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                                >
                                    {formatDate(post.publishedAt)}
                                </p>
                                <h3
                                    className="mb-2 truncate text-sm font-semibold uppercase tracking-[0.06em]"
                                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                                >
                                    {post.title}
                                </h3>
                                {excerpt && (
                                    <p
                                        className="line-clamp-2 text-[12px] leading-relaxed"
                                        style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-ui)" }}
                                    >
                                        {excerpt}
                                    </p>
                                )}
                                <p
                                    className="mt-3 text-[11px] uppercase tracking-[0.12em]"
                                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                                >
                                    Read more →
                                </p>
                            </Link>
                        );
                    })}
                </div>

                <div className="mt-4 text-right">
                    <Link
                        href="/news"
                        className="text-[11px] uppercase tracking-[0.15em] transition-colors hover:opacity-80"
                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                    >
                        View all news →
                    </Link>
                </div>
            </div>
        </section>
    );
}
