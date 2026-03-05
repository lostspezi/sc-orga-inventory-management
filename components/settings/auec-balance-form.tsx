"use client";

import { useActionState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setUserAuecBalanceAction, type SetUserAuecBalanceState } from "@/lib/actions/set-user-auec-balance-action";

type Props = {
    currentBalance: number | null;
    sectionLabel: string;
    sectionDesc: string;
    balanceLabel: string;
    saveLabel: string;
    savingLabel: string;
};

const initialState: SetUserAuecBalanceState = { success: false, message: "" };

export default function AuecBalanceForm({
    currentBalance,
    sectionLabel,
    sectionDesc,
    balanceLabel,
    saveLabel,
    savingLabel,
}: Props) {
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [state, formAction, isPending] = useActionState(
        async (prev: SetUserAuecBalanceState, formData: FormData) => {
            const result = await setUserAuecBalanceAction(prev, formData);
            if (result.success) {
                startTransition(() => router.refresh());
            }
            return result;
        },
        initialState
    );

    return (
        <section
            className="hud-panel p-5 sm:p-6"
            style={{ background: "rgba(8,16,24,0.45)" }}
        >
            <p
                className="mb-1 text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
            >
                {sectionLabel}
            </p>
            <p
                className="mb-4 text-xs"
                style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
            >
                {sectionDesc}
            </p>

            <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex-1">
                    <label
                        htmlFor="auecBalance"
                        className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        {balanceLabel}
                    </label>
                    <input
                        id="auecBalance"
                        name="auecBalance"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={currentBalance ?? ""}
                        disabled={isPending}
                        className="sc-input w-full disabled:opacity-70"
                        placeholder="0"
                    />
                </div>
                <button type="submit" className="sc-btn shrink-0" disabled={isPending}>
                    {isPending ? savingLabel : saveLabel}
                </button>
            </form>

            {state.message && (
                <p
                    className="mt-2 text-sm"
                    style={{
                        color: state.success ? "rgba(80,210,120,0.85)" : "rgba(240,165,0,0.9)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {state.message}
                </p>
            )}
        </section>
    );
}
