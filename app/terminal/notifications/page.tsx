import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getNotificationsForUser } from "@/lib/repositories/notification-repository";
import NotificationsPageClient from "@/components/terminal/notifications-page-client";
import BackButton from "@/components/ui/back-button";
import type { NotificationView } from "@/lib/types/notification";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const t = await getTranslations("notifications");

    const docs = await getNotificationsForUser(session.user.id, 100);

    const notifications: NotificationView[] = docs.map((n) => ({
        _id: n._id.toString(),
        type: n.type,
        title: n.title,
        message: n.message,
        link: n.link,
        read: n.read,
        createdAt: n.createdAt.toISOString(),
    }));

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-3xl space-y-4"
                style={{ animation: "slide-in-up 0.45s ease forwards" }}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p
                            className="text-[10px] uppercase tracking-[0.25em]"
                            style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                        >
                            {t("account")}
                        </p>
                        <h1
                            className="mt-1 text-2xl font-semibold uppercase tracking-[0.08em]"
                            style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                        >
                            {t("title")}
                        </h1>
                    </div>
                    <BackButton />
                </div>

                <NotificationsPageClient notifications={notifications} />
            </div>
        </main>
    );
}
