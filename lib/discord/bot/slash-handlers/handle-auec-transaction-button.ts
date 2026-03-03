import { ButtonInteraction, MessageFlagsBitField } from "discord.js";
import { ObjectId } from "mongodb";
import {
    parseAuecTxButtonId,
    buildAuecTransactionMessagePayload,
    updateAuecTransactionEmbed,
} from "@/lib/discord/send-auec-transaction-embed";
import { getOrganizationByDiscordGuildId, adjustOrgAuecBalance } from "@/lib/repositories/organization-repository";
import { getUserByDiscordAccountId } from "@/lib/repositories/auth-account-repository";
import {
    getAuecTransactionById,
    getAuecTransactionViewById,
    updateAuecTransactionStatus,
    setAuecTransactionDiscordMessage,
} from "@/lib/repositories/organization-auec-transaction-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { getDiscordUserId } from "@/lib/discord/get-discord-user-id";
import { updateMemberDkp } from "@/lib/raid-helper/update-member-dkp";
import { notify } from "@/lib/notify";

export async function handleAuecTransactionButton(interaction: ButtonInteraction): Promise<void> {
    try {
        await interaction.deferUpdate();
    } catch {
        return;
    }

    const parsed = parseAuecTxButtonId(interaction.customId);
    if (!parsed) return;
    const { action, txId } = parsed;

    if (!interaction.guildId) {
        await interaction.followUp({ content: "This button can only be used inside a Discord server.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const org = await getOrganizationByDiscordGuildId(interaction.guildId);
    if (!org) {
        await interaction.followUp({ content: "No organization is linked to this Discord server.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const appUser = await getUserByDiscordAccountId(interaction.user.id);
    if (!appUser) {
        await interaction.followUp({ content: "Your Discord account is not linked to an application user.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const member = org.members.find((m) => m.userId === appUser.id);
    if (!member) {
        await interaction.followUp({ content: "You are not a member of this organization.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    if (!ObjectId.isValid(txId)) {
        await interaction.followUp({ content: "Invalid transaction ID.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const tx = await getAuecTransactionById(txId);
    if (!tx) {
        await interaction.followUp({ content: "aUEC transaction not found.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }
    if (!tx.organizationId.equals(org._id)) {
        await interaction.followUp({ content: "Transaction not found.", flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    const isAdminOrOwner = member.role === "owner" || member.role === "admin";
    const isMemberParty = tx.memberId === appUser.id;

    // ── approve ──────────────────────────────────────────────────────────────
    if (action === "approve") {
        if (!isAdminOrOwner) {
            await interaction.followUp({ content: "Only admins and owners can approve aUEC transactions.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }
        if (tx.status !== "requested") {
            await interaction.followUp({ content: "This transaction can no longer be approved.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        await updateAuecTransactionStatus(txId, { status: "approved" });

        await createOrganizationAuditLog({
            organizationId: tx.organizationId,
            organizationSlug: tx.organizationSlug,
            actorUserId: appUser.id,
            actorUsername: appUser.rsiHandle ?? appUser.name ?? interaction.user.username,
            action: "auec_transaction.approved",
            entityType: "auec_transaction",
            entityId: txId,
            message: `aUEC transaction approved via Discord.`,
        });

        await refreshEmbed(interaction, txId);
        await interaction.followUp({ content: `aUEC transaction approved.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    // ── reject ───────────────────────────────────────────────────────────────
    if (action === "reject") {
        if (!isAdminOrOwner) {
            await interaction.followUp({ content: "Only admins and owners can reject aUEC transactions.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }
        if (tx.status !== "requested") {
            await interaction.followUp({ content: "This transaction can no longer be rejected.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        await updateAuecTransactionStatus(txId, { status: "rejected" });

        await createOrganizationAuditLog({
            organizationId: tx.organizationId,
            organizationSlug: tx.organizationSlug,
            actorUserId: appUser.id,
            actorUsername: appUser.rsiHandle ?? appUser.name ?? interaction.user.username,
            action: "auec_transaction.rejected",
            entityType: "auec_transaction",
            entityId: txId,
            message: `aUEC transaction rejected via Discord.`,
        });

        await refreshEmbed(interaction, txId);
        await interaction.followUp({ content: `aUEC transaction rejected.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    // ── cancel ───────────────────────────────────────────────────────────────
    if (action === "cancel") {
        if (!isAdminOrOwner && !isMemberParty) {
            await interaction.followUp({ content: "You do not have permission to cancel this transaction.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }
        if (tx.status !== "requested" && tx.status !== "approved") {
            await interaction.followUp({ content: "This transaction can no longer be cancelled.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        await updateAuecTransactionStatus(txId, { status: "cancelled" });

        await createOrganizationAuditLog({
            organizationId: tx.organizationId,
            organizationSlug: tx.organizationSlug,
            actorUserId: appUser.id,
            actorUsername: appUser.rsiHandle ?? appUser.name ?? interaction.user.username,
            action: "auec_transaction.cancelled",
            entityType: "auec_transaction",
            entityId: txId,
            message: `aUEC transaction cancelled via Discord by ${isAdminOrOwner ? "admin" : "member"}.`,
        });

        await refreshEmbed(interaction, txId);
        await interaction.followUp({ content: `aUEC transaction cancelled.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        return;
    }

    // ── confirm ──────────────────────────────────────────────────────────────
    if (action === "confirm") {
        if (!isAdminOrOwner && !isMemberParty) {
            await interaction.followUp({ content: "You are not a party to this transaction.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }
        if (tx.status !== "approved") {
            await interaction.followUp({ content: "This transaction must be approved before it can be confirmed.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        const patch: { memberConfirmed?: boolean; adminConfirmed?: boolean; adminConfirmedByUsername?: string } = {};

        if (isAdminOrOwner && !tx.adminConfirmed) {
            patch.adminConfirmed = true;
            patch.adminConfirmedByUsername = appUser.rsiHandle ?? appUser.name ?? interaction.user.username;
        } else if (isMemberParty && !tx.memberConfirmed) {
            patch.memberConfirmed = true;
        } else {
            await interaction.followUp({ content: "You have already confirmed this transaction.", flags: MessageFlagsBitField.Flags.Ephemeral });
            return;
        }

        const updatedMemberConfirmed = patch.memberConfirmed ?? tx.memberConfirmed;
        const updatedAdminConfirmed  = patch.adminConfirmed  ?? tx.adminConfirmed;

        if (updatedMemberConfirmed && updatedAdminConfirmed) {
            await updateAuecTransactionStatus(txId, { ...patch, status: "completed" });

            const delta = tx.direction === "member_to_org" ? tx.auecAmount : -tx.auecAmount;
            await adjustOrgAuecBalance(org._id, delta);

            await createOrganizationAuditLog({
                organizationId: tx.organizationId,
                organizationSlug: tx.organizationSlug,
                actorUserId: appUser.id,
                actorUsername: appUser.rsiHandle ?? appUser.name ?? interaction.user.username,
                action: "auec_transaction.completed",
                entityType: "auec_transaction",
                entityId: txId,
                message: `aUEC transaction completed via Discord. Balance adjusted by ${delta > 0 ? "+" : ""}${delta.toLocaleString()} aUEC.`,
                metadata: { delta, direction: tx.direction, auecAmount: tx.auecAmount, totalDkp: tx.totalDkp },
            });

            // Sync DKP with Raid Helper (non-blocking)
            if (org.raidHelperApiKey && org.discordGuildId) {
                const memberDiscordId = await getDiscordUserId(tx.memberId);
                if (memberDiscordId) {
                    const dkpOperation = tx.direction === "member_to_org" ? "add" : "subtract";
                    const verb = tx.direction === "member_to_org" ? "Sell" : "Buy";
                    const adminName = patch.adminConfirmedByUsername ?? tx.adminConfirmedByUsername ?? "Admin";
                    const now = new Date();
                    const ts = now.toLocaleDateString("en-GB", {
                        day: "2-digit", month: "short", year: "numeric", timeZone: "UTC",
                    }) + " " + now.toLocaleTimeString("en-GB", {
                        hour: "2-digit", minute: "2-digit", timeZone: "UTC",
                    }) + " UTC";
                    const dkpDescription = `[SC Orga] ${verb} ${tx.auecAmount.toLocaleString()} aUEC | TxID: ${txId} | Trader: ${tx.memberUsername} | Admin: ${adminName} | ${ts}`;
                    await updateMemberDkp(
                        org.discordGuildId,
                        memberDiscordId,
                        org.raidHelperApiKey,
                        dkpOperation,
                        tx.totalDkp,
                        dkpDescription
                    );
                }
            }

            await notify(
                tx.memberId,
                "trade.completed",
                "aUEC Trade Completed",
                `Your aUEC trade of ${tx.auecAmount.toLocaleString()} aUEC is complete.`,
                `/terminal/orgs/${tx.organizationSlug}/inventory?tab=auec`
            );

            await refreshEmbed(interaction, txId);
            await interaction.followUp({ content: `aUEC transaction completed. Balance updated.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        } else {
            await updateAuecTransactionStatus(txId, patch);

            await createOrganizationAuditLog({
                organizationId: tx.organizationId,
                organizationSlug: tx.organizationSlug,
                actorUserId: appUser.id,
                actorUsername: appUser.rsiHandle ?? appUser.name ?? interaction.user.username,
                action: "auec_transaction.confirmed",
                entityType: "auec_transaction",
                entityId: txId,
                message: `${isAdminOrOwner ? "Admin" : "Member"} confirmed aUEC trade via Discord. Waiting for other party.`,
            });

            await refreshEmbed(interaction, txId);
            await interaction.followUp({ content: `Confirmed. Waiting for the other party to confirm.`, flags: MessageFlagsBitField.Flags.Ephemeral });
        }
        return;
    }
}

async function refreshEmbed(interaction: ButtonInteraction, txId: string): Promise<void> {
    const updatedView = await getAuecTransactionViewById(txId);
    if (!updatedView) return;

    const payload = buildAuecTransactionMessagePayload(updatedView);
    try {
        await interaction.editReply({ embeds: payload.embeds, components: payload.components });
    } catch {
        if (updatedView.discordChannelId && updatedView.discordMessageId) {
            await updateAuecTransactionEmbed(updatedView.discordChannelId, updatedView.discordMessageId, updatedView);
        }
    }

    if (!updatedView.discordMessageId && interaction.message) {
        await setAuecTransactionDiscordMessage(txId, interaction.channelId, interaction.message.id);
    }
}
