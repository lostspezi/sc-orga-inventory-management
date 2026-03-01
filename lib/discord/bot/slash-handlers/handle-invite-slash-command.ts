import {ChatInputCommandInteraction} from "discord.js";
import { createHash, randomBytes } from "crypto";
import { getOrganizationByDiscordGuildId } from "@/lib/repositories/organization-repository";
import { getUserByDiscordAccountId } from "@/lib/repositories/auth-account-repository";
import { createOrganizationInvite } from "@/lib/repositories/organization-invite-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";
import { sendDiscordDm } from "@/lib/discord/send-discord-dm";

type TargetRole = "member" | "admin";

function buildInviteExpiryDate() {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
}

function createRawInviteToken() {
    return randomBytes(32).toString("hex");
}

function hashInviteToken(rawToken: string) {
    return createHash("sha256").update(rawToken).digest("hex");
}

export async function handleInviteSlashCommand(
    interaction: ChatInputCommandInteraction
) {
    // Defer immediately — DB work below can exceed Discord's 3-second window.
    await interaction.deferReply({ ephemeral: true });

    if (!interaction.guildId) {
        await interaction.editReply("This command can only be used inside a Discord server.");
        return;
    }

    const org = await getOrganizationByDiscordGuildId(interaction.guildId);

    if (!org) {
        await interaction.editReply("No organization is linked to this Discord server.");
        return;
    }

    const actorUser = await getUserByDiscordAccountId(interaction.user.id);

    if (!actorUser) {
        await interaction.editReply("Your Discord account is not linked to an application user.");
        return;
    }

    const actorMember = org.members.find((m) => m.userId === actorUser.id);

    if (!actorMember || !["owner", "admin"].includes(actorMember.role)) {
        await interaction.editReply("Only organization owners or admins can use this command.");
        return;
    }

    const targetDiscordUser = interaction.options.getUser("user", true);
    const requestedRole = (interaction.options.getString("role") ?? "member") as TargetRole;

    if (actorMember.role !== "owner" && requestedRole === "admin") {
        await interaction.editReply("Only the owner can invite someone as admin.");
        return;
    }

    const targetAppUser = await getUserByDiscordAccountId(targetDiscordUser.id);

    if (targetAppUser) {
        const alreadyMember = org.members.some((m) => m.userId === targetAppUser.id);

        if (alreadyMember) {
            await interaction.editReply("That user is already a member of this organization.");
            return;
        }
    }

    const rawToken = createRawInviteToken();
    const inviteToken = hashInviteToken(rawToken);

    const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${rawToken}`;

    await createOrganizationInvite({
        organizationId: org._id,
        organizationSlug: org.slug,
        invitedByUserId: actorUser.id,
        invitedByUsername: actorUser.name ?? interaction.user.username,
        targetRole: requestedRole,
        deliveryMethod: "discord_dm",
        token: inviteToken,
        discordUserId: targetDiscordUser.id,
        targetUserId: targetAppUser?.id,
        status: "pending",
        expiresAt: buildInviteExpiryDate(),
    });

    try {
        await sendDiscordDm(
            targetDiscordUser.id,
            `You have been invited to join "${org.name}" as ${requestedRole}.\n\nAccept invite: ${inviteLink}\n\nThis invite expires in 7 days.`
        );
    } catch (error) {
        console.error("Error sending Discord DM:", error);
        await interaction.editReply("The invite was created, but the Discord DM could not be delivered.");
        return;
    }

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: actorUser.id,
        actorUsername: actorUser.name ?? interaction.user.username,
        action: "member.invited_discord",
        entityType: "member",
        entityId: targetAppUser?.id ?? targetDiscordUser.id,
        message: `Discord invite sent to ${targetDiscordUser.username}.`,
        metadata: {
            targetDiscordUserId: targetDiscordUser.id,
            targetDiscordUsername: targetDiscordUser.username,
            targetRole: requestedRole,
            source: "slash_command",
            commandName: "invite",
        },
    });

    await interaction.editReply(`Invite sent to ${targetDiscordUser.username} as ${requestedRole}.`);
}