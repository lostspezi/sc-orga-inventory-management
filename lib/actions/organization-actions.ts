"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import {
    createOrganizationInDb,
    getOrganizationBySlug,
} from "@/lib/repositories/organization-repository";

export type CreateOrganizationActionState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        name?: string;
        starCitizenOrganizationUrl?: string;
    };
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

function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

export async function createOrganizationAction(
    _prevState: CreateOrganizationActionState,
    formData: FormData
): Promise<CreateOrganizationActionState> {
    const session = await auth();

    if (!session?.user) {
        return {
            success: false,
            message: "You are not logged in.",
        };
    }

    const userId = session.user.id;
    if (!userId) {
        return {
            success: false,
            message: "User-ID missing.",
        };
    }

    const nameRaw = formData.get("name");
    const urlRaw = formData.get("starCitizenOrganizationUrl");

    const name = typeof nameRaw === "string" ? nameRaw.trim() : "";
    const starCitizenOrganizationUrl = typeof urlRaw === "string" ? urlRaw.trim() : "";

    const fieldErrors: CreateOrganizationActionState["fieldErrors"] = {};

    if (!name) fieldErrors.name = "Bitte gib einen Namen ein.";
    if (!starCitizenOrganizationUrl) {
        fieldErrors.starCitizenOrganizationUrl = "Bitte gib eine URL ein.";
    } else if (!isValidUrl(starCitizenOrganizationUrl)) {
        fieldErrors.starCitizenOrganizationUrl = "Bitte gib eine gültige URL ein.";
    }

    if (Object.keys(fieldErrors).length > 0) {
        return {
            success: false,
            message: "Bitte prüfe deine Eingaben.",
            fieldErrors,
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
        starCitizenOrganizationUrl,
        createdByUserId: userId,
    });

    revalidatePath("/terminal/orgs");

    return {
        success: true,
        message: "Organisation wurde erstellt.",
    };
}