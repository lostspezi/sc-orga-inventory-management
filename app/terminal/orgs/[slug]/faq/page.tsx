import {
    LayoutDashboard,
    PackageOpen,
    ArrowLeftRight,
    Users,
    Bot,
    Settings2,
    Zap,
    CheckCircle,
    XCircle,
    Terminal,
    ShieldCheck,
} from "lucide-react";

// ─── Primitives ───────────────────────────────────────────────────────────────

function Section({
    icon: Icon,
    title,
    subtitle,
    children,
}: {
    icon: React.ElementType;
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}) {
    return (
        <section className="space-y-3">
            <div className="flex items-center gap-3">
                <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
                    style={{
                        borderColor: "rgba(79,195,220,0.2)",
                        color: "rgba(79,195,220,0.85)",
                        background: "rgba(79,195,220,0.06)",
                    }}
                >
                    <Icon size={16} />
                </div>
                <div>
                    <h3
                        className="text-base font-semibold uppercase tracking-[0.08em]"
                        style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                    >
                        {title}
                    </h3>
                    {subtitle && (
                        <p
                            className="text-[11px]"
                            style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                        >
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            <div className="ml-12 space-y-2">{children}</div>
        </section>
    );
}

function Q({ q, children }: { q: string; children: React.ReactNode }) {
    return (
        <div
            className="rounded-lg border p-4"
            style={{
                borderColor: "rgba(79,195,220,0.08)",
                background: "rgba(4,12,20,0.5)",
            }}
        >
            <p
                className="mb-2 text-[11px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: "rgba(79,195,220,0.7)", fontFamily: "var(--font-mono)" }}
            >
                ▸ {q}
            </p>
            <div
                className="space-y-1.5 text-[13px] leading-relaxed"
                style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)" }}
            >
                {children}
            </div>
        </div>
    );
}

function P({ children }: { children: React.ReactNode }) {
    return <p>{children}</p>;
}

function Code({ children }: { children: React.ReactNode }) {
    return (
        <code
            className="rounded px-1.5 py-0.5 text-[11px]"
            style={{
                background: "rgba(79,195,220,0.1)",
                color: "rgba(79,195,220,0.9)",
                border: "1px solid rgba(79,195,220,0.15)",
            }}
        >
            {children}
        </code>
    );
}

function Highlight({ children }: { children: React.ReactNode }) {
    return (
        <span style={{ color: "var(--accent-primary)" }}>{children}</span>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, { color: string; bg: string; border: string }> = {
        requested: { color: "rgba(240,165,0,0.9)",   bg: "rgba(240,165,0,0.07)",   border: "rgba(240,165,0,0.2)"   },
        approved:  { color: "rgba(79,195,220,0.9)",  bg: "rgba(79,195,220,0.07)",  border: "rgba(79,195,220,0.2)"  },
        completed: { color: "rgba(80,210,120,0.9)",  bg: "rgba(80,210,120,0.07)",  border: "rgba(80,210,120,0.2)"  },
        rejected:  { color: "rgba(220,80,80,0.9)",   bg: "rgba(220,80,80,0.07)",   border: "rgba(220,80,80,0.2)"   },
        cancelled: { color: "rgba(140,140,160,0.7)", bg: "rgba(140,140,160,0.05)", border: "rgba(140,140,160,0.15)" },
    };
    const c = colors[status] ?? colors.cancelled;
    return (
        <span
            className="inline-block rounded px-1.5 py-0.5 text-[10px] uppercase tracking-[0.12em]"
            style={{ color: c.color, background: c.bg, border: `1px solid ${c.border}` }}
        >
            {status}
        </span>
    );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
    return (
        <div className="flex items-start gap-3">
            <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                style={{
                    background: "rgba(79,195,220,0.12)",
                    border: "1px solid rgba(79,195,220,0.2)",
                    color: "rgba(79,195,220,0.8)",
                    fontFamily: "var(--font-mono)",
                }}
            >
                {n}
            </span>
            <span style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                {children}
            </span>
        </div>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FaqPage() {
    return (
        <div className="space-y-6 pb-10">
            {/* Header */}
            <div>
                <p
                    className="text-[10px] uppercase tracking-[0.25em]"
                    style={{ color: "rgba(79,195,220,0.45)", fontFamily: "var(--font-mono)" }}
                >
                    Documentation
                </p>
                <h2
                    className="mt-1 text-lg font-semibold uppercase tracking-[0.08em]"
                    style={{ color: "var(--accent-primary)", fontFamily: "var(--font-display)" }}
                >
                    Help &amp; FAQ
                </h2>
                <p
                    className="mt-1 text-sm"
                    style={{ color: "rgba(200,220,232,0.4)", fontFamily: "var(--font-mono)" }}
                >
                    Everything you need to know about the inventory management terminal.
                </p>
            </div>

            {/* ── Dashboard ── */}
            <Section icon={LayoutDashboard} title="Dashboard" subtitle="Real-time org overview">
                <Q q="What does the dashboard show?">
                    <P>The dashboard is your command center. It displays four KPI cards at a glance:</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li><Highlight>Active Requests</Highlight> — transactions currently in <StatusBadge status="requested" /> or <StatusBadge status="approved" /> state.</li>
                        <li><Highlight>Completed this month</Highlight> — trades that reached <StatusBadge status="completed" /> since the 1st of the current month.</li>
                        <li><Highlight>Revenue this month</Highlight> — total aUEC from completed trades this month.</li>
                        <li><Highlight>Inventory items</Highlight> — how many item types are listed in the org store.</li>
                    </ul>
                    <P>Below the KPIs you have two charts (revenue curve and transaction volume bars), a top-items leaderboard, and the last 10 completed trades.</P>
                </Q>
                <Q q="How does the real-time feed work?">
                    <P>The dashboard opens a persistent connection to the server (SSE — Server-Sent Events). Every 3 seconds the server checks for transaction updates. When a status change is detected you&apos;ll see:</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>A <Highlight>toast notification</Highlight> in the bottom-right corner (auto-dismisses after 6 s, max 5 at once).</li>
                        <li>A new row in the <Highlight>Live Activity Feed</Highlight> at the bottom of the page (keeps last 30 events).</li>
                        <li>All server-side data (KPI cards, charts, recent list) silently refreshes in the background.</li>
                    </ul>
                    <P>The feed indicator shows <Highlight>● Live</Highlight> once the connection is established.</P>
                </Q>
            </Section>

            {/* ── Inventory ── */}
            <Section icon={PackageOpen} title="Inventory" subtitle="Managing your org's item catalogue">
                <Q q="What is an inventory item?">
                    <P>An inventory item represents a Star Citizen item or commodity that your organization buys or sells. Each entry tracks the item name (looked up from the SC item database), the current stock quantity, and a price per unit in aUEC.</P>
                </Q>
                <Q q="How do I add items to inventory?">
                    <P>Open the <Highlight>Inventory</Highlight> page and click <Code>+ Add Item</Code>. Start typing the item name — the autocomplete searches the Star Citizen item database and shows matching results. Once selected, enter quantity and price, then submit.</P>
                    <P>Only <Highlight>admins</Highlight> and <Highlight>owners</Highlight> can add or remove inventory items.</P>
                </Q>
                <Q q="How does stock quantity change?">
                    <P>Stock is automatically adjusted when a transaction is <StatusBadge status="completed" />:</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li><Highlight>Sell (member → org)</Highlight> — a member sells items to the org, so org stock increases.</li>
                        <li><Highlight>Buy (org → member)</Highlight> — a member buys items from the org, so org stock decreases.</li>
                    </ul>
                </Q>
            </Section>

            {/* ── Transactions ── */}
            <Section icon={ArrowLeftRight} title="Transactions" subtitle="The buy/sell request flow">
                <Q q="What are the two transaction directions?">
                    <ul className="ml-4 list-disc space-y-1">
                        <li><Highlight>Sell (member → org)</Highlight> — the member has goods and wants to sell them to the organization. The org pays the member.</li>
                        <li><Highlight>Buy (org → member)</Highlight> — the member wants to buy goods from the organization&apos;s stock. The member pays the org.</li>
                    </ul>
                </Q>
                <Q q="What are all the transaction statuses?">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2"><StatusBadge status="requested" /><span className="ml-1">— Initial state. One side has submitted the request and is waiting for the other to approve it.</span></div>
                        <div className="flex items-start gap-2"><StatusBadge status="approved" /><span className="ml-1">— The counterparty (admin/owner for member-initiated, or member for admin-initiated) accepted the trade. Both parties now need to confirm the in-game transfer.</span></div>
                        <div className="flex items-start gap-2"><StatusBadge status="completed" /><span className="ml-1">— Both sides have confirmed the in-game trade. Inventory stock is adjusted automatically.</span></div>
                        <div className="flex items-start gap-2"><StatusBadge status="rejected" /><span className="ml-1">— The counterparty declined the request.</span></div>
                        <div className="flex items-start gap-2"><StatusBadge status="cancelled" /><span className="ml-1">— Either party cancelled before completion.</span></div>
                    </div>
                </Q>
                <Q q="Who can approve, confirm, and cancel?">
                    <P>The approval rules depend on who initiated the request:</P>
                    <ul className="ml-4 list-disc space-y-1">
                        <li>If a <Highlight>member</Highlight> created the request, an <Highlight>admin/owner</Highlight> must approve it.</li>
                        <li>If an <Highlight>admin/owner</Highlight> created the request, the <Highlight>member</Highlight> must approve it.</li>
                        <li>Once <StatusBadge status="approved" />, both parties independently click <Code>Confirm Trade</Code> to record that the in-game exchange happened.</li>
                        <li>Either party can <Code>Cancel</Code> at any point before completion.</li>
                    </ul>
                </Q>
                <Q q="Can I create transactions from Discord?">
                    <P>Yes — if the Discord bot is connected. Use the <Code>/sell</Code> or <Code>/buy</Code> slash commands. See the <Highlight>Discord Bot</Highlight> section below for full details.</P>
                </Q>
            </Section>

            {/* ── Members ── */}
            <Section icon={Users} title="Members" subtitle="Roles and invitations (admin/owner only)">
                <Q q="What roles exist?">
                    <ul className="ml-4 list-disc space-y-1">
                        <li><Highlight>Owner</Highlight> — full access including audit logs and member management. Only one owner per org.</li>
                        <li><Highlight>Admin</Highlight> — can manage inventory, approve/reject transactions, invite members, and access settings.</li>
                        <li><Highlight>Member</Highlight> — can create transaction requests and confirm their own trades.</li>
                    </ul>
                </Q>
                <Q q="How do I invite someone?">
                    <P>Go to <Highlight>Members</Highlight> and use the Discord invite form. The Discord bot must be connected first (see <Highlight>Settings</Highlight>). Type a Discord username and the bot will send the target user a DM with a private invite link. The link is single-use and expires after 24 hours.</P>
                </Q>
            </Section>

            {/* ── Discord Bot ── */}
            <Section icon={Bot} title="Discord Bot" subtitle="Setup, slash commands, and interactive embeds">
                <Q q="How do I add the Discord bot to my server?">
                    <div className="space-y-2">
                        <Step n={1}>Go to <Highlight>Settings</Highlight> (admin/owner only).</Step>
                        <Step n={2}>In the <Highlight>Discord Server</Highlight> card at the top, click <Code>Add Bot to Server</Code>. You&apos;ll be redirected to Discord&apos;s OAuth flow.</Step>
                        <Step n={3}>Select the server you want to link to this organization and click <Code>Authorize</Code>.</Step>
                        <Step n={4}>You&apos;ll be redirected back to the Settings page. The card will now show <Highlight>● Connected</Highlight> along with the guild name.</Step>
                    </div>
                    <p className="mt-2" style={{ color: "rgba(200,220,232,0.65)", fontFamily: "var(--font-mono)", fontSize: 13 }}>Only one Discord server can be linked per organization at a time.</p>
                </Q>
                <Q q="How do I disconnect the Discord server?">
                    <P>In <Highlight>Settings</Highlight>, open the Discord Server card and click <Code>Disconnect</Code>. This removes the link. Slash commands and invite features will stop working until a new server is connected.</P>
                </Q>
                <Q q="What slash commands does the bot provide?">
                    <div className="space-y-3">
                        <div
                            className="rounded border p-3"
                            style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(79,195,220,0.04)" }}
                        >
                            <p className="mb-1" style={{ color: "rgba(79,195,220,0.9)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                                /sell
                            </p>
                            <p>Create a <Highlight>sell</Highlight> request (member → org) without opening the web UI. The bot will ask for:</p>
                            <ul className="ml-4 mt-1 list-disc space-y-0.5">
                                <li><Code>item</Code> — starts typing to search your org&apos;s inventory (autocomplete, up to 25 results)</li>
                                <li><Code>quantity</Code> — how many units (minimum 1)</li>
                                <li><Code>price</Code> — price per unit in aUEC (minimum 0)</li>
                                <li><Code>note</Code> — optional message for the admin</li>
                            </ul>
                        </div>
                        <div
                            className="rounded border p-3"
                            style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(79,195,220,0.04)" }}
                        >
                            <p className="mb-1" style={{ color: "rgba(79,195,220,0.9)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                                /buy
                            </p>
                            <p>Same as <Code>/sell</Code> but creates a <Highlight>buy</Highlight> request (org → member). Same fields.</p>
                        </div>
                    </div>
                    <P>After submitting, you&apos;ll receive an ephemeral (private) confirmation. The transaction is created in <StatusBadge status="requested" /> state and an embed is posted to the notification channel if one is configured.</P>
                </Q>
                <Q q="What is the autocomplete for the item field?">
                    <P>When you start typing in the <Code>item</Code> field of <Code>/sell</Code> or <Code>/buy</Code>, Discord shows up to 25 matching items from your org&apos;s current inventory. The search is a case-insensitive substring match on the item name. Select one from the dropdown — you cannot type a free-form name.</P>
                </Q>
                <Q q="What is the transaction notification embed?">
                    <P>When a transaction is created (via web or Discord), the bot posts an embed to the configured notification channel (see Settings). The embed shows:</P>
                    <ul className="ml-4 list-disc space-y-0.5">
                        <li>Item name, direction, quantity, price per unit, total, member username, optional note</li>
                        <li>Current status with color coding</li>
                        <li>Action buttons depending on status</li>
                    </ul>
                </Q>
                <Q q="What buttons appear on the Discord embed?">
                    <div className="space-y-2">
                        <div className="flex items-start gap-2">
                            <CheckCircle size={14} style={{ color: "rgba(80,210,120,0.7)", flexShrink: 0, marginTop: 1 }} />
                            <span><Highlight>Approve</Highlight> — available when status is <StatusBadge status="requested" />. Moves the transaction to <StatusBadge status="approved" />.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <XCircle size={14} style={{ color: "rgba(220,80,80,0.7)", flexShrink: 0, marginTop: 1 }} />
                            <span><Highlight>Reject</Highlight> — available when status is <StatusBadge status="requested" />. Moves the transaction to <StatusBadge status="rejected" />.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <CheckCircle size={14} style={{ color: "rgba(79,195,220,0.7)", flexShrink: 0, marginTop: 1 }} />
                            <span><Highlight>Confirm Trade</Highlight> — available when status is <StatusBadge status="approved" />. Records that you completed the in-game exchange. Once both sides confirm, the transaction becomes <StatusBadge status="completed" />.</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <XCircle size={14} style={{ color: "rgba(140,140,160,0.6)", flexShrink: 0, marginTop: 1 }} />
                            <span><Highlight>Cancel</Highlight> — available when status is <StatusBadge status="requested" /> or <StatusBadge status="approved" />. Moves the transaction to <StatusBadge status="cancelled" />.</span>
                        </div>
                    </div>
                    <P>The embed is automatically updated in-place whenever the status changes, whether the action was taken on Discord or in the web UI. Terminal status changes are always reflected on Discord within seconds.</P>
                </Q>
                <Q q="Do Discord actions respect the same permission rules as the web UI?">
                    <P>Yes. The bot verifies your Discord account is linked to an org member account and that you have the correct role before allowing any action. The same business rules apply — you cannot approve your own request, confirm a trade for the other party, etc.</P>
                </Q>
            </Section>

            {/* ── Settings ── */}
            <Section icon={Settings2} title="Settings" subtitle="Admin/owner configuration (admin/owner only)">
                <Q q="How do I set a Discord notification channel?">
                    <div className="space-y-2">
                        <Step n={1}>Make sure a Discord server is connected first (see above).</Step>
                        <Step n={2}>In <Highlight>Settings</Highlight>, scroll to the <Highlight>Transaction Notifications</Highlight> card.</Step>
                        <Step n={3}>Click the channel dropdown. It shows all text channels from your linked Discord server.</Step>
                        <Step n={4}>Select the channel where transaction embeds should be posted and click <Code>Save Settings</Code>.</Step>
                    </div>
                    <P>To disable notifications, clear the selection and save. The <Code>$</Code> icon identifies text channels.</P>
                </Q>
                <Q q="What happens if no notification channel is set?">
                    <P>Transactions created via the web UI will not post any Discord embed. Transactions created via <Code>/sell</Code> or <Code>/buy</Code> will still be saved to the database and the user will get an ephemeral confirmation, but no channel embed will be posted.</P>
                </Q>
            </Section>

            {/* ── Audit Logs ── */}
            <Section icon={ShieldCheck} title="Audit Logs" subtitle="Owner only — full activity history">
                <Q q="What is logged in the audit trail?">
                    <P>Every significant action is recorded with a timestamp, the acting user, and a description:</P>
                    <ul className="ml-4 list-disc space-y-0.5">
                        <li>Transaction created, approved, rejected, confirmed, cancelled</li>
                        <li>Inventory item added, updated, removed</li>
                        <li>Member invited, role changed, removed</li>
                        <li>Discord server connected/disconnected</li>
                        <li>Org settings changed</li>
                    </ul>
                </Q>
                <Q q="Who can see the audit logs?">
                    <P>Only <Highlight>owners</Highlight>. The Logs page is hidden from admins and members in the navigation.</P>
                </Q>
            </Section>

            {/* ── Quick Reference ── */}
            <Section icon={Terminal} title="Quick Reference" subtitle="Slash commands at a glance">
                <div
                    className="overflow-x-auto rounded-lg border"
                    style={{ borderColor: "rgba(79,195,220,0.12)", background: "rgba(4,12,20,0.6)" }}
                >
                    <table className="w-full text-[12px]" style={{ fontFamily: "var(--font-mono)" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid rgba(79,195,220,0.1)" }}>
                                {["Command", "Who can use", "What it does"].map((h) => (
                                    <th
                                        key={h}
                                        className="px-4 py-2.5 text-left text-[10px] uppercase tracking-[0.2em]"
                                        style={{ color: "rgba(79,195,220,0.5)" }}
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                ["/sell", "Any linked member", "Create a sell request (member → org) via Discord"],
                                ["/buy",  "Any linked member", "Create a buy request (org → member) via Discord"],
                            ].map(([cmd, who, what]) => (
                                <tr
                                    key={cmd}
                                    style={{ borderBottom: "1px solid rgba(79,195,220,0.05)" }}
                                >
                                    <td className="px-4 py-2.5">
                                        <Code>{cmd}</Code>
                                    </td>
                                    <td className="px-4 py-2.5" style={{ color: "rgba(200,220,232,0.5)" }}>{who}</td>
                                    <td className="px-4 py-2.5" style={{ color: "rgba(200,220,232,0.5)" }}>{what}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div
                    className="mt-3 rounded-lg border p-4"
                    style={{ borderColor: "rgba(240,165,0,0.15)", background: "rgba(20,14,6,0.3)" }}
                >
                    <div className="flex items-start gap-2">
                        <Zap size={14} style={{ color: "rgba(240,165,0,0.7)", flexShrink: 0, marginTop: 1 }} />
                        <div>
                            <p
                                className="mb-1 text-[10px] uppercase tracking-[0.15em]"
                                style={{ color: "rgba(240,165,0,0.7)", fontFamily: "var(--font-mono)" }}
                            >
                                Note on Discord account linking
                            </p>
                            <p
                                className="text-[12px]"
                                style={{ color: "rgba(200,220,232,0.5)", fontFamily: "var(--font-mono)" }}
                            >
                                To use slash commands or interact with embeds, your Discord account must be the one you used to log in to this terminal. The bot matches Discord user IDs to terminal accounts via the OAuth login.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>
        </div>
    );
}
