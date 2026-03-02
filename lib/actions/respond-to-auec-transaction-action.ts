"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    getAuecTransactionById,
    getAuecTransactionViewById,
    updateAuecTransactionStatus,
} from "@/lib/repositories/organization-auec-transaction-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { updateAuecTransactionEmbed } from "@/lib/discord/send-auec-transaction-embed";
import { notify } from "@/lib/notify";

export async function respondToAuecTransactionAction(formData: FormData): Promise<void> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const transactionId = String(formData.get("transactionId") ?? "").trim();
    const response = String(formData.get("response") ?? "").trim();

    if (!transactionId || (response !== "approve" && response !== "reject")) return;

    const tx = await getAuecTransactionById(transactionId);

    if (!tx || tx.status !== "requested") return;

    const org = await getOrganizationBySlug(tx.organizationSlug);

    if (!org) return;

    const actor = org.members.find((m) => m.userId === session.user!.id);

    if (!actor || (actor.role !== "owner" && actor.role !== "admin")) return;

    const newStatus = response === "approve" ? "approved" : "rejected";

    await updateAuecTransactionStatus(transactionId, { status: newStatus });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
        action: newStatus === "approved" ? "auec_transaction.approved" : "auec_transaction.rejected",
        entityType: "auec_transaction",
        entityId: transactionId,
        message: `aUEC transaction ${newStatus} by admin.`,
    });

    const txLink = `/terminal/orgs/${org.slug}/inventory?tab=auec`;
    if (newStatus === "approved") {
        await notify(
            tx.memberId,
            "trade.approved",
            "aUEC Request Approved",
            `Your aUEC request for ${tx.auecAmount.toLocaleString()} aUEC has been approved.`,
            txLink
        );
    } else {
        await notify(
            tx.memberId,
            "trade.rejected",
            "aUEC Request Rejected",
            `Your aUEC request for ${tx.auecAmount.toLocaleString()} aUEC has been rejected.`,
            txLink
        );
    }

    if (tx.discordChannelId && tx.discordMessageId) {
        const updatedView = await getAuecTransactionViewById(transactionId);
        if (updatedView) {
            await updateAuecTransactionEmbed(tx.discordChannelId, tx.discordMessageId, updatedView);
        }
    }

    revalidatePath(`/terminal/orgs/${org.slug}/inventory`);
}
