import { getTranslations } from "next-intl/server";
import { getAllAppNews } from "@/lib/repositories/app-news-repository";
import type { AppNewsView } from "@/lib/types/app-news";
import {
    CreateNewsDialog,
    EditNewsDialog,
    DeleteNewsButton,
} from "@/components/admin/news-admin-panel";

export const metadata = { title: "Admin · News" };

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });
}

export default async function AdminNewsPage() {
    const t = await getTranslations("news.admin");
    const docs = await getAllAppNews();
    const posts: AppNewsView[] = docs.map((p) => ({
        _id: p._id.toString(),
        title: p.title,
        body: p.body,
        publishedAt: p.publishedAt.toISOString(),
    }));

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
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.6), transparent)",
                        }}
                    />
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p
                                className="mb-1 text-xs uppercase tracking-[0.35em]"
                                style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-display)" }}
                            >
                                {t("superAdmin")}
                            </p>
                            <h1
                                className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                                style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                            >
                                {t("title")}
                            </h1>
                            <p
                                className="mt-1 text-sm"
                                style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                            >
                                {t("published", { count: posts.length })}
                            </p>
                        </div>
                        <div className="shrink-0 pt-1">
                            <CreateNewsDialog />
                        </div>
                    </div>
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.2), transparent)",
                        }}
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
                            {t("noPosts")}
                        </p>
                    ) : (
                        <ul className="divide-y" style={{ borderColor: "rgba(79,195,220,0.08)" }}>
                            {posts.map((post) => (
                                <li
                                    key={post._id.toString()}
                                    className="flex items-start gap-4 px-5 py-4"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p
                                            className="truncate text-sm font-semibold uppercase tracking-[0.06em]"
                                            style={{
                                                color: "rgba(200,220,232,0.85)",
                                                fontFamily: "var(--font-display)",
                                            }}
                                        >
                                            {post.title}
                                        </p>
                                        <p
                                            className="mt-0.5 text-[11px]"
                                            style={{
                                                color: "rgba(79,195,220,0.45)",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {formatDate(post.publishedAt)}
                                        </p>
                                        <p
                                            className="mt-1.5 line-clamp-2 text-xs"
                                            style={{
                                                color: "rgba(200,220,232,0.45)",
                                                fontFamily: "var(--font-mono)",
                                            }}
                                        >
                                            {post.body}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 items-center gap-2">
                                        <EditNewsDialog post={post} />
                                        <DeleteNewsButton post={post} />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </main>
    );
}
