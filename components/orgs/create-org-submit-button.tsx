"use client";

import { useFormStatus } from "react-dom";

export default function CreateOrgSubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="sc-btn sc-btn-outline"
        >
            {pending ? "Creating..." : "Create"}
        </button>
    );
}