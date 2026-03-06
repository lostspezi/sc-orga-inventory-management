"use server";

import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { saveSocialSettings } from "@/lib/repositories/social-settings-repository";
import { revalidatePath } from "next/cache";

type Result = { success: boolean; error?: string };

export async function saveSocialSettingsAction(_: Result | null, formData: FormData): Promise<Result> {
    const session = await auth();
    if (!session?.user?.id || !(await isSuperAdmin(session.user.id))) {
        return { success: false, error: "Unauthorized" };
    }

    await saveSocialSettings({
        discord: (formData.get("discord") as string | null)?.trim() ?? "",
        github: (formData.get("github") as string | null)?.trim() ?? "",
        twitter: (formData.get("twitter") as string | null)?.trim() ?? "",
        reddit: (formData.get("reddit") as string | null)?.trim() ?? "",
        youtube: (formData.get("youtube") as string | null)?.trim() ?? "",
    });

    revalidatePath("/", "layout");
    revalidatePath("/terminal/admin/social");

    return { success: true };
}
