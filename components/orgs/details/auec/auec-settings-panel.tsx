"use client";

import { useActionState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { updateAuecSettingsAction } from "@/lib/actions/update-auec-settings-action";

type Props = {
    organizationSlug: string;
    auecBalance?: number;
};

const initialState = { success: false, message: "" };

export default function AuecSettingsPanel({
    organizationSlug,
    auecBalance,
}: Props) {
    const t = useTranslations("auec");
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [state, formAction, isPending] = useActionState(
        async (prev: typeof initialState, formData: FormData) => {
            const result = await updateAuecSettingsAction(prev, formData);
            if (result.success) {
                startTransition(() => router.refresh());
            }
            return result;
        },
        initialState
    );

    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.14)",
                background: "rgba(7,18,28,0.28)",
            }}
        >
            <div className="mb-4">
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("adminPanel")}
                </p>
                <h3
                    className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    {t("adminPanel")}
                </h3>
            </div>

            <form action={formAction} className="space-y-4">
                <input type="hidden" name="organizationSlug" value={organizationSlug} />

                {/* Balance */}
                <div>
                    <label
                        htmlFor="auecBalance"
                        className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("setBalance")}
                    </label>
                    <input
                        id="auecBalance"
                        name="auecBalance"
                        type="number"
                        min="0"
                        step="1"
                        defaultValue={auecBalance ?? ""}
                        disabled={isPending}
                        className="sc-input w-full disabled:opacity-70"
                        placeholder={t("balancePlaceholder")}
                    />
                </div>

                {state.message && (
                    <p
                        className="text-sm"
                        style={{
                            color: state.success ? "rgba(80,210,120,0.85)" : "rgba(240,165,0,0.9)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {state.message}
                    </p>
                )}

                <button type="submit" className="sc-btn" disabled={isPending}>
                    {isPending ? t("saving") : t("saveSettings")}
                </button>
            </form>
        </div>
    );
}
