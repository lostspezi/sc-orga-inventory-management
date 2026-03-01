import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    serverExternalPackages: ["discord.js", "@discordjs/ws"],
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

export default nextConfig;
