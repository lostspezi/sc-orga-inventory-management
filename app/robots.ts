import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scoim.io";

    return {
        rules: [
            {
                userAgent: "*",
                allow: ["/", "/login", "/invite/", "/legal/", "/news/"],
                disallow: ["/terminal/", "/api/"],
            },
        ],
        sitemap: `${appUrl}/sitemap.xml`,
    };
}
