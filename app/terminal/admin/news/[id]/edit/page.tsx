import { notFound } from "next/navigation";
import { getAppNewsById, toAppNewsView } from "@/lib/repositories/app-news-repository";
import { getOrCreateNewsSettings, toNewsSettingsView } from "@/lib/repositories/app-news-settings-repository";
import NewsEditor from "@/components/admin/news-editor";

export const metadata = { title: "Admin · Edit Post" };

type Props = { params: Promise<{ id: string }> };

export default async function EditNewsPostPage({ params }: Props) {
    const { id } = await params;
    const [doc, settingsDoc] = await Promise.all([
        getAppNewsById(id),
        getOrCreateNewsSettings(),
    ]);

    if (!doc) notFound();

    const post = toAppNewsView(doc);
    const settings = toNewsSettingsView(settingsDoc);
    const hasOpenAiKey = !!process.env.OPENAI_API_KEY;

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-4xl"
                style={{ animation: "slide-in-up 0.45s ease forwards" }}
            >
                <NewsEditor initialPost={post} settings={settings} hasOpenAiKey={hasOpenAiKey} />
            </div>
        </main>
    );
}
