"use client";

import { startTransition, useActionState, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import type { OrgRankView } from "@/lib/types/org-rank";
import { createOrgRankAction } from "@/lib/actions/create-org-rank-action";
import { updateOrgRankAction } from "@/lib/actions/update-org-rank-action";
import { deleteOrgRankAction } from "@/lib/actions/delete-org-rank-action";
import { reorderOrgRanksAction } from "@/lib/actions/reorder-org-ranks-action";

type Props = {
    ranks: OrgRankView[];
    organizationSlug: string;
};

const init = { success: false, message: "" };

export default function RanksManagement({ ranks, organizationSlug }: Props) {
    const t = useTranslations("members");
    const router = useRouter();
    const [showCreate, setShowCreate] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [localRanks, setLocalRanks] = useState(ranks);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const dragIndexRef = useRef<number | null>(null);
    const [reorderState, reorderFormAction] = useActionState(reorderOrgRanksAction, init);

    const [createState, createFormAction, createPending] = useActionState(createOrgRankAction, init);
    const [updateState, updateFormAction, updatePending] = useActionState(updateOrgRankAction, init);
    const [deleteState, deleteFormAction, deletePending] = useActionState(deleteOrgRankAction, init);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

    // Sync local list when server data changes
    useEffect(() => { setLocalRanks(ranks); }, [ranks]);

    useEffect(() => {
        if (createState.success) {
            queueMicrotask(() => { setShowCreate(false); });
            router.refresh();
        }
    }, [createState.success, router]);

    useEffect(() => {
        if (updateState.success) {
            queueMicrotask(() => { setEditingId(null); });
            router.refresh();
        }
    }, [updateState.success, router]);

    useEffect(() => {
        if (deleteState.success) {
            queueMicrotask(() => { setDeleteConfirmId(null); });
            router.refresh();
        }
    }, [deleteState.success, router]);

    const handleDragStart = (index: number) => {
        dragIndexRef.current = index;
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const fromIndex = dragIndexRef.current;
        if (fromIndex === null || fromIndex === dropIndex) {
            dragIndexRef.current = null;
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...localRanks];
        const [moved] = reordered.splice(fromIndex, 1);
        reordered.splice(dropIndex, 0, moved);

        // Assign sequential order values based on new position
        const updated = reordered.map((r, i) => ({ ...r, order: i + 1 }));
        setLocalRanks(updated);

        dragIndexRef.current = null;
        setDragIndex(null);
        setDragOverIndex(null);

        // Persist to server
        const fd = new FormData();
        fd.set("organizationSlug", organizationSlug);
        fd.set("ranks", JSON.stringify(updated.map((r) => ({ rankId: r._id, order: r.order }))));
        startTransition(async () => { await reorderFormAction(fd); });
    };

    const handleDragEnd = () => {
        dragIndexRef.current = null;
        setDragIndex(null);
        setDragOverIndex(null);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
                    {ranks.length} Ranks
                </p>
                <button
                    type="button"
                    onClick={() => setShowCreate((v) => !v)}
                    className="sc-btn sc-btn-outline flex items-center gap-1.5 py-1 text-xs"
                >
                    <Plus size={12} />
                    {t("createRank")}
                </button>
            </div>

            {/* Create form */}
            {showCreate && (
                <RankForm
                    organizationSlug={organizationSlug}
                    formAction={createFormAction}
                    state={createState}
                    isPending={createPending}
                    onCancel={() => setShowCreate(false)}
                    label={t("createRank")}
                />
            )}

            {ranks.length === 0 && !showCreate && (
                <div
                    className="rounded-lg border border-dashed p-6 text-center"
                    style={{ borderColor: "rgba(79,195,220,0.18)", background: "rgba(7,18,28,0.18)" }}
                >
                    <p className="text-sm" style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                        {t("noRanksDesc")}
                    </p>
                </div>
            )}

            {/* Rank list */}
            <div className="space-y-1.5">
                {localRanks.map((rank, index) => (
                    <div
                        key={rank._id}
                        draggable={editingId !== rank._id}
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDrop={(e) => handleDrop(e, index)}
                        onDragEnd={handleDragEnd}
                        style={{
                            opacity: dragIndex === index ? 0.4 : 1,
                            borderTop: dragOverIndex === index && dragIndex !== index
                                ? "2px solid rgba(79,195,220,0.6)"
                                : "2px solid transparent",
                            transition: "border-color 0.1s",
                        }}
                    >
                        {editingId === rank._id ? (
                            <RankForm
                                organizationSlug={organizationSlug}
                                formAction={updateFormAction}
                                state={updateState}
                                isPending={updatePending}
                                onCancel={() => setEditingId(null)}
                                label="Save"
                                rankId={rank._id}
                                defaults={rank}
                            />
                        ) : (
                            <div
                                className="flex items-center gap-3 rounded-md border px-3 py-2"
                                style={{ borderColor: "rgba(79,195,220,0.1)", background: "rgba(7,18,28,0.18)" }}
                            >
                                {/* Drag handle */}
                                <GripVertical
                                    size={14}
                                    className="shrink-0 cursor-grab active:cursor-grabbing opacity-30 hover:opacity-70 transition"
                                    style={{ color: "rgba(200,220,232,0.7)" }}
                                />
                                {rank.color && (
                                    <div
                                        className="h-4 w-4 rounded-full border shrink-0"
                                        style={{ background: rank.color, borderColor: `${rank.color}44` }}
                                    />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs" style={{ color: "rgba(200,220,232,0.8)", fontFamily: "var(--font-mono)" }}>
                                            {rank.name}
                                        </span>
                                        {rank.isDefault && (
                                            <span className="rounded border px-1.5 py-0.5 text-[9px] uppercase" style={{ borderColor: "rgba(79,195,220,0.2)", color: "rgba(79,195,220,0.6)", fontFamily: "var(--font-mono)" }}>
                                                {t("rankDefault")}
                                            </span>
                                        )}
                                    </div>
                                    {rank.description && (
                                        <p className="text-[10px] truncate" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                                            {rank.description}
                                        </p>
                                    )}
                                </div>
                                <span className="text-[10px]" style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}>
                                    #{rank.order}
                                </span>
                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(rank._id)}
                                        className="cursor-pointer rounded p-1 opacity-60 hover:opacity-100 transition"
                                        style={{ color: "var(--accent-primary)" }}
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setDeleteConfirmId(rank._id)}
                                        className="cursor-pointer rounded p-1 opacity-60 hover:opacity-100 transition"
                                        style={{ color: "rgba(240,80,80,0.8)" }}
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {deleteState.message && !deleteState.success && (
                <p className="text-xs" style={{ color: "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                    {deleteState.message}
                </p>
            )}
            {reorderState.message && !reorderState.success && (
                <p className="text-xs" style={{ color: "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                    {reorderState.message}
                </p>
            )}

            {/* Delete confirm */}
            {deleteConfirmId && (
                <dialog
                    open
                    className="fixed left-1/2 top-1/2 z-50 m-0 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-5 backdrop:bg-black/60"
                    style={{ borderColor: "rgba(240,80,80,0.2)", background: "rgba(6,14,22,0.98)" }}
                >
                        <h3 className="mb-2 text-sm font-semibold uppercase" style={{ color: "rgba(240,80,80,0.85)", fontFamily: "var(--font-display)" }}>
                            {t("deleteRankConfirmTitle")}
                        </h3>
                        <p className="mb-4 text-xs" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}>
                            {t("deleteRankConfirmDesc", { name: ranks.find((r) => r._id === deleteConfirmId)?.name ?? "" })}
                        </p>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setDeleteConfirmId(null)} className="sc-btn sc-btn-outline text-xs">
                                Cancel
                            </button>
                            <form action={(fd) => {
                                fd.set("organizationSlug", organizationSlug);
                                fd.set("rankId", deleteConfirmId!);
                                startTransition(async () => { await deleteFormAction(fd); });
                            }}>
                                <input type="hidden" name="organizationSlug" value={organizationSlug} />
                                <input type="hidden" name="rankId" value={deleteConfirmId} />
                                <button
                                    type="submit"
                                    disabled={deletePending}
                                    className="sc-btn disabled:opacity-50"
                                    style={{ background: "rgba(240,60,60,0.15)", borderColor: "rgba(240,60,60,0.3)", color: "rgba(240,80,80,0.9)" }}
                                >
                                    Delete
                                </button>
                            </form>
                        </div>
                </dialog>
            )}
        </div>
    );
}

type RankFormProps = {
    organizationSlug: string;
    formAction: (fd: FormData) => void;
    state: { success: boolean; message: string };
    isPending: boolean;
    onCancel: () => void;
    label: string;
    rankId?: string;
    defaults?: OrgRankView;
};

function RankForm({ organizationSlug, formAction, state, isPending, onCancel, label, rankId, defaults }: RankFormProps) {
    const t = useTranslations("members");

    return (
        <div
            className="rounded-md border p-4 space-y-3"
            style={{ borderColor: "rgba(79,195,220,0.18)", background: "rgba(7,18,28,0.3)" }}
        >
            <form action={(fd) => {
                fd.set("organizationSlug", organizationSlug);
                if (rankId) fd.set("rankId", rankId);
                startTransition(async () => { await formAction(fd); });
            }} className="space-y-3">
                <input type="hidden" name="organizationSlug" value={organizationSlug} />
                {rankId && <input type="hidden" name="rankId" value={rankId} />}

                {/* Name */}
                <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                        {t("rankName")} <span style={{ color: "rgba(240,80,80,0.7)" }}>*</span>
                    </label>
                    <input
                        className="sc-input w-full text-xs"
                        name="name"
                        placeholder='e.g. "Recruit", "Officer", "Commander"'
                        defaultValue={defaults?.name ?? ""}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {/* Order */}
                    <div>
                        <label className="mb-1 block text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                            {t("rankOrder")}
                        </label>
                        <input
                            className="sc-input w-full text-xs"
                            name="order"
                            type="number"
                            placeholder="1"
                            defaultValue={defaults?.order ?? 1}
                            min={1}
                        />
                        <p className="mt-1 text-[10px]" style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}>
                            Lower = entry level (1 = lowest)
                        </p>
                    </div>

                    {/* Color */}
                    <div>
                        <label className="mb-1 block text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                            {t("rankColor")}
                        </label>
                        <input
                            className="sc-input w-full text-xs"
                            name="color"
                            type="color"
                            defaultValue={defaults?.color ?? "#4fc3dc"}
                            style={{ padding: "2px 6px", height: "32px", cursor: "pointer" }}
                        />
                        <p className="mt-1 text-[10px]" style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}>
                            Badge accent color
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="mb-1 block text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}>
                        {t("rankDescription")} <span style={{ color: "rgba(200,220,232,0.3)" }}>(optional)</span>
                    </label>
                    <input
                        className="sc-input w-full text-xs"
                        name="description"
                        placeholder='e.g. "New members on probation"'
                        defaultValue={defaults?.description ?? ""}
                    />
                </div>

                {/* Default + actions */}
                <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-[10px] uppercase tracking-[0.12em]" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}>
                        <input type="checkbox" name="isDefault" value="true" defaultChecked={defaults?.isDefault ?? false} className="accent-(--accent-primary)" />
                        {t("rankDefault")}
                        <span className="normal-case tracking-normal text-[9px]" style={{ color: "rgba(200,220,232,0.3)" }}>
                            (auto-assigned to new members)
                        </span>
                    </label>
                    <div className="flex gap-2">
                        <button type="button" onClick={onCancel} className="sc-btn sc-btn-outline py-1 text-xs">
                            Cancel
                        </button>
                        <button type="submit" disabled={isPending} className="sc-btn py-1 text-xs disabled:opacity-50">
                            {isPending ? "…" : label}
                        </button>
                    </div>
                </div>

                {state.message && (
                    <p className="text-xs" style={{ color: state.success ? "rgba(79,195,220,0.7)" : "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                        {state.message}
                    </p>
                )}
            </form>
        </div>
    );
}
