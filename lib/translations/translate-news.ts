import {
    getAppNewsById,
    setAppNewsTranslation,
    setAppNewsStatus,
} from "@/lib/repositories/app-news-repository";
import type { NewsLocale } from "@/lib/types/app-news";

const SYSTEM_PROMPT = `You are a professional translator for SCOIM.io, a Star Citizen organization management platform.

Rules:
- Translate naturally and professionally, matching the tone of the original.
- Preserve all Markdown formatting exactly: **bold**, *italic*, \`code\`, \`\`\`blocks\`\`\`, [links](url), lists, blockquotes.
- Do NOT translate: brand names (SCOIM.io, SC Orga Manager, PRO), in-game terms (aUEC, Star Citizen, RSI), Discord/GitHub, code blocks, identifiers.
- Do NOT add, remove, or reorder any information.
- Return ONLY the translated text — no explanations.`;

const LOCALE_NAMES: Record<string, string> = { en: "English", de: "German", fr: "French" };

function buildUserPrompt(field: "title" | "body", from: string, to: string, content: string): string {
    return `Translate the following ${field} from ${LOCALE_NAMES[from]} to ${LOCALE_NAMES[to]}:\n\n${content}`;
}

async function callOpenAI(
    field: "title" | "body",
    from: NewsLocale,
    to: NewsLocale,
    content: string
): Promise<string> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

    const model = process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4o-mini";
    const { OpenAI } = await import("openai");
    const openai = new OpenAI({ apiKey });

    for (let attempt = 0; attempt <= 2; attempt++) {
        try {
            const response = await openai.chat.completions.create({
                model,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: buildUserPrompt(field, from, to, content) },
                ],
                max_tokens: field === "title" ? 200 : 1500,
                temperature: 0.3,
            });
            return response.choices[0]?.message?.content?.trim() ?? "";
        } catch (err) {
            if (attempt === 2) throw err;
            await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
        }
    }
    throw new Error("Translation failed after retries");
}

/**
 * Fire-and-forget translation pipeline.
 * Call without await to return immediately while translations run in background.
 */
export async function translateNewsPost(newsId: string, targetLocales: NewsLocale[]): Promise<void> {
    const news = await getAppNewsById(newsId);
    if (!news) return;

    const sourceLocale = news.primaryLocale;
    let anySuccess = false;

    for (const locale of targetLocales) {
        if (locale === sourceLocale) continue;
        try {
            const [translatedTitle, translatedBody] = await Promise.all([
                callOpenAI("title", sourceLocale, locale, news.title),
                callOpenAI("body", sourceLocale, locale, news.body),
            ]);

            await setAppNewsTranslation(newsId, locale, {
                title: translatedTitle,
                body: translatedBody,
                status: "ready",
                translatedAt: new Date(),
                modelUsed: process.env.OPENAI_TRANSLATION_MODEL ?? "gpt-4o-mini",
            });
            anySuccess = true;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Unknown error";
            // Preserve any existing content, just update status
            const existing = news.translations?.[locale];
            await setAppNewsTranslation(newsId, locale, {
                title: existing?.title ?? "",
                body: existing?.body ?? "",
                status: "error",
                errorMessage,
            });
        }
    }

    // Transition status after all translations complete
    const updated = await getAppNewsById(newsId);
    if (!updated || updated.status !== "translation_pending") return;

    const nonPrimaryLocales = (["en", "de", "fr"] as NewsLocale[]).filter((l) => l !== sourceLocale);
    const allSettled = nonPrimaryLocales.every((l) => {
        const t = updated.translations?.[l];
        return !t || t.status === "ready" || t.status === "edited" || t.status === "error";
    });

    if (allSettled) {
        const hasReady = anySuccess || nonPrimaryLocales.some((l) => {
            const t = updated.translations?.[l];
            return t?.status === "ready" || t?.status === "edited";
        });
        await setAppNewsStatus(newsId, hasReady ? "ready_to_publish" : "draft");
    }
}
