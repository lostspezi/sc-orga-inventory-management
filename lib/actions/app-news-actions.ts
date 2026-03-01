"use server";

import { auth } from "@/auth";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isSuperAdmin } from "@/lib/is-super-admin";
import {
    createAppNewsInDb,
    updateAppNewsInDb,
    deleteAppNewsInDb,
} from "@/lib/repositories/app-news-repository";

type Result = { success: boolean; message: string };

async function requireSuperAdmin() {
    const session = await auth();
    if (!session?.user?.id || !(await isSuperAdmin(session.user.id))) {
        notFound();
    }
}

export async function createAppNewsAction(formData: FormData): Promise<Result> {
    await requireSuperAdmin();

    const title = (formData.get("title") as string)?.trim();
    const body = (formData.get("body") as string)?.trim();

    if (!title || !body) {
        return { success: false, message: "Title and body are required." };
    }

    await createAppNewsInDb(title, body);

    revalidatePath("/terminal/admin/news");
    revalidatePath("/terminal/orgs", "layout");

    return { success: true, message: "Post created." };
}

export async function updateAppNewsAction(id: string, formData: FormData): Promise<Result> {
    await requireSuperAdmin();

    const title = (formData.get("title") as string)?.trim();
    const body = (formData.get("body") as string)?.trim();

    if (!title || !body) {
        return { success: false, message: "Title and body are required." };
    }

    const updated = await updateAppNewsInDb(id, title, body);

    if (!updated) {
        return { success: false, message: "Post not found or no changes made." };
    }

    revalidatePath("/terminal/admin/news");
    revalidatePath("/terminal/orgs", "layout");

    return { success: true, message: "Post updated." };
}

export async function deleteAppNewsAction(id: string): Promise<Result> {
    await requireSuperAdmin();

    const deleted = await deleteAppNewsInDb(id);

    if (!deleted) {
        return { success: false, message: "Post not found." };
    }

    revalidatePath("/terminal/admin/news");
    revalidatePath("/terminal/orgs", "layout");

    return { success: true, message: "Post deleted." };
}
