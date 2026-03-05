"use client";

import { useActionState, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createAuecTransactionAction, type CreateAuecTransactionState } from "@/lib/actions/create-auec-transaction-action";

type Props = {
    organizationSlug: string;
    memberAuecBalance?: number | null;
};

const initialState: CreateAuecTransactionState = { success: false, message: "", fieldErrors: {} };

export default function AuecTransactionForm({
    organizationSlug,
    memberAuecBalance,
}: Props) {
    const t = useTranslations("auec");
    const router = useRouter();
    const [, startTransition] = useTransition();
    const [direction, setDirection] = useState<"org_to_member" | "member_to_org">("org_to_member");
    const [auecAmount, setAuecAmount] = useState("");

    const [state, formAction, isPending] = useActionState(
        async (prev: CreateAuecTransactionState, formData: FormData) => {
            const result = await createAuecTransactionAction(prev, formData);
            if (result.success) {
                setAuecAmount("");
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
                    {t("eyebrow")}
                </p>
                <h3
                    className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    {t("title")}
                </h3>
            </div>

            <form action={formAction} className="space-y-4">
                <input type="hidden" name="organizationSlug" value={organizationSlug} />
                <input type="hidden" name="direction" value={direction} />

                {/* Member balance (informational) */}
                {memberAuecBalance != null && (
                    <div
                        className="rounded px-3 py-2 text-xs"
                        style={{
                            background: "rgba(79,195,220,0.05)",
                            border: "1px solid rgba(79,195,220,0.12)",
                            color: "rgba(200,220,232,0.6)",
                            fontFamily: "var(--font-mono)",
                        }}
                    >
                        {t("memberBalance")}: <span style={{ color: "var(--accent-primary)" }}>{memberAuecBalance.toLocaleString()} aUEC</span>
                    </div>
                )}

                {/* Direction */}
                <div>
                    <p
                        className="mb-2 text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("direction")}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => { setDirection("org_to_member"); setAuecAmount(""); }}
                            className={direction === "org_to_member" ? "sc-btn" : "sc-btn-outline"}
                            style={{ fontSize: "11px" }}
                        >
                            {t("directionBuy")}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setDirection("member_to_org"); setAuecAmount(""); }}
                            className={direction === "member_to_org" ? "sc-btn" : "sc-btn-outline"}
                            style={{ fontSize: "11px" }}
                        >
                            {t("directionSell")}
                        </button>
                    </div>
                    {state.fieldErrors?.direction && (
                        <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}>
                            {state.fieldErrors.direction}
                        </p>
                    )}
                </div>

                {/* aUEC amount */}
                <div>
                    <label
                        htmlFor="auecAmount"
                        className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("auecAmount")}
                    </label>
                    <input
                        id="auecAmount"
                        name="auecAmount"
                        type="number"
                        min="1"
                        step="1"
                        value={auecAmount}
                        onChange={(e) => setAuecAmount(e.target.value)}
                        disabled={isPending}
                        className="sc-input w-full disabled:opacity-70"
                        placeholder="250000"
                    />
                    {state.fieldErrors?.auecAmount && (
                        <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}>
                            {state.fieldErrors.auecAmount}
                        </p>
                    )}
                </div>

                {/* Note */}
                <div>
                    <label
                        htmlFor="auecNote"
                        className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        {t("note")}
                    </label>
                    <input
                        id="auecNote"
                        name="note"
                        type="text"
                        disabled={isPending}
                        className="sc-input w-full disabled:opacity-70"
                        placeholder={t("notePlaceholder")}
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

                <button
                    type="submit"
                    className="sc-btn"
                    disabled={isPending}
                >
                    {isPending ? t("submitting") : t("submit")}
                </button>
            </form>
        </div>
    );
}
