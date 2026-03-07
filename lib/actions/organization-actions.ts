"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
    countOrganizationsCreatedByUser,
    createOrganizationInDb,
    getOrganizationBySlug,
} from "@/lib/repositories/organization-repository";

export type CreateOrganizationActionState = {
    success: boolean;
    message: string;
    fieldErrors?: { name?: string };
};

function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/ä/g, "ae")
        .replace(/ö/g, "oe")
        .replace(/ü/g, "ue")
        .replace(/ß/g, "ss")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
}

export async function createOrganizationAction(
    _prevState: CreateOrganizationActionState,
    formData: FormData
): Promise<CreateOrganizationActionState> {
    const session = await auth();

    if (!session?.user) {
        return { success: false, message: "You are not logged in." };
    }

    const userId = session.user.id;
    if (!userId) {
        return { success: false, message: "User-ID missing." };
    }

    const createdCount = await countOrganizationsCreatedByUser(userId);
    if (createdCount >= 3) {
        return { success: false, message: "limit_reached" };
    }

    const nameRaw = formData.get("name");
    const urlRaw = formData.get("starCitizenOrganizationUrl");
    const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
    const starCitizenOrganizationUrl = typeof urlRaw === "string" ? urlRaw.trim() : undefined;

    if (!name || name.length < 2) {
        return {
            success: false,
            message: "Please check your input.",
            fieldErrors: { name: "Organization name must be at least 2 characters." },
        };
    }

    if (name.length > 60) {
        return {
            success: false,
            message: "Please check your input.",
            fieldErrors: { name: "Organization name must be 60 characters or fewer." },
        };
    }

    let slug = slugify(name);
    if (!slug) slug = `org-${Date.now()}`;

    const existing = await getOrganizationBySlug(slug);
    if (existing) {
        slug = `${slug}-${Date.now()}`;
    }

    await createOrganizationInDb({
        name,
        slug,
        starCitizenOrganizationUrl: starCitizenOrganizationUrl || undefined,
        createdByUserId: userId,
    });

    revalidatePath("/terminal");

    return { success: true, message: "Organisation created." };
}
