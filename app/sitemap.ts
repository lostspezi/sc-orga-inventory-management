import type { MetadataRoute } from "next";
import { getAllPublishedAppNews } from "@/lib/repositories/app-news-repository";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scoim.io";
    const now = new Date();

    const published = await getAllPublishedAppNews(500);
    const newsEntries: MetadataRoute.Sitemap = published.map((p) => ({
        url: `${appUrl}/news/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
    }));

    return [
        {
            url: appUrl,
            lastModified: now,
            changeFrequency: "weekly",
            priority: 1.0,
        },
        {
            url: `${appUrl}/login`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.3,
        },
        {
            url: `${appUrl}/news`,
            lastModified: now,
            changeFrequency: "daily",
            priority: 0.8,
        },
        ...newsEntries,
        // /invite/[token] intentionally omitted — tokens are private invite links
        {
            url: `${appUrl}/legal/privacy`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${appUrl}/legal/terms`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${appUrl}/legal/imprint`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.2,
        },
        {
            url: `${appUrl}/legal/cookies`,
            lastModified: now,
            changeFrequency: "yearly",
            priority: 0.2,
        },
    ];
}
