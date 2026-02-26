"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
    to: string;
    delayMs?: number;
};

export default function InviteSuccessRedirect({
                                                  to,
                                                  delayMs = 5000,
                                              }: Readonly<Props>) {
    const router = useRouter();

    useEffect(() => {
        const timeout = setTimeout(() => {
            router.replace(to);
        }, delayMs);

        return () => clearTimeout(timeout);
    }, [router, to, delayMs]);

    return null;
}