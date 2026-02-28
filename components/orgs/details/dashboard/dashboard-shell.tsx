"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTransactionEvents, type TransactionEvent } from "@/hooks/use-transaction-events";
import type { OrganizationTransactionView } from "@/lib/types/transaction";
import ToastContainer from "@/components/orgs/details/dashboard/toast-container";
import LiveActivityFeed from "@/components/orgs/details/dashboard/live-activity-feed";

export type ActivityEntry = {
    id: string;
    transaction: OrganizationTransactionView;
    prevStatus: string | undefined;
    at: number;
};

export default function DashboardShell({
    organizationSlug,
    children,
}: {
    organizationSlug: string;
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [toasts, setToasts] = useState<ActivityEntry[]>([]);
    const [activity, setActivity] = useState<ActivityEntry[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const lastKnownStatus = useRef(new Map<string, string>());

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const handleEvent = useCallback(
        (event: TransactionEvent) => {
            if (event.type === "connected") {
                setIsConnected(true);
                return;
            }

            const tx = event.transaction;
            const prevStatus = lastKnownStatus.current.get(tx._id);
            const changed = prevStatus !== tx.status;
            lastKnownStatus.current.set(tx._id, tx.status);

            if (!changed) return;

            const entry: ActivityEntry = {
                id: `${tx._id}-${tx.status}-${Date.now()}`,
                transaction: tx,
                prevStatus,
                at: Date.now(),
            };

            setToasts((prev) => [entry, ...prev].slice(0, 5));
            setActivity((prev) => [entry, ...prev].slice(0, 30));
            router.refresh();

            setTimeout(() => dismissToast(entry.id), 6000);
        },
        [router, dismissToast]
    );

    useTransactionEvents(organizationSlug, handleEvent);

    return (
        <div className="space-y-4">
            {children}

            <LiveActivityFeed entries={activity} isConnected={isConnected} />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}
