import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { startDiscordBot } from "@/lib/discord/bot/start-discord-bot";

startDiscordBot().catch((error) => {
    console.error("[discord-bot] Startup failed", error);
});

const orbitron = Orbitron({
    variable: "--font-orbitron",
    subsets: ["latin"],
    weight: ["400", "500", "600", "700", "900"],
});

const rajdhani = Rajdhani({
    variable: "--font-rajdhani",
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
    title: {
        template: "%s | SC Orga",
        default: "SC Orga — Inventory Management",
    },
    description:
        "Inventory management platform for Star Citizen organizations. Track stock, manage transactions, and coordinate your crew.",
    keywords: ["Star Citizen", "organization", "inventory", "management", "UEC", "trading"],
    openGraph: {
        title: "SC Orga — Inventory Management",
        description:
            "Inventory management platform for Star Citizen organizations. Track stock, manage transactions, and coordinate your crew.",
        type: "website",
        siteName: "SC Orga",
    },
    twitter: {
        card: "summary",
        title: "SC Orga — Inventory Management",
        description:
            "Inventory management platform for Star Citizen organizations.",
    },
    icons: {
        icon: "/icon.svg",
    },
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const locale = await getLocale();
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className={`${orbitron.variable} ${rajdhani.variable} antialiased`}>
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
