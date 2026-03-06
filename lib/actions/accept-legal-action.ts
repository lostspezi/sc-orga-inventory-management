"use server";

import { auth } from "@/auth";
import { setUserLegalAcceptedVersion } from "@/lib/repositories/user-repository";
import { revalidatePath } from "next/cache";

export async function acceptLegalAction(version: string): Promise<void> {
    const session = await auth();
    if (!session?.user?.id) return;

    await setUserLegalAcceptedVersion(session.user.id, version);
    revalidatePath("/terminal", "layout");
}
