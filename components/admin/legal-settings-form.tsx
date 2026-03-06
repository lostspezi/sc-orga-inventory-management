"use client";

import { useRef, useActionState } from "react";
import { useRouter } from "next/navigation";
import { saveLegalSettingsAction, publishLegalVersionAction } from "@/lib/actions/save-legal-settings-action";
import type { LegalSettingsView } from "@/lib/types/legal-settings";

type State = { success: boolean; error?: string } | null;

export default function LegalSettingsForm({ settings }: { settings: LegalSettingsView }) {
    const publishDialogRef = useRef<HTMLDialogElement>(null);
    const router = useRouter();

    const [saveState, saveAction, savePending] = useActionState<State, FormData>(
        async (_prev, formData) => {
            const result = await saveLegalSettingsAction(formData);
            if (result.success) router.refresh();
            return result;
        },
        null
    );

    const [publishState, publishAction, publishPending] = useActionState<State, FormData>(
        async (_prev, formData) => {
            const result = await publishLegalVersionAction(formData);
            if (result.success) {
                publishDialogRef.current?.close();
                router.refresh();
            }
            return result;
        },
        null
    );

    const inputStyle = {
        background: "rgba(8,16,24,0.6)",
        border: "1px solid rgba(79,195,220,0.2)",
        color: "rgba(200,220,232,0.85)",
        fontFamily: "var(--font-mono)",
        fontSize: "0.8125rem",
        padding: "0.4rem 0.65rem",
        width: "100%",
        borderRadius: 0,
    };

    return (
        <>
            <form action={saveAction} className="space-y-6">
                {/* Document dates */}
                <section
                    className="hud-panel p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    <p
                        className="mb-4 text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Document &quot;Last Updated&quot; Dates
                    </p>
                    <p
                        className="mb-5 text-xs"
                        style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                    >
                        These dates are shown on the public legal pages. Format: YYYY-MM-DD
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                        {[
                            { name: "privacyDate", label: "Privacy Policy", value: settings.documents.privacy.lastUpdated },
                            { name: "termsDate", label: "Terms & Conditions", value: settings.documents.terms.lastUpdated },
                            { name: "imprintDate", label: "Imprint", value: settings.documents.imprint.lastUpdated },
                            { name: "cookiesDate", label: "Cookie Information", value: settings.documents.cookies.lastUpdated },
                        ].map(({ name, label, value }) => (
                            <div key={name}>
                                <label
                                    htmlFor={name}
                                    className="mb-1 block text-[10px] uppercase tracking-[0.2em]"
                                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                                >
                                    {label}
                                </label>
                                <input
                                    id={name}
                                    name={name}
                                    type="date"
                                    defaultValue={value}
                                    required
                                    style={inputStyle}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="mt-5">
                        <label
                            htmlFor="changeNote"
                            className="mb-1 block text-[10px] uppercase tracking-[0.2em]"
                            style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            Change Note (shown to users when re-accepting)
                        </label>
                        <textarea
                            id="changeNote"
                            name="changeNote"
                            rows={3}
                            defaultValue={settings.changeNote}
                            placeholder="Describe what changed…"
                            style={{ ...inputStyle, resize: "vertical" }}
                        />
                    </div>
                </section>

                {saveState?.error && (
                    <p className="text-sm" style={{ color: "rgba(220,80,80,0.8)", fontFamily: "var(--font-mono)" }}>
                        Error: {saveState.error}
                    </p>
                )}
                {saveState?.success && (
                    <p className="text-sm" style={{ color: "rgba(79,195,220,0.7)", fontFamily: "var(--font-mono)" }}>
                        Dates saved. Legal pages updated.
                    </p>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                        type="submit"
                        disabled={savePending}
                        className="sc-btn sc-btn-outline text-xs"
                    >
                        {savePending ? "Saving…" : "Save Dates & Note"}
                    </button>

                    <button
                        type="button"
                        onClick={() => publishDialogRef.current?.showModal()}
                        className="sc-btn text-xs"
                        style={{ borderColor: "rgba(240,165,0,0.5)", color: "rgba(240,165,0,0.9)" }}
                    >
                        Publish New Version →
                    </button>
                </div>
            </form>

            {/* Publish confirmation dialog */}
            <dialog
                ref={publishDialogRef}
                className="backdrop:bg-black/70"
                style={{ background: "transparent", border: "none", padding: 0, maxWidth: "min(90vw,480px)", width: "100%" }}
            >
                <div className="hud-panel relative p-6" style={{ background: "rgba(4,10,18,0.97)" }}>
                    <div className="absolute -top-px left-8 right-8 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(240,165,0,0.7),transparent)" }} />

                    <h3
                        className="mb-2 text-sm font-bold uppercase tracking-[0.25em]"
                        style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                    >
                        Publish New Legal Version
                    </h3>
                    <p
                        className="mb-4 text-sm leading-relaxed"
                        style={{ color: "rgba(200,220,232,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        This will set today&apos;s date as the new legal version and force{" "}
                        <strong style={{ color: "rgba(200,220,232,0.85)" }}>all users</strong> to accept
                        the updated terms on their next visit to the terminal.
                    </p>

                    <form action={publishAction} className="space-y-3">
                        {/* Hidden inputs to carry current form values — pre-populated with current settings */}
                        {[
                            { name: "privacyDate", value: settings.documents.privacy.lastUpdated },
                            { name: "termsDate", value: settings.documents.terms.lastUpdated },
                            { name: "imprintDate", value: settings.documents.imprint.lastUpdated },
                            { name: "cookiesDate", value: settings.documents.cookies.lastUpdated },
                        ].map(({ name, value }) => (
                            <input key={name} type="hidden" name={name} value={value} />
                        ))}
                        <input type="hidden" name="changeNote" value={settings.changeNote} />

                        {publishState?.error && (
                            <p className="text-xs" style={{ color: "rgba(220,80,80,0.8)", fontFamily: "var(--font-mono)" }}>
                                Error: {publishState.error}
                            </p>
                        )}

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => publishDialogRef.current?.close()}
                                className="sc-btn sc-btn-outline flex-1 text-xs"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={publishPending}
                                className="sc-btn flex-1 text-xs"
                                style={{ borderColor: "rgba(240,165,0,0.5)", color: "rgba(240,165,0,0.9)" }}
                            >
                                {publishPending ? "Publishing…" : "Confirm & Publish"}
                            </button>
                        </div>
                    </form>

                    <div className="absolute -bottom-px left-8 right-8 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(240,165,0,0.2),transparent)" }} />
                </div>
            </dialog>
        </>
    );
}
