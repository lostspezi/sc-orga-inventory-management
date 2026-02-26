"use server";

import {auth} from "@/auth";
import {redirect} from "next/navigation";
import {getOrganizationBySlug} from "@/lib/repositories/organization-repository";
import {
    createOrganizationInvite,
    hasPendingDiscordInviteForOrganization,
} from "@/lib/repositories/organization-invite-repository";
import {sendDiscordDm} from "@/lib/discord/send-discord-dm";
import {refresh, revalidatePath} from "next/cache";

type CreateDiscordOrgInviteState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        discordUserId?: string;
        targetRole?: string;
    };
};
export async function createDiscordOrgInviteAction(
    _prevState: CreateDiscordOrgInviteState,
    formData: FormData
): Promise<CreateDiscordOrgInviteState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const discordUserId = String(formData.get("discordUserId") ?? "").trim();
    const targetRole = String(formData.get("targetRole") ?? "").trim() as "admin" | "member";

    const fieldErrors: CreateDiscordOrgInviteState["fieldErrors"] = {};

    if (!discordUserId) {
        fieldErrors.discordUserId = "Discord user ID is required.";
    }

    if (!["admin", "member"].includes(targetRole)) {
        fieldErrors.targetRole = "A valid role is required.";
    }

    if (fieldErrors.discordUserId || fieldErrors.targetRole) {
        return {
            success: false,
            message: "Please correct the highlighted fields.",
            fieldErrors,
        };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return {
            success: false,
            message: "Organization not found.",
            fieldErrors: {},
        };
    }

    if (!org.discordGuildId?.trim()) {
        return {
            success: false,
            message:
                "Discord invites are only available after the bot has been connected to a Discord server for this organization.",
            fieldErrors: {},
        };
    }

    const inviterMembership = org.members.find((m) => m.userId === session?.user?.id);

    if (!inviterMembership || !["owner", "admin"].includes(inviterMembership.role)) {
        return {
            success: false,
            message: "You are not allowed to invite members to this organization.",
            fieldErrors: {},
        };
    }

    const alreadyPending = await hasPendingDiscordInviteForOrganization(org._id, discordUserId);
    if (alreadyPending) {
        return {
            success: false,
            message: "There is already a pending Discord invite for this user.",
            fieldErrors: {},
        };
    }

    const {rawToken} = await createOrganizationInvite({
        organizationId: org._id,
        organizationSlug: org.slug,
        invitedByUserId: session.user.id,
        invitedByUsername: session.user.name ?? undefined,
        targetRole,
        deliveryMethod: "discord_dm",
        discordUserId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) {
        return {
            success: false,
            message: "Missing NEXT_PUBLIC_APP_URL configuration.",
            fieldErrors: {},
        };
    }

    const inviteUrl = `${appUrl}/invite/${rawToken}`;

    const dmText =
        `You have been invited to join "${org.name}" as ${targetRole}.\n\n` +
        `Accept invite: ${inviteUrl}\n\n` +
        `This invite expires in 7 days.`;

    try {
        await sendDiscordDm(discordUserId, dmText);

        revalidatePath(`/terminal/orgs/${org.slug}/members`);
        refresh();

        return {
            success: true,
            message: "Discord invite sent successfully.",
            fieldErrors: {},
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";

        console.error("[createDiscordOrgInviteAction] Failed to send Discord DM", {
            organizationSlug: org.slug,
            discordUserId,
            invitedByUserId: session.user.id,
            errorMessage,
            error,
        });

        return {
            success: false,
            message: "Invite created, but the Discord DM could not be delivered.",
            fieldErrors: {},
        };
    }
}