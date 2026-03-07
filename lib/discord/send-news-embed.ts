import { EmbedBuilder } from "discord.js";
import { getDiscordBotClient } from "@/lib/discord/bot/client";
import type { AppNewsView, NewsLocale, DiscordPostResult } from "@/lib/types/app-news";
import type { AppNewsSettingsDocument } from "@/lib/types/app-news-settings";

const LOCALE_FLAGS: Record<NewsLocale, string> = { en: "🇬🇧", de: "🇩🇪", fr: "🇫🇷" };
const LOCALE_LABELS: Record<NewsLocale, string> = { en: "EN", de: "DE", fr: "FR" };
const NEWS_COLOR = 0x4fc3dc;
const MAX_DESC_LENGTH = 4000;
const MAX_PER_LANG = 1200;

function markdownToDiscord(md: string): string {
    return md
        .replace(/^## (.+)$/gm, "**$1**")
        .replace(/^### (.+)$/gm, "__$1__")
        .replace(/^---+$/gm, "");
}

function truncateBody(body: string, maxLen: number, newsId: string, appUrl: string): string {
    if (body.length <= maxLen) return body;
    const suffix = `\n[…Read more](${appUrl}/news/${newsId})`;
    const cutoff = maxLen - suffix.length;
    const spaceIdx = body.lastIndexOf(" ", cutoff);
    return body.slice(0, spaceIdx > 0 ? spaceIdx : cutoff) + suffix;
}

function buildDescription(news: AppNewsView, appUrl: string): string {
    const primary = news.primaryLocale;
    const orderedLocales: NewsLocale[] = [
        primary,
        ...(["en", "de", "fr"] as NewsLocale[]).filter((l) => l !== primary),
    ];

    const sections: string[] = [];

    for (const locale of orderedLocales) {
        let body: string;
        if (locale === primary) {
            body = news.body;
        } else {
            const t = news.translations?.[locale];
            if (!t || t.status === "missing" || t.status === "generating" || t.status === "error") continue;
            body = t.body;
        }

        const discordBody = markdownToDiscord(body);
        const truncated = truncateBody(discordBody, MAX_PER_LANG, news._id, appUrl);
        sections.push(`${LOCALE_FLAGS[locale]} **${LOCALE_LABELS[locale]}**\n${truncated}`);
    }

    let description = sections.join("\n\n");

    // Proportional truncation if total exceeds limit
    if (description.length > MAX_DESC_LENGTH) {
        const headerLen = 8; // "🇬🇧 **EN**\n"
        const perLang = Math.floor((MAX_DESC_LENGTH - headerLen * sections.length - 4 * (sections.length - 1)) / sections.length);
        const trimmed = sections.map((s) => {
            const newlineIdx = s.indexOf("\n");
            if (newlineIdx === -1) return s;
            const header = s.slice(0, newlineIdx);
            const body = s.slice(newlineIdx + 1);
            return `${header}\n${truncateBody(body, Math.max(perLang, 100), news._id, appUrl)}`;
        });
        description = trimmed.join("\n\n");
    }

    return description;
}

export function buildNewsEmbed(news: AppNewsView, appUrl: string): EmbedBuilder {
    const title = news.title.length > 256 ? news.title.slice(0, 253) + "…" : news.title;
    const description = buildDescription(news, appUrl);
    const publishedAt = news.publishedAt ? new Date(news.publishedAt) : new Date();
    const dateLabel = publishedAt.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
    });

    return new EmbedBuilder()
        .setColor(NEWS_COLOR)
        .setAuthor({ name: "SCOIM.io News", iconURL: `${appUrl}/favicon.ico` })
        .setTitle(title)
        .setURL(`${appUrl}/news/${news._id}`)
        .setDescription(description || "No content available.")
        .setFooter({ text: `SCOIM.io · ${dateLabel}` })
        .setTimestamp(publishedAt);
}

export async function sendOrUpdateNewsEmbed(
    news: AppNewsView,
    settings: AppNewsSettingsDocument,
    appUrl: string
): Promise<DiscordPostResult> {
    const client = getDiscordBotClient();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let channel: any;
    try {
        channel = await client.channels.fetch(settings.discordChannelId);
    } catch {
        throw new Error(`Channel ${settings.discordChannelId} not found or bot lacks access`);
    }

    if (!channel?.isTextBased?.()) {
        throw new Error("Target channel is not text-based");
    }

    const embed = buildNewsEmbed(news, appUrl);

    // Try to update existing Discord message
    if (news.discord?.messageId) {
        try {
            const msg = await channel.messages.fetch(news.discord.messageId);
            await msg.edit({ embeds: [embed] });
            return {
                guildId: settings.discordGuildId,
                channelId: settings.discordChannelId,
                messageId: news.discord.messageId,
                postedAt: news.discord.postedAt ? new Date(news.discord.postedAt) : new Date(),
                updatedAt: new Date(),
            };
        } catch {
            // Message was deleted — fall through to post a new one
        }
    }

    // Post new message
    const message = await channel.send({ embeds: [embed] });
    return {
        guildId: settings.discordGuildId,
        channelId: settings.discordChannelId,
        messageId: message.id,
        postedAt: new Date(),
    };
}
