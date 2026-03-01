"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";

export default function DiscordInviteSubmitButton() {
    const { pending } = useFormStatus();
    const t = useTranslations("members");

    return (
        <button
            type="submit"
            disabled={pending}
            className="sc-btn disabled:opacity-60"
        >
            {pending ? t("sending") : t("sendInvite")}
        </button>
    );
}