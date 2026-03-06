# Space Intel — The Bloomberg Terminal for Space

A unified intelligence platform for the $626B space economy. Combines real-time data from SEC filings, government contracts, launch tracking, and funding databases into a single AI-powered interface for space investors, analysts, and executives.

## Screenshots

The app features a dark Bloomberg-style terminal UI with:

- **Command Center** — key metrics, launch cadence chart, recent contracts & filings
- **Company Directory** — searchable/filterable table of 20+ space companies
- **Company Profiles** — deep-dive pages with financials, contracts, filings, and funding
- **Launch Tracker** — sortable table with provider/status/year filters
- **AI Research Chat** — conversational interface powered by RAG over all data

## Quick Start

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open **http://localhost:3000**. The UI renders with mock data — no database, Docker, or API keys required.

## Full Setup (with database & ingestion)

```bash
# 1. Start PostgreSQL 16 (pgvector) + Redis 7
docker compose up -d

# 2. Configure environment
cp .env.example .env.local
# Fill in your API keys (see below)

# 3. Push schema to database
pnpm db:push

# 4. Seed 30 space companies
pnpm db:seed

# 5. Start dev server + Inngest dev server
pnpm dev
```

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | For DB features | Defaults to local Docker Postgres |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | For auth | From [Clerk dashboard](https://dashboard.clerk.com) |
| `CLERK_SECRET_KEY` | For auth | From Clerk dashboard |
| `ANTHROPIC_API_KEY` | For AI chat | From [Anthropic console](https://console.anthropic.com) |
| `OPENAI_API_KEY` | For embeddings | From [OpenAI platform](https://platform.openai.com) |
| `INNGEST_EVENT_KEY` | For jobs | From [Inngest dashboard](https://app.inngest.com) |
| `REDIS_URL` | Optional | Falls back to in-memory in dev |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router, Turbopack) |
| Language | TypeScript (strict mode) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Auth | Clerk (optional for local dev) |
| State | TanStack Query v5 (server) + Zustand (client) |
| API | tRPC v11 |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis (Upstash in prod) |
| Background Jobs | Inngest |
| AI/LLM | Vercel AI SDK + Claude |
| Embeddings | OpenAI text-embedding-3-small |
| Monorepo | Turborepo + pnpm |

## Project Structure

```
space-intel/
├── apps/web/                  # Next.js 15 frontend
│   └── src/
│       ├── app/               # App Router pages
│       │   ├── (dashboard)/   # Dashboard layout group
│       │   │   ├── page.tsx           # Command Center (/)
│       │   │   ├── companies/         # /companies + /companies/[slug]
│       │   │   ├── launches/          # /launches
│       │   │   └── research/          # /research (AI chat)
│       │   └── api/           # API routes (tRPC, Inngest)
│       ├── components/        # React components
│       ├── lib/               # Utilities
│       └── stores/            # Zustand stores
├── packages/
│   ├── db/                    # Drizzle schema & migrations
│   ├── api/                   # tRPC routers
│   ├── ingestion/             # Data pipelines (Inngest + source clients)
│   └── ai/                    # LLM utilities, RAG, embeddings
└── tooling/                   # Shared ESLint & TypeScript configs
```

## Commands

```bash
pnpm dev              # Start dev server (Next.js + Inngest)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm typecheck        # TypeScript strict check
pnpm test             # Run Vitest
pnpm db:push          # Push Drizzle schema to DB
pnpm db:generate      # Generate migration SQL
pnpm db:migrate       # Run migrations
pnpm db:seed          # Seed initial company data
pnpm db:studio        # Open Drizzle Studio GUI
```

## Data Sources

| Source | API | Schedule | Data |
|--------|-----|----------|------|
| Launch Library 2 | `ll.thespacedevs.com/2.3.0` | Every 6h | Launches, vehicles, pads |
| USAspending.gov | `api.usaspending.gov` | Daily | Federal contracts (space NAICS) |
| SEC EDGAR | `efts.sec.gov/LATEST` | Every 4h | 10-K, 10-Q, 8-K filings |
| SBIR.gov | `sbir.gov/api` | Weekly | SBIR/STTR awards |

## Database Schema

Core tables managed by Drizzle ORM:

- **companies** — 30+ tracked space companies (with pgvector embeddings)
- **contracts** — government contracts and SBIR awards
- **launches** — past and upcoming orbital launches
- **filings** — SEC filings with AI-generated summaries
- **funding_rounds** — venture/PE funding events
- **data_syncs** — ingestion job tracking
- **users** — user profiles (linked to Clerk)

## License

Private — all rights reserved.
