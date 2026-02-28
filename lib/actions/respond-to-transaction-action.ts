"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getTransactionById, updateTransactionStatus } from "@/lib/repositories/organization-transaction-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

export async function respondToTransactionAction(formData: FormData): Promise<void> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const transactionId = String(formData.get("transactionId") ?? "").trim();
    const response = String(formData.get("response") ?? "").trim();

    if (!transactionId || (response !== "approved" && response !== "rejected")) return;

    const tx = await getTransactionById(transactionId);

    if (!tx || tx.status !== "requested") return;

    const org = await getOrganizationBySlug(tx.organizationSlug);

    if (!org) return;

    const actor = org.members.find((m) => m.userId === session.user!.id);

    if (!actor) return;

    const isAdminOrOwner = actor.role === "owner" || actor.role === "admin";
    const isMemberParty = tx.memberId === session.user!.id;

    // Counter-party check
    if (tx.initiatedBy === "member" && !isAdminOrOwner) return;
    if (tx.initiatedBy === "admin" && !isMemberParty) return;

    const newStatus = response === "approved" ? "approved" : "rejected";

    await updateTransactionStatus(transactionId, { status: newStatus });

    const auditAction = response === "approved" ? "transaction.approved" : "transaction.rejected";
    const auditMessage = response === "approved"
        ? `Transaction for "${tx.itemName}" approved.`
        : `Transaction for "${tx.itemName}" rejected.`;

    await createOrganizationAuditLog({
        organizationId: tx.organizationId,
        organizationSlug: tx.organizationSlug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: auditAction,
        entityType: "transaction",
        entityId: transactionId,
        message: auditMessage,
    });

    revalidatePath(`/terminal/orgs/${tx.organizationSlug}/transactions`);
    revalidatePath(`/terminal/orgs/${tx.organizationSlug}/inventory`);
}
