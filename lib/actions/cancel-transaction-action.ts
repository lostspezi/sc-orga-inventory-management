"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    getTransactionById,
    getTransactionViewById,
    updateTransactionStatus,
} from "@/lib/repositories/organization-transaction-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { updateTransactionEmbed } from "@/lib/discord/send-transaction-embed";

export async function cancelTransactionAction(formData: FormData): Promise<void> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const transactionId = String(formData.get("transactionId") ?? "").trim();

    if (!transactionId) return;

    const tx = await getTransactionById(transactionId);

    if (!tx || (tx.status !== "requested" && tx.status !== "approved")) return;

    const org = await getOrganizationBySlug(tx.organizationSlug);

    if (!org) return;

    const actor = org.members.find((m) => m.userId === session.user!.id);

    if (!actor) return;

    const isAdminOrOwner = actor.role === "owner" || actor.role === "admin";
    const isMemberInitiator = tx.memberId === session.user!.id;

    if (!isAdminOrOwner && !isMemberInitiator) return;

    await updateTransactionStatus(transactionId, { status: "cancelled" });

    await createOrganizationAuditLog({
        organizationId: tx.organizationId,
        organizationSlug: tx.organizationSlug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "transaction.cancelled",
        entityType: "transaction",
        entityId: transactionId,
        message: `Transaction for "${tx.itemName}" cancelled by ${isAdminOrOwner ? "admin" : "member"}.`,
    });

    if (tx.discordChannelId && tx.discordMessageId) {
        const updatedView = await getTransactionViewById(transactionId);
        if (updatedView) {
            await updateTransactionEmbed(tx.discordChannelId, tx.discordMessageId, updatedView);
        }
    }

    revalidatePath(`/terminal/orgs/${tx.organizationSlug}/transactions`);
    revalidatePath(`/terminal/orgs/${tx.organizationSlug}/inventory`);
}
