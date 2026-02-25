import type {OrganizationView} from "@/lib/types/organization";
import OrgCard from "@/components/orgs/org-card";

type Props = {
    organizations: OrganizationView[];
};

export default function OrgsList({ organizations }: Props) {
    if (organizations.length === 0) {
        return (
            <div
                className="hud-panel corner-tr corner-bl relative p-8 text-center"
                style={{ animation: "slide-in-up 0.55s 0.05s ease both" }}
            >
                <div
                    className="absolute -top-px left-8 right-8 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(240,165,0,0.8), transparent)" }}
                />

                <h2
                    className="text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                >
                    No Organizations Found
                </h2>
                <p
                    className="mt-2 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Create your first organization using the button above.
                </p>

                <div
                    className="absolute -bottom-px left-8 right-8 h-px"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(79,195,220,0.2), transparent)" }}
                />
            </div>
        );
    }

    return (
        <div
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
            style={{ animation: "slide-in-up 0.55s 0.1s ease both" }}
        >
            {organizations.map((org) => (
                <OrgCard key={org._id.toString()} organization={org} />
            ))}
        </div>
    );
}