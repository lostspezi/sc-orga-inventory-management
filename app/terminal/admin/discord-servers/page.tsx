import Image from "next/image";
import { getBotGuilds } from "@/lib/discord/get-bot-guilds";
import LeaveServerButton from "@/components/admin/leave-server-button";

export const metadata = { title: "Admin · Discord Servers" };

export default async function AdminDiscordServersPage() {
    const guilds = await getBotGuilds();

    return (
        <main className="px-4 py-6 sm:px-6">
            <div
                className="mx-auto w-full max-w-7xl space-y-4"
                style={{ animation: "slide-in-up 0.45s ease forwards" }}
            >
                <section
                    className="hud-panel corner-tr corner-bl relative p-5 sm:p-6"
                    style={{ background: "rgba(8,16,24,0.55)" }}
                >
                    <div
                        className="absolute -top-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.6), transparent)",
                        }}
                    />
                    <p
                        className="mb-1 text-xs uppercase tracking-[0.35em]"
                        style={{ color: "rgba(240,165,0,0.5)", fontFamily: "var(--font-display)" }}
                    >
                        Super Admin · Discord Bot
                    </p>
                    <h1
                        className="text-2xl font-semibold uppercase tracking-[0.08em] sm:text-3xl"
                        style={{ color: "rgba(240,165,0,0.9)", fontFamily: "var(--font-display)" }}
                    >
                        Discord Servers
                    </h1>
                    <p
                        className="mt-1 text-sm"
                        style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        Bot is active on {guilds.length} server{guilds.length !== 1 ? "s" : ""}.
                    </p>
                    <div
                        className="absolute -bottom-px left-8 right-8 h-px"
                        style={{
                            background:
                                "linear-gradient(90deg, transparent, rgba(240,165,0,0.2), transparent)",
                        }}
                    />
                </section>

                <section
                    className="hud-panel overflow-hidden"
                    style={{ background: "rgba(8,16,24,0.45)" }}
                >
                    {guilds.length === 0 ? (
                        <p
                            className="p-6 text-sm"
                            style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                        >
                            Bot is not active on any Discord servers, or the bot token is unavailable.
                        </p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table
                                className="w-full text-sm"
                                style={{ fontFamily: "var(--font-mono)" }}
                            >
                                <thead>
                                    <tr
                                        style={{
                                            borderBottom: "1px solid rgba(79,195,220,0.12)",
                                            color: "rgba(79,195,220,0.5)",
                                        }}
                                    >
                                        {["Server", "Server ID", "Owner", "Members", ""].map((h) => (
                                            <th
                                                key={h}
                                                className={`px-4 py-3 text-[10px] uppercase tracking-[0.22em] ${h === "" ? "text-right" : "text-left"}`}
                                            >
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {guilds.map((guild) => (
                                        <tr
                                            key={guild.id}
                                            style={{
                                                borderBottom: "1px solid rgba(79,195,220,0.07)",
                                                color: "rgba(200,220,232,0.75)",
                                            }}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {guild.iconUrl ? (
                                                        <Image
                                                            src={guild.iconUrl}
                                                            alt={guild.name}
                                                            width={32}
                                                            height={32}
                                                            className="rounded-full"
                                                            style={{ objectFit: "cover" }}
                                                        />
                                                    ) : (
                                                        <div
                                                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                                                            style={{
                                                                background: "rgba(79,195,220,0.1)",
                                                                color: "rgba(79,195,220,0.6)",
                                                                border: "1px solid rgba(79,195,220,0.15)",
                                                            }}
                                                        >
                                                            {guild.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <span className="font-medium">{guild.name}</span>
                                                </div>
                                            </td>
                                            <td
                                                className="px-4 py-3"
                                                style={{ color: "rgba(79,195,220,0.5)" }}
                                            >
                                                {guild.id}
                                            </td>
                                            <td className="px-4 py-3">
                                                {guild.ownerName ?? (
                                                    <span style={{ color: "rgba(200,220,232,0.3)" }}>
                                                        unknown
                                                    </span>
                                                )}
                                                {guild.ownerId && (
                                                    <span
                                                        className="ml-1.5 text-[10px]"
                                                        style={{ color: "rgba(200,220,232,0.25)" }}
                                                    >
                                                        ({guild.ownerId})
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {guild.memberCount !== null ? (
                                                    guild.memberCount.toLocaleString()
                                                ) : (
                                                    <span style={{ color: "rgba(200,220,232,0.3)" }}>—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <LeaveServerButton
                                                    guildId={guild.id}
                                                    guildName={guild.name}
                                                />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}
