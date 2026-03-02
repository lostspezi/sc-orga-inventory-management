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

export async function cancelAuecTransactionAction(formData: FormData): Promise<void> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const transactionId = String(formData.get("transactionId") ?? "").trim();

    if (!transactionId) return;

    const tx = await getAuecTransactionById(transactionId);

    if (!tx || (tx.status !== "requested" && tx.status !== "approved")) return;

    const org = await getOrganizationBySlug(tx.organizationSlug);

    if (!org) return;

    const actor = org.members.find((m) => m.userId === session.user!.id);

    if (!actor) return;

    const isAdminOrOwner = actor.role === "owner" || actor.role === "admin";
    const isMemberParty = tx.memberId === session.user!.id;

    if (!isAdminOrOwner && !isMemberParty) return;

    await updateAuecTransactionStatus(transactionId, { status: "cancelled" });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
        action: "auec_transaction.cancelled",
        entityType: "auec_transaction",
        entityId: transactionId,
        message: `aUEC transaction cancelled by ${isAdminOrOwner ? "admin" : "member"}.`,
    });

    if (tx.discordChannelId && tx.discordMessageId) {
        const updatedView = await getAuecTransactionViewById(transactionId);
        if (updatedView) {
            await updateAuecTransactionEmbed(tx.discordChannelId, tx.discordMessageId, updatedView);
        }
    }

    revalidatePath(`/terminal/orgs/${tx.organizationSlug}/inventory`);
}
