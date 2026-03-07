"use client";

import { useState, useMemo, useCallback, startTransition, useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { OrgMemberView } from "@/lib/types/org-member";
import type { OrgRankView } from "@/lib/types/org-rank";
import MemberRankBadge from "./member-rank-badge";
import MemberDetailDrawer from "./member-detail-drawer";
import BulkActionBar from "./bulk-action-bar";
import { exportMembersAction } from "@/lib/actions/export-members-action";

type Props = {
    members: OrgMemberView[];
    ranks: OrgRankView[];
    organizationSlug: string;
    actorRole: "owner" | "admin" | "hr" | "member";
    isPro: boolean;
};

const exportInit: { success: boolean; message: string; csv?: string } = { success: false, message: "" };

export default function MemberList({ members, ranks, organizationSlug, actorRole, isPro }: Props) {
    const t = useTranslations("members");
    const [search, setSearch] = useState("");
    const [filterRole, setFilterRole] = useState("");
    const [filterRank, setFilterRank] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [drawerMember, setDrawerMember] = useState<OrgMemberView | null>(null);
    const [exportState, exportFormAction, exportPending] = useActionState(exportMembersAction, exportInit);

    useEffect(() => {
        if (exportState.success && exportState.csv) {
            const blob = new Blob([exportState.csv], { type: "text/csv" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `members-${organizationSlug}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        }
    }, [exportState.success, exportState.csv, organizationSlug]);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return members.filter((m) => {
            if (q && !m.username.toLowerCase().includes(q) && !(m.displayName ?? "").toLowerCase().includes(q) && !(m.tags ?? []).some((tag) => tag.toLowerCase().includes(q))) return false;
            if (filterRole && m.role !== filterRole) return false;
            if (filterRank && m.rankId !== filterRank) return false;
            if (filterStatus && m.status !== filterStatus) return false;
            return true;
        });
    }, [members, search, filterRole, filterRank, filterStatus]);

    const toggleSelect = (userId: string) => {
        setSelectedIds((prev) =>
            prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filtered.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filtered.map((m) => m.userId));
        }
    };

    const clearSelection = useCallback(() => setSelectedIds([]), []);
    const closeDrawer = useCallback(() => setDrawerMember(null), []);

    const handleExport = () => {
        const fd = new FormData();
        fd.set("organizationSlug", organizationSlug);
        startTransition(async () => { await exportFormAction(fd); });
    };

    const roleBadgeColor = (role: string) =>
        role === "owner" ? "rgba(240,165,0,0.85)"
            : role === "admin" ? "rgba(79,195,220,0.75)"
            : role === "hr" ? "rgba(160,120,255,0.75)"
            : "rgba(200,220,232,0.45)";

    return (
        <div className="space-y-3">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-2">
                <input
                    className="sc-input flex-1 min-w-40 py-1 text-xs"
                    placeholder={t("searchPlaceholder")}
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <select className="sc-input py-1 text-xs" value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                    <option value="">{t("allRoles")}</option>
                    <option value="owner">Owner</option>
                    <option value="admin">{t("roleAdmin")}</option>
                    <option value="hr">{t("roleHr")}</option>
                    <option value="member">{t("roleMember")}</option>
                </select>
                {ranks.length > 0 && (
                    <select className="sc-input py-1 text-xs" value={filterRank} onChange={(e) => setFilterRank(e.target.value)}>
                        <option value="">{t("allRanks")}</option>
                        {ranks.map((r) => <option key={r._id} value={r._id}>{r.name}</option>)}
                    </select>
                )}
                <select className="sc-input py-1 text-xs" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="">{t("allStatuses")}</option>
                    <option value="active">{t("statusActive")}</option>
                    <option value="suspended">{t("statusSuspended")}</option>
                </select>
                {isPro && (
                    <button
                        type="button"
                        onClick={handleExport}
                        disabled={exportPending}
                        className="sc-btn sc-btn-outline py-1 text-xs disabled:opacity-50"
                    >
                        {exportPending ? t("exportDownloading") : t("exportCsvPro")}
                    </button>
                )}
            </div>

            {/* Count */}
            <div className="flex items-center justify-between">
                <p className="text-[10px] uppercase tracking-[0.2em]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
                    {t("activeMembersCount", { count: filtered.length })}
                </p>
                {filtered.length > 0 && (
                    <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-[10px] uppercase tracking-[0.12em] opacity-60 hover:opacity-100 transition"
                        style={{ color: "rgba(200,220,232,0.7)", fontFamily: "var(--font-mono)" }}
                    >
                        {selectedIds.length === filtered.length ? t("clearSelection") : t("selectAll")}
                    </button>
                )}
            </div>

            {/* Member rows */}
            <div className="space-y-1.5">
                {filtered.map((member) => {
                    const isSelected = selectedIds.includes(member.userId);
                    const isSuspended = member.status === "suspended";

                    return (
                        <div
                            key={member.userId}
                            className="flex cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 transition hover:border-[rgba(79,195,220,0.22)]"
                            style={{
                                borderColor: isSelected ? "rgba(79,195,220,0.35)" : "rgba(79,195,220,0.1)",
                                background: isSelected ? "rgba(79,195,220,0.05)" : "rgba(7,18,28,0.18)",
                                opacity: isSuspended ? 0.6 : 1,
                            }}
                            onClick={() => setDrawerMember(member)}
                        >
                            {/* Checkbox */}
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => { e.stopPropagation(); toggleSelect(member.userId); }}
                                onClick={(e) => e.stopPropagation()}
                                className="h-3.5 w-3.5 cursor-pointer accent-(--accent-primary)"
                            />
                            {/* Avatar initial */}
                            <div
                                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold"
                                style={{ borderColor: "rgba(79,195,220,0.2)", background: "rgba(79,195,220,0.07)", color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                            >
                                {(member.displayName ?? member.username).charAt(0).toUpperCase()}
                            </div>
                            {/* Name & badges */}
                            <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
                                <span className="truncate text-xs" style={{ color: "rgba(200,220,232,0.75)", fontFamily: "var(--font-mono)" }}>
                                    {member.displayName ? (
                                        <>{member.displayName} <span style={{ color: "rgba(200,220,232,0.35)" }}>({member.username})</span></>
                                    ) : member.username}
                                </span>
                                <span className="rounded border px-1.5 py-0.5 text-[9px] uppercase" style={{ borderColor: `${roleBadgeColor(member.role)}30`, color: roleBadgeColor(member.role), fontFamily: "var(--font-mono)" }}>
                                    {member.role === "hr" ? t("roleHr") : member.role}
                                </span>
                                {isSuspended && (
                                    <span className="rounded border px-1.5 py-0.5 text-[9px] uppercase" style={{ borderColor: "rgba(240,165,0,0.3)", color: "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                                        {t("statusSuspended")}
                                    </span>
                                )}
                                {member.rankName && <MemberRankBadge rankName={member.rankName} rankColor={member.rankColor} />}
                                {member.auecBalance != null && (
                                    <span className="rounded border px-1.5 py-0.5 text-[9px]" style={{ borderColor: "rgba(80,210,120,0.22)", color: "rgba(80,210,120,0.7)", fontFamily: "var(--font-mono)" }}>
                                        {member.auecBalance.toLocaleString()} aUEC
                                    </span>
                                )}
                                {(member.tags ?? []).map((tag) => (
                                    <span key={tag} className="rounded border px-1.5 py-0.5 text-[9px]" style={{ borderColor: "rgba(160,120,255,0.2)", color: "rgba(160,120,255,0.65)", fontFamily: "var(--font-mono)" }}>
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            {/* Join date */}
                            <span className="hidden text-[10px] sm:block" style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}>
                                {new Date(member.joinedAt).toLocaleDateString("en-GB", { dateStyle: "short" })}
                            </span>
                        </div>
                    );
                })}
            </div>

            {filtered.length === 0 && (
                <p className="text-center text-xs py-6" style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}>
                    No members match your filters.
                </p>
            )}

            {/* Bulk bar */}
            <BulkActionBar
                organizationSlug={organizationSlug}
                selectedIds={selectedIds}
                ranks={ranks}
                onClear={clearSelection}
            />

            {/* Detail drawer */}
            <MemberDetailDrawer
                member={drawerMember}
                onClose={closeDrawer}
                organizationSlug={organizationSlug}
                ranks={ranks}
                actorRole={actorRole}
            />
        </div>
    );
}
