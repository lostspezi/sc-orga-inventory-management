"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createOrganizationAction, type CreateOrganizationActionState } from "@/lib/actions/organization-actions";
import CreateOrgSubmitButton from "@/components/orgs/create-org-submit-button";

const initialState: CreateOrganizationActionState = {
    success: false,
    message: "",
};

export default function CreateOrgDialog({ atLimit }: { atLimit: boolean }) {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

    const [state, formAction] = useActionState(createOrganizationAction, initialState);
    const [name, setName] = useState("");
    const [handle, setHandle] = useState("");

    const canSubmit = name.trim().length >= 2;

    // reset & close on success
    useEffect(() => {
        if (!state.success) return;
        queueMicrotask(() => {
            formRef.current?.reset();
            setName("");
            setHandle("");
            dialogRef.current?.close();
        });
    }, [state.success]);

    const handleClose = () => {
        dialogRef.current?.close();
        formRef.current?.reset();
        setName("");
        setHandle("");
    };

    const isLimitReached = atLimit || state.message === "limit_reached";

    return (
        <>
            <button type="button" onClick={() => dialogRef.current?.showModal()} className="sc-btn">
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
                                {isLimitReached ? "Organization Limit Reached" : "Create Organization"}
                            </h2>
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

                    {isLimitReached ? (
                        <div className="space-y-4">
                            <div
                                className="rounded-lg border p-4"
                                style={{
                                    borderColor: "rgba(240,165,0,0.3)",
                                    background: "rgba(240,165,0,0.06)",
                                }}
                            >
                                <p
                                    className="text-sm leading-relaxed"
                                    style={{ color: "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}
                                >
                                    You&apos;ve reached the maximum of 3 organizations you can create.
                                    To add a new one, leave or delete an existing organization first.
                                </p>
                                <p
                                    className="mt-2 text-xs"
                                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                                >
                                    Need more? Contact support.
                                </p>
                            </div>
                            <div className="flex justify-end">
                                <button type="button" onClick={handleClose} className="sc-btn sc-btn-outline">
                                    Close
                                </button>
                            </div>
                        </div>
                    ) : (
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
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Mercenary Corps"
                                    className="sc-input w-full"
                                    maxLength={60}
                                    autoComplete="off"
                                />

                                {state.fieldErrors?.name && (
                                    <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)", fontFamily: "var(--font-mono)" }}>
                                        {state.fieldErrors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label
                                    htmlFor="rsiHandle"
                                    className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                    style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                                >
                                    RSI Org Handle <span style={{ color: "rgba(200,220,232,0.3)" }}>(optional)</span>
                                </label>

                                <input
                                    id="rsiHandle"
                                    type="text"
                                    value={handle}
                                    onChange={(e) => setHandle(e.target.value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                                    placeholder="e.g. merccorp"
                                    className="sc-input w-full"
                                    autoComplete="off"
                                />

                                {handle && (
                                    <p className="mt-1 text-[11px]" style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                                        robertsspaceindustries.com/orgs/{handle}
                                    </p>
                                )}

                                <input
                                    type="hidden"
                                    name="starCitizenOrganizationUrl"
                                    value={handle ? `https://robertsspaceindustries.com/orgs/${handle}` : ""}
                                />
                            </div>

                            {state.message && !state.success && state.message !== "limit_reached" && (
                                <p
                                    className="text-sm"
                                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-mono)" }}
                                >
                                    {state.message}
                                </p>
                            )}

                            <div className="flex justify-end gap-2 pt-2">
                                <button type="button" onClick={handleClose} className="sc-btn sc-btn-outline">
                                    Cancel
                                </button>
                                <CreateOrgSubmitButton disabled={!canSubmit} />
                            </div>
                        </form>
                    )}
                </div>
            </dialog>
        </>
    );
}
