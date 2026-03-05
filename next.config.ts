import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
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
