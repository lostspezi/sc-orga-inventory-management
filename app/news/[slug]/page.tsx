import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import {
    getPublishedAppNewsBySlug,
    getAllPublishedAppNews,
    toAppNewsPublicView,
} from "@/lib/repositories/app-news-repository";
import type { NewsLocale } from "@/lib/types/app-news";
import { stripMarkdown } from "@/lib/utils/strip-markdown";
import NewsMarkdownBody from "@/components/news/news-markdown-body";
import ShareButtons from "@/components/news/share-buttons";

export const revalidate = 3600;

export async function generateStaticParams() {
    const posts = await getAllPublishedAppNews(100);
    return posts.filter((p) => p.slug).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const doc = await getPublishedAppNewsBySlug(slug);
    if (!doc) return { title: "Not Found" };

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scoim.io";
    const excerpt = stripMarkdown(doc.body).slice(0, 160);

    return {
        title: doc.title,
        description: excerpt,
        robots: { index: true, follow: true },
        alternates: { canonical: `${appUrl}/news/${slug}` },
        openGraph: {
            type: "article" as const,
            title: doc.title,
            description: excerpt,
            url: `${appUrl}/news/${slug}`,
            publishedTime: doc.publishedAt?.toISOString(),
            siteName: "SC Orga Manager",
        },
        twitter: {
            card: "summary_large_image" as const,
            title: doc.title,
            description: excerpt,
        },
    };
}

function formatDate(date: Date) {
    return date.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric",
    });
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const doc = await getPublishedAppNewsBySlug(slug);

    if (!doc) notFound();

    let locale: NewsLocale;
    try {
        locale = (await getLocale()) as NewsLocale;
    } catch {
        locale = doc.primaryLocale;
    }

    const post = toAppNewsPublicView(doc, locale);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scoim.io";
    const excerpt = stripMarkdown(doc.body).slice(0, 160);
    const pageUrl = `${appUrl}/news/${slug}`;

    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: doc.title,
        datePublished: doc.publishedAt?.toISOString(),
        dateModified: doc.updatedAt.toISOString(),
        author: { "@type": "Organization", name: "SC Orga Manager" },
        publisher: { "@type": "Organization", name: "SC Orga Manager", url: appUrl },
        mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
        description: excerpt,
    };

    return (
        <div className="relative min-h-screen" style={{ background: "var(--background)" }}>
            <div className="scan-overlay" />
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                 
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className="relative z-10 mx-auto max-w-2xl px-6 py-16 sm:px-10">

                {/* Back */}
                <Link
                    href="/news"
                    className="mb-8 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] transition-opacity hover:opacity-70"
                    style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 12H5M12 5l-7 7 7 7" />
                    </svg>
                    All news
                </Link>

                {/* Article header */}
                <div
                    className="hud-panel mb-8 p-6"
                    style={{ background: "rgba(8,16,24,0.6)" }}
                >
                    <div
                        className="absolute left-6 right-6 top-0 h-px"
                        style={{
                            background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.35), transparent)",
                        }}
                    />
                    <p
                        className="mb-2 text-[11px]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        {formatDate(doc.publishedAt!)}
                    </p>
                    <h1
                        className="text-2xl font-black uppercase leading-tight tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {post.title}
                    </h1>
                </div>

                {/* Body */}
                <div
                    className="hud-panel mb-8 p-6"
                    style={{ background: "rgba(8,16,24,0.4)" }}
                >
                    <NewsMarkdownBody body={post.body} />
                </div>

                {/* Share */}
                <div
                    className="hud-panel p-5"
                    style={{ background: "rgba(8,16,24,0.3)" }}
                >
                    <ShareButtons title={post.title} url={pageUrl} />
                </div>
            </div>
        </div>
    );
}
