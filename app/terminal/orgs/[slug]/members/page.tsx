export default function OrgMembersPage() {
    return (
        <div className="space-y-4">
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Members
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    Member Management
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Member administration tools will be available here soon.
                </p>
            </div>

            <div
                className="rounded-lg border border-dashed p-8 text-center"
                style={{
                    borderColor: "rgba(240,165,0,0.28)",
                    background: "rgba(20,14,6,0.12)",
                }}
            >
                <p
                    className="text-sm uppercase tracking-[0.12em]"
                    style={{ color: "rgba(240,165,0,0.8)", fontFamily: "var(--font-display)" }}
                >
                    Module Under Construction
                </p>
                <p
                    className="mt-2 text-xs"
                    style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                >
                    Invite, roles, and member actions are currently being integrated.
                </p>
            </div>
        </div>
    );
}