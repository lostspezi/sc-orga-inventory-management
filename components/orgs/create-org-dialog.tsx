"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { createOrganizationAction, type CreateOrganizationActionState } from "@/lib/actions/organization-actions";
import CreateOrgSubmitButton from "@/components/orgs/create-org-submit-button";

const initialState: CreateOrganizationActionState = {
    success: false,
    message: "",
    fieldErrors: {},
};

function sanitizeHandle(input: string) {
    return input
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "")
        .replace(/[^a-z0-9_-]/g, "");
}

// very simple display name generator
function displayNameFromHandle(handle: string) {
    if (!handle) return "";
    // merccorp -> Merccorp, my-org -> My Org
    return handle
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

type RsiResult =
    | { status: "valid"; url: string; handle: string }
    | { status: "invalid"; reason?: string; handle: string };

type DbResult =
    | { status: "known"; exists: boolean; handle: string }
    | { status: "idle" };

export default function CreateOrgDialog() {
    const dialogRef = useRef<HTMLDialogElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

    const [state, formAction] = useActionState(createOrganizationAction, initialState);

    const [orgHandleRaw, setOrgHandleRaw] = useState("");
    const orgHandle = useMemo(() => sanitizeHandle(orgHandleRaw), [orgHandleRaw]);

    // RSI validation result
    const [rsiResult, setRsiResult] = useState<RsiResult | null>(null);

    // DB existence check
    const [dbResult, setDbResult] = useState<DbResult>({ status: "idle" });

    const isCheckingRsi =
        orgHandle.length > 0 && (rsiResult === null || rsiResult.handle !== orgHandle);

    const rsiValid =
        orgHandle.length > 0 && rsiResult?.status === "valid" && rsiResult.handle === orgHandle;

    const dbKnownForHandle =
        dbResult.status === "known" && dbResult.handle === orgHandle;

    const existsInDb =
        dbKnownForHandle && dbResult.exists;

    const isCheckingDb =
        rsiValid && !dbKnownForHandle; // we only check DB once RSI is valid

    const orgName = useMemo(() => displayNameFromHandle(orgHandle), [orgHandle]);

    // Submit only if RSI valid AND not existing in DB
    const canSubmit = rsiValid && !existsInDb;

    // reset & close on success
    useEffect(() => {
        if (!state.success) return;

        queueMicrotask(() => {
            formRef.current?.reset();
            setOrgHandleRaw("");
            setRsiResult(null);
            setDbResult({ status: "idle" });
            dialogRef.current?.close();
        });
    }, [state.success]);

    const handleClose = () => {
        dialogRef.current?.close();
        formRef.current?.reset();
        setOrgHandleRaw("");
        setRsiResult(null);
        setDbResult({ status: "idle" });
    };

    // RSI: validate handle -> exists?
    useEffect(() => {
        if (!orgHandle) return;

        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/rsi/org-exists?handle=${encodeURIComponent(orgHandle)}`, {
                    method: "GET",
                    cache: "no-store",
                });

                const data: { exists: boolean; url: string | null } = await res.json();

                if (data.exists && data.url) {
                    setRsiResult({ status: "valid", url: data.url, handle: orgHandle });
                } else {
                    setRsiResult({ status: "invalid", reason: "Organization not found (404).", handle: orgHandle });
                }

                // important: reset dbResult when handle changes / RSI re-check happens
                setDbResult({ status: "idle" });
            } catch {
                setRsiResult({ status: "invalid", reason: "Validation failed. Try again.", handle: orgHandle });
                setDbResult({ status: "idle" });
            }
        }, 400);

        return () => clearTimeout(t);
    }, [orgHandle]);

    // DB: check if slug already exists (only once RSI valid)
    useEffect(() => {
        if (!rsiValid) return;

        const t = setTimeout(async () => {
            try {
                const res = await fetch(`/api/orgs/exists?handle=${encodeURIComponent(orgHandle)}`, {
                    method: "GET",
                    cache: "no-store",
                });

                const data: { exists: boolean; handle: string } = await res.json();
                setDbResult({ status: "known", exists: data.exists, handle: data.handle });
            } catch {
                // if DB check fails, treat as "unknown" but keep UI safe
                setDbResult({ status: "known", exists: false, handle: orgHandle });
            }
        }, 150);

        return () => clearTimeout(t);
    }, [rsiValid, orgHandle]);

    const submittedUrl =
        rsiValid && rsiResult?.status === "valid" ? rsiResult.url : "";

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
                                Create Organization
                            </h2>
                            <p
                                className="mt-1 text-sm"
                                style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                            >
                                Enter the RSI org handle. The name will be derived automatically.
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
                        {/* Derived Name (read-only) */}
                        <div>
                            <label
                                htmlFor="name"
                                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                Organization Name (derived)
                            </label>

                            {/* submit value */}
                            <input type="hidden" name="name" value={orgName} />

                            {/* display-only */}
                            <input
                                id="name"
                                type="text"
                                value={orgName || ""}
                                readOnly
                                className="sc-input w-full opacity-90"
                            />

                            <p
                                className="mt-1 text-[11px]"
                                style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                            >
                                Name is generated from the handle and cannot be edited.
                            </p>

                            {state.fieldErrors?.name && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.name}
                                </p>
                            )}
                        </div>

                        {/* Handle Input */}
                        <div>
                            <label
                                htmlFor="starCitizenOrgHandle"
                                className="mb-1.5 block text-[10px] uppercase tracking-[0.22em]"
                                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
                            >
                                Star Citizen Org Handle
                            </label>

                            <input
                                id="starCitizenOrgHandle"
                                name="starCitizenOrgHandle"
                                type="text"
                                value={orgHandleRaw}
                                onChange={(e) => setOrgHandleRaw(e.target.value)}
                                placeholder="e.g. merccorp"
                                className="sc-input w-full"
                                required
                                autoComplete="off"
                            />

                            {/* URL saved to DB */}
                            <input type="hidden" name="starCitizenOrganizationUrl" value={submittedUrl} />

                            {/* Status line */}
                            <div className="mt-2 text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                                {!orgHandle && (
                                    <span style={{ color: "rgba(200,220,232,0.35)" }}>
                    Enter the org handle to validate availability.
                  </span>
                                )}

                                {orgHandle && isCheckingRsi && (
                                    <span style={{ color: "rgba(79,195,220,0.55)" }}>
                    Checking RSI registry…
                  </span>
                                )}

                                {rsiValid && rsiResult?.status === "valid" && (
                                    <span style={{ color: "rgba(79,195,220,0.75)" }}>
                    RSI OK:{" "}
                                        <a href={rsiResult.url} target="_blank" rel="noreferrer" className="underline">
                      {rsiResult.url}
                    </a>
                  </span>
                                )}

                                {orgHandle &&
                                    !isCheckingRsi &&
                                    rsiResult?.status === "invalid" &&
                                    rsiResult.handle === orgHandle && (
                                        <span style={{ color: "rgba(240,165,0,0.85)" }}>
                      {rsiResult.reason ?? "Organization not found."}
                    </span>
                                    )}
                            </div>

                            {/* DB Check line */}
                            <div className="mt-2 text-[11px]" style={{ fontFamily: "var(--font-mono)" }}>
                                {rsiValid && isCheckingDb && (
                                    <span style={{ color: "rgba(79,195,220,0.45)" }}>
                    Checking local registry…
                  </span>
                                )}

                                {rsiValid && dbKnownForHandle && !existsInDb && (
                                    <span style={{ color: "rgba(79,195,220,0.65)" }}>
                    Local registry: available.
                  </span>
                                )}

                                {rsiValid && dbKnownForHandle && existsInDb && (
                                    <span style={{ color: "rgba(240,165,0,0.9)" }}>
                    This organization already exists in your database.
                  </span>
                                )}
                            </div>

                            {state.fieldErrors?.starCitizenOrganizationUrl && (
                                <p className="mt-1 text-xs" style={{ color: "rgba(240,165,0,0.85)" }}>
                                    {state.fieldErrors.starCitizenOrganizationUrl}
                                </p>
                            )}
                        </div>

                        {state.message && !state.success && (
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
                </div>
            </dialog>
        </>
    );
}