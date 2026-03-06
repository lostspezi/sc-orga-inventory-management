import { getOrCreateSocialSettings, toSocialSettingsView } from "@/lib/repositories/social-settings-repository";
import SocialSettingsForm from "@/components/admin/social-settings-form";

export default async function AdminSocialPage() {
    const doc = await getOrCreateSocialSettings();
    const settings = toSocialSettingsView(doc);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="mb-6">
                <p className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                    style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-mono)" }}>
                    Super Admin
                </p>
                <h1 className="text-xl font-bold uppercase tracking-[0.1em]"
                    style={{ color: "rgba(240,165,0,0.85)", fontFamily: "var(--font-display)" }}>
                    Social Links
                </h1>
                <p className="mt-1 text-xs" style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                    Set the social media links displayed in the homepage footer and metadata. Leave blank to hide.
                </p>
            </div>

            <div
                className="rounded-lg border p-6"
                style={{
                    borderColor: "rgba(240,165,0,0.12)",
                    background: "rgba(240,165,0,0.02)",
                }}
            >
                <SocialSettingsForm settings={settings} />
            </div>
        </div>
    );
}
