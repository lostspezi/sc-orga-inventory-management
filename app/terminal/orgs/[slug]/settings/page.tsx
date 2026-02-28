import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import OrgSettingsForm from "@/components/orgs/details/settings/org-settings-form";
import DiscordServerCard from "@/components/orgs/details/settings/discord-server-card";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function OrgSettingsPage({ params }: Props) {
    const { slug } = await params;

    const session = await auth();

    if (!session?.user) {
        redirect("/login");
    }

    const org = await getOrganizationBySlug(slug);

    if (!org) {
        notFound();
    }

    const currentMember = org.members.find((m) => m.userId === session.user!.id);
    const isAdminOrOwner = currentMember && ["owner", "admin"].includes(currentMember.role);

    if (!currentMember || !isAdminOrOwner) {
        return (
            <div
                className="rounded-lg border p-6"
                style={{
                    borderColor: "rgba(240,165,0,0.18)",
                    background: "rgba(20,14,6,0.12)",
                }}
            >
                <h2
                    className="text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                >
                    Forbidden
                </h2>
                <p
                    className="mt-2 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Only organization admins & owners can access settings.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Settings
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    Organization Settings
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "rgba(200,220,232,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Configure integrations and notifications for your organization.
                </p>
            </div>

            <DiscordServerCard
                organizationSlug={org.slug}
                discordGuildId={org.discordGuildId}
            />

            <div
                className="rounded-lg border p-4"
                style={{
                    borderColor: "rgba(79,195,220,0.14)",
                    background: "rgba(7,18,28,0.28)",
                }}
            >
                <div className="mb-4">
                    <p
                        className="text-[10px] uppercase tracking-[0.25em]"
                        style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                    >
                        Discord Integration
                    </p>
                    <h3
                        className="mt-1 text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        Transaction Notifications
                    </h3>
                </div>

                <OrgSettingsForm
                    organizationSlug={org.slug}
                    currentChannelId={org.discordTransactionChannelId ?? ""}
                    hasDiscord={!!org.discordGuildId}
                />
            </div>
        </div>
    );
}
