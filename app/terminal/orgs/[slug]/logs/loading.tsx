export default function OrgLogsLoading() {
    return (
        <div className="space-y-4 animate-pulse">
            {/* Header skeleton */}
            <div>
                <div
                    className="mb-2 h-3 w-16 rounded-full"
                    style={{ background: "rgba(79,195,220,0.14)" }}
                />
                <div
                    className="h-7 w-44 rounded-md"
                    style={{ background: "rgba(79,195,220,0.12)" }}
                />
                <div
                    className="mt-2 h-4 w-full max-w-xl rounded-md"
                    style={{ background: "rgba(200,220,232,0.08)" }}
                />
            </div>

            {/* Search form skeleton */}
            <div
                className="rounded-lg border p-3"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.28)",
                }}
            >
                <div
                    className="mb-2 h-3 w-24 rounded-full"
                    style={{ background: "rgba(79,195,220,0.12)" }}
                />
                <div
                    className="h-11 w-full rounded-md"
                    style={{ background: "rgba(200,220,232,0.08)" }}
                />
            </div>

            {/* Log rows skeleton */}
            <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="rounded-lg border p-3"
                        style={{
                            borderColor: "rgba(79,195,220,0.14)",
                            background: "rgba(7,18,28,0.26)",
                        }}
                    >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <div className="min-w-0 flex-1 pr-2">
                                <div
                                    className="h-4 w-full max-w-lg rounded-md"
                                    style={{ background: "rgba(200,220,232,0.10)" }}
                                />
                            </div>

                            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                                <div
                                    className="h-3 w-24 rounded-md"
                                    style={{ background: "rgba(200,220,232,0.08)" }}
                                />
                                <div
                                    className="h-3 w-28 rounded-md"
                                    style={{ background: "rgba(200,220,232,0.06)" }}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}