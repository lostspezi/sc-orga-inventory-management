"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
    getOrganizationBySlug,
    unsetOrganizationDiscordGuildId,
} from "@/lib/repositories/organization-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

export async function disconnectDiscordAction(formData: FormData): Promise<void> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const slug = String(formData.get("organizationSlug") ?? "").trim();
    if (!slug) return;

    const org = await getOrganizationBySlug(slug);
    if (!org) return;

    const member = org.members.find((m) => m.userId === session.user!.id);
    if (!member || !["owner", "admin"].includes(member.role)) return;

    if (!org.discordGuildId) return;

    await unsetOrganizationDiscordGuildId(slug);

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "integration.discord_disconnected",
        entityType: "organization",
        entityId: org._id.toString(),
        message: "Discord server disconnected manually via Settings.",
        metadata: { discordGuildId: org.discordGuildId },
    });

    revalidatePath(`/terminal/orgs/${slug}/settings`);
}
