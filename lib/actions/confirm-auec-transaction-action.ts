"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug, adjustOrgAuecBalance } from "@/lib/repositories/organization-repository";
import {
    getAuecTransactionById,
    getAuecTransactionViewById,
    updateAuecTransactionStatus,
} from "@/lib/repositories/organization-auec-transaction-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { updateAuecTransactionEmbed } from "@/lib/discord/send-auec-transaction-embed";
import { notify, notifyMany } from "@/lib/notify";
import { getDiscordUserId } from "@/lib/discord/get-discord-user-id";
import { updateMemberDkp } from "@/lib/raid-helper/update-member-dkp";

export async function confirmAuecTransactionAction(formData: FormData): Promise<void> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const transactionId = String(formData.get("transactionId") ?? "").trim();

    if (!transactionId) return;

    const tx = await getAuecTransactionById(transactionId);

    if (!tx || tx.status !== "approved") return;

    const org = await getOrganizationBySlug(tx.organizationSlug);

    if (!org) return;

    const actor = org.members.find((m) => m.userId === session.user!.id);

    if (!actor) return;

    const isAdminOrOwner = actor.role === "owner" || actor.role === "admin";
    const isMemberParty = tx.memberId === session.user!.id;

    if (!isAdminOrOwner && !isMemberParty) return;

    const patch: { memberConfirmed?: boolean; adminConfirmed?: boolean; adminConfirmedByUsername?: string } = {};

    if (isAdminOrOwner && !tx.adminConfirmed) {
        patch.adminConfirmed = true;
        patch.adminConfirmedByUsername = session.user.rsiHandle ?? session.user.name ?? "Admin";
    } else if (isMemberParty && !tx.memberConfirmed) {
        patch.memberConfirmed = true;
    } else {
        return; // already confirmed by this side
    }

    const updatedMemberConfirmed = patch.memberConfirmed ?? tx.memberConfirmed;
    const updatedAdminConfirmed = patch.adminConfirmed ?? tx.adminConfirmed;

    const txLink = `/terminal/orgs/${tx.organizationSlug}/inventory?tab=auec`;

    if (updatedMemberConfirmed && updatedAdminConfirmed) {
        await updateAuecTransactionStatus(transactionId, { ...patch, status: "completed" });

        // Adjust org aUEC balance
        // member_to_org (sell): org gains aUEC → +delta
        // org_to_member (buy): org loses aUEC → -delta
        const delta = tx.direction === "member_to_org" ? tx.auecAmount : -tx.auecAmount;
        await adjustOrgAuecBalance(org._id, delta);

        await createOrganizationAuditLog({
            organizationId: org._id,
            organizationSlug: org.slug,
            actorUserId: session.user.id,
            actorUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
            action: "auec_transaction.completed",
            entityType: "auec_transaction",
            entityId: transactionId,
            message: `aUEC transaction completed. Balance adjusted by ${delta > 0 ? "+" : ""}${delta.toLocaleString()} aUEC.`,
            metadata: { delta, direction: tx.direction, auecAmount: tx.auecAmount, totalDkp: tx.totalDkp },
        });

        // Sync DKP with Raid Helper (non-blocking)
        if (org.raidHelperApiKey && org.discordGuildId) {
            const memberDiscordId = await getDiscordUserId(tx.memberId);
            if (memberDiscordId) {
                // member_to_org (sell) → member receives DKP → add
                // org_to_member (buy) → member spends DKP → subtract
                const dkpOperation = tx.direction === "member_to_org" ? "add" : "subtract";
                const verb = tx.direction === "member_to_org" ? "Sell" : "Buy";
                const adminName = patch.adminConfirmedByUsername ?? tx.adminConfirmedByUsername ?? "Admin";
                const now = new Date();
                const ts = now.toLocaleDateString("en-GB", {
                    day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
                }) + " " + now.toLocaleTimeString("en-GB", {
                    hour: "2-digit", minute: "2-digit", timeZone: "UTC",
                }) + " UTC";
                const dkpDescription = `[SC Orga] ${verb} ${tx.auecAmount.toLocaleString()} aUEC | TxID: ${transactionId} | Trader: ${tx.memberUsername} | Admin: ${adminName} | ${ts}`;
                const dkpOk = await updateMemberDkp(
                    org.discordGuildId,
                    memberDiscordId,
                    org.raidHelperApiKey,
                    dkpOperation,
                    tx.totalDkp,
                    dkpDescription
                );
                if (!dkpOk) {
                    console.error(`[DKP] Failed to update DKP for member ${tx.memberId} after completing aUEC transaction ${transactionId}`);
                }
            }
        }

        await notify(
            tx.memberId,
            "trade.completed",
            "aUEC Trade Completed",
            `Your aUEC trade of ${tx.auecAmount.toLocaleString()} aUEC is complete.`,
            txLink
        );
    } else {
        await updateAuecTransactionStatus(transactionId, patch);

        await createOrganizationAuditLog({
            organizationId: org._id,
            organizationSlug: org.slug,
            actorUserId: session.user.id,
            actorUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
            action: "auec_transaction.confirmed",
            entityType: "auec_transaction",
            entityId: transactionId,
            message: `${isAdminOrOwner ? "Admin" : "Member"} confirmed in-game aUEC trade. Waiting for other party.`,
        });

        if (isAdminOrOwner) {
            if (tx.memberId !== session.user!.id) {
                await notify(
                    tx.memberId,
                    "trade.confirmed",
                    "Admin Confirmed aUEC Trade",
                    `An admin confirmed the in-game aUEC exchange. Awaiting your confirmation.`,
                    txLink
                );
            }
        } else {
            const adminIds = org.members
                .filter((m) => (m.role === "admin" || m.role === "owner") && m.userId !== session.user!.id)
                .map((m) => m.userId);
            await notifyMany(
                adminIds,
                "trade.confirmed",
                "Member Confirmed aUEC Trade",
                `${session.user.rsiHandle ?? session.user.name ?? "A member"} confirmed in-game aUEC exchange. Awaiting admin confirmation.`,
                txLink
            );
        }
    }

    if (tx.discordChannelId && tx.discordMessageId) {
        const updatedView = await getAuecTransactionViewById(transactionId);
        if (updatedView) {
            await updateAuecTransactionEmbed(tx.discordChannelId, tx.discordMessageId, updatedView);
        }
    }

    revalidatePath(`/terminal/orgs/${tx.organizationSlug}/inventory`);
}
