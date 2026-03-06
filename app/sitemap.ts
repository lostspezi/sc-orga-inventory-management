import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scoim.io";
    const now = new Date();

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
        // /invite/[token] intentionally omitted — tokens are private invite links
    ];
}
