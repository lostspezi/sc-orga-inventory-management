"use client";

import { useActionState } from "react";
import { updateOrgSettingsAction, type UpdateOrgSettingsActionState } from "@/lib/actions/update-org-settings-action";
import DiscordChannelSelect from "@/components/orgs/details/settings/discord-channel-select";

type Props = {
    organizationSlug: string;
    currentChannelId: string;
    hasDiscord: boolean;
};

const initialState: UpdateOrgSettingsActionState = {
    success: false,
    message: "",
};

export default function OrgSettingsForm({ organizationSlug, currentChannelId, hasDiscord }: Props) {
    const [state, formAction, isPending] = useActionState(updateOrgSettingsAction, initialState);

    return (
        <form action={formAction} className="space-y-4">
            <input type="hidden" name="organizationSlug" value={organizationSlug} />

            {hasDiscord ? (
                <DiscordChannelSelect
                    organizationSlug={organizationSlug}
                    currentChannelId={currentChannelId}
                />
            ) : (
                <div>
                    <p
                        className="text-[10px] uppercase tracking-[0.15em]"
                        style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                    >
                        Discord Notification Channel
                    </p>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                    >
                        Connect a Discord server to this organization first (Members page) to configure a notification channel.
                    </p>
                    {/* Still include hidden input so form submission is valid */}
                    <input type="hidden" name="discordTransactionChannelId" value="" />
                </div>
            )}

            {state.message && (
                <p
                    className="text-sm"
                    style={{
                        color: state.success
                            ? "rgba(87,242,135,0.85)"
                            : "rgba(240,100,100,0.85)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {state.message}
                </p>
            )}

            {hasDiscord && (
                <button
                    type="submit"
                    disabled={isPending}
                    className="cursor-pointer rounded-md border px-4 py-2 text-xs uppercase tracking-[0.15em] transition-colors disabled:opacity-50"
                    style={{
                        borderColor: "rgba(79,195,220,0.35)",
                        color: "rgba(79,195,220,0.85)",
                        fontFamily: "var(--font-mono)",
                    }}
                >
                    {isPending ? "Saving..." : "Save Settings"}
                </button>
            )}
        </form>
    );
}
