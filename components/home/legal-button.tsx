"use client";

import { useState } from "react";
import LegalDialog from "@/components/lega-dialog";

export default function HomeLegalButton({ label }: { label: string }) {
    const [show, setShow] = useState(false);

    return (
        <>
            {show && <LegalDialog onClose={() => setShow(false)} />}
            <button
                onClick={() => setShow(true)}
                className="cursor-pointer text-[10px] uppercase tracking-[0.2em] transition-colors hover:text-cyan-400"
                style={{ color: "rgba(79,195,220,0.3)", fontFamily: "var(--font-mono)" }}
            >
                {label}
            </button>
        </>
    );
}
