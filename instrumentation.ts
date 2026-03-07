export async function register() {
    // Only run in the Node.js runtime (not Edge)
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { runAllMigrations } = await import("@/lib/migrations/run-all");
        await runAllMigrations();
    }
}
