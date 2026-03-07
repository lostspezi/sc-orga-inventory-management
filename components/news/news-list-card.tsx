import Link from "next/link";
import type { AppNewsPublicView } from "@/lib/types/app-news";
import { stripMarkdown } from "@/lib/utils/strip-markdown";

type Props = {
    post: AppNewsPublicView;
};

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export default function NewsListCard({ post }: Props) {
    const excerpt = stripMarkdown(post.body).slice(0, 160);

    return (
        <Link
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
            <h2
                className="mb-2 truncate text-sm font-semibold uppercase tracking-[0.06em]"
                style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
            >
                {post.title}
            </h2>
            {excerpt && (
                <p
                    className="line-clamp-2 text-[12px] leading-relaxed"
                    style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-ui)" }}
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
}
