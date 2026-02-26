export default function OrgMembersLoading() {
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
                    className="mt-2 h-4 w-full max-w-xl rounded-md"
                    style={{ background: "rgba(200,220,232,0.08)" }}
                />
            </div>

            {/* Active members skeleton */}
            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.28)",
                }}
            >
                <div className="mb-4">
                    <div
                        className="mb-2 h-3 w-24 rounded-full"
                        style={{ background: "rgba(79,195,220,0.14)" }}
                    />
                    <div
                        className="h-6 w-40 rounded-md"
                        style={{ background: "rgba(79,195,220,0.12)" }}
                    />
                </div>

                <div className="space-y-2">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-md border px-3 py-3"
                            style={{
                                borderColor: "rgba(79,195,220,0.10)",
                                background: "rgba(7,18,28,0.18)",
                            }}
                        >
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="space-y-2">
                                    <div
                                        className="h-4 w-32 rounded-md"
                                        style={{ background: "rgba(200,220,232,0.10)" }}
                                    />
                                    <div
                                        className="h-5 w-16 rounded-full"
                                        style={{ background: "rgba(79,195,220,0.10)" }}
                                    />
                                </div>

                                <div
                                    className="h-8 w-24 rounded-md"
                                    style={{ background: "rgba(240,165,0,0.08)" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Invite panel skeleton */}
            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.28)",
                }}
            >
                <div className="mb-4">
                    <div
                        className="mb-2 h-3 w-24 rounded-full"
                        style={{ background: "rgba(79,195,220,0.14)" }}
                    />
                    <div
                        className="h-6 w-52 rounded-md"
                        style={{ background: "rgba(79,195,220,0.12)" }}
                    />
                    <div
                        className="mt-2 h-4 w-full max-w-lg rounded-md"
                        style={{ background: "rgba(200,220,232,0.08)" }}
                    />
                </div>

                <div className="space-y-4">
                    <div>
                        <div
                            className="mb-2 h-3 w-28 rounded-full"
                            style={{ background: "rgba(79,195,220,0.12)" }}
                        />
                        <div
                            className="h-11 w-full rounded-md"
                            style={{ background: "rgba(200,220,232,0.08)" }}
                        />
                    </div>

                    <div>
                        <div
                            className="mb-2 h-3 w-20 rounded-full"
                            style={{ background: "rgba(79,195,220,0.12)" }}
                        />
                        <div
                            className="h-11 w-full rounded-md"
                            style={{ background: "rgba(200,220,232,0.08)" }}
                        />
                    </div>

                    <div className="flex justify-end">
                        <div
                            className="h-10 w-40 rounded-md"
                            style={{ background: "rgba(79,195,220,0.10)" }}
                        />
                    </div>
                </div>
            </div>

            {/* Pending invites skeleton */}
            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.28)",
                }}
            >
                <div className="mb-4">
                    <div
                        className="mb-2 h-3 w-28 rounded-full"
                        style={{ background: "rgba(79,195,220,0.14)" }}
                    />
                    <div
                        className="h-6 w-36 rounded-md"
                        style={{ background: "rgba(79,195,220,0.12)" }}
                    />
                </div>

                <div className="space-y-2">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="rounded-md border p-3"
                            style={{
                                borderColor: "rgba(79,195,220,0.10)",
                                background: "rgba(7,18,28,0.18)",
                            }}
                        >
                            <div className="space-y-2">
                                <div
                                    className="h-4 w-40 rounded-md"
                                    style={{ background: "rgba(200,220,232,0.10)" }}
                                />
                                <div
                                    className="h-3 w-32 rounded-md"
                                    style={{ background: "rgba(200,220,232,0.06)" }}
                                />
                                <div
                                    className="h-3 w-24 rounded-md"
                                    style={{ background: "rgba(200,220,232,0.06)" }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}