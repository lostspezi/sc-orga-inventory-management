"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { X } from "lucide-react";
import type { OrgMemberView } from "@/lib/types/org-member";
import type { OrgRankView } from "@/lib/types/org-rank";
import MemberRankBadge from "./member-rank-badge";
import { updateMemberProfileAction } from "@/lib/actions/update-member-profile-action";
import { assignMemberRankAction } from "@/lib/actions/assign-member-rank-action";
import { suspendMemberAction } from "@/lib/actions/suspend-member-action";
import { reactivateMemberAction } from "@/lib/actions/reactivate-member-action";
import { removeOrgMemberAction } from "@/lib/actions/remove-org-member-action";
import { changeOrgMemberRoleAction } from "@/lib/actions/change-org-member-role-action";

type Props = {
    member: OrgMemberView | null;
    onClose: () => void;
    organizationSlug: string;
    ranks: OrgRankView[];
    actorRole: "owner" | "admin" | "hr" | "member";
};

const init = { success: false, message: "" };

export default function MemberDetailDrawer({ member, onClose, organizationSlug, ranks, actorRole }: Props) {
    const t = useTranslations("members");
    const router = useRouter();
    const drawerRef = useRef<HTMLDivElement>(null);

    const canEditProfile = ["owner", "admin", "hr"].includes(actorRole);
    const canChangeRole = ["owner", "admin"].includes(actorRole);
    const canSuspend = ["owner", "admin"].includes(actorRole);
    const canRemove = ["owner", "admin"].includes(actorRole);

    const [profileState, profileFormAction, profilePending] = useActionState(updateMemberProfileAction, init);
    const [rankState, rankFormAction, rankPending] = useActionState(assignMemberRankAction, init);
    const [roleState, roleFormAction, rolePending] = useActionState(changeOrgMemberRoleAction, init);
    const [suspendState, suspendFormAction, suspendPending] = useActionState(suspendMemberAction, init);
    const [reactivateState, reactivateFormAction, reactivatePending] = useActionState(reactivateMemberAction, init);
    const [removeState, removeFormAction, removePending] = useActionState(removeOrgMemberAction, init);
    const [confirmAction, setConfirmAction] = useState<"suspend" | "reactivate" | "remove" | null>(null);

    useEffect(() => {
        if (profileState.success || rankState.success || roleState.success ||
            suspendState.success || reactivateState.success) {
            router.refresh();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profileState.success, rankState.success, roleState.success,
        suspendState.success, reactivateState.success]);

    useEffect(() => {
        if (removeState.success) {
            onClose();
            router.refresh();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [removeState.success]);

    // Close on backdrop click
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
                onClose();
            }
        };
        if (member) {
            document.addEventListener("mousedown", handleClick);
        }
        return () => document.removeEventListener("mousedown", handleClick);
    }, [member, onClose]);

    if (!member) return null;
    if (typeof document === "undefined") return null;

    const isSuspended = member.status === "suspended";
    const isOwner = member.role === "owner";

    const roleBadgeColor = member.role === "owner" ? "rgba(240,165,0,0.85)"
        : member.role === "admin" ? "rgba(79,195,220,0.75)"
        : member.role === "hr" ? "rgba(160,120,255,0.75)"
        : "rgba(200,220,232,0.5)";

    const statusColor = isSuspended ? "rgba(240,165,0,0.85)" : "rgba(80,210,120,0.75)";

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                style={{ background: "rgba(0,0,0,0.5)" }}
            />
            {/* Drawer */}
            <div
                ref={drawerRef}
                className="fixed right-0 top-0 z-50 h-screen w-full max-w-md overflow-y-auto border-l"
                style={{
                    borderColor: "rgba(79,195,220,0.18)",
                    background: "rgba(6,14,22,0.98)",
                }}
            >
                {/* Header */}
                <div
                    className="sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3"
                    style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(6,14,22,0.98)" }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold"
                            style={{
                                borderColor: "rgba(79,195,220,0.25)",
                                background: "rgba(79,195,220,0.08)",
                                color: "var(--accent-primary)",
                                fontFamily: "var(--font-display)",
                            }}
                        >
                            {(member.displayName ?? member.username).charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <div
                                className="text-sm font-semibold uppercase tracking-[0.06em]"
                                style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                            >
                                {member.displayName ?? member.username}
                            </div>
                            {member.displayName && (
                                <div className="text-[10px]" style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}>
                                    {member.username}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="rounded border px-2 py-0.5 text-[10px] uppercase" style={{ borderColor: `${roleBadgeColor}30`, color: roleBadgeColor, fontFamily: "var(--font-mono)" }}>
                            {member.role === "hr" ? t("roleHr") : member.role}
                        </span>
                        <span className="rounded border px-2 py-0.5 text-[10px] uppercase" style={{ borderColor: `${statusColor}30`, color: statusColor, fontFamily: "var(--font-mono)" }}>
                            {isSuspended ? t("statusSuspended") : t("statusActive")}
                        </span>
                        {member.rankName && <MemberRankBadge rankName={member.rankName} rankColor={member.rankColor} />}
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded p-1 opacity-60 hover:opacity-100 transition"
                            style={{ color: "rgba(200,220,232,0.7)" }}
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                <div className="space-y-4 p-4">
                    {/* Profile section */}
                    {canEditProfile && (
                        <section>
                            <SectionLabel>{t("displayNameLabel")} / {t("tagsLabel")} / {t("notesLabel")}</SectionLabel>
                            <form
                                action={(fd) => {
                                    fd.set("organizationSlug", organizationSlug);
                                    fd.set("targetUserId", member.userId);
                                    startTransition(async () => { await profileFormAction(fd); });
                                }}
                                className="space-y-3"
                            >
                                <input type="hidden" name="organizationSlug" value={organizationSlug} />
                                <input type="hidden" name="targetUserId" value={member.userId} />
                                <div>
                                    <FieldLabel>{t("displayNameLabel")}</FieldLabel>
                                    <input
                                        className="sc-input w-full"
                                        name="displayName"
                                        defaultValue={member.displayName ?? ""}
                                        placeholder={member.username}
                                    />
                                </div>
                                <div>
                                    <FieldLabel>{t("tagsLabel")} (comma-separated)</FieldLabel>
                                    <input
                                        className="sc-input w-full"
                                        name="tags"
                                        defaultValue={(member.tags ?? []).join(", ")}
                                        placeholder="logistics, quartermaster"
                                    />
                                </div>
                                <div>
                                    <FieldLabel>{t("notesLabel")}</FieldLabel>
                                    <textarea
                                        className="sc-input w-full resize-none"
                                        rows={3}
                                        name="notes"
                                        defaultValue={member.notes ?? ""}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    {profileState.message && (
                                        <span className="text-xs" style={{ color: profileState.success ? "rgba(79,195,220,0.7)" : "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                                            {profileState.message}
                                        </span>
                                    )}
                                    <button
                                        type="submit"
                                        disabled={profilePending}
                                        className="sc-btn ml-auto text-xs disabled:opacity-50"
                                    >
                                        {profilePending ? t("saving") : t("saveProfile")}
                                    </button>
                                </div>
                            </form>
                        </section>
                    )}

                    {/* Rank assignment */}
                    {canEditProfile && ranks.length > 0 && (
                        <section>
                            <SectionLabel>{t("assignRank")}</SectionLabel>
                            <form
                                action={(fd) => {
                                    fd.set("organizationSlug", organizationSlug);
                                    fd.set("targetUserId", member.userId);
                                    startTransition(async () => { await rankFormAction(fd); });
                                }}
                                className="flex items-center gap-2"
                            >
                                <input type="hidden" name="organizationSlug" value={organizationSlug} />
                                <input type="hidden" name="targetUserId" value={member.userId} />
                                <select
                                    className="sc-input flex-1"
                                    name="rankId"
                                    defaultValue={member.rankId ?? ""}
                                >
                                    <option value="">{t("rankNone")}</option>
                                    {ranks.map((r) => (
                                        <option key={r._id} value={r._id}>{r.name}</option>
                                    ))}
                                </select>
                                <button type="submit" disabled={rankPending} className="sc-btn text-xs disabled:opacity-50">
                                    {rankPending ? "…" : t("assignRank")}
                                </button>
                            </form>
                            {rankState.message && (
                                <p className="mt-1 text-xs" style={{ color: rankState.success ? "rgba(79,195,220,0.7)" : "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                                    {rankState.message}
                                </p>
                            )}
                        </section>
                    )}

                    {/* Role change */}
                    {canChangeRole && !isOwner && (
                        <section>
                            <SectionLabel>Role</SectionLabel>
                            <form
                                action={(fd) => {
                                    fd.set("organizationSlug", organizationSlug);
                                    fd.set("targetUserId", member.userId);
                                    startTransition(async () => { await roleFormAction(fd); });
                                }}
                                className="flex items-center gap-2"
                            >
                                <input type="hidden" name="organizationSlug" value={organizationSlug} />
                                <input type="hidden" name="targetUserId" value={member.userId} />
                                <select className="sc-input flex-1" name="newRole" defaultValue={member.role}>
                                    <option value="member">{t("roleMember")}</option>
                                    <option value="hr">{t("roleHr")}</option>
                                    {actorRole === "owner" && <option value="admin">{t("roleAdmin")}</option>}
                                </select>
                                <button type="submit" disabled={rolePending} className="sc-btn text-xs disabled:opacity-50">
                                    {rolePending ? "…" : t("applyRole")}
                                </button>
                            </form>
                            {roleState.message && (
                                <p className="mt-1 text-xs" style={{ color: roleState.success ? "rgba(79,195,220,0.7)" : "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                                    {roleState.message}
                                </p>
                            )}
                        </section>
                    )}

                    {/* Join info */}
                    <section>
                        <SectionLabel>{t("joinedAt")}</SectionLabel>
                        <p className="text-xs" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}>
                            {new Date(member.joinedAt).toLocaleDateString("en-GB", { dateStyle: "long" })}
                        </p>
                        {member.auecBalance != null && (
                            <p className="mt-1 text-xs" style={{ color: "rgba(80,210,120,0.7)", fontFamily: "var(--font-mono)" }}>
                                {member.auecBalance.toLocaleString()} aUEC
                            </p>
                        )}
                    </section>

                    {/* History */}
                    {(member.roleHistory.length > 0 || member.rankHistory.length > 0) && (
                        <section>
                            <SectionLabel>{t("historyTimeline")}</SectionLabel>
                            <div className="space-y-1.5 max-h-48 overflow-y-auto">
                                {[...member.roleHistory.map((e) => ({ ...e, type: "role" as const })),
                                  ...member.rankHistory.map((e) => ({ ...e, type: "rank" as const }))]
                                    .sort((a, b) => {
                                        const aTime = "changedAt" in a ? new Date(a.changedAt).getTime() : new Date((a as { assignedAt: string }).assignedAt).getTime();
                                        const bTime = "changedAt" in b ? new Date(b.changedAt).getTime() : new Date((b as { assignedAt: string }).assignedAt).getTime();
                                        return bTime - aTime;
                                    })
                                    .map((entry, i) => (
                                        <div key={i} className="rounded border px-2 py-1.5" style={{ borderColor: "rgba(79,195,220,0.1)", background: "rgba(7,18,28,0.2)" }}>
                                            <p className="text-[10px]" style={{ color: "rgba(200,220,232,0.6)", fontFamily: "var(--font-mono)" }}>
                                                {entry.type === "role"
                                                    ? `Role: ${(entry as { fromRole: string }).fromRole} → ${(entry as { toRole: string }).toRole}`
                                                    : `Rank: ${(entry as { fromRankId?: string }).fromRankId ?? "none"} → ${(entry as { toRankId?: string }).toRankId ?? "none"}`}
                                                {" · "}{entry.type === "role"
                                                    ? (entry as { changedByUsername: string }).changedByUsername
                                                    : (entry as { assignedByUsername: string }).assignedByUsername}
                                            </p>
                                            <p className="text-[9px]" style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}>
                                                {entry.type === "role"
                                                    ? new Date((entry as { changedAt: string }).changedAt).toLocaleString("en-GB")
                                                    : new Date((entry as { assignedAt: string }).assignedAt).toLocaleString("en-GB")}
                                            </p>
                                        </div>
                                    ))}
                            </div>
                        </section>
                    )}

                    {/* Actions */}
                    {(canSuspend || canRemove) && !isOwner && (
                        <section>
                            <SectionLabel>Actions</SectionLabel>
                            <div className="flex flex-wrap gap-2">
                                {canSuspend && !isSuspended && (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmAction("suspend")}
                                        disabled={suspendPending}
                                        className="rounded border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition hover:opacity-90 disabled:opacity-50"
                                        style={{ borderColor: "rgba(240,165,0,0.3)", color: "rgba(240,165,0,0.85)", background: "rgba(240,165,0,0.06)", fontFamily: "var(--font-mono)" }}
                                    >
                                        {t("suspendMember")}
                                    </button>
                                )}
                                {canSuspend && isSuspended && (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmAction("reactivate")}
                                        disabled={reactivatePending}
                                        className="rounded border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition hover:opacity-90 disabled:opacity-50"
                                        style={{ borderColor: "rgba(80,210,120,0.3)", color: "rgba(80,210,120,0.85)", background: "rgba(80,210,120,0.06)", fontFamily: "var(--font-mono)" }}
                                    >
                                        {t("reactivateMember")}
                                    </button>
                                )}
                                {canRemove && (
                                    <button
                                        type="button"
                                        onClick={() => setConfirmAction("remove")}
                                        disabled={removePending}
                                        className="rounded border px-3 py-1.5 text-xs uppercase tracking-[0.1em] transition hover:opacity-90 disabled:opacity-50"
                                        style={{ borderColor: "rgba(240,60,60,0.3)", color: "rgba(240,80,80,0.85)", background: "rgba(240,60,60,0.06)", fontFamily: "var(--font-mono)" }}
                                    >
                                        {t("removeMember")}
                                    </button>
                                )}
                            </div>
                            {(suspendState.message || reactivateState.message || removeState.message) && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                                    {suspendState.message || reactivateState.message || removeState.message}
                                </p>
                            )}
                        </section>
                    )}
                </div>
            </div>

            {/* Confirm dialog */}
            {confirmAction && (
                <dialog
                    open
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-transparent"
                    style={{ margin: 0, padding: 0, maxWidth: "100vw", maxHeight: "100vh", width: "100vw", height: "100vh" }}
                >
                    <div
                        className="w-full max-w-sm rounded-lg border p-5"
                        style={{ borderColor: "rgba(79,195,220,0.2)", background: "rgba(6,14,22,0.98)" }}
                    >
                        <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}>
                            {confirmAction === "suspend" ? t("suspendConfirmTitle")
                                : confirmAction === "reactivate" ? t("reactivateConfirmTitle")
                                : t("removeMemberTitle")}
                        </h3>
                        <p className="mb-4 text-xs" style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}>
                            {confirmAction === "suspend" ? t("suspendConfirmDesc", { name: member.displayName ?? member.username })
                                : confirmAction === "reactivate" ? t("reactivateConfirmDesc", { name: member.displayName ?? member.username })
                                : t("removeMemberConfirm", { name: member.displayName ?? member.username })}
                        </p>
                        <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setConfirmAction(null)} className="sc-btn sc-btn-outline text-xs">
                                Cancel
                            </button>
                            <form action={(fd) => {
                                fd.set("organizationSlug", organizationSlug);
                                fd.set("targetUserId", member.userId);
                                setConfirmAction(null);
                                startTransition(async () => {
                                    if (confirmAction === "suspend") await suspendFormAction(fd);
                                    else if (confirmAction === "reactivate") await reactivateFormAction(fd);
                                    else await removeFormAction(fd);
                                });
                            }}>
                                <input type="hidden" name="organizationSlug" value={organizationSlug} />
                                <input type="hidden" name="targetUserId" value={member.userId} />
                                <button type="submit" className="sc-btn text-xs">
                                    {confirmAction === "remove" ? t("removeMemberButton") : "Confirm"}
                                </button>
                            </form>
                        </div>
                    </div>
                </dialog>
            )}
        </>,
        document.body
    );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-2 text-[10px] uppercase tracking-[0.22em]" style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}>
            {children}
        </p>
    );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <label className="mb-1.5 block text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
            {children}
        </label>
    );
}

