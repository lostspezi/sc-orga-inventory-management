"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { updateOrgMemberProfile } from "@/lib/repositories/org-member-repository";
import { createOrganizationAuditLog } from "@/lib/repositories/organization-audit-log-repository";

type State = { success: boolean; message: string };

export async function updateMemberProfileAction(
    _prev: State,
    formData: FormData
): Promise<State> {
    const session = await auth();
    if (!session?.user?.id) redirect("/login");

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const targetUserId = String(formData.get("targetUserId") ?? "").trim();
    const displayName = String(formData.get("displayName") ?? "").trim() || undefined;
    const notes = String(formData.get("notes") ?? "").trim() || undefined;
    const tagsRaw = String(formData.get("tags") ?? "").trim();
    const tags = tagsRaw
        ? tagsRaw
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
        : [];

    const org = await getOrganizationBySlug(organizationSlug);
    if (!org) return { success: false, message: "Organization not found." };

    const actor = org.members.find((m) => m.userId === session.user!.id);
    if (!actor || !["owner", "admin", "hr"].includes(actor.role)) {
        return { success: false, message: "Not authorized." };
    }

    const target = org.members.find((m) => m.userId === targetUserId);
    if (!target) return { success: false, message: "Target member not found." };

    await updateOrgMemberProfile(org._id, targetUserId, {
        displayName,
        notes,
        tags,
    });

    await createOrganizationAuditLog({
        organizationId: org._id,
        organizationSlug: org.slug,
        actorUserId: session.user.id,
        actorUsername: session.user.name ?? "Unknown",
        action: "member.profile_updated",
        entityType: "member",
        entityId: targetUserId,
        message: "Member profile updated.",
        metadata: { displayName, tags },
    });

    revalidatePath(`/terminal/orgs/${org.slug}/members`);
    return { success: true, message: "Profile saved." };
}
