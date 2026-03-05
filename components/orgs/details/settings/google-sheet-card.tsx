"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, RefreshCw, Unlink } from "lucide-react";
import { saveGoogleSheetAction } from "@/lib/actions/save-google-sheet-action";
import { importFromGoogleSheetAction } from "@/lib/actions/import-from-google-sheet-action";

type Props = {
    organizationSlug: string;
    googleSheetId?: string;
    googleSheetLastSyncedAt?: string; // ISO string
    labels: {
        label: string;
        connectedStatus: string;
        notConnectedStatus: string;
        connectedTitle: string;
        notConnectedTitle: string;
        desc: string;
        urlPlaceholder: string;
        save: string;
        disconnect: string;
        syncNow: string;
        lastSynced: string;
        never: string;
        syncStarted: string;
        syncPushed: string;
        syncError: string;
        saveError: string;
        howItWorksTitle: string;
        howItWorksShare: string;
        serviceAccountEmail: string;
        howItWorksSync: string;
        howItWorksAuto: string;
        howItWorksFormat: string;
    };
};

function formatDate(iso: string): string {
    return new Date(iso).toLocaleString(undefined, {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
    });
}

export default function GoogleSheetCard({ organizationSlug, googleSheetId, googleSheetLastSyncedAt, labels }: Props) {
    const isConnected = !!googleSheetId;
    const router = useRouter();

    const saveWithSlug = saveGoogleSheetAction.bind(null, organizationSlug);
    const importWithSlug = importFromGoogleSheetAction.bind(null, organizationSlug);

    const [saveState, saveAction, savePending] = useActionState(saveWithSlug, null);
    const [importState, importAction, importPending] = useActionState(importWithSlug, null);

    // Redirect to import results page once the job is created
    useEffect(() => {
        if (importState?.success && importState.jobId) {
            router.push(`/terminal/orgs/${organizationSlug}/inventory/import/${importState.jobId}`);
        }
    }, [importState, organizationSlug, router]);

    const borderColor = isConnected ? "rgba(87,242,135,0.18)" : "rgba(240,165,0,0.18)";
    const bg = isConnected ? "rgba(6,20,14,0.18)" : "rgba(20,14,6,0.14)";
    const accentColor = isConnected ? "rgba(87,242,135,0.85)" : "rgba(240,165,0,0.85)";
    const accentBorder = isConnected ? "rgba(87,242,135,0.2)" : "rgba(240,165,0,0.2)";
    const accentBg = isConnected ? "rgba(87,242,135,0.06)" : "rgba(240,165,0,0.05)";

    return (
        <div
            className="rounded-lg border p-4"
            style={{ borderColor, background: bg }}
        >
            <div className="flex items-start gap-3">
                <div
                    className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border"
                    style={{ borderColor: accentBorder, color: accentColor, background: accentBg }}
                >
                    <FileSpreadsheet size={18} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: isConnected ? "rgba(87,242,135,0.6)" : "rgba(240,165,0,0.75)", fontFamily: "var(--font-mono)" }}
                        >
                            {labels.label}
                        </p>
                        <span
                            className="rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.1em]"
                            style={{
                                borderColor: isConnected ? "rgba(87,242,135,0.25)" : "rgba(240,165,0,0.25)",
                                color: accentColor,
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {isConnected ? labels.connectedStatus : labels.notConnectedStatus}
                        </span>
                    </div>

                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: accentColor, fontFamily: "var(--font-display)" }}
                    >
                        {isConnected ? labels.connectedTitle : labels.notConnectedTitle}
                    </h3>

                    {isConnected ? (
                        <p
                            className="mt-1 text-xs"
                            style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                        >
                            {labels.lastSynced}:{" "}
                            {googleSheetLastSyncedAt ? formatDate(googleSheetLastSyncedAt) : labels.never}
                        </p>
                    ) : (
                        <p
                            className="mt-2 text-xs"
                            style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {labels.desc}
                        </p>
                    )}
                </div>
            </div>

            {/* How it works */}
            <div
                className="mt-4 rounded border p-3 space-y-1"
                style={{
                    borderColor: "rgba(79,195,220,0.12)",
                    background: "rgba(79,195,220,0.04)",
                }}
            >
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                    {labels.howItWorksTitle}
                </p>
                <ul className="mt-1 space-y-0.5" style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)", fontSize: 11 }}>
                    <li>→ {labels.howItWorksShare} <span style={{ color: "rgba(79,195,220,0.7)" }}>{labels.serviceAccountEmail}</span></li>
                    <li>→ {labels.howItWorksSync}</li>
                    <li>→ {labels.howItWorksAuto}</li>
                    <li>→ {labels.howItWorksFormat}</li>
                </ul>
            </div>

            {/* Feedback */}
            {saveState && !saveState.success && (
                <p className="mt-3 text-xs" style={{ color: "rgba(240,100,100,0.85)", fontFamily: "var(--font-mono)" }}>
                    {saveState.error ?? labels.saveError}
                </p>
            )}
            {importState && !importState.success && (
                <p className="mt-3 text-xs" style={{ color: "rgba(240,100,100,0.85)", fontFamily: "var(--font-mono)" }}>
                    {importState.error ?? labels.syncError}
                </p>
            )}
            {importPending && (
                <p className="mt-3 text-xs" style={{ color: "rgba(79,195,220,0.7)", fontFamily: "var(--font-mono)" }}>
                    {labels.syncStarted}
                </p>
            )}
            {importState?.success && importState.pushed && (
                <p className="mt-3 text-xs" style={{ color: "rgba(87,242,135,0.8)", fontFamily: "var(--font-mono)" }}>
                    {labels.syncPushed}
                </p>
            )}

            {/* Actions */}
            {isConnected ? (
                <div className="mt-4 flex flex-wrap justify-end gap-2">
                    <form action={importAction}>
                        <button
                            type="submit"
                            disabled={importPending}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-50"
                            style={{
                                borderColor: "rgba(79,195,220,0.3)",
                                color: "rgba(79,195,220,0.8)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            <RefreshCw size={12} className={importPending ? "animate-spin" : ""} />
                            {labels.syncNow}
                        </button>
                    </form>

                    <form action={saveAction}>
                        <input type="hidden" name="sheetUrl" value="" />
                        <button
                            type="submit"
                            disabled={savePending}
                            className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs uppercase tracking-[0.12em] transition-colors disabled:opacity-50"
                            style={{
                                borderColor: "rgba(240,100,100,0.3)",
                                color: "rgba(240,100,100,0.75)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            <Unlink size={12} />
                            {labels.disconnect}
                        </button>
                    </form>
                </div>
            ) : (
                <form className="mt-4 flex gap-2" action={saveAction}>
                    <input
                        name="sheetUrl"
                        type="text"
                        placeholder={labels.urlPlaceholder}
                        required
                        className="sc-input flex-1 text-xs"
                    />
                    <button
                        type="submit"
                        disabled={savePending}
                        className="sc-btn text-xs disabled:opacity-50"
                    >
                        {labels.save}
                    </button>
                </form>
            )}
        </div>
    );
}
