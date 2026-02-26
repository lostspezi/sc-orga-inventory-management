"use client";

import { useFormStatus } from "react-dom";

export default function DiscordInviteSubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="sc-btn disabled:opacity-60"
        >
            {pending ? "Sending..." : "Send Discord Invite"}
        </button>
    );
}