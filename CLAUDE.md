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
- **Stripe** — subscription billing for PRO orgs
- **@react-pdf/renderer** — server-side PDF generation (no headless browser)
- **node-cron** — scheduled tasks (weekly reports) started alongside the Discord bot

## Architecture

### Route layout

```
app/
  page.tsx             # Public landing page (server component, auth-aware nav)
  (auth)/login/        # Discord OAuth login page
  (legal)/legal/       # Public legal pages: privacy, terms, imprint, cookies
  invite/[token]/      # Permanent invite link acceptance
  terminal/            # Authenticated app shell
    layout.tsx         # Auth gate + legal-version gate + TerminalHeader + TerminalBackground
    page.tsx           # Org list (home)
    notifications/     # User notification inbox
    settings/          # Account settings
    admin/             # Super-admin area
      layout.tsx       # Super-admin gate + AdminNav tabs
      page.tsx         # KPI dashboard
      organizations/   # Org management table (with PRO override toggle)
      discord-servers/ # Bot server management
      news/            # App-wide news/updates management
      legal/           # Legal document date management + version publishing
      social/          # Social links management (footer icons)
    orgs/[slug]/
      layout.tsx       # Org membership gate — fetches org, checks member, passes role + isPro
      page.tsx / members/ / inventory/ / transactions/ / logs/ / settings/ / faq/ / reports/
      inventory/
        imports/       # Import history list (all past CSV jobs)
        import/[jobId] # Live results page for a specific import job (polls every 2s)
      settings/
        billing/       # Stripe subscription management + invoice history (admin/owner only)
  api/
    auth/[...nextauth]/           # NextAuth handler
    discord/install/callback/     # OAuth2 callback for bot install flow
    orgs/[slug]/transaction-events/ # SSE endpoint (polls DB every 3s)
    notifications/
      events/          # SSE endpoint — streams unread count + new notifications (polls every 5s)
      mark-read/       # POST — mark one notification as read
      mark-all-read/   # POST — mark all notifications as read
    orgs/[slug]/inventory/import/         # POST — start CSV import job (fire-and-forget)
    orgs/[slug]/inventory/import/[jobId]/ # GET — poll import job status
    orgs/[slug]/inventory/export/         # POST — start CSV export job (fire-and-forget)
    orgs/[slug]/inventory/export/[jobId]/ # GET — poll export job / download CSV
    orgs/[slug]/reports/                  # GET list, POST create
    orgs/[slug]/reports/[reportId]/       # GET single
    orgs/[slug]/reports/[reportId]/download/   # GET — stream PDF from GridFS
    orgs/[slug]/reports/[reportId]/regenerate/ # POST — re-run report pipeline
    orgs/[slug]/billing/checkout/  # POST — create Stripe checkout session
    orgs/[slug]/billing/portal/    # POST — create Stripe customer portal session
    orgs/[slug]/billing/cancel/    # POST — cancel subscription at period end
    admin/orgs/[orgId]/pro-override/ # POST — super-admin toggle PRO without Stripe
    stripe/webhooks/               # POST — Stripe webhook (subscription lifecycle + emails)
    user/export/                   # GET — GDPR data export for calling user
    rsi/ / orgs/exists/ / sc-items/ / discord/guild-members/search/ / discord/guild-channels/
```

### Database access pattern

All MongoDB access goes through `lib/db.ts` → `getDb()`. Repository files in `lib/repositories/` own all queries — pages and actions never call `getDb()` directly. The MongoDB client is cached on `global._mongoClient` in development to survive hot reloads.

Collections: `users`, `accounts`, `sessions` (NextAuth), `organizations`, `organization_audit_logs`, `organization_inventory_items`, `organization_transactions`, `organization_invites`, `organization_auec_transactions`, `organization_import_jobs`, `organization_export_jobs`, `organization_reports`, `report_pdfs` (GridFS), `app_news`, `notifications`, `app_legal_settings`, `app_social_settings`.

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

### PRO / Billing

Orgs can subscribe to a PRO plan via Stripe. PRO gates the Reporting feature and may gate future features.

**PRO check:** `isProOrg(org)` from `lib/billing/is-pro.ts` — returns `true` if `org.proOverride?.enabled` OR subscription status is `"active"` / `"trialing"` and `currentPeriodEnd > now`.

**Org document fields** (`lib/types/organization.ts`):
```ts
subscription?: OrgSubscription;  // set/updated by Stripe webhook
proOverride?: OrgProOverride;    // super-admin manual override
```

**Stripe webhook** (`app/api/stripe/webhooks/route.ts`) handles:
- `customer.subscription.created` / `updated` → calls `setOrgSubscription()`, sends PRO welcome email on creation
- `customer.subscription.deleted` → clears subscription
- `invoice.payment_succeeded` → sends invoice email

**Billing page** (`app/terminal/orgs/[slug]/settings/billing/page.tsx`): admin/owner only; fetches live subscription + invoices from Stripe; renders `BillingManagePage` client component. i18n namespace: `billing`.

**API routes:**
- `POST .../billing/checkout` — creates Stripe checkout session, redirects to Stripe-hosted page
- `POST .../billing/portal` — creates Stripe customer portal session for self-service management
- `POST .../billing/cancel` — cancels subscription at period end

**Admin PRO override** (`app/api/admin/orgs/[orgId]/pro-override/`): super-admin can toggle PRO without Stripe (for testing / gifting). Stored as `org.proOverride`.

Key files: `lib/stripe.ts` (singleton client), `lib/billing/is-pro.ts`, `lib/billing/require-pro.ts`.

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

### aUEC Cash Desk

Members can exchange aUEC (in-game currency) with the org. The inventory page has tab navigation — "Items" (`?tab=items`) and "aUEC" (`?tab=auec`) — defaulting to items.

Member aUEC balances are stored globally on `users.auecBalance` (not per-org). Org pool is `organizations.auecBalance`.

**Relevant org document field:** `auecBalance?: number` — org's current aUEC pool.

**Collection:** `organization_auec_transactions`
- Type: `lib/types/auec-transaction.ts` — `AuecTransactionDocument` / `AuecTransactionView`
- Repository: `lib/repositories/organization-auec-transaction-repository.ts`

**Actions:**
- `lib/actions/update-auec-settings-action.ts` — admin sets org aUEC balance
- `lib/actions/create-auec-transaction-action.ts` — member submits request; validates org balance (buy direction)
- `lib/actions/respond-to-auec-transaction-action.ts` — admin approve/reject; `(formData) => void` (used directly as `form action={}`)
- `lib/actions/confirm-auec-transaction-action.ts` — dual confirm; on completion calls `adjustUserAuecBalance` + `adjustOrgAuecBalance`
- `lib/actions/cancel-auec-transaction-action.ts` — cancel requested/approved

**User aUEC balance helpers** (`lib/repositories/user-repository.ts`): `getUserAuecBalance`, `setUserAuecBalance`, `adjustUserAuecBalance`, `getUsersByIds`.

On item transaction completion: `adjustUserAuecBalance(memberId, ±totalPrice)` + `adjustOrgAuecBalance(org._id, ∓totalPrice)`.
On aUEC transaction completion: `adjustUserAuecBalance(memberId, ∓auecAmount)` + `adjustOrgAuecBalance(org._id, ±auecAmount)`.

**Discord:**
- `lib/discord/send-auec-transaction-embed.ts` — `AUEC_TX_BUTTON_PREFIX = "auec_"`, button ID helpers, embed builders
- `lib/discord/bot/slash-handlers/handle-auec-transaction-button.ts` — handles approve/reject/confirm/cancel from Discord
- `lib/discord/bot/commands/interaction-create.ts` — routes `auec_*` prefix to `handleAuecTransactionButton` (checked before `tx_` prefix)

**UI components** (`components/orgs/details/`):
- `items/inventory-tab-nav.tsx` — client component; receives tab labels as props from server (no `useTranslations`)
- `auec/auec-cash-desk.tsx` — async server component; renders balance display, settings panel (admin only), transaction form, transaction list
- `auec/auec-settings-panel.tsx` — client; admin sets org balance via `useActionState`
- `auec/auec-transaction-form.tsx` — client; direction toggle, amount input, member aUEC balance display (informational only)
- `auec/auec-transaction-list.tsx` — client; rows with approve/reject/confirm/cancel forms using `form action={serverAction}` pattern

**Account Settings** has an `AuecBalanceForm` component (`components/settings/auec-balance-form.tsx`) — allows users to set their own aUEC balance (manual sync). Action: `lib/actions/set-user-auec-balance-action.ts`.

**i18n namespace:** `auec` — in `messages/en.json`, `messages/de.json`, `messages/fr.json`.

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

**ImportRowResult status values:** `"success"` | `"not_found"` | `"already_exists"` | `"error"`

**Flow:**
1. Admin uploads CSV in the Inventory page → Bulk CSV Import accordion
2. Client parses and previews up to 10 rows
3. POST `/api/orgs/[slug]/inventory/import` → job created → `processImportJob` called without `await` (fire-and-forget) → returns `{ jobId }` immediately
4. Client redirects to `/terminal/orgs/[slug]/inventory/import/[jobId]`
5. Results page polls `GET /api/orgs/[slug]/inventory/import/[jobId]` every 2 s until job is `completed` or `failed`
6. On completion: in-app notification + Discord DM sent to the initiator

**Background processing** (`lib/inventory-import/process-import-job.ts`):
- Per row: calls `fetchBestMatch(name)` using a two-pass SC Wiki lookup (exact match → word-overlap, then progressive word-drop retry)
- On match: `createOrganizationInventoryItemInDb` (idempotent by `{ organizationId, normalizedName }`) → optional price/stock update → audit log
- After all rows: `completeImportJob` → `notify` → Discord DM via `sendDiscordDm`

**Pages:**
- `app/terminal/orgs/[slug]/inventory/import/[jobId]/page.tsx` — passes initial job to `CsvImportResultsClient` (polls every 2 s)
- `app/terminal/orgs/[slug]/inventory/imports/page.tsx` — import history list

**i18n namespace:** `csvImport`.

### CSV Export

Admins and owners can export the full inventory to a CSV file. Uses a short-lived job pattern similar to import.

**Collection:** `organization_export_jobs` — type: `lib/types/export-job.ts`, repository: `lib/repositories/export-job-repository.ts`.

**Flow:** POST `.../inventory/export` → creates job + generates CSV in background → client polls GET `.../inventory/export/[jobId]` until `completed`; on completion the polling endpoint streams the CSV file.

### Google Sheets Integration

Orgs can connect a Google Sheet for bi-directional inventory sync.

**Org document fields:** `googleSheetId?: string`, `googleSheetLastSyncedAt?: Date`.

**Auth:** `lib/google-sheets/auth.ts` — RS256 JWT via Node.js `crypto`, exchanges for OAuth2 token; cached 55 min in a module-level variable.

**Sync logic** (`lib/google-sheets/sync-inventory-to-sheet.ts`): clears sheet A1:Z10000, writes header + all items.

**Import from sheet** (`lib/google-sheets/read-inventory-from-sheet.ts` + `lib/actions/import-from-google-sheet-action.ts`): reads rows from the sheet; if sheet is empty → pushes org inventory to sheet; if sheet has rows → fires an import job (`processImportJob`) using the sheet contents.

**Auto-sync scheduler** (`lib/google-sheets/auto-sync-scheduler.ts`): `startGoogleSheetAutoSync()` runs every 10 minutes for all orgs with `googleSheetId` set — same bi-directional logic (empty sheet → push; rows present → import). Started alongside the Discord bot. Guarded by `global.__sheetSyncStarted` singleton.

**Manual triggers** (auto-fire `triggerSync` after): create/update/remove inventory item, clear inventory, CSV import completion.

**Actions:** `lib/actions/save-google-sheet-action.ts` (connect/disconnect), `lib/actions/sync-google-sheet-now-action.ts`, `lib/actions/import-from-google-sheet-action.ts`.

**Settings card:** `components/orgs/details/settings/google-sheet-card.tsx`. The Sheet must be shared with the service account email (Editor access).

### Reporting (PRO-only)

Weekly performance reports are generated as PDFs and stored in MongoDB GridFS. Requires PRO status.

- **Collection:** `organization_reports` — type: `lib/types/report.ts`; repository: `lib/repositories/report-repository.ts`
- **PDF storage:** GridFS bucket `report_pdfs` — `lib/reporting/storage.ts`
- **KPI engine:** `lib/reporting/compute-kpis.ts` — MongoDB aggregation pipelines
- **Week utils:** `lib/reporting/week-utils.ts` — ISO week boundaries with timezone (`date-fns-tz`); org `timezone` field (optional, defaults `"UTC"`)
- **PDF generation:** `lib/reporting/generate-pdf.ts` — `@react-pdf/renderer`, built-in Helvetica/Courier fonts
- **Orchestrator:** `lib/reporting/process-report.ts` — fire-and-forget pipeline (compute KPIs → generate PDF → store in GridFS → update report doc)
- **Cron:** `lib/reporting/cron.ts` — Monday 02:00 UTC auto-generation for all PRO orgs; started in `startDiscordBot()`
- **API routes:** GET list, POST create, GET single, GET download (streams PDF from GridFS), POST regenerate
- **Page:** `app/terminal/orgs/[slug]/reports/page.tsx`
- **UI components:** `components/orgs/details/reports/`
- **PRO gate:** `isProOrg(org)` checked server-side on every API route AND page; non-PRO sees upgrade CTA
- **Nav:** `ORG_NAV_ITEMS` has `requiresPro` field; sidebar/mobile-nav accept `isPro` prop from the org layout

`next.config.ts` `serverExternalPackages` includes `node-cron`, `@react-pdf/renderer`, `canvas`.

### App-wide news

Super-admin manages posts at `/terminal/admin/news`. Posts appear on every org dashboard above the KPI cards.

- Repository: `lib/repositories/app-news-repository.ts`
- Type: `lib/types/app-news.ts` — `AppNewsDocument` / `AppNewsView`
- Actions: `lib/actions/app-news-actions.ts` — `createAppNewsAction`, `updateAppNewsAction`, `deleteAppNewsAction`
- Dashboard component: `components/orgs/details/dashboard/news-feed.tsx` — accepts `AppNewsView[]`

### Social settings

Super-admin manages social link URLs at `/terminal/admin/social`. These appear in the public landing page footer.

- Collection: `app_social_settings` (singleton document)
- Repository: `lib/repositories/social-settings-repository.ts` — `getOrCreateSocialSettings`, `saveSocialSettings`
- Action: `lib/actions/save-social-settings-action.ts`

### GDPR / Legal system

- **Legal pages** (`app/(legal)/legal/{privacy,terms,imprint,cookies}/page.tsx`): public, no auth, dates fetched from DB
- **Legal settings** (`app_legal_settings` singleton): `lib/types/legal-settings.ts`, `lib/repositories/legal-settings-repository.ts`
- **`currentVersion`** (date string e.g. `"2026-03-06"`) is the version all users must accept; `users.legalAcceptedVersion` tracks per-user acceptance
- **Force re-accept:** terminal layout checks `acceptedVersion !== currentVersion`, renders `<LegalAcceptGate>` blocking dialog
- **Accept action:** `lib/actions/accept-legal-action.ts`
- **Admin legal tab:** `/terminal/admin/legal` — update doc dates + "Publish New Version" (bumps `currentVersion`, forces all users to re-accept)
- **Admin actions:** `lib/actions/save-legal-settings-action.ts` — `saveLegalSettingsAction` (dates) + `publishLegalVersionAction` (bumps version)
- **Cookie notice:** `components/consent/cookie-notice.tsx` — modal `<dialog>` on first visit (`sc_consent` cookie), uses `useSyncExternalStore` to avoid hydration mismatch
- **Legal gate:** `components/consent/legal-accept-gate.tsx` — blocking `<dialog>` in terminal, Escape key disabled

### Email system

- **Production:** Resend (`RESEND_API_KEY` env var) — `lib/email/send-email.ts`
- **Local dev:** MailDev via SMTP (localhost:1025) — `docker compose -f docker-compose.maildev.yml up -d`, UI at http://localhost:1080
- **Trigger:** Stripe webhook `invoice.payment_succeeded` with `billing_reason === "subscription_create"` → sends PRO welcome + invoice email to org owner
- Pattern: `sendEmail({ to, subject, html, text? })` — never throws on email error in webhook

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

### Inventory item schema

`organization_inventory_items` stores name/normalizedName/category/scWikiUuid/unit inline — there is **no** shared items collection. Deduplication is by `{ organizationId, normalizedName }`.

`OrganizationInventoryItemView` fields: `inventoryItemId, name, normalizedName, category?, scWikiUuid?, unit?, buyPrice, sellPrice, quantity, minStock?, maxStock?`.

`app/api/sc-items/search/route.ts` returns wiki-only results (`source: "sc_wiki"`). `?commoditiesOnly=true` appends `&filter[type]=Commodity` to the wiki query.

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

All namespaces are top-level keys in the message files: `common`, `nav`, `header`, `notifications`, `userMenu`, `adminNav`, `terminal`, `settings`, `adminOverview`, `adminOrgs`, `adminDiscord`, `adminComponents`, `dashboard`, `kpi`, `charts`, `recentTrades`, `orgShell`, `members`, `inventory`, `transactions`, `logs`, `orgSettings`, `auec`, `csvImport`, `news` (nested: `feed`, `admin`), `faq` (nested by section), `home` (nested: `hero`, `howItWorks`, `features`, `discordSection`, `dashboardSection`, `cta`, `footer`), `billing`, `reports`.

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
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `NEXT_PUBLIC_STRIPE_PRICE_ID` | Stripe price ID for the PRO plan |
| `RESEND_API_KEY` | Resend API key (production email) |
| `EMAIL_FROM` | Sender address (optional, has default) |
| `SMTP_HOST` / `SMTP_PORT` | SMTP config for local MailDev |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Google service account for Sheets integration |
| `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` | PEM key with escaped `\n` |
