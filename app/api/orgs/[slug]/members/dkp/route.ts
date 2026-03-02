import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getOrganizationBySlug } from "@/lib/repositories/organization-repository";
import { getDiscordUserId } from "@/lib/discord/get-discord-user-id";
import { getMemberDkp } from "@/lib/raid-helper/get-member-dkp";

type Params = { slug: string };

export async function GET(
    _req: Request,
    { params }: { params: Promise<Params> }
) {
    const session = await auth();

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const org = await getOrganizationBySlug(slug);

    if (!org) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const member = org.members.find((m) => m.userId === session.user!.id);

    if (!member) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hasDkpIntegration = !!(org.raidHelperApiKey && org.discordGuildId);

    if (!hasDkpIntegration) {
        return NextResponse.json({ dkp: null, hasDkpIntegration: false });
    }

    const discordUserId = await getDiscordUserId(session.user.id);

    if (!discordUserId) {
        return NextResponse.json({ dkp: null, hasDkpIntegration: true });
    }

    const dkp = await getMemberDkp(org.discordGuildId!, discordUserId, org.raidHelperApiKey!);

    return NextResponse.json({ dkp, hasDkpIntegration: true });
}
