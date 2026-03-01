"use client";

import {startTransition, useActionState, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import { useTranslations } from "next-intl";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import {removeOrganizationInventoryItemAction} from "@/lib/actions/remove-organization-inventory-item-action";

type Props = {
    organizationSlug: string;
    inventoryItemId: string;
    itemLabel?: string;
};

const initialState = {
    success: false,
    message: "",
};

export default function RemoveOrganizationInventoryItemButton({
                                                                  organizationSlug,
                                                                  inventoryItemId,
                                                                  itemLabel,
                                                              }: Props) {
    const router = useRouter();
    const t = useTranslations("inventory");
    const tc = useTranslations("common");
    const [open, setOpen] = useState(false);
    const handledSuccessRef = useRef(false);

    const [state, formAction, isPending] = useActionState(
        removeOrganizationInventoryItemAction,
        initialState
    );

    useEffect(() => {
        if (open) {
            handledSuccessRef.current = false;
        }
    }, [open]);

    useEffect(() => {
        if (!state.success || handledSuccessRef.current) return;
        handledSuccessRef.current = true;

        queueMicrotask(() => {
            setOpen(false);
            const msg = state.message || "Item removed from inventory.";
            router.replace(`?deleted=${encodeURIComponent(msg)}`);
        });
    }, [state.success, router, state.message]);

    const handleConfirm = async () => {
        const formData = new FormData();
        formData.set("organizationSlug", organizationSlug);
        formData.set("inventoryItemId", inventoryItemId);

        startTransition(async () => {
            await formAction(formData);
        });
    };

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                disabled={isPending}
                className="cursor-pointer rounded-md border px-3 py-1.5 text-[10px] uppercase tracking-[0.12em] disabled:opacity-50 w-full"
                style={{
                    borderColor: "rgba(240,165,0,0.2)",
                    color: "rgba(240,165,0,0.85)",
                    fontFamily: "var(--font-mono)",
                    background: "rgba(240,165,0,0.05)",
                }}
            >
                {t("removeItem")}
            </button>

            <ConfirmDialog
                open={open}
                onClose={() => setOpen(false)}
                onConfirm={handleConfirm}
                tone="danger"
                isLoading={isPending}
                title={t("removeItemTitle")}
                description={t("removeItemConfirm", { name: itemLabel ?? "this item" })}
                confirmLabel={t("removeItemButton")}
                cancelLabel={tc("cancel")}
            />
        </>
    );
}