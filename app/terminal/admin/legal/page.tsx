import { getOrCreateLegalSettings, toLegalSettingsView } from "@/lib/repositories/legal-settings-repository";
import LegalSettingsForm from "@/components/admin/legal-settings-form";

export const metadata = { title: "Admin · Legal" };

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone: "UTC",
    });
}

export default async function AdminLegalPage() {
    const doc = await getOrCreateLegalSettings();
    const settings = toLegalSettingsView(doc);

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-3xl space-y-6"
                style={{ animation: "slide-in-up 0.45s ease forwards" }}
            >
                {/* Header */}
                <section
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.55)" }}
                >
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.6), transparent)" }}
                    />
                    <p
                        className="mb-1 text-xs uppercase tracking-[0.35em]"
                        style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-display)" }}
                    >
                        Super Admin
                    </p>
                    <h1
                        className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                        style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                    >
                        Legal Management
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        Manage legal document dates and force user re-acceptance.
                    </p>
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.2), transparent)" }}
                    />
                </section>

                {/* Current version status */}
                <section
                    className="hud-panel p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    <p
                        className="mb-3 text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Current Legal Version
                    </p>
                    <div className="flex flex-wrap items-start gap-4">
                        <div>
                            <p
                                className="text-2xl font-black tracking-widest"
                                style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                            >
                                {settings.currentVersion}
                            </p>
                            <p
                                className="mt-1 text-xs"
                                style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                            >
                                Published {formatDate(settings.publishedAt)} by {settings.publishedByUsername}
                            </p>
                        </div>
                        {settings.changeNote && (
                            <div
                                className="flex-1 rounded px-3 py-2 text-xs leading-relaxed"
                                style={{
                                    background: "rgba(79,195,220,0.05)",
                                    border: "1px solid rgba(79,195,220,0.1)",
                                    color: "rgba(200,220,232,0.5)",
                                    fontFamily: "var(--font-mono)",
                                    minWidth: "180px",
                                }}
                            >
                                &ldquo;{settings.changeNote}&rdquo;
                            </div>
                        )}
                    </div>
                    <p
                        className="mt-3 text-xs"
                        style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                    >
                        Users who have not accepted version <strong style={{ color: "rgba(200,220,232,0.5)" }}>{settings.currentVersion}</strong> will
                        see a blocking dialog on next terminal visit.
                    </p>
                </section>

                {/* Settings form */}
                <LegalSettingsForm settings={settings} />

                {/* Quick links */}
                <section
                    className="hud-panel p-5"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    <p
                        className="mb-3 text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Preview Legal Pages
                    </p>
                    <div className="flex flex-wrap gap-3">
                        {[
                            { label: "Privacy Policy", href: "/legal/privacy" },
                            { label: "Terms", href: "/legal/terms" },
                            { label: "Imprint", href: "/legal/imprint" },
                            { label: "Cookie Info", href: "/legal/cookies" },
                        ].map(({ label, href }) => (
                            <a
                                key={href}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] uppercase tracking-[0.15em] underline transition-colors hover:text-cyan-400"
                                style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                {label} ↗
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </main>
    );
}
