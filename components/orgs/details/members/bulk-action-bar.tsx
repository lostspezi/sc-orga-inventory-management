"use client";

import { startTransition, useActionState } from "react";
import { useTranslations } from "next-intl";
import { bulkAssignMemberRankAction } from "@/lib/actions/bulk-assign-member-rank-action";
import type { OrgRankView } from "@/lib/types/org-rank";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
    organizationSlug: string;
    selectedIds: string[];
    ranks: OrgRankView[];
    onClear: () => void;
};

const initialState = { success: false, message: "" };

export default function BulkActionBar({ organizationSlug, selectedIds, ranks, onClear }: Props) {
    const t = useTranslations("members");
    const router = useRouter();
    const [state, formAction, isPending] = useActionState(bulkAssignMemberRankAction, initialState);

    useEffect(() => {
        if (state.success) {
            onClear();
            router.refresh();
        }
    }, [state.success, onClear, router]);

    if (selectedIds.length === 0) return null;

    const handleAssign = (rankId: string) => {
        const formData = new FormData();
        formData.set("organizationSlug", organizationSlug);
        formData.set("rankId", rankId);
        formData.set("userIds", selectedIds.join(","));
        startTransition(async () => {
            await formAction(formData);
        });
    };

    return (
        <div
            className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-lg border px-4 py-2.5 shadow-lg"
            style={{
                borderColor: "rgba(79,195,220,0.3)",
                background: "rgba(6,14,22,0.95)",
                backdropFilter: "blur(8px)",
            }}
        >
            <span
                className="text-xs uppercase tracking-[0.14em]"
                style={{ color: "rgba(79,195,220,0.8)", fontFamily: "var(--font-mono)" }}
            >
                {t("selected", { count: selectedIds.length })}
            </span>

            {ranks.length > 0 && (
                <div className="flex items-center gap-2">
                    <select
                        className="sc-input py-1 text-xs"
                        disabled={isPending}
                        defaultValue=""
                        onChange={(e) => {
                            if (e.target.value) handleAssign(e.target.value);
                        }}
                    >
                        <option value="" disabled>
                            {t("assignRank")}
                        </option>
                        {ranks.map((r) => (
                            <option key={r._id} value={r._id}>
                                {r.name}
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <button
                type="button"
                onClick={onClear}
                className="text-xs uppercase tracking-[0.12em] opacity-60 hover:opacity-100"
                style={{ color: "rgba(200,220,232,0.7)", fontFamily: "var(--font-mono)" }}
            >
                {t("clearSelection")}
            </button>

            {state.message && !state.success && (
                <span className="text-xs" style={{ color: "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                    {state.message}
                </span>
            )}
        </div>
    );
}
