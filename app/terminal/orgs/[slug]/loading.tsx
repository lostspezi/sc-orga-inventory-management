export default function OrgDetailsLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Header skeleton */}
            <div>
                <div
                    className="mb-2 h-3 w-20 rounded-full"
                    style={{ background: "rgba(79,195,220,0.14)" }}
                />
                <div
                    className="h-7 w-56 rounded-md"
                    style={{ background: "rgba(79,195,220,0.12)" }}
                />
                <div
                    className="mt-2 h-4 w-full max-w-2xl rounded-md"
                    style={{ background: "rgba(200,220,232,0.08)" }}
                />
            </div>

            {/* Status cards skeleton */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg border p-4"
                        style={{
                            borderColor: "rgba(79,195,220,0.14)",
                            background: "rgba(7,18,28,0.28)",
                        }}
                    >
                        <div className="mb-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div
                                    className="h-4 w-4 rounded-sm"
                                    style={{ background: "rgba(79,195,220,0.10)" }}
                                />
                                <div
                                    className="h-4 w-28 rounded-md"
                                    style={{ background: "rgba(79,195,220,0.12)" }}
                                />
                            </div>

                            <div
                                className="h-5 w-16 rounded-full"
                                style={{ background: "rgba(79,195,220,0.10)" }}
                            />
                        </div>

                        <div className="space-y-2">
                            <div
                                className="h-3 w-full rounded-md"
                                style={{ background: "rgba(200,220,232,0.08)" }}
                            />
                            <div
                                className="h-3 w-5/6 rounded-md"
                                style={{ background: "rgba(200,220,232,0.06)" }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Terminal output skeleton */}
            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.35)",
                }}
            >
                <div className="space-y-2">
                    <div
                        className="h-3 w-64 rounded-md"
                        style={{ background: "rgba(200,220,232,0.08)" }}
                    />
                    <div
                        className="h-3 w-56 rounded-md"
                        style={{ background: "rgba(200,220,232,0.06)" }}
                    />
                    <div
                        className="h-3 w-48 rounded-md"
                        style={{ background: "rgba(200,220,232,0.06)" }}
                    />
                    <div
                        className="h-3 w-52 rounded-md"
                        style={{ background: "rgba(200,220,232,0.06)" }}
                    />
                    <div
                        className="h-3 w-72 rounded-md"
                        style={{ background: "rgba(200,220,232,0.08)" }}
                    />
                </div>
            </div>
        </div>
    );
}