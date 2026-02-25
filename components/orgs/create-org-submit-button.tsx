"use client";

import { useFormStatus } from "react-dom";

export default function CreateOrgSubmitButton({ disabled }: { disabled?: boolean }) {
    const { pending } = useFormStatus();
    const isDisabled = disabled || pending;

    return (
        <button
            type="submit"
            disabled={isDisabled}
            className="sc-btn disabled:opacity-60"
        >
            {pending ? "Creating..." : "Create Organization"}
        </button>
    );
}