import type {OrganizationView} from "@/lib/types/organization";
import Link from "next/link";

type Props = {
    organization: OrganizationView;
};

export default function OrgCard({ organization }: Props) {
    const owner = organization.members.find((m) => m.role === "owner");

    return (
        <div
            className="hud-panel corner-tr corner-bl relative p-4"
            style={{ background: "rgba(8,16,24,0.55)" }}
        >
            <div
                className="absolute -top-px left-6 right-6 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.35), transparent)" }}
            />

            <div className="space-y-1">
                <div className="flex items-start justify-between gap-3">
                    <h3
                        className="text-sm font-semibold uppercase tracking-[0.12em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {organization.name}
                    </h3>

                    <span
                        className="rounded border px-2 py-0.5 text-[10px] uppercase tracking-[0.15em]"
                        style={{
                            borderColor: "rgba(79,195,220,0.18)",
                            color: "rgba(79,195,220,0.55)",
                            fontFamily: "var(--font-mono)",
                            background: "rgba(79,195,220,0.04)",
                        }}
                    >
                        ORG
                    </span>
                </div>

                <p
                    className="text-[11px]"
                    style={{ color: "rgba(200,220,232,0.35)", fontFamily: "var(--font-mono)" }}
                >
                    Slug: {organization.slug}
                </p>
            </div>

            <div className="mt-4 space-y-2 text-xs" style={{ fontFamily: "var(--font-mono)" }}>
                <div className="flex items-center justify-between">
                    <span style={{ color: "rgba(200,220,232,0.35)" }}>Members</span>
                    <span style={{ color: "rgba(79,195,220,0.7)" }}>{organization.members.length}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                    <span style={{ color: "rgba(200,220,232,0.35)" }}>Owner</span>
                    <span
                        className="truncate text-right"
                        style={{ color: "rgba(200,220,232,0.55)" }}
                        title={owner?.username ?? "—"}
                    >
                        {owner?.username ?? "—"}
                    </span>
                </div>
            </div>

            <Link
                href={`/terminal/orgs/${organization.slug}`}
                className="sc-btn sc-btn-outline mt-4 inline-flex w-full items-center justify-center text-center"
            >
                Go to Org
            </Link>

            {organization.starCitizenOrganizationUrl && (
                <a
                    href={organization.starCitizenOrganizationUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="sc-btn sc-btn-outline mt-4 inline-flex w-full items-center justify-center text-center"
                >
                    Open Star Citizen Org
                </a>
            )}

            <div
                className="absolute -bottom-px left-6 right-6 h-px"
                style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.18), transparent)" }}
            />
        </div>
    );
}