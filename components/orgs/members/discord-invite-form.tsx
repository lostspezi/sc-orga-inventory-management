"use client";

import { useActionState, useEffect, useRef } from "react";
import { createDiscordOrgInviteAction } from "@/lib/actions/create-discord-org-invite-action";
import DiscordInviteSubmitButton from "@/components/orgs/members/discord-invite-submit-button";
import DiscordMemberAutocomplete from "@/components/orgs/members/discord-member-autocomplete";

type Props = {
    organizationSlug: string;
};

type CreateDiscordOrgInviteState = {
    success: boolean;
    message: string;
    fieldErrors?: {
        discordUserId?: string;
        targetRole?: string;
    };
};

const initialState: CreateDiscordOrgInviteState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export default function DiscordInviteForm({ organizationSlug }: Props) {
    const formRef = useRef<HTMLFormElement | null>(null);
    const [state, formAction] = useActionState(createDiscordOrgInviteAction, initialState);

    useEffect(() => {
        if (!state.success) return;

        queueMicrotask(() => {
            formRef.current?.reset();
        });
    }, [state.success]);

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
                    Invite Delivery
                </p>
                <h3
                    className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    Discord Direct Message
                </h3>
                <p
                    className="mt-1 text-xs sm:text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Select a member from the connected Discord server and send a private invite link.
                </p>
            </div>

            <form ref={formRef} action={formAction} className="space-y-4">
                <input type="hidden" name="organizationSlug" value={organizationSlug} />

                <DiscordMemberAutocomplete organizationSlug={organizationSlug} />

                {state.fieldErrors?.discordUserId && (
                    <p className="-mt-2 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                        {state.fieldErrors.discordUserId}
                    </p>
                )}

                <div>
                    <label
                        htmlFor="targetRole"
                        className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                        style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        Invite Role
                    </label>
                    <select
                        id="targetRole"
                        name="targetRole"
                        className="sc-input w-full"
                        defaultValue="member"
                        required
                    >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                    </select>
                    {state.fieldErrors?.targetRole && (
                        <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                            {state.fieldErrors.targetRole}
                        </p>
                    )}
                </div>

                {state.message && (
                    <div
                        className="rounded-md border px-3 py-2"
                        style={{
                            borderColor: state.success
                                ? "rgba(79,195,220,0.2)"
                                : "rgba(240,165,0,0.2)",
                            background: state.success
                                ? "rgba(79,195,220,0.04)"
                                : "rgba(240,165,0,0.05)",
                        }}
                    >
                        <p
                            className="text-xs"
                            style={{
                                color: state.success
                                    ? "rgba(79,195,220,0.75)"
                                    : "rgba(240,165,0,0.9)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {state.message}
                        </p>
                    </div>
                )}

                <div className="flex justify-end">
                    <DiscordInviteSubmitButton />
                </div>
            </form>
        </div>
    );
}