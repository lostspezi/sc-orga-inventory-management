"use server";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { setUserAuecBalance } from "@/lib/repositories/user-repository";

export type SetUserAuecBalanceState = {
    success: boolean;
    message: string;
};

export async function setUserAuecBalanceAction(
    _prevState: SetUserAuecBalanceState,
    formData: FormData
): Promise<SetUserAuecBalanceState> {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const balanceRaw = formData.get("auecBalance");

    if (balanceRaw === null || balanceRaw === "") {
        return { success: false, message: "Please enter a valid balance." };
    }

    const balance = Number(balanceRaw);

    if (!Number.isFinite(balance) || balance < 0) {
        return { success: false, message: "Balance must be a non-negative number." };
    }

    await setUserAuecBalance(session.user.id, Math.round(balance));

    revalidatePath("/terminal/settings");

    return { success: true, message: "aUEC balance saved." };
}
