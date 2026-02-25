import CreateOrgDialog from "@/components/orgs/create-org-dialog";
import Link from "next/link";

export default function OrgsPageHeader() {
    return (
        <div
            className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
            style={{ animation: "slide-in-up 0.45s ease forwards" }}
        >
            <div
                className="absolute -top-px left-8 right-8 h-px"
                style={{ background: "linear-gradient(90deg, transparent, var(--accent-primary), transparent)" }}
            />
            <div
                className="absolute -top-5 left-6 px-3 text-[10px] uppercase tracking-[0.3em]"
                style={{
                    color: "var(--accent-primary)",
                    fontFamily: "var(--font-mono)",
                    background: "var(--background)",
                }}
            >
                ORG.DIRECTORY
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <p
                        className="mb-1 text-xs uppercase tracking-[0.35em]"
                        style={{ color: "rgba(79,195,220,0.5)", fontFamily: "var(--font-display)" }}
                    >
                        United Empire of Earth
                    </p>
                    <h1
                        className="text-2xl font-semibold tracking-[0.08em] uppercase"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        Organizations
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Manage your organizations and member access.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Link href="/terminal" className="sc-btn sc-btn-outline text-center">
                        Back to Terminal
                    </Link>
                    <CreateOrgDialog />
                </div>
            </div>

            <div
                className="absolute -bottom-px left-8 right-8 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.25), transparent)" }}
            />
        </div>
    );
}