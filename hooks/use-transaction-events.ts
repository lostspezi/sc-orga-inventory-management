"use client";

import {useEffect, useLayoutEffect, useRef} from "react";
import type { OrganizationTransactionView } from "@/lib/types/transaction";

export type TransactionEvent =
    | { type: "connected" }
    | { type: "transaction.update"; transaction: OrganizationTransactionView };

export function useTransactionEvents(
    organizationSlug: string,
    onEvent: (event: TransactionEvent) => void
) {
    const onEventRef = useRef(onEvent);

    useLayoutEffect(() => {
        onEventRef.current = onEvent;
    });

    useEffect(() => {
        const es = new EventSource(`/api/orgs/${organizationSlug}/transaction-events`);

        es.onmessage = (e: MessageEvent) => {
            try {
                const data = JSON.parse(e.data) as TransactionEvent;
                onEventRef.current(data);
            } catch { /* ignore malformed events */ }
        };

        return () => es.close();
    }, [organizationSlug]);
}
