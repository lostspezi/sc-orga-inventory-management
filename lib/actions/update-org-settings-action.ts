"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getOrganizationBySlug, setOrganizationDiscordTransactionChannelId } from "@/lib/repositories/organization-repository";

export type UpdateOrgSettingsActionState = {
    success: boolean;
    message: string;
};

const initialState: UpdateOrgSettingsActionState = {
    success: false,
    message: "",
};

export async function updateOrgSettingsAction(
    _prevState: UpdateOrgSettingsActionState,
    formData: FormData
): Promise<UpdateOrgSettingsActionState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const organizationSlug = String(formData.get("organizationSlug") ?? "").trim();
    const discordTransactionChannelId = String(formData.get("discordTransactionChannelId") ?? "").trim();

    if (!organizationSlug) {
        return { ...initialState, message: "Missing organization." };
    }

    const org = await getOrganizationBySlug(organizationSlug);

    if (!org) {
        return { ...initialState, message: "Organization not found." };
    }

    const member = org.members.find((m) => m.userId === session.user!.id);

    if (!member || !["owner", "admin"].includes(member.role)) {
        return { ...initialState, message: "Only owners and admins can update organization settings." };
    }

    await setOrganizationDiscordTransactionChannelId(organizationSlug, discordTransactionChannelId);

    revalidatePath(`/terminal/orgs/${organizationSlug}/settings`);

    return { success: true, message: "Settings saved." };
}
