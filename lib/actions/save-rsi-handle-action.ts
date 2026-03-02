"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { saveRsiHandle } from "@/lib/repositories/user-repository";

export type SaveRsiHandleActionState = {
    success: boolean;
    message: string;
};

export async function saveRsiHandleAction(
    _prevState: SaveRsiHandleActionState,
    formData: FormData
): Promise<SaveRsiHandleActionState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const handle = String(formData.get("rsiHandle") ?? "").trim();

    if (!handle) {
        return { success: false, message: "RSI handle is required." };
    }

    if (handle.length < 3) {
        return { success: false, message: "RSI handle must be at least 3 characters." };
    }

    if (handle.length > 30) {
        return { success: false, message: "RSI handle must be 30 characters or fewer." };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(handle)) {
        return { success: false, message: "Only letters, numbers, underscores, and hyphens are allowed." };
    }

    const saved = await saveRsiHandle(session.user.id, handle);

    if (!saved) {
        return { success: false, message: "Failed to save RSI handle. Please try again." };
    }

    revalidatePath("/terminal/settings");
    revalidatePath("/terminal", "layout");

    return { success: true, message: "RSI handle saved." };
}
