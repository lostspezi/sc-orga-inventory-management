import Link from "next/link";

export default function ForbiddenPage() {
    return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
            <div
                className="w-full max-w-xl rounded-lg border p-6"
                style={{
                    borderColor: "rgba(240,165,0,0.18)",
                    background: "rgba(20,14,6,0.12)",
                }}
            >
                <h1
                    className="text-2xl font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                >
                    Forbidden
                </h1>
                <p
                    className="mt-2 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    You do not have permission to access this area.
                </p>

                <div className="mt-4 flex gap-2">
                    <Link href="/terminal" className="sc-btn">
                        Open Terminal
                    </Link>
                    <Link href="/" className="sc-btn sc-btn-outline">
                        Back Home
                    </Link>
                </div>
            </div>
        </main>
    );
}