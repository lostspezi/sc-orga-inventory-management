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

**Local dev services (Docker):**
```bash
docker compose up -d   # MongoDB 7 on :27017 + MailDev SMTP on :1025 (UI: http://localhost:1080)
```

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
- **react-markdown@10 + remark-gfm + rehype-sanitize** — markdown rendering (ESM-only; ~60 packages listed in `next.config.ts` `transpilePackages`)
- **openai** — GPT-4o-mini translation pipeline for the news module

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
      layout.tsx       # Org membership gate — fetches org, checks member, suspension redirect, passes role + isPro
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
    orgs/[slug]/reports/                  # GET list, POST create, GET single, GET download, POST regenerate
    orgs/[slug]/billing/checkout/  # POST — create Stripe checkout session
    orgs/[slug]/billing/portal/    # POST — create Stripe customer portal session
    orgs/[slug]/billing/cancel/    # POST — cancel subscription at period end
    admin/orgs/[orgId]/pro-override/ # POST — super-admin toggle PRO without Stripe
    stripe/webhooks/               # POST — Stripe webhook (subscription lifecycle + emails)
    user/export/                   # GET — GDPR data export for calling user
    rsi/ / orgs/exists/ / sc-items/ / discord/guild-members/search/ / discord/guild-channels/
    news/                          # GET list (public, locale-resolved AppNewsPublicView[])
    news/[id]/                     # GET single published post (public)
    admin/news/                    # GET all (any status) + POST create — super-admin
    admin/news/[id]/               # GET + PATCH (content update, auto-resets published→draft) + DELETE
    admin/news/[id]/translate/     # POST — fire-and-forget OpenAI translation
    admin/news/[id]/publish/       # POST — publish + optional Discord embed
    admin/news/[id]/archive/       # POST
    admin/news/[id]/restore/       # POST → draft
    admin/news/[id]/mark-ready/    # POST → ready_to_publish
    admin/news-settings/           # GET + POST — Discord channel config
    admin/news-settings/test/      # POST — test Discord embed (30s rate limit)
