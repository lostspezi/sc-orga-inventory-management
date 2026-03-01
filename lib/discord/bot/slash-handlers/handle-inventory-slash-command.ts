import { ChatInputCommandInteraction, EmbedBuilder, MessageFlagsBitField } from "discord.js";
import { getOrganizationByDiscordGuildId } from "@/lib/repositories/organization-repository";
import { getOrganizationInventoryItemViewsByOrganizationId } from "@/lib/repositories/organization-inventory-item-repository";

const EMBED_COLOR = 0x4fc3dc;
const MAX_FIELDS = 25;

function formatPrice(aUEC: number): string {
    return `${aUEC.toLocaleString("en-US")} aUEC`;
}

export async function handleInventorySlashCommand(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.guildId) {
        await interaction.reply({
            content: "This command can only be used inside a Discord server.",
            flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
    }

    const org = await getOrganizationByDiscordGuildId(interaction.guildId);
    if (!org) {
        await interaction.reply({
            content: "No organization is linked to this Discord server.",
            flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
    }

    const search = interaction.options.getString("search")?.trim().toLowerCase() ?? null;

    let items = await getOrganizationInventoryItemViewsByOrganizationId(org._id);

    if (search) {
        items = items.filter((item) => item.name.toLowerCase().includes(search));
    }

    if (items.length === 0) {
        await interaction.reply({
            content: search
                ? `No inventory items match **${search}**.`
                : "This organization has no inventory items yet.",
            flags: MessageFlagsBitField.Flags.Ephemeral,
        });
        return;
    }

    const truncated = items.length > MAX_FIELDS;
    const displayed = items.slice(0, MAX_FIELDS);

    const embed = new EmbedBuilder()
        .setColor(EMBED_COLOR)
        .setTitle(search ? `Inventory — "${search}"` : `${org.name} — Inventory`)
        .setFooter(
            truncated
                ? { text: `Showing ${MAX_FIELDS} of ${items.length} items. Use /inventory search:<name> to filter.` }
                : { text: `${items.length} item${items.length !== 1 ? "s" : ""}` }
        )
        .setTimestamp();

    for (const item of displayed) {
        embed.addFields({
            name: item.name,
            value: [
                `Buy: **${formatPrice(item.buyPrice)}**`,
                `Sell: **${formatPrice(item.sellPrice)}**`,
                `Stock: **${item.quantity}**`,
            ].join("\n"),
            inline: true,
        });
    }

    await interaction.reply({ embeds: [embed] });
}
