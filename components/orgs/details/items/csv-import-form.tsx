"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Download, AlertCircle, X, FileText } from "lucide-react";
import { ImportRowInput } from "@/lib/types/import-job";
import { parseQualityInput } from "@/lib/utils/item-quality";

type Props = {
    organizationSlug: string;
    labels: {
        downloadTemplate: string;
        dropzone: string;
        browse: string;
        previewTitle: string;
        previewDesc: string;
        colName: string;
        colBuyPrice: string;
        colSellPrice: string;
        colQuantity: string;
        colQuality: string;
        colMinStock: string;
        colMaxStock: string;
        submitBtn: string;
        submitting: string;
        clearFile: string;
        rowsLoaded: string;
        parseError: string;
        tooManyRows: string;
    };
};

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === "," && !inQuotes) {
            result.push(current);
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function parseCsv(text: string): { rows: ImportRowInput[]; error?: string } {
    const lines = text
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")
        .trim()
        .split("\n");

    if (lines.length < 2) {
        return { rows: [], error: "CSV must have a header row and at least one data row." };
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
    const nameIdx = headers.indexOf("name");

    if (nameIdx === -1) {
        return { rows: [], error: 'CSV must have a "name" column.' };
    }

    const buyPriceIdx = headers.indexOf("buyprice");
    const sellPriceIdx = headers.indexOf("sellprice");
    const quantityIdx = headers.indexOf("quantity");
    const qualityIdx = headers.indexOf("quality");
    const minStockIdx = headers.indexOf("minstock");
    const maxStockIdx = headers.indexOf("maxstock");

    const rows: ImportRowInput[] = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = parseCsvLine(line);
        const name = cells[nameIdx]?.replace(/^"|"$/g, "").trim();
        if (!name) continue;

        const row: ImportRowInput = { name };

        const parseOptionalNumber = (idx: number, integer = false) => {
            if (idx === -1) return undefined;
            const raw = cells[idx]?.trim();
            if (!raw) return undefined;
            const v = Number(raw);
            if (isNaN(v) || v < 0) return undefined;
            return integer ? Math.floor(v) : v;
        };

        const buyPrice = parseOptionalNumber(buyPriceIdx);
        const sellPrice = parseOptionalNumber(sellPriceIdx);
        const quantity = parseOptionalNumber(quantityIdx, true);
        const minStock = parseOptionalNumber(minStockIdx, true);
        const maxStock = parseOptionalNumber(maxStockIdx, true);

        const qualityRaw = qualityIdx !== -1 ? cells[qualityIdx]?.trim() : undefined;
        const quality = qualityRaw ? parseQualityInput(qualityRaw) : undefined;

        if (buyPrice !== undefined) row.buyPrice = buyPrice;
        if (sellPrice !== undefined) row.sellPrice = sellPrice;
        if (quantity !== undefined) row.quantity = quantity;
        if (quality !== undefined && quality !== null) row.quality = quality;
        if (minStock !== undefined) row.minStock = minStock;
        if (maxStock !== undefined) row.maxStock = maxStock;

        rows.push(row);
    }

    return { rows };
}

function downloadTemplate() {
    const header = "name,buyPrice,sellPrice,quantity,quality,minStock,maxStock";
    const example1 = '"Laranite",100,150,50,675,10,200';
    const example2 = '"Gold",80,120,30,Good,,';
    const csv = [header, example1, example2].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory-import-template.csv";
    a.click();
    URL.revokeObjectURL(url);
}

export default function CsvImportForm({ organizationSlug, labels }: Props) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [rows, setRows] = useState<ImportRowInput[]>([]);
    const [fileName, setFileName] = useState<string | null>(null);
    const [parseError, setParseError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    function handleFile(file: File) {
        if (!file.name.endsWith(".csv")) {
            setParseError("Please upload a .csv file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const { rows: parsed, error } = parseCsv(text);
            if (error) {
                setParseError(error);
                setRows([]);
                setFileName(null);
                return;
            }
            if (parsed.length > 500) {
                setParseError(labels.tooManyRows);
                setRows([]);
                setFileName(null);
                return;
            }
            setParseError(null);
            setRows(parsed);
            setFileName(file.name);
        };
        reader.readAsText(file);
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
    }

    function clearFile() {
        setRows([]);
        setFileName(null);
        setParseError(null);
        setSubmitError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    async function handleSubmit() {
        if (rows.length === 0 || submitting) return;
        setSubmitting(true);
        setSubmitError(null);

        try {
            const res = await fetch(`/api/orgs/${organizationSlug}/inventory/import`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rows }),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                setSubmitError(data.error ?? "Import failed. Please try again.");
                setSubmitting(false);
                return;
            }

            const { jobId } = await res.json();
            router.push(
                `/terminal/orgs/${organizationSlug}/inventory/import/${jobId}`
            );
        } catch {
            setSubmitError("Network error. Please try again.");
            setSubmitting(false);
        }
    }

    return (
        <div className="space-y-4 pt-4">
            {/* Template download */}
            <button
                type="button"
                onClick={downloadTemplate}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] transition-colors"
            >
                <Download size={14} />
                {labels.downloadTemplate}
            </button>

            {/* Drop zone */}
            {!fileName && (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-10 transition-colors"
                    style={{
                        borderColor: isDragging
                            ? "rgba(79,195,220,0.6)"
                            : "rgba(79,195,220,0.2)",
                        background: isDragging
                            ? "rgba(79,195,220,0.06)"
                            : "rgba(7,18,28,0.2)",
                    }}
                >
                    <Upload
                        size={28}
                        style={{ color: "rgba(79,195,220,0.5)" }}
                    />
                    <p
                        className="text-sm text-center"
                        style={{ color: "rgba(200,220,232,0.6)", fontFamily: "var(--font-mono)" }}
                    >
                        {labels.dropzone}{" "}
                        <span style={{ color: "var(--accent-primary)" }}>
                            {labels.browse}
                        </span>
                    </p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>
            )}

            {/* Parse error */}
            {parseError && (
                <div
                    className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm"
                    style={{
                        borderColor: "rgba(220,79,79,0.3)",
                        background: "rgba(220,79,79,0.07)",
                        color: "rgba(220,120,120,1)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    <AlertCircle size={14} className="shrink-0" />
                    {parseError}
                </div>
            )}

            {/* Preview */}
            {fileName && rows.length > 0 && (
                <div className="space-y-3">
                    {/* File badge + clear */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <FileText size={14} style={{ color: "rgba(79,195,220,0.7)" }} />
                            <span
                                className="text-sm"
                                style={{
                                    color: "rgba(200,220,232,0.8)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {fileName}
                            </span>
                            <span
                                className="rounded px-2 py-0.5 text-xs"
                                style={{
                                    background: "rgba(79,195,220,0.12)",
                                    color: "var(--accent-primary)",
                                    fontFamily: "var(--font-mono)",
                                }}
                            >
                                {rows.length} {labels.rowsLoaded}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={clearFile}
                            className="flex items-center gap-1 text-xs sc-btn-outline px-2 py-1"
                            style={{ color: "rgba(200,220,232,0.5)" }}
                        >
                            <X size={12} />
                            {labels.clearFile}
                        </button>
                    </div>

                    {/* Preview table */}
                    <div
                        className="overflow-x-auto rounded-lg border"
                        style={{ borderColor: "rgba(79,195,220,0.1)" }}
                    >
                        <table className="w-full text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                            <thead>
                                <tr style={{ borderBottom: "1px solid rgba(79,195,220,0.1)", background: "rgba(7,18,28,0.5)" }}>
                                    {[
                                        labels.colName,
                                        labels.colBuyPrice,
                                        labels.colSellPrice,
                                        labels.colQuantity,
                                        labels.colQuality,
                                        labels.colMinStock,
                                        labels.colMaxStock,
                                    ].map((col) => (
                                        <th
                                            key={col}
                                            className="px-3 py-2 text-left uppercase tracking-wider"
                                            style={{ color: "rgba(79,195,220,0.6)" }}
                                        >
                                            {col}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {rows.slice(0, 10).map((row, i) => (
                                    <tr
                                        key={i}
                                        style={{
                                            borderBottom: "1px solid rgba(79,195,220,0.05)",
                                            color: "rgba(200,220,232,0.7)",
                                        }}
                                    >
                                        <td className="px-3 py-2 font-medium" style={{ color: "rgba(200,220,232,0.95)" }}>{row.name}</td>
                                        <td className="px-3 py-2">{row.buyPrice ?? "—"}</td>
                                        <td className="px-3 py-2">{row.sellPrice ?? "—"}</td>
                                        <td className="px-3 py-2">{row.quantity ?? "—"}</td>
                                        <td className="px-3 py-2">{row.quality ?? "—"}</td>
                                        <td className="px-3 py-2">{row.minStock ?? "—"}</td>
                                        <td className="px-3 py-2">{row.maxStock ?? "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {rows.length > 10 && (
                            <div
                                className="px-3 py-2 text-xs"
                                style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                            >
                                + {rows.length - 10} more rows
                            </div>
                        )}
                    </div>

                    {/* Submit error */}
                    {submitError && (
                        <div
                            className="flex items-center gap-2 rounded-lg border px-4 py-3 text-sm"
                            style={{
                                borderColor: "rgba(220,79,79,0.3)",
                                background: "rgba(220,79,79,0.07)",
                                color: "rgba(220,120,120,1)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            <AlertCircle size={14} className="shrink-0" />
                            {submitError}
                        </div>
                    )}

                    {/* Submit button */}
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="sc-btn flex items-center gap-2"
                    >
                        <Upload size={14} />
                        {submitting ? labels.submitting : labels.submitBtn}
                    </button>
                </div>
            )}
        </div>
    );
}