```

### Database access pattern

All MongoDB access goes through `lib/db.ts` → `getDb()`. Repository files in `lib/repositories/` own all queries — pages and actions never call `getDb()` directly. The MongoDB client is cached on `global._mongoClient` in development to survive hot reloads.

Collections: `users`, `accounts`, `sessions` (NextAuth), `organizations`, `organization_audit_logs`, `organization_inventory_items`, `organization_transactions`, `organization_invites`, `organization_auec_transactions`, `organization_import_jobs`, `organization_export_jobs`, `organization_reports`, `report_pdfs` (GridFS), `organization_members`, `organization_ranks`, `app_news`, `app_news_settings`, `notifications`, `app_legal_settings`, `app_social_settings`.

### Server actions

One file per action in `lib/actions/`. All actions:
1. Call `await auth()` and check `session.user.id` — import from `@/auth`, not `@/lib/auth`
2. Fetch the relevant org/entity and validate permissions
3. Call the repository function
4. Write an audit log entry via `createOrganizationAuditLog()`
5. Call `revalidatePath()` before returning

### Role system

Four roles: `"owner" | "admin" | "hr" | "member"` — stored in **two** places:

1. **`organizations.members[]`** (lean array) — `{ userId, role, joinedAt, status? }` — used by `app/terminal/orgs/[slug]/layout.tsx` for fast membership + suspension checks. Keep in sync with every role/status change action.
2. **`organization_members` collection** (rich profiles) — full document per member with `rankId`, `displayName`, `notes`, `tags`, `roleHistory`, `rankHistory`, `status`, etc. Source of truth for the Members page UI.

**Dual-write pattern:** all actions that change role, status, or membership must write to both `org.members[]` (via `organization-repository.ts`) and `organization_members` (via `org-member-repository.ts`).

**HR role restrictions:**
- Sees only the Members tab in the org nav (`allowedRoles: ["owner", "admin", "hr"]`)
- Cannot access Settings, Billing, Audit Logs, Transactions
- Settings and Billing pages call `notFound()` if `currentRole === "hr"`
- Can invite only at `"member"` target role (guard in `createDiscordOrgInviteAction`)
- Can assign ranks, edit profiles (display name, notes, tags), view member drawer

**Suspension:** `organization_members.status === "suspended"` → `app/terminal/orgs/[slug]/layout.tsx` redirects to `/terminal?reason=suspended`.

**Super-admin** is a parallel identity checked via `lib/is-super-admin.ts`: compares Discord `providerAccountId` to `SUPER_ADMIN_DISCORD_USER_ID` env var. No DB concept.

### Member management system

New in the `smb` branch. Two new collections + repositories:

**`organization_members`** — `lib/types/org-member.ts`, `lib/repositories/org-member-repository.ts`
- Indexes: `{ organizationId, userId }` unique; `{ organizationId, status }`; `{ organizationId, role }`; `{ organizationId, rankId }`
- Key functions: `createOrgMember`, `getOrgMembersByOrganizationId`, `updateOrgMemberRole`, `updateOrgMemberRank`, `bulkUpdateOrgMemberRank`, `updateOrgMemberProfile`, `updateOrgMemberStatus`, `buildOrgMemberViews`

**`organization_ranks`** — `lib/types/org-rank.ts`, `lib/repositories/org-rank-repository.ts`
- Indexes: `{ organizationId, order }`; `{ organizationId, isDefault }`
- Key functions: `createOrgRank`, `getOrgRanksByOrganizationId`, `updateOrgRank`, `deleteOrgRank` (blocked if members assigned), `bulkUpdateRankOrder`, `setDefaultRank`

**Members page** (`app/terminal/orgs/[slug]/members/page.tsx`) uses `?tab=members|ranks|invitations` URL param with a client tab nav component.

**UI components** (`components/orgs/details/members/`):
- `member-list.tsx` — filterable/searchable list, checkbox bulk select, PRO CSV export button
- `member-detail-drawer.tsx` — slide-in right panel rendered via `createPortal(…, document.body)` to escape parent CSS stacking contexts; shows profile edit, rank assign, role change, history timeline, suspend/remove
- `member-rank-badge.tsx` — coloured pill badge
- `bulk-action-bar.tsx` — fixed bottom bar for bulk rank assignment
- `ranks-management.tsx` — rank CRUD with drag-and-drop reorder (HTML5 DnD, `bulkUpdateRankOrder` on drop)
- `invitations-panel.tsx` — pending invites + revoke; triggers `invite-create-dialog.tsx`
- `invite-create-dialog.tsx` — Discord member search autocomplete, role selector (HR locked to member), expiry date

**PRO-gated:** CSV member export (`export-members-action.ts`) — returns CSV string in action state, client downloads via `URL.createObjectURL`.

**Migration script:** `scripts/migrate-members.ts` — backfills `organization_members` from `organizations.members[]`. Safe to re-run (upsert on unique index). Run with `npx tsx scripts/migrate-members.ts`.

### App-wide News System

Global announcements written and managed by Super Admin only. Multilingual (EN/DE/FR), markdown-enabled, with optional Discord embed posting.

**Status machine:** `draft → translation_pending → ready_to_publish → published → archived`. Any content edit on a `published` post resets it to `draft` (Discord `messageId` preserved for embed update on re-publish).

**Translation status per locale:** `missing | generating | ready | edited | error`. Translations are generated via OpenAI GPT-4o-mini (fire-and-forget — no `await` on `translateNewsPost`). Each locale translates independently; partial failures don't block other locales.

**Key files:**
- `lib/types/app-news.ts` — all news types (`AppNewsDocument`, `AppNewsView`, `AppNewsPublicView`)
- `lib/types/app-news-settings.ts` — singleton Discord config type
- `lib/repositories/app-news-repository.ts` — CRUD + `toAppNewsView`, `toAppNewsPublicView`
- `lib/repositories/app-news-settings-repository.ts` — `getOrCreateNewsSettings`, `saveNewsSettings`
- `lib/translations/translate-news.ts` — OpenAI pipeline with exponential backoff (1s, 2s), auto-transitions to `ready_to_publish` when all locales done
- `lib/discord/send-news-embed.ts` — `buildNewsEmbed` + `sendOrUpdateNewsEmbed` (edits existing Discord message if `discord.messageId` is stored; falls back to new post if message deleted)
- `components/admin/news-editor.tsx` — full client editor; polls `/api/admin/news/[id]` every 2s while `status === "translation_pending"`
- `components/admin/news-settings-card.tsx` — Discord guild/channel config UI

**Admin pages:** `/terminal/admin/news` (list + settings card), `/terminal/admin/news/new`, `/terminal/admin/news/[id]/edit`

**Public consumption:** `getLatestPublishedAppNews()` → server component resolves locale via `getLocale()` (next-intl) → maps to `AppNewsPublicView` → passes to `components/orgs/details/dashboard/news-feed.tsx` (client, ReactMarkdown body in a `<dialog>`).

**Discord embed:** multilingual embed with locale flags (🇬🇧/🇩🇪/🇫🇷), proportional truncation to 4,000 chars total. Only locales with content are included. Primary locale always first.

**react-markdown@10 note:** ESM-only package requires `transpilePackages` in `next.config.ts` (~60 entries). Do NOT add `className` prop to `<ReactMarkdown>` — removed in v10; wrap with `<div className="...">` instead.

**Migration script:** `scripts/migrate-news.ts` — adds `status/primaryLocale/translations/createdBy` to existing docs, creates `app_news_settings` singleton, ensures indexes. Run with `npx tsx scripts/migrate-news.ts`.

### PRO / Billing

Orgs can subscribe to a PRO plan via Stripe. PRO gates: Reporting, CSV member export.

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

Key files: `lib/stripe.ts` (singleton client), `lib/billing/is-pro.ts`, `lib/billing/require-pro.ts`.

### Notification system

```ts
import { notify } from "@/lib/notify";
await notify(userId, "type.slug", "Title", "Message body.", "/optional/link");

