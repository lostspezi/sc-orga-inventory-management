"use server";

import { auth } from "@/auth";
import { isSuperAdmin } from "@/lib/is-super-admin";
import { updateLegalDocDates, publishNewLegalVersion } from "@/lib/repositories/legal-settings-repository";
import type { LegalDocDates } from "@/lib/types/legal-settings";
import { revalidatePath } from "next/cache";

type Result = { success: boolean; error?: string };

function parseDates(formData: FormData): LegalDocDates {
    return {
        privacy: { lastUpdated: (formData.get("privacyDate") as string | null) ?? "" },
        terms: { lastUpdated: (formData.get("termsDate") as string | null) ?? "" },
        imprint: { lastUpdated: (formData.get("imprintDate") as string | null) ?? "" },
        cookies: { lastUpdated: (formData.get("cookiesDate") as string | null) ?? "" },
    };
}

export async function saveLegalSettingsAction(formData: FormData): Promise<Result> {
    const session = await auth();
    if (!session?.user?.id || !(await isSuperAdmin(session.user.id))) {
        return { success: false, error: "Unauthorized" };
    }

    const dates = parseDates(formData);
    const changeNote = (formData.get("changeNote") as string | null) ?? "";

    await updateLegalDocDates(dates, changeNote);
    revalidatePath("/terminal/admin/legal");
    revalidatePath("/legal", "layout");

    return { success: true };
}

export async function publishLegalVersionAction(formData: FormData): Promise<Result> {
    const session = await auth();
    if (!session?.user?.id || !(await isSuperAdmin(session.user.id))) {
        return { success: false, error: "Unauthorized" };
    }

    const dates = parseDates(formData);
    const changeNote = (formData.get("changeNote") as string | null) ?? "";
    const version = new Date().toISOString().slice(0, 10);

    const username =
        session.user.rsiHandle ?? session.user.name ?? "admin";

    await publishNewLegalVersion(version, username, changeNote, dates);
    revalidatePath("/terminal", "layout");
    revalidatePath("/terminal/admin/legal");
    revalidatePath("/legal", "layout");

    return { success: true };
}
