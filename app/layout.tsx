import type { Metadata, Viewport } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";
import { startDiscordBot } from "@/lib/discord/bot/start-discord-bot";
import { startGoogleSheetAutoSync } from "@/lib/google-sheets/auto-sync-scheduler";

startDiscordBot().catch((error) => {
    console.error("[discord-bot] Startup failed", error);
});
startGoogleSheetAutoSync();

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

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://scoim.io";

const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SC Orga Manager",
    url: appUrl,
};

const softwareAppSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SC Orga Manager",
    url: appUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
        "Inventory management and trading coordination platform for Star Citizen organizations.",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "EUR",
        description: "Free plan available. PRO plan at €4.99/month.",
    },
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
};

export const metadata: Metadata = {
    metadataBase: new URL(appUrl),
    title: {
        template: "%s | SC Orga Manager",
        default: "SC Orga Manager — Star Citizen Organization Inventory",
    },
    description:
        "The command hub for Star Citizen organizations. Manage inventory, coordinate trades, automate reports, and run your crew — all in one place.",
    keywords: ["Star Citizen", "organization", "inventory management", "trading", "aUEC", "org manager", "scoim"],
    authors: [{ name: "SC Orga Manager" }],
    creator: "SC Orga Manager",
    openGraph: {
        title: "SC Orga Manager — Star Citizen Organization Inventory",
        description:
            "The command hub for Star Citizen organizations. Manage inventory, coordinate trades, automate reports, and run your crew.",
        url: "/",
        type: "website",
        siteName: "SC Orga Manager",
        images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "SC Orga Manager" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "SC Orga Manager — Star Citizen Organization Inventory",
        description:
            "The command hub for Star Citizen organizations. Manage inventory, trades, and reports.",
        images: ["/opengraph-image"],
    },
    icons: {
        icon: "/icon.svg",
        shortcut: "/icon.svg",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true },
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
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareAppSchema) }}
                />
            </head>
            <body className={`${orbitron.variable} ${rajdhani.variable} antialiased`}>
                <NextIntlClientProvider messages={messages}>
                    {children}
                </NextIntlClientProvider>
            </body>
        </html>
    );
}
