"use client";

import { useRef, useState, useActionState, startTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, Loader2 } from "lucide-react";
import { clearInventoryAction, type ClearInventoryActionState } from "@/lib/actions/clear-inventory-action";

class InventoryItem {
}

type Props = {
    organizationSlug: string;
    isPro: boolean;
    labels: {
        exportCsv: string;
        exportCsvDesc: string;
        exportStarted: string;
        exportFailed: string;
        exportProRequired: string;
        clearInventory: string;
        clearInventoryDesc: string;
        clearInventoryConfirmTitle: string;
        clearInventoryConfirmDesc: string;
        clearInventoryConfirm: string;
        clearInventoryCancel: string;
    };
    items: InventoryItem[];
};

const clearInitialState: ClearInventoryActionState = { success: false, message: "" };

export default function InventoryAdminTools({ organizationSlug, isPro, labels, items }: Props) {
    const router = useRouter();
    const dialogRef = useRef<HTMLDialogElement>(null);

    // Export state
    const [exportPending, setExportPending] = useState(false);
    const [exportMessage, setExportMessage] = useState<{ text: string; ok: boolean } | null>(null);

    // Clear state
    const [clearState, clearFormAction, clearPending] = useActionState(
        async (prev: ClearInventoryActionState, formData: FormData) => {
            const result = await clearInventoryAction(prev, formData);
            if (result.success) {
                dialogRef.current?.close();
                router.refresh();
            }
            return result;
        },
        clearInitialState
    );

    async function handleExport() {
        if (!isPro) {
            setExportMessage({ text: labels.exportProRequired, ok: false });
            return;
        }
        setExportPending(true);
        setExportMessage(null);
        try {
            const res = await fetch(`/api/orgs/${organizationSlug}/inventory/export`, {
                method: "POST",
            });
            if (!res.ok) throw new Error();
            setExportMessage({ text: labels.exportStarted, ok: true });
        } catch {
            setExportMessage({ text: labels.exportFailed, ok: false });
        } finally {
            setExportPending(false);
        }
    }

    return (
        <>
            <div className="flex flex-col gap-3 sm:flex-row pt-4">
                {/* Export CSV */}
                <div
                    className="flex flex-1 flex-col gap-3 rounded-lg border p-4"
                    style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(7,18,28,0.22)" }}
                >
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                            {labels.exportCsv}
                        </p>
                        <p className="mt-1 text-[11px]" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                            {labels.exportCsvDesc}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            type="button"
                            onClick={handleExport}
                            disabled={exportPending || items.length < 1}
                            className="flex w-fit items-center gap-2 rounded border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ borderColor: "rgba(79,195,220,0.25)", color: "rgba(79,195,220,0.85)", fontFamily: "var(--font-mono)", background: "rgba(79,195,220,0.06)" }}
                        >
                            {exportPending
                                ? <Loader2 size={11} className="animate-spin" />
                                : <Download size={11} />}
                            {labels.exportCsv}
                        </button>
                        {exportMessage && (
                            <p className="text-[11px]" style={{ color: exportMessage.ok ? "rgba(74,222,128,0.8)" : "rgba(248,113,113,0.8)", fontFamily: "var(--font-mono)" }}>
                                {exportMessage.text}
                            </p>
                        )}
                    </div>
                </div>

                {/* Clear Inventory */}
                <div
                    className="flex flex-1 flex-col gap-3 rounded-lg border p-4"
                    style={{ borderColor: "rgba(220,79,79,0.12)", background: "rgba(28,7,7,0.22)" }}
                >
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(220,79,79,0.5)", fontFamily: "var(--font-mono)" }}>
                            {labels.clearInventory}
                        </p>
                        <p className="mt-1 text-[11px]" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                            {labels.clearInventoryDesc}
                        </p>
                    </div>
                    <button
                        type="button"
                        disabled={items.length < 1}
                        onClick={() => dialogRef.current?.showModal()}
                        className="flex w-fit items-center gap-2 rounded border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-opacity cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ borderColor: "rgba(220,79,79,0.3)", color: "rgba(220,79,79,0.85)", fontFamily: "var(--font-mono)", background: "rgba(220,79,79,0.06)" }}
                    >
                        <Trash2 size={11} />
                        {labels.clearInventory}
                    </button>
                </div>
            </div>

            {/* Confirmation dialog */}
            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{ borderColor: "rgba(220,79,79,0.25)", background: "rgba(6,12,18,0.97)", boxShadow: "0 0 40px rgba(0,0,0,0.5)" }}
            >
                <div className="relative p-5 sm:p-6">
                    <div className="absolute left-6 right-6 top-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(220,79,79,0.35), transparent)" }} />

                    <p className="mb-1 text-[10px] uppercase tracking-[0.3em]" style={{ color: "rgba(220,79,79,0.5)", fontFamily: "var(--font-mono)" }}>
                        {labels.clearInventory}
                    </p>
                    <h2 className="text-base font-semibold uppercase tracking-[0.06em]" style={{ color: "rgba(220,79,79,0.9)", fontFamily: "var(--font-display)" }}>
                        {labels.clearInventoryConfirmTitle}
                    </h2>
                    <p className="mt-2 text-[11px]" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}>
                        {labels.clearInventoryConfirmDesc}
                    </p>

                    {clearState.message && !clearState.success && (
                        <p className="mt-3 text-[11px]" style={{ color: "rgba(248,113,113,0.8)", fontFamily: "var(--font-mono)" }}>
                            {clearState.message}
                        </p>
                    )}

                    <form
                        action={clearFormAction}
                        className="mt-5 flex justify-end gap-2"
                        onSubmit={(e) => { e.preventDefault(); startTransition(() => clearFormAction(new FormData(e.currentTarget))); }}
                    >
                        <input type="hidden" name="organizationSlug" value={organizationSlug} />
                        <button
                            type="button"
                            onClick={() => dialogRef.current?.close()}
                            disabled={clearPending}
                            className="rounded border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-opacity disabled:opacity-40 cursor-pointer"
                            style={{ borderColor: "rgba(79,195,220,0.2)", color: "rgba(200,220,232,0.6)", fontFamily: "var(--font-mono)", background: "rgba(79,195,220,0.04)" }}
                        >
                            {labels.clearInventoryCancel}
                        </button>
                        <button
                            type="submit"
                            disabled={clearPending}
                            className="flex items-center gap-2 rounded border px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                            style={{ borderColor: "rgba(220,79,79,0.35)", color: "rgba(220,79,79,0.9)", fontFamily: "var(--font-mono)", background: "rgba(220,79,79,0.08)" }}
                        >
                            {clearPending && <Loader2 size={11} className="animate-spin" />}
                            {labels.clearInventoryConfirm}
                        </button>
                    </form>
                </div>
            </dialog>
        </>
    );
}
