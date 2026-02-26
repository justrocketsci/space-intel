# Space Intel — The Bloomberg Terminal for Space

A unified intelligence platform for the $626B space economy. Combines real-time data from SEC filings, government contracts, launch tracking, and funding databases into a single AI-powered interface for space investors, analysts, and executives.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict mode) |
| UI | shadcn/ui + Tailwind CSS v4 |
| Tables | TanStack Table v8 |
| Charts | Recharts |
| Auth | Clerk |
| State | TanStack Query v5 (server) + Zustand (client) |
| API | tRPC v11 |
| ORM | Drizzle ORM |
| Database | PostgreSQL 16 + pgvector |
| Cache | Redis (Upstash in prod) |
| Background Jobs | Inngest |
| AI/LLM | Vercel AI SDK + Claude / OpenAI |
| Embeddings | OpenAI text-embedding-3-small (1536 dims) |
| Monorepo | Turborepo + pnpm |
| Deploy | Vercel (frontend) + Neon (Postgres) |

## Directory Structure

```
space-intel/
├── apps/
│   └── web/                      # Next.js 15 app
│       └── src/
│           ├── app/              # App Router pages
│           │   ├── (auth)/       # Sign-in / sign-up
│           │   ├── companies/    # Company directory & profiles
│           │   ├── launches/     # Launch tracker
│           │   └── research/     # AI research chat
│           ├── components/       # React components
│           │   ├── ui/           # shadcn/ui primitives
│           │   ├── layout/       # Shell, sidebar, nav
│           │   └── [feature]/    # Feature-specific components
│           ├── lib/              # Utilities, constants, config
│           ├── hooks/            # Custom React hooks
│           └── stores/           # Zustand stores
├── packages/
│   ├── db/                       # Drizzle schema & migrations
│   │   ├── schema/               # Table definitions (one file per entity)
│   │   └── migrations/           # Generated SQL migrations
│   ├── api/                      # tRPC routers
│   │   └── routers/              # One router per domain
│   ├── ingestion/                # Data pipelines
│   │   ├── inngest/              # Inngest function definitions
│   │   ├── sources/              # API client wrappers per data source
│   │   └── seed/                 # Seed data (companies.json)
│   └── ai/                       # AI/LLM utilities
│       ├── prompts/              # System prompts
│       └── rag.ts                # Retrieval pipeline
└── tooling/                      # Shared ESLint, TS, Tailwind configs
```

## Development Setup

### Prerequisites
- Node.js 20+
- pnpm 9+
- Docker (for local Postgres + Redis)

### Getting Started

```bash
# Install dependencies
pnpm install

# Start local databases
docker compose up -d

# Push schema to database
pnpm db:push

# Seed initial company data
pnpm db:seed

# Start development server + Inngest dev server
pnpm dev
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/spaceintel

# Auth (Clerk)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI / LLM
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Inngest
INNGEST_EVENT_KEY=...
INNGEST_SIGNING_KEY=...

# Redis (optional in dev)
REDIS_URL=redis://localhost:6379
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
pnpm db:seed          # Seed initial data
pnpm db:studio        # Open Drizzle Studio GUI
```

## Coding Conventions

- **TypeScript strict mode** everywhere — no `any`, no implicit returns
- **Server Components by default** — only add `"use client"` when interactivity is needed
- **tRPC for all API calls** — no raw `fetch` to internal APIs
- **Zod for validation** — all inputs validated at the tRPC layer
- **Drizzle for DB access** — no raw SQL strings outside migrations
- **One schema file per entity** in `packages/db/schema/`
- **One router file per domain** in `packages/api/routers/`
- **Colocation** — keep components close to the routes that use them
- **Naming**: `kebab-case` for files/dirs, `PascalCase` for components, `camelCase` for functions/variables
- **Imports**: Use `@/` alias for `apps/web/src/`, `@space-intel/db` for db package, etc.
- **No default exports** except for Next.js pages/layouts (required by framework)
- **Prefer server actions** for mutations where possible
- **Error handling**: Use tRPC error codes, let error boundaries catch rendering errors

## Data Sources (MVP)

| Source | API | Schedule | Data |
|--------|-----|----------|------|
| Launch Library 2 | `ll.thespacedevs.com/2.3.0` | Every 6h | Launches, vehicles, pads |
| USAspending.gov | `api.usaspending.gov` | Daily | Federal contracts (space NAICS) |
| SEC EDGAR | `efts.sec.gov/LATEST` | Every 4h | 10-K, 10-Q, 8-K filings |
| SBIR.gov | `sbir.gov/api` | Weekly | SBIR/STTR awards |
| Seed data | Manual JSON | One-time + updates | ~200 space companies |

## Database Schema (Core Tables)

- `companies` — tracked space companies (with embedding vector column)
- `contracts` — government contracts and SBIR awards
- `launches` — past and upcoming launches
- `filings` — SEC filings with AI summaries
- `funding_rounds` — venture/PE funding events
- `data_syncs` — ingestion job tracking
- `users` — user profiles (linked to Clerk)

## MVP Views

1. **Command Center** (`/`) — dashboard with key metrics, upcoming launches, recent contracts/filings
2. **Company Profiles** (`/companies`, `/companies/[slug]`) — searchable directory + deep-dive profiles
3. **Launch Tracker** (`/launches`) — calendar, history table, success rate charts
4. **AI Research Chat** (`/research`) — RAG-powered conversational interface over all data

## Architecture Decisions

- **Postgres-only for MVP** — pgvector for embeddings, tsvector for full-text search. Defer Neo4j (knowledge graph) and Elasticsearch to post-MVP.
- **No separate Python service** — Vercel AI SDK handles all LLM calls in TypeScript. Add Python service later for advanced ML pipelines.
- **Inngest over custom cron** — durable execution, built-in retries, observability dashboard.
- **Drizzle over Prisma** — lighter weight, better SQL control, faster migrations.
- **shadcn/ui over full component library** — copy-paste ownership, fully customizable, no vendor lock.
