# SC Orga Inventory Management

A Star Citizen organization inventory management system that allows org members to buy from and sell to the organization's stockpile. Built with a HUD-style UI inspired by the Star Citizen universe.

## Features

- **Org Stockpile** — Full overview of all goods and resources owned by the organization, always current and transparent
- **Sell to the Org** — Members can sell looted or farmed goods directly to the org at fair, agreed-upon prices
- **Buy from Stockpile** — Members can purchase equipment, ammunition, or cargo directly from the org's inventory
- **Organization Management** — Create organizations, manage members and roles (owner / admin / member)
- **Discord Integration** — Connect your Discord server, invite members via DM, and use `/invite` slash commands
- **Star Citizen API Integration** — Search items from the SC Wiki and the local database when adding inventory entries
- **Audit Logging** — Full audit trail of all organization actions
- **Invite System** — Invite members via Discord DM or shareable token links

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Language | TypeScript |
| Database | MongoDB |
| Auth | NextAuth v5 (Discord OAuth) |
| Discord | discord.js v14 |
| External API | [Star Citizen Wiki API](https://api.star-citizen.wiki) |

## Project Structure

```
app/
├── (auth)/login/          # Login page
├── api/
│   ├── auth/              # NextAuth route handler
│   ├── discord/           # Discord bot install & guild member search
│   ├── items/             # Local item search API
│   ├── orgs/              # Org existence check
│   ├── rsi/               # RSI org validation
│   └── sc-items/          # SC Wiki item search & lookup
├── invite/[token]/        # Invite acceptance page
└── terminal/              # Authenticated app shell
    └── orgs/[slug]/       # Organization detail pages
        ├── inventory/     # Inventory management
        ├── members/       # Member management
        └── logs/          # Audit log viewer

components/
├── orgs/                  # Organization UI components
│   └── details/           # Org detail panels (members, items, audit)
├── terminal/              # Terminal shell UI components
├── ui/                    # Shared UI primitives
└── invite/                # Invite flow components

lib/
├── actions/               # Next.js Server Actions
├── discord/               # Discord bot logic & helpers
├── repositories/          # MongoDB data access layer
└── types/                 # Shared TypeScript types
```

## Getting Started

### Prerequisites

- Node.js 20+
- A MongoDB database (Atlas recommended)
- A Discord application with OAuth2 configured
- A Discord bot token

### Environment Variables

Create a `.env.local` file in the root of the project:

```env
# MongoDB
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<db>?retryWrites=true&w=majority
MONGODB_DB_NAME=<your-db-name>

# NextAuth
AUTH_SECRET=<random-secret>

# Discord OAuth (https://discord.com/developers/applications)
AUTH_DISCORD_ID=<your-discord-app-id>
AUTH_DISCORD_SECRET=<your-discord-app-secret>

# Discord Bot
DISCORD_BOT_TOKEN=<your-discord-bot-token>
DISCORD_BOT_INSTALL_REDIRECT_URI=<your-app-url>/api/discord/install/callback

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Installation

```bash
npm install
# or
yarn install
# or
pnpm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Linting

```bash
npm run lint        # check for issues
npm run lint:fix    # auto-fix fixable issues
```

### Production Build

```bash
npm run build
npm run start
```

## Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications) and create a new application.
2. Enable the **Bot** feature and copy the bot token into `DISCORD_BOT_TOKEN`.
3. Under **OAuth2**, set the redirect URI to `<your-app-url>/api/discord/install/callback`.
4. Copy the **Client ID** and **Client Secret** into `AUTH_DISCORD_ID` and `AUTH_DISCORD_SECRET`.
5. Add the bot to your server via the install URL generated in the app's organization settings.

The bot supports the `/invite` slash command, which lets org admins invite Discord members directly via DM.

## Authentication

Authentication is handled by NextAuth v5 using Discord as the sole provider. Users sign in with their Discord account; sessions and accounts are persisted in MongoDB via `@auth/mongodb-adapter`.

## Data Model

| Collection | Purpose |
|---|---|
| `organizations` | Org documents with members and Discord guild link |
| `organization_inventory_items` | Items in an org's stockpile (buy/sell price, quantity) |
| `organization_invites` | Pending/accepted/expired invites |
| `organization_audit_logs` | Full audit trail of all org actions |
| `items` | Local Star Citizen item catalogue |

## Roles

| Role | Permissions |
|---|---|
| `owner` | Full control — manage members, inventory, and roles |
| `admin` | Manage members and inventory; cannot change owner |
| `member` | View inventory; sell/buy operations |
