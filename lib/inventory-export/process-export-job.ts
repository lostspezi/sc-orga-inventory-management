import { ObjectId } from "mongodb";
import { OrganizationDocument } from "@/lib/types/organization";
import { getOrganizationInventoryItemViewsByOrganizationId } from "@/lib/repositories/organization-inventory-item-repository";
import { completeExportJob, failExportJob } from "@/lib/repositories/export-job-repository";
import { notify } from "@/lib/notify";
import { getDiscordUserId } from "@/lib/discord/get-discord-user-id";
import { sendDiscordDm } from "@/lib/discord/send-discord-dm";

function escapeCell(value: string | number | undefined): string {
    if (value === undefined || value === null) return "";
    const str = String(value);
    if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
}

export async function processExportJob(
    jobId: ObjectId,
    org: OrganizationDocument,
    initiatedByUserId: string
): Promise<void> {
    try {
        const items = await getOrganizationInventoryItemViewsByOrganizationId(org._id);

        const header = "name,buyPrice,sellPrice,quantity,quality,minStock,maxStock";
        const rows = items.map((item) =>
            [
                escapeCell(item.name),
                escapeCell(item.buyPrice),
                escapeCell(item.sellPrice),
                escapeCell(item.quantity),
                escapeCell(item.quality),
                escapeCell(item.minStock),
                escapeCell(item.maxStock),
            ].join(",")
        );

        const csvContent = [header, ...rows].join("\n");

        await completeExportJob(jobId, items.length, csvContent);

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
        const downloadPath = `/api/orgs/${org.slug}/inventory/export/${jobId.toString()}`;
        const downloadUrl = `${appUrl}${downloadPath}`;

        await notify(
            initiatedByUserId,
            "inventory.export_complete",
            "Inventory Export Ready",
            `${items.length} items exported. Click to download.`,
            downloadPath
        );

        try {
            const discordId = await getDiscordUserId(initiatedByUserId);
            if (discordId) {
                await sendDiscordDm(
                    discordId,
                    `**Inventory Export Ready** — ${org.name}\n📦 ${items.length} items exported.\n⬇️ Download: ${downloadUrl}`
                );
            }
        } catch {
            // Discord DM failure is non-critical
        }
    } catch (err) {
        console.error("[processExportJob] Fatal error", err);
        await failExportJob(jobId);
    }
}
