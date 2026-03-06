import { Suspense } from "react";
import type { ReactNode } from "react";
import { LegalBackButton, LegalInternalFooter } from "@/components/legal/legal-nav";

export default function LegalLayout({ children }: { children: ReactNode }) {
    return (
        <div
            className="min-h-screen"
            style={{
                background: "var(--background)",
                fontFamily: "var(--font-ui)",
                color: "rgba(200,220,232,0.7)",
            }}
        >
            <header
                className="flex items-center gap-4 px-6 py-4"
                style={{ borderBottom: "1px solid rgba(79,195,220,0.1)" }}
            >
                <Suspense fallback={
                    <span className="text-[11px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-mono)" }}>
                        ← Back
                    </span>
                }>
                    <LegalBackButton />
                </Suspense>
                <span style={{ color: "rgba(79,195,220,0.15)" }}>|</span>
                <span
                    className="text-[11px] uppercase tracking-[0.3em]"
                    style={{ color: "rgba(79,195,220,0.25)", fontFamily: "var(--font-display)" }}
                >
                    SC Orga Manager
                </span>
            </header>

            <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>

            <Suspense fallback={null}>
                <LegalInternalFooter />
            </Suspense>
        </div>
    );
}
