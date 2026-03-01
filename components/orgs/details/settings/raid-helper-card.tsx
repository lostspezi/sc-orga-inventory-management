"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { saveRaidHelperApiKeyAction } from "@/lib/actions/save-raid-helper-api-key-action";

type Props = {
    organizationSlug: string;
    hasApiKey: boolean;
};

const initialState = { success: false, message: "" };

export default function RaidHelperCard({ organizationSlug, hasApiKey }: Props) {
    const t = useTranslations("orgSettings");
    const tc = useTranslations("common");
    const [state, formAction, isPending] = useActionState(saveRaidHelperApiKeyAction, initialState);

    const connected = state.success ? state.message.includes("configured") : hasApiKey;

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
                    {t("raidHelper")}
                </p>
                <div className="mt-1 flex items-center gap-3">
                    <h3
                        className="text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {t("raidHelper")}
                    </h3>
                    <span
                        className="text-[10px] uppercase tracking-[0.1em]"
                        style={{
                            color: connected ? "rgba(80,210,120,0.85)" : "rgba(140,140,160,0.65)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {connected ? t("raidHelperConnected") : t("raidHelperDisconnected")}
                    </span>
                </div>
                <p
                    className="mt-2 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    {t("raidHelperDesc")}
                </p>
            </div>

            <form action={formAction} className="space-y-3">
                <input type="hidden" name="organizationSlug" value={organizationSlug} />

                <div>
                    <label
                        htmlFor="raidHelperApiKey"
                        className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("raidHelperApiKeyLabel")}
                    </label>
                    <input
                        id="raidHelperApiKey"
                        name="apiKey"
                        type="password"
                        autoComplete="off"
                        disabled={isPending}
                        className="sc-input w-full disabled:opacity-70"
                        placeholder={connected ? "••••••••••••••••" : "Enter API key…"}
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

                <div className="flex gap-2 pt-1">
                    <button type="submit" className="sc-btn" disabled={isPending}>
                        {isPending ? tc("saving") : t("raidHelperSave")}
                    </button>
                    {connected && (
                        <button
                            type="submit"
                            name="apiKey"
                            value=""
                            disabled={isPending}
                            className="cursor-pointer rounded-md border px-3 py-1.5 text-xs disabled:opacity-50"
                            style={{
                                borderColor: "rgba(220,80,80,0.25)",
                                color: "rgba(220,80,80,0.75)",
                                background: "rgba(220,80,80,0.04)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {t("raidHelperClear")}
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
}
