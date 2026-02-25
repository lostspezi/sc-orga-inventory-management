"use client";

import { useActionState, useEffect, useRef } from "react";
import { createOrganizationAction, type CreateOrganizationActionState } from "@/lib/actions/organization-actions";
import CreateOrgSubmitButton from "@/components/orgs/create-org-submit-button";

const initialState: CreateOrganizationActionState = {
    success: false,
    message: "",
    fieldErrors: {},
};

export default function CreateOrgDialog() {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

    const [state, formAction] = useActionState(createOrganizationAction, initialState);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
            dialogRef.current?.close();
        }
    }, [state.success]);

    const handleClose = () => {
        dialogRef.current?.close();
        formRef.current?.reset();
    }

    return (
        <>
            <button
                type="button"
                onClick={() => dialogRef.current?.showModal()}
                className="sc-btn"
            >
                Create Organization
            </button>

            <dialog
                ref={dialogRef}
                className="fixed left-1/2 top-1/2 m-0 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border p-0 backdrop:bg-black/70"
                style={{
                    borderColor: "rgba(79,195,220,0.2)",
                    background: "rgba(6,12,18,0.95)",
                    boxShadow: "0 0 40px rgba(0,0,0,0.45)",
                }}
            >
                <div className="relative p-5 sm:p-6">
                    <div
                        className="absolute left-6 right-6 top-0 h-px"
                        style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }}
                    />

                    <div className="mb-5 flex items-start justify-between gap-3">
                        <div>
                            <p
                                className="mb-1 text-[10px] uppercase tracking-[0.3em]"
                                style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                            >
                                ORG.CREATE
                            </p>
                            <h2
                                className="text-lg font-semibold uppercase tracking-[0.08em]"
                                style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                            >
                                Create Organization
                            </h2>
                            <p
                                className="mt-1 text-sm"
                                style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                            >
                                Register a new organization in the terminal.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            className="cursor-pointer rounded-md border px-2.5 py-1 text-xs"
                            style={{
                                borderColor: "rgba(79,195,220,0.2)",
                                color: "rgba(200,220,232,0.6)",
                                fontFamily: "var(--font-mono)",
                                background: "rgba(79,195,220,0.04)",
                            }}
                        >
                            CLOSE
                        </button>
                    </div>

                    <form ref={formRef} action={formAction} className="space-y-4">
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                Organization Name
                            </label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                placeholder="e.g. Galactic Traders"
                                className="sc-input w-full"
                                required
                            />
                            {state.fieldErrors?.name && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.name}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="starCitizenOrganizationUrl"
                                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                Star Citizen Organization URL
                            </label>
                            <input
                                id="starCitizenOrganizationUrl"
                                name="starCitizenOrganizationUrl"
                                type="url"
                                placeholder="https://robertsspaceindustries.com/orgs/..."
                                className="sc-input w-full"
                                required
                            />
                            {state.fieldErrors?.starCitizenOrganizationUrl && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.starCitizenOrganizationUrl}
                                </p>
                            )}
                        </div>

                        {state.message && !state.success && (
                            <p className="text-sm" style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}>
                                {state.message}
                            </p>
                        )}

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="sc-btn sc-btn-outline"
                            >
                                Cancel
                            </button>
                            <CreateOrgSubmitButton />
                        </div>
                    </form>
                </div>
            </dialog>
        </>
    );
}