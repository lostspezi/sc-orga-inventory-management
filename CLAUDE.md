# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Next.js dev server (also starts the Discord bot via global startup)
npm run build      # Production build
npm run lint       # ESLint check
npm run lint:fix   # ESLint auto-fix
```

No test suite is configured.

## Stack

- **Next.js 16** (App Router, React 19, TypeScript)
- **next-intl v4** — cookie-based i18n, no URL prefix, locales: `en` / `de` / `fr`
- **MongoDB** via native driver (`mongodb` package) — no ORM
- **NextAuth v5 beta** with Discord OAuth and `@auth/mongodb-adapter` (database sessions)
- **discord.js v14** — bot runs inside the Next.js process using global singletons
- **Tailwind CSS v4**

## Architecture

### Route layout

```
app/
  page.tsx             # Public landing page (server component, auth-aware nav)
  login/               # Discord OAuth login page
  terminal/            # Authenticated app shell
    layout.tsx         # Auth gate + TerminalHeader + TerminalBackground
    page.tsx           # Org list (home)
    notifications/     # User notification inbox
    settings/          # Account settings
    admin/             # Super-admin area
      layout.tsx       # Super-admin gate + AdminNav tabs
      page.tsx         # KPI dashboard
      organizations/   # Org management table
      discord-servers/ # Bot server management
      news/            # App-wide news/updates management
    orgs/[slug]/
      layout.tsx       # Org membership gate — fetches org, checks member, passes role
      page.tsx / members/ / inventory/ / transactions/ / logs/ / settings/ / faq/
      inventory/
        imports/       # Import history list (all past CSV jobs)
        import/[jobId] # Live results page for a specific import job (polls every 2s)
  api/
    auth/[...nextauth]/           # NextAuth handler
    discord/install/callback/     # OAuth2 callback for bot install flow
    orgs/[slug]/transaction-events/ # SSE endpoint (polls DB every 3s)
    notifications/
      events/          # SSE endpoint — streams unread count + new notifications (polls every 5s)
      mark-read/       # POST — mark one notification as read
      mark-all-read/   # POST — mark all notifications as read
    rsi/ / orgs/exists/ / sc-items/ / items/ / discord/guild-members/search/
    orgs/[slug]/members/dkp/      # GET — returns calling user's DKP balance from Raid Helper
    orgs/[slug]/inventory/import/ # POST — start a CSV bulk import job (fire-and-forget)
    orgs/[slug]/inventory/import/[jobId]/ # GET — poll job status
```

### Database access pattern

All MongoDB access goes through `lib/db.ts` → `getDb()`. Repository files in `lib/repositories/` own all queries — pages and actions never call `getDb()` directly. The MongoDB client is cached on `global._mongoClient` in development to survive hot reloads.

Collections: `users`, `accounts`, `sessions` (NextAuth), `organizations`, `organization_audit_logs`, `organization_inventory_items`, `organization_transactions`, `organization_invites`, `organization_auec_transactions`, `app_news`, `notifications`, `organization_import_jobs`.

The `organizations` collection has an optional `raidHelperApiKey` field (stored encrypted at rest by MongoDB, never exposed client-side). The `organization_transactions` collection has an optional `adminConfirmedByUsername` field written when an admin/owner presses confirm — persists their display name so it's available in the Raid Helper DKP description even if the member confirms last.

### Server actions

One file per action in `lib/actions/`. All actions:
1. Call `await auth()` and check `session.user.id`
2. Fetch the relevant org/entity and validate permissions
3. Call the repository function
4. Write an audit log entry via `createOrganizationAuditLog()`
5. Call `revalidatePath()` before returning

### Role system

Roles (`"owner" | "admin" | "member"`) are stored as `org.members[].role`. There is no separate roles collection. Permission checks are done inline in each action/layout by finding the current user's member entry.

**Super-admin** is a parallel identity checked via `lib/is-super-admin.ts`: it looks up the user's Discord `providerAccountId` from the `accounts` collection and compares it to `SUPER_ADMIN_DISCORD_USER_ID` in env. There is no super-admin concept in the DB.

### Notification system

Send a notification to a user from anywhere with:
```ts
import { notify } from "@/lib/notify";
await notify(userId, "type.slug", "Title", "Message body.", "/optional/link");

// Multiple recipients at once:
import { notifyMany } from "@/lib/notify";
await notifyMany(userIds, "type.slug", "Title", "Message body.", "/optional/link");
```

- Repository: `lib/repositories/notification-repository.ts`
- Type: `lib/types/notification.ts` — `NotificationDocument` (DB) / `NotificationView` (serialized)
- Real-time delivery: SSE at `/api/notifications/events` — client subscribes via `EventSource`, receives `init` on connect and `new` events as they arrive
- Bell UI: `components/terminal/notification-bell.tsx` — live badge + dropdown in the terminal header
- Inbox page: `/terminal/notifications`

Existing triggers: trade requested → notify admins; trade approved/rejected → notify member; trade confirmed (one side) → notify other side; trade completed → notify member; invite accepted → notify inviter; joined via permanent link → notify all admins/owners. Same triggers exist for aUEC transactions. CSV import completed → notify initiator (type `inventory.import_complete`).

### Permanent invite links

Orgs support a single shareable permanent invite link, managed from the Settings page by admins/owners.

- **Token storage:** `organization_invites` collection with `isPermanent: true`, `permanentRawToken` (raw token stored in plaintext — it's a public share link), `deliveryMethod: "permanent_link"`, `expiresAt: 2099-01-01`, `status: "pending"`
- **Only one active at a time:** generating or regenerating calls `revokeActivePermanentInvitesByOrgId` first
- **Acceptance** (`app/invite/[token]/page.tsx`): skips Discord account mismatch check, does **not** call `markOrganizationInviteAccepted` (keeps the link reusable), writes a `member.joined_via_permanent_link` audit log, and notifies all admins/owners via `notifyMany`
- **Settings card:** `components/orgs/details/settings/permanent-invite-card.tsx` — shows URL in readonly input with Copy/Generate/Regenerate/Revoke buttons
- **Actions:** `lib/actions/generate-permanent-invite-action.ts` / `lib/actions/revoke-permanent-invite-action.ts`
- **Repository helpers:** `getActivePermanentInviteByOrgId` / `revokeActivePermanentInvitesByOrgId` in `organization-invite-repository.ts`
- **Settings page** fetches the active invite and passes `inviteUrl` (built from `NEXT_PUBLIC_APP_URL + /invite/ + permanentRawToken`) to the card

### Raid Helper DKP integration

Orgs can connect a Raid Helper API key (stored as `org.raidHelperApiKey`) to enable DKP wallet sync. When connected:
- **Transaction prices** are locked to inventory values (`invItem.sellPrice` / `invItem.buyPrice`) — users cannot set their own price.
- **Create transaction dialog** fetches the calling user's DKP balance from `/api/orgs/[slug]/members/dkp` and blocks submission if the total cost exceeds their balance (buy direction only).
- **On transaction completion** (both parties confirmed), DKP is automatically synced via Raid Helper PATCH:
  - `member_to_org` (sell) → `operation: "add"`
  - `org_to_member` (buy) → `operation: "subtract"`
  - This happens in both `lib/actions/confirm-transaction-action.ts` (web) and `lib/discord/bot/slash-handlers/handle-transaction-button.ts` (Discord buttons).
- **Members page** shows each member's current DKP balance (fetched in parallel per member via Raid Helper GET, cached 60 s with `next: { revalidate: 60 }`).
- **Settings page** has a Raid Helper card (`components/orgs/details/settings/raid-helper-card.tsx`) to save/clear the API key.

Raid Helper API base: `https://raid-helper.dev/api/v2/servers/{guildId}/entities/{entityId}/dkp`
- `GET` → `{ result: [{ name, id, dkp }] }` — fetch balance; entityId = Discord user ID or guild ID (all members)
- `PATCH` body: `{ operation: "add"|"subtract", value: string, description: string }` — update balance

Key files:
- `lib/raid-helper/get-member-dkp.ts` — GET with `next: { revalidate: 60 }`; returns `number | null`, never throws
- `lib/raid-helper/update-member-dkp.ts` — PATCH; returns `boolean`, never throws (logs error on failure)
- `lib/actions/save-raid-helper-api-key-action.ts` — admin/owner action to save or clear the API key

DKP description format sent to Raid Helper on completion (item trades):
```
[SC Orga] Sell 50x Laranite | TxID: <transactionId> | Trader: <memberUsername> | Admin: <adminName> | 01 Mar 2026 14:30 UTC
```
DKP description format for aUEC trades:
```
[SC Orga] Sell 250000 aUEC | TxID: <transactionId> | Trader: <memberUsername> | Admin: <adminName> | 01 Mar 2026 14:30 UTC
```
The admin name is stored on the transaction as `adminConfirmedByUsername` when the admin confirms (so it's available even if the member confirms last).

### aUEC Cash Desk

Members can exchange aUEC (in-game currency) with the org at configured rates. The inventory page has tab navigation — "Items" (`?tab=items`) and "aUEC" (`?tab=auec`) — defaulting to items.

**Org document fields** (`lib/types/organization.ts`):
```ts
auecBalance?: number;       // org's current aUEC pool
auecBuyPriceDkp?: number;  // DKP cost per buy bundle (org → member)
auecBuyPriceAuec?: number; // aUEC per buy bundle
auecSellPriceDkp?: number; // DKP reward per sell bundle (member → org)
auecSellPriceAuec?: number;// aUEC per sell bundle
```
Rate formula: `totalDkp = Math.round((auecAmount / priceAuec) * priceDkp)`

**Collection:** `organization_auec_transactions`
- Type: `lib/types/auec-transaction.ts` — `AuecTransactionDocument` / `AuecTransactionView`
- Repository: `lib/repositories/organization-auec-transaction-repository.ts`

**Actions:**
- `lib/actions/update-auec-settings-action.ts` — admin sets balance + rates; uses `updateOrgAuecSettings` ($set) from org repo
- `lib/actions/create-auec-transaction-action.ts` — member submits request; validates rates configured, org balance (buy), DKP (buy)
- `lib/actions/respond-to-auec-transaction-action.ts` — admin approve/reject; simple `(formData) => void` signature (used directly as `form action={}`)
- `lib/actions/confirm-auec-transaction-action.ts` — dual confirm; on completion calls `adjustOrgAuecBalance` ($inc) and Raid Helper DKP sync
- `lib/actions/cancel-auec-transaction-action.ts` — cancel requested/approved

**Repository helpers** (in `organization-repository.ts`):
- `updateOrgAuecSettings(orgId, patch)` — $set on auec fields
- `adjustOrgAuecBalance(orgId, delta)` — $inc on `auecBalance`

**Discord:**
- `lib/discord/send-auec-transaction-embed.ts` — `AUEC_TX_BUTTON_PREFIX = "auec_"`, `makeAuecTxButtonId`, `parseAuecTxButtonId`, `buildAuecTransactionMessagePayload`, `sendAuecTransactionEmbed`, `updateAuecTransactionEmbed`
- `lib/discord/bot/slash-handlers/handle-auec-transaction-button.ts` — handles approve/reject/confirm/cancel from Discord; on complete calls `adjustOrgAuecBalance` + Raid Helper sync
- `lib/discord/bot/commands/interaction-create.ts` — routes `auec_*` prefix to `handleAuecTransactionButton` (checked before `tx_` prefix)

**UI components** (`components/orgs/details/`):
- `items/inventory-tab-nav.tsx` — client component; receives `tabItemsLabel`/`tabAuecLabel` as props from server (no `useTranslations`)
- `auec/auec-cash-desk.tsx` — async server component; renders balance display, settings panel (admin only), transaction form (when configured), transaction list
- `auec/auec-settings-panel.tsx` — client; admin sets balance + buy/sell rates via `useActionState`
- `auec/auec-transaction-form.tsx` — client; direction toggle, amount input, live DKP calculation, DKP balance check
- `auec/auec-transaction-list.tsx` — client; rows with approve/reject/confirm/cancel forms using `form action={serverAction}` pattern

**Inventory page** (`app/terminal/orgs/[slug]/inventory/page.tsx`): reads `?tab` searchParam; conditionally fetches inventory items or aUEC transactions; fetches member DKP on aUEC tab if Raid Helper connected; passes `tabItemsLabel`/`tabAuecLabel` from `getTranslations("auec")` to `InventoryTabNav`.

**i18n namespace:** `auec` — added to `messages/en.json`, `messages/de.json`, `messages/fr.json`.

### CSV Bulk Import

Admins and owners can bulk-import inventory items from a CSV file. Item metadata (category, class, grade, size, description) is fetched from the Star Citizen Wiki API per row during processing.

**CSV format** (only `name` is required):
```csv
name,buyPrice,sellPrice,quantity,minStock,maxStock
"Laranite",100,150,50,10,200
"Gold",80,120,30,,
```

**Collection:** `organization_import_jobs`
- Type: `lib/types/import-job.ts` — `ImportJobDocument` / `ImportJobView` / `ImportRowInput` / `ImportRowResult`
- Repository: `lib/repositories/import-job-repository.ts` — `createImportJob`, `getImportJobById`, `getImportJobsByOrg`, `updateImportJobProgress`, `completeImportJob`, `failImportJob`, `toImportJobView`

**ImportJobDocument fields:**
```ts
status: "pending" | "processing" | "completed" | "failed"
totalRows: number       // set at creation
processedRows: number   // updated after each row
rows: ImportRowInput[]  // original CSV rows stored verbatim
results: ImportRowResult[] // per-row outcome, appended as processing runs
```

**ImportRowResult status values:** `"success"` | `"not_found"` | `"already_exists"` | `"error"`

**Flow:**
1. Admin uploads CSV in the Inventory page → Bulk CSV Import accordion
2. Client parses and previews up to 10 rows
3. POST `/api/orgs/[slug]/inventory/import` → job created → `processImportJob` called without `await` (fire-and-forget) → returns `{ jobId }` immediately
4. Client redirects to `/terminal/orgs/[slug]/inventory/import/[jobId]`
5. Results page polls `GET /api/orgs/[slug]/inventory/import/[jobId]` every 2 s until job is `completed` or `failed`
6. On completion: in-app notification + Discord DM sent to the initiator

**Background processing** (`lib/inventory-import/process-import-job.ts`):
- Per row: calls `fetchBestMatch(name)` which uses a two-pass SC Wiki lookup:
  - Pass 1: `filter[name]=<fullName>` — exact match wins, then best word-overlap score
  - Pass 2 (if pass 1 returns nothing): progressively drops trailing words and retries; picks candidate with highest word-overlap against the original query
- On match: `createItemInDb` (idempotent) → `createOrganizationInventoryItemInDb` → optional `updateOrganizationInventoryItemInDb` for minStock/maxStock → audit log
- `updateImportJobProgress` written to DB after every row so the polling endpoint reflects live progress
- After all rows: `completeImportJob` → `notify` → Discord DM via `sendDiscordDm`

**API routes:**
- `POST /api/orgs/[slug]/inventory/import` — auth + admin/owner check; validates rows (max 500); creates job; fires processing
- `GET /api/orgs/[slug]/inventory/import/[jobId]` — auth + membership check; returns `ImportJobView` for polling

**UI components** (`components/orgs/details/items/`):
- `csv-import-form.tsx` — client; CSV template download, drag-and-drop upload, client-side parsing (no external lib), 10-row preview table, submit
- `csv-import-results-client.tsx` — client; polls job status every 2 s while active; progress bar, per-row results table; on completion shows "Download Failed Items" button (generates CSV of `not_found`/`error` rows from original input data) and links to inventory + history

**Pages:**
- `app/terminal/orgs/[slug]/inventory/import/[jobId]/page.tsx` — server component; auth + membership gate; passes initial job state to `CsvImportResultsClient`
- `app/terminal/orgs/[slug]/inventory/imports/page.tsx` — import history list; shows all past jobs for the org (newest first) with status, row counts, success/skipped/failed columns, and a link to each job's detail page

**i18n namespace:** `csvImport` — in `messages/en.json`, `messages/de.json`, `messages/fr.json`.

### App-wide news

Super-admin manages posts at `/terminal/admin/news`. Posts appear on every org dashboard above the KPI cards.

- Repository: `lib/repositories/app-news-repository.ts`
- Type: `lib/types/app-news.ts` — `AppNewsDocument` / `AppNewsView`
- Actions: `lib/actions/app-news-actions.ts` — `createAppNewsAction`, `updateAppNewsAction`, `deleteAppNewsAction`
- Dashboard component: `components/orgs/details/dashboard/news-feed.tsx` — accepts `AppNewsView[]`

### Discord bot

The bot (discord.js gateway client) runs inside the Next.js server process. It is started lazily via `startDiscordBot()` and kept alive through global singletons (`global.__discordBotClient`, `global.__discordBotStarted`, `global.__discordBotEventsRegistered`). This is required because Next.js hot-reloads would create duplicate clients otherwise.

`discord.js` and `@discordjs/ws` are listed in `next.config.ts` as `serverExternalPackages` to prevent bundling issues.

For admin Discord API calls (guild info, leaving servers), use `discord.js` `REST` directly — no gateway needed:
```ts
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN!);
await rest.get(Routes.userGuilds());
```

Key Discord lib files:
- `lib/discord/get-bot-guild-count.ts` — fast single call for count only
- `lib/discord/get-bot-guilds.ts` — full guild list with member count and owner username (3 round-trips: guilds → guild details → user lookups); used on the admin Discord Servers page
- `lib/discord/send-discord-dm.ts` / `send-transaction-embed.ts` / `send-auec-transaction-embed.ts` — outbound messaging
- `lib/discord/get-discord-user-id.ts` — resolves a MongoDB `userId` → Discord `providerAccountId` via the `accounts` collection

`cdn.discordapp.com/icons/**` is whitelisted in `next.config.ts` for `next/image`.

**Discord interaction rules:** All slash command handlers must call `await interaction.deferReply({ ephemeral: true })` as the very first line before any async work (DB queries, etc.) — Discord's response window is 3 seconds. All subsequent replies must use `interaction.editReply(...)` not `interaction.reply(...)`. Button handlers must wrap `await interaction.deferUpdate()` in a try/catch and return early if it throws (interaction already expired).

### UI conventions

The app uses a custom sci-fi / Star Citizen aesthetic — **do not introduce generic UI component libraries**. Styling uses:
- CSS variables: `--accent-primary`, `--font-display`, `--font-mono`, `--background`
- Utility classes: `hud-panel`, `corner-tr`, `corner-bl`, `sc-btn`, `sc-btn-outline`, `sc-input`
- Inline `style` props for one-off colors (always rgba, e.g. `rgba(79,195,220,0.45)`)
- Native `<dialog>` element for all modals — opened via `dialogRef.current?.showModal()`

Client components that call server actions use `useTransition` + `startTransition(async () => { ... })`, then `router.refresh()` on success.

**Serialization boundary:** MongoDB `ObjectId` and `Date` values cannot cross the server→client boundary. Always map repository results to a `*View` type (plain strings) before passing as props to client components. Pattern: `_id: doc._id.toString()`, `createdAt: doc.createdAt.toISOString()`.

**i18n in components:** Server components use `getTranslations("ns")` from `next-intl/server` (async). Client components use `useTranslations("ns")` from `next-intl`. **Do not use `useTranslations` in a component without `"use client"`.** When a client component only needs a few static labels, prefer passing them as string props from a server parent to avoid needing `useTranslations` in the client component entirely.

**Reusable UI primitives** live in `components/ui/`:
- `back-button.tsx` — `<BackButton />` calls `router.back()`
- `language-switcher.tsx` — `<LanguageSwitcher />` styled `<select>` dropdown; calls `setLocaleAction`

**Public landing page** (`app/page.tsx`) is an async server component that calls `auth()` to detect session state. Nav shows `LanguageSwitcher` + `UserDropdown` when logged in, or `LanguageSwitcher` + "Access Terminal" link when not. CTA buttons also adapt (→ `/terminal` vs → `/login`). Client-only piece extracted to `components/home/legal-button.tsx`.

**Mobile navigation** (`components/orgs/details/org-details-mobile-nav.tsx`) is a draggable FAB (`position: fixed`, `lg:hidden`). It uses pointer capture (`setPointerCapture`) to distinguish taps from drags — moves less than 5 px are treated as a tap to toggle the menu. Position is persisted in `localStorage` under the key `org-fab-pos` and re-clamped on resize. The menu opens above or below the FAB depending on vertical position, and closes on outside tap or route change. Because the FAB is fixed, its wrapper div has zero layout height and the shell renders it without any spacing side-effects.

### Terminal header

`components/terminal/terminal-header.tsx` — sticky header containing (left to right):
- Brand / "Command Hub" link → `/terminal`
- `TerminalNav` — links to `/` (Home) and `/terminal` (Hub) with active underline
- `NotificationBell` — live SSE-powered bell with unread badge and dropdown
- `UserDropdown` — avatar + name, links to Notifications / Settings, sign-out

### Internationalisation (i18n)

The app uses **next-intl** with cookie-based locale detection — no URL prefix (e.g. `/en/...`).

**Supported locales:** `en` (English), `de` (Deutsch), `fr` (Français)
**Default:** `en`
**Config:** `i18n/config.ts` — `locales`, `Locale` type, `localeLabels`
**Request config:** `i18n/request.ts` — reads `NEXT_LOCALE` cookie, falls back to `Accept-Language` header
**Locale action:** `lib/actions/set-locale-action.ts` — sets `NEXT_LOCALE` cookie (1-year, path `/`), calls `revalidatePath("/", "layout")`
**Message files:** `messages/en.json`, `messages/de.json`, `messages/fr.json`

Usage patterns:
```ts
// Server component (must make component async)
import { getTranslations } from "next-intl/server";
const t = await getTranslations("namespace");

// Client component
import { useTranslations } from "next-intl";
const t = useTranslations("namespace");

// Interpolation
t("key", { name: "value" })

// Plurals (ICU format in JSON)
// "key": "{count, plural, one {# item} other {# items}}"
t("key", { count: 3 })
```

All namespaces are top-level keys in the message files: `common`, `nav`, `header`, `notifications`, `userMenu`, `adminNav`, `terminal`, `settings`, `adminOverview`, `adminOrgs`, `adminDiscord`, `adminComponents`, `dashboard`, `kpi`, `charts`, `recentTrades`, `orgShell`, `members`, `inventory`, `transactions`, `logs`, `orgSettings`, `auec`, `csvImport`, `news` (nested: `feed`, `admin`), `faq` (nested by section), `home` (nested: `hero`, `howItWorks`, `features`, `discordSection`, `dashboardSection`, `cta`, `footer`).

When adding a new translatable string: add the key to all three message files (`en.json`, `de.json`, `fr.json`) at the same time.

### Auth pattern

```ts
const session = await auth();
if (!session?.user?.id) redirect("/login"); // in pages/layouts
// or return { success: false } / notFound() in actions
```

`session.user.id` is the MongoDB ObjectId string of the user document.

## Environment variables

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `MONGODB_DB_NAME` | Database name |
| `AUTH_SECRET` | NextAuth secret |
| `AUTH_DISCORD_ID` / `AUTH_DISCORD_SECRET` | Discord OAuth app credentials |
| `DISCORD_BOT_TOKEN` | Bot token for gateway + REST calls |
| `DISCORD_BOT_INSTALL_REDIRECT_URI` | OAuth2 redirect for bot install flow |
| `NEXT_PUBLIC_APP_URL` | Public base URL |
| `SUPER_ADMIN_DISCORD_USER_ID` | Your Discord user ID — grants super-admin access |

The Raid Helper API key is stored **in the database** on the org document (`raidHelperApiKey`), not in env. Admins set it via the Settings page.
