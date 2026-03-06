import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
    async headers() {
        return [
            {
                source: "/(.*)",
                headers: [
                    { key: "X-Content-Type-Options", value: "nosniff" },
                    { key: "X-Frame-Options", value: "DENY" },
                    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
                    { key: "Permissions-Policy", value: "geolocation=(), microphone=(), camera=()" },
                    ...(process.env.NEXT_PUBLIC_APP_URL?.includes("localhost") ||
                        process.env.VERCEL_ENV === "preview"
                        ? [{ key: "X-Robots-Tag", value: "noindex, nofollow" }]
                        : []),
                ],
            },
        ];
    },
    serverExternalPackages: [
        "discord.js",
        "@discordjs/ws",
        "node-cron",
        "@react-pdf/renderer",
        "canvas",
    ],
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "cdn.discordapp.com",
                pathname: "/icons/**",
            },
            {
                protocol: "https",
                hostname: "cdn.discordapp.com",
                pathname: "/avatars/**",
            },
            {
                protocol: "https",
                hostname: "cdn.discordapp.com",
                pathname: "/embed/avatars/**",
            },
        ],
    },
};

export default withNextIntl(nextConfig);
