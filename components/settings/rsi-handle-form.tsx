"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { saveRsiHandleAction, type SaveRsiHandleActionState } from "@/lib/actions/save-rsi-handle-action";

const initialState: SaveRsiHandleActionState = { success: false, message: "" };

type Props = {
    currentHandle: string | null;
};

export default function RsiHandleForm({ currentHandle }: Props) {
    const t = useTranslations("settings");
    const tc = useTranslations("common");
    const router = useRouter();

    const [state, formAction, isPending] = useActionState(saveRsiHandleAction, initialState);

    useEffect(() => {
        if (state.success) {
            router.refresh();
        }
    }, [state.success, router]);

    return (
        <form action={formAction} className="space-y-4">
            <div>
                <label
                    htmlFor="rsiHandle"
                    className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                >
                    {t("rsiHandleLabel")}
                </label>
                <input
                    id="rsiHandle"
                    name="rsiHandle"
                    type="text"
                    defaultValue={currentHandle ?? ""}
                    placeholder={t("rsiHandlePlaceholder")}
                    className="sc-input w-full"
                    maxLength={30}
                    disabled={isPending}
                    autoComplete="off"
                    spellCheck={false}
                />
                <p
                    className="mt-1.5 text-[11px]"
                    style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                >
                    {t("rsiHandleHint")}
                </p>
            </div>

            {state.message && (
                <p
                    className="text-[11px]"
                    style={{
                        color: state.success ? "rgba(74,222,128,0.8)" : "rgba(248,113,113,0.8)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {state.message}
                </p>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="sc-btn disabled:opacity-40 disabled:cursor-not-allowed"
            >
                {isPending ? tc("saving") : t("rsiHandleSave")}
            </button>
        </form>
    );
}
