import { createNotificationInDb } from "@/lib/repositories/notification-repository";

/**
 * Fire-and-forget notification helper. Use this anywhere you want to send a
 * notification to a user. Errors are swallowed so they never break the caller.
 *
 * @example
 * await notify(userId, "trade.requested", "New Trade Request", "Alice wants to sell 5x Laranite", "/terminal/orgs/my-org/transactions");
 */
export async function notify(
    userId: string,
    type: string,
    title: string,
    message: string,
    link?: string
): Promise<void> {
    try {
        await createNotificationInDb(userId, type, title, message, link);
    } catch (err) {
        console.error("[notify] Failed to create notification", err);
    }
}

/**
 * Send the same notification to multiple users at once.
 */
export async function notifyMany(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    link?: string
): Promise<void> {
    await Promise.all(userIds.map((id) => notify(id, type, title, message, link)));
}
