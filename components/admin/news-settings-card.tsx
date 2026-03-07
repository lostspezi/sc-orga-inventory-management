"use client";

import { useState } from "react";
import type { AppNewsSettingsView } from "@/lib/types/app-news-settings";

type Props = { initialSettings: AppNewsSettingsView };

function timeAgo(isoDate: string): string {
    const diff = Date.now() - new Date(isoDate).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
    return new Date(isoDate).toLocaleDateString();
}

export default function NewsSettingsCard({ initialSettings }: Props) {
    const [settings, setSettings] = useState(initialSettings);
    const [guildId, setGuildId] = useState(initialSettings.discordGuildId);
    const [channelId, setChannelId] = useState(initialSettings.discordChannelId);
    const [autoPost, setAutoPost] = useState(initialSettings.autoPostOnPublish);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [saveMsg, setSaveMsg] = useState<string | null>(null);
    const [testMsg, setTestMsg] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    async function handleSave() {
        setIsSaving(true);
        setError(null);
        setSaveMsg(null);
        try {
            const res = await fetch("/api/admin/news-settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ discordGuildId: guildId, discordChannelId: channelId, autoPostOnPublish: autoPost }),
            });
            if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
            const updated: AppNewsSettingsView = await res.json();
            setSettings(updated);
            setSaveMsg("Settings saved.");
            setTimeout(() => setSaveMsg(null), 3000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Save failed.");
        } finally {
            setIsSaving(false);
        }
    }

    async function handleTest() {
        setIsTesting(true);
        setError(null);
        setTestMsg(null);
        try {
            const res = await fetch("/api/admin/news-settings/test", { method: "POST" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error ?? "Test failed");
            if (data.settings) setSettings(data.settings);
            setTestMsg("Test embed sent successfully!");
            setTimeout(() => setTestMsg(null), 5000);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Test failed.");
            // Refresh settings to get updated lastTestResult
            const res = await fetch("/api/admin/news-settings");
            if (res.ok) setSettings(await res.json());
        } finally {
            setIsTesting(false);
        }
    }

    return (
        <section
            className="hud-panel p-4 sm:p-5 space-y-4"
            style={{ background: "rgba(8,16,24,0.45)" }}
        >
            <p
                className="text-[10px] uppercase tracking-[0.25em]"
                style={{ color: "rgba(79,195,220,0.55)", fontFamily: "var(--font-mono)" }}
            >
                Discord Integration
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
                <div>
                    <label
                        className="mb-1 block text-[10px] uppercase tracking-[0.2em]"
                        style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        Guild ID
                    </label>
                    <input
                        type="text"
                        value={guildId}
                        onChange={(e) => setGuildId(e.target.value)}
                        placeholder="123456789012345678"
                        className="sc-input w-full text-sm"
                    />
                </div>
                <div>
                    <label
                        className="mb-1 block text-[10px] uppercase tracking-[0.2em]"
                        style={{ color: "rgba(79,195,220,0.4)", fontFamily: "var(--font-mono)" }}
                    >
                        Channel ID
                    </label>
                    <input
                        type="text"
                        value={channelId}
                        onChange={(e) => setChannelId(e.target.value)}
                        placeholder="123456789012345678"
                        className="sc-input w-full text-sm"
                    />
                </div>
            </div>

            <label className="flex cursor-pointer items-center gap-2">
                <input
                    type="checkbox"
                    checked={autoPost}
                    onChange={(e) => setAutoPost(e.target.checked)}
                    className="rounded"
                />
                <span
                    className="text-sm"
                    style={{ color: "rgba(200,220,232,0.75)", fontFamily: "var(--font-mono)" }}
                >
                    Auto-post to Discord on publish
                </span>
            </label>

            {error && (
                <p
                    className="text-xs"
                    style={{ color: "rgba(220,100,100,0.8)", fontFamily: "var(--font-mono)" }}
                >
                    {error}
                </p>
            )}
            {saveMsg && (
                <p
                    className="text-xs"
                    style={{ color: "rgba(80,210,120,0.8)", fontFamily: "var(--font-mono)" }}
                >
                    {saveMsg}
                </p>
            )}
            {testMsg && (
                <p
                    className="text-xs"
                    style={{ color: "rgba(80,210,120,0.8)", fontFamily: "var(--font-mono)" }}
                >
                    {testMsg}
                </p>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="sc-btn text-xs"
                    style={{ fontSize: "0.7rem", padding: "0.3rem 0.75rem" }}
                >
                    {isSaving ? "Saving…" : "Save Settings"}
                </button>
                <button
                    type="button"
                    onClick={handleTest}
                    disabled={isTesting || !guildId || !channelId}
                    className="sc-btn sc-btn-outline text-xs"
                    style={{
                        fontSize: "0.7rem",
                        padding: "0.3rem 0.75rem",
                        borderColor: "rgba(88,101,242,0.4)",
                        color: "rgba(88,101,242,0.85)",
                    }}
                >
                    {isTesting ? "Sending…" : "Send Test Embed"}
                </button>

                {settings.lastTestPostedAt && (
                    <div className="flex items-center gap-1.5">
                        <span
                            className="text-[10px]"
                            style={{ color: "rgba(200,220,232,0.3)", fontFamily: "var(--font-mono)" }}
                        >
                            Last test:
                        </span>
                        <span
                            className="text-[10px]"
                            style={{
                                color: settings.lastTestResult === "success"
                                    ? "rgba(80,210,120,0.7)"
                                    : "rgba(220,100,100,0.7)",
                                fontFamily: "var(--font-mono)",
                            }}
                        >
                            {settings.lastTestResult === "success" ? "✅" : "❌"}{" "}
                            {timeAgo(settings.lastTestPostedAt)}
                        </span>
                    </div>
                )}
            </div>
        </section>
    );
}
