type Props = {
    params: Promise<{ slug: string }>;
};

export default async function OrgDetailsPage({ params }: Props) {
    const { slug } = await params;

    return (
        <div className="space-y-4">
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Dashboard
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    Organization Overview
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Core modules for {slug} are being prepared. Initial features will be available soon.
                </p>
            </div>
        </div>
    );
}
