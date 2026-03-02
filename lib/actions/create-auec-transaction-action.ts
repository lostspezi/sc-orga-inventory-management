"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import {
    createAuecTransaction,
    setAuecTransactionDiscordMessage,
} from "@/lib/repositories/organization-auec-transaction-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { sendAuecTransactionEmbed } from "@/lib/discord/send-auec-transaction-embed";
import { notifyMany } from "@/lib/notify";
import { getDiscordUserId } from "@/lib/discord/get-discord-user-id";
import { getMemberDkp } from "@/lib/raid-helper/get-member-dkp";

export type CreateAuecTransactionState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        auecAmount?: string;
        direction?: string;
    };
};

const initialState: CreateAuecTransactionState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export async function createAuecTransactionAction(
    _prevState: CreateAuecTransactionState,
    formData: FormData
): Promise<CreateAuecTransactionState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const direction = String(formData.get("direction") ?? "").trim();
    const auecAmountRaw = Number(formData.get("auecAmount"));
    const note = String(formData.get("note") ?? "").trim() || undefined;

    if (!organizationSlug) {
        return { ...initialState, message: "Missing organization." };
    }

    if (direction !== "member_to_org" && direction !== "org_to_member") {
        return { ...initialState, message: "Please select a valid direction.", fieldErrors: { direction: "Required." } };
    }

    if (!Number.isFinite(auecAmountRaw) || auecAmountRaw <= 0) {
        return { ...initialState, message: "Enter a valid aUEC amount.", fieldErrors: { auecAmount: "Must be greater than 0." } };
    }

    const auecAmount = Math.round(auecAmountRaw);

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return { ...initialState, message: "Organization not found." };
    }

    const member = org.members.find((m) => m.userId === session.user!.id);

    if (!member) {
        return { ...initialState, message: "You are not a member of this organization." };
    }

    // Check rates are configured
    if (direction === "org_to_member") {
        if (!org.auecBuyPriceDkp || !org.auecBuyPriceAuec) {
            return { ...initialState, message: "Buy rates are not configured for this organization." };
        }
    } else {
        if (!org.auecSellPriceDkp || !org.auecSellPriceAuec) {
            return { ...initialState, message: "Sell rates are not configured for this organization." };
        }
    }

    const priceDkp = direction === "org_to_member" ? org.auecBuyPriceDkp! : org.auecSellPriceDkp!;
    const priceAuec = direction === "org_to_member" ? org.auecBuyPriceAuec! : org.auecSellPriceAuec!;
    const totalDkp = Math.round((auecAmount / priceAuec) * priceDkp);
    const dkpRate = totalDkp / auecAmount;

    // Check org has enough aUEC balance for buy (org_to_member)
    if (direction === "org_to_member") {
        const balance = org.auecBalance ?? 0;
        if (auecAmount > balance) {
            return {
                ...initialState,
                message: `Insufficient org aUEC balance. Available: ${balance.toLocaleString()} aUEC.`,
                fieldErrors: { auecAmount: `Only ${balance.toLocaleString()} aUEC available.` },
            };
        }
    }

    // Check member has enough DKP for buy (org_to_member)
    if (direction === "org_to_member" && org.raidHelperApiKey && org.discordGuildId) {
        const discordId = await getDiscordUserId(session.user.id);
        if (discordId) {
            const currentDkp = await getMemberDkp(org.discordGuildId, discordId, org.raidHelperApiKey);
            if (currentDkp !== null && totalDkp > currentDkp) {
                return {
                    ...initialState,
                    message: `Insufficient DKP. Required: ${totalDkp.toLocaleString()}, available: ${currentDkp.toLocaleString()}.`,
                };
            }
        }
    }

    const tx = await createAuecTransaction({
        organizationId: org._id,
        organizationSlug: org.slug,
        memberId: session.user.id,
        memberUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
        direction: direction as "member_to_org" | "org_to_member",
        auecAmount,
        dkpRate,
        totalDkp,
        status: "requested",
        note,
        memberConfirmed: false,
        adminConfirmed: false,
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.rsiHandle ?? session.user.name ?? "Unknown",
        action: "auec_transaction.requested",
        entityType: "auec_transaction",
        entityId: tx._id,
        message: `aUEC transaction requested: ${direction === "member_to_org" ? "sell" : "buy"} ${auecAmount.toLocaleString()} aUEC for ${totalDkp.toLocaleString()} DKP.`,
        metadata: { direction, auecAmount, totalDkp },
    });

    // Notify admins/owners
    const txLink = `/terminal/orgs/${org.slug}/inventory?tab=auec`;
    if (member.role === "member") {
        const adminIds = org.members
            .filter((m) => (m.role === "admin" || m.role === "owner") && m.userId !== session.user!.id)
            .map((m) => m.userId);
        const dirLabel = direction === "member_to_org" ? "sell" : "buy";
        await notifyMany(
            adminIds,
            "trade.requested",
            "New aUEC Request",
            `${session.user.rsiHandle ?? session.user.name ?? "A member"} wants to ${dirLabel} ${auecAmount.toLocaleString()} aUEC.`,
            txLink
        );
    }

    if (org.discordTransactionChannelId) {
        const embedResult = await sendAuecTransactionEmbed(org.discordTransactionChannelId, tx);
        if (embedResult) {
            await setAuecTransactionDiscordMessage(tx._id, embedResult.channelId, embedResult.messageId);
        }
    }

    revalidatePath(`/terminal/orgs/${org.slug}/inventory`);

    return { success: true, message: "aUEC request submitted." };
}