import { notifyMany } from "@/lib/notify";
await notifyMany(userIds, "type.slug", "Title", "Message body.", "/optional/link");
```

- Real-time delivery: SSE at `/api/notifications/events`
- Bell UI: `components/terminal/notification-bell.tsx`

Existing triggers: trade requested → notify admins; trade approved/rejected → notify member; trade confirmed (one side) → notify other side; trade completed → notify member; invite accepted → notify inviter; joined via permanent link → notify all admins/owners. Same triggers exist for aUEC transactions. CSV import completed → notify initiator (type `inventory.import_complete`).

### Permanent invite links

- **Token storage:** `organization_invites` with `isPermanent: true`, `permanentRawToken` (plaintext), `deliveryMethod: "permanent_link"`, `expiresAt: 2099-01-01`
- **Only one active at a time:** new generation calls `revokeActivePermanentInvitesByOrgId` first
- **Acceptance** (`app/invite/[token]/page.tsx`): skips Discord mismatch check, does NOT call `markOrganizationInviteAccepted` (keeps link reusable), checks `maxUses` if set, increments `useCount` via `incrementInviteUseCount`, calls `createOrgMember` (best-effort), notifies all admins/owners
- **Actions:** `lib/actions/generate-permanent-invite-action.ts` / `lib/actions/revoke-permanent-invite-action.ts`

### aUEC Cash Desk

Member aUEC balances stored globally on `users.auecBalance`. Org pool: `organizations.auecBalance`.

- Collection: `organization_auec_transactions` — `lib/types/auec-transaction.ts`, `lib/repositories/organization-auec-transaction-repository.ts`
- On item tx completion: `adjustUserAuecBalance(memberId, ±totalPrice)` + `adjustOrgAuecBalance(org._id, ∓totalPrice)`
- Discord button prefix: `"auec_"` — routed before `"tx_"` in `interaction-create.ts`
- Inventory page tabs: `?tab=items` / `?tab=auec` (3 tabs with cargo: items/auec/cargo)

### CSV Bulk Import

**CSV format** (only `name` required): `name,buyPrice,sellPrice,quantity,minStock,maxStock`

Fire-and-forget flow: POST creates job → `processImportJob` without await → client polls every 2s until `completed`/`failed`. On completion: in-app notification + Discord DM.

- `lib/inventory-import/process-import-job.ts` — per-row SC Wiki lookup (two-pass: exact → word-overlap → progressive word-drop retry)
- `ImportRowResult` status: `"success"` | `"not_found"` | `"already_exists"` | `"error"`

### Google Sheets Integration

Bi-directional sync: empty sheet → push org inventory; sheet has rows → fires import job.

- Auth: `lib/google-sheets/auth.ts` — RS256 JWT, OAuth2 token cached 55 min
- Auto-sync: `lib/google-sheets/auto-sync-scheduler.ts` — every 10 min, guarded by `global.__sheetSyncStarted`
- Triggers automatically after: create/update/remove inventory item, clear inventory, CSV import completion
- Sheet must be shared with service account email (Editor access)

### Reporting (PRO-only)

Auto-generated PDF reports every Monday (cron Monday 02:00 UTC, started in `startDiscordBot()`).

- PDF storage: MongoDB GridFS bucket `report_pdfs`
- KPI engine: `lib/reporting/compute-kpis.ts` — MongoDB aggregation pipelines
- Week boundaries: `lib/reporting/week-utils.ts` with `date-fns-tz`; org `timezone` field defaults to `"UTC"`
- `next.config.ts` `serverExternalPackages`: `node-cron`, `@react-pdf/renderer`, `canvas`

### Discord bot

Runs inside the Next.js process via global singletons (`global.__discordBotClient`, `global.__discordBotStarted`, `global.__discordBotEventsRegistered`).

**Interaction rules:** All slash command handlers must `await interaction.deferReply({ ephemeral: true })` as the very first line. All subsequent replies use `interaction.editReply(...)`. Button handlers wrap `await interaction.deferUpdate()` in try/catch and return early if it throws.

### Inventory item schema

`organization_inventory_items` stores name/normalizedName/category/scWikiUuid/unit inline — no shared items collection. Deduplication by `{ organizationId, normalizedName }`.

`app/api/sc-items/search/route.ts` returns wiki-only results. `?commoditiesOnly=true` appends `&filter[type]=Commodity`.

### UI conventions

Custom sci-fi aesthetic — **do not introduce generic UI component libraries**.
- CSS variables: `--accent-primary`, `--font-display`, `--font-mono`, `--background`
- Utility classes: `hud-panel`, `corner-tr`, `corner-bl`, `sc-btn`, `sc-btn-outline`, `sc-input`
- Inline `style` for one-off colors (always rgba, e.g. `rgba(79,195,220,0.45)`)

**Modals:** Use native `<dialog>` with `dialogRef.current?.showModal()`. Center with `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2` + `backdrop:bg-black/60` — do NOT use `fixed inset-0 flex items-center justify-center`.

**Fixed overlays / drawers** that must escape parent CSS stacking contexts (overflow, transform, contain): use `createPortal(jsx, document.body)` from `react-dom`. Guard with `if (typeof document === "undefined") return null` for SSR safety.

**Serialization boundary:** `ObjectId` and `Date` cannot cross server→client. Always map to `*View` type: `_id: doc._id.toString()`, `createdAt: doc.createdAt.toISOString()`.

**`router.refresh()` in `useEffect`:** Never put `onClose` (an inline arrow function prop) in the same `useEffect` dep array as `router.refresh()` — it creates an infinite loop because every refresh re-renders the parent, creating a new `onClose` reference, re-triggering the effect. Fix: `useCallback` on the parent side, and/or split into separate effects so `onClose` is only in the effect that actually calls it.

**i18n:** Server components use `getTranslations("ns")` (async). Client components use `useTranslations("ns")`. Add keys to all three message files simultaneously. When a client component needs only a few static labels, pass them as string props from a server parent instead.

Rich text in message values uses XML-style tags — `"key": "Hello <strong>world</strong>"` — rendered via `t.rich("key", { strong: (chunks) => <strong>{chunks}</strong> })`. Do **not** use `{tag}...{/tag}` format; next-intl will throw `INVALID_MESSAGE: MALFORMED_ARGUMENT`.

All namespaces: `common`, `nav`, `header`, `notifications`, `userMenu`, `adminNav`, `terminal`, `settings`, `adminOverview`, `adminOrgs`, `adminDiscord`, `adminComponents`, `dashboard`, `kpi`, `charts`, `recentTrades`, `orgShell`, `members`, `inventory`, `transactions`, `logs`, `orgSettings`, `auec`, `csvImport`, `cargo`, `news`, `faq`, `home`, `billing`, `reports`, `cookieNotice`.

**Client action pattern:**
```ts
// useActionState + startTransition
const [state, formAction, isPending] = useActionState(myAction, init);
startTransition(async () => { await formAction(formData); });
// On success: router.refresh() — split into separate useEffect from onClose calls
```

### Auth pattern

```ts
import { auth } from "@/auth"; // NOT "@/lib/auth"
const session = await auth();
if (!session?.user?.id) redirect("/login"); // in pages/layouts
```

`session.user.id` is the MongoDB ObjectId string of the user document.

## Environment variables

| Variable | Purpose |
| --- | --- |
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
| `OPENAI_API_KEY` | OpenAI key for news auto-translation (optional — disables translation button if missing) |
| `OPENAI_TRANSLATION_MODEL` | Override model for translation (default: `gpt-4o-mini`) |
