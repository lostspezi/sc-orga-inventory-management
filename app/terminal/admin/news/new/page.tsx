import { getOrCreateNewsSettings, toNewsSettingsView } from "@/lib/repositories/app-news-settings-repository";
import NewsEditor from "@/components/admin/news-editor";

export const metadata = { title: "Admin · New Post" };

export default async function NewNewsPostPage() {
    const settingsDoc = await getOrCreateNewsSettings();
    const settings = toNewsSettingsView(settingsDoc);
    const hasOpenAiKey = !!process.env.OPENAI_API_KEY;

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-4xl"
                style={{ animation: "slide-in-up 0.45s ease forwards" }}
            >
                <NewsEditor settings={settings} hasOpenAiKey={hasOpenAiKey} />
            </div>
        </main>
    );
}
