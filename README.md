# Bobkat StackScore

Technology maturity assessment platform for Bobkat IT. Evaluates client environments across seven categories, calculates StackScores, generates recommendations, and tracks improvement over time.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS 4** + **shadcn/ui**
- **Prisma** + **PostgreSQL**
- **Auth.js** (NextAuth v5) with credentials provider

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

Required variables:

- `DATABASE_URL` — PostgreSQL connection string
- `AUTH_SECRET` — random string for session signing (`openssl rand -base64 32`)

### 3. Set up the database

**New install (recommended):**

```bash
npm run db:migrate:deploy
npm run db:seed
```

**Development only** (quick schema sync without migration history):

```bash
npm run db:push
npm run db:seed
```

If you already used `db push` on an existing database, baseline before deploying migrations — see [DEPLOY.md](docs/50-Development/DEPLOY.md#existing-database-previously-used-db-push).

Seed creates:

- 7 assessment categories
- 50 questions with scored answer options
- Recommendation templates from `data/RecommendationRuleCatalog.json`
- Admin user: `admin@bobkatit.com`
- Technician user: `technician@bobkatit.com`
- Default password: `ChangeMe123!` (or `SEED_ADMIN_PASSWORD`)

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Project Structure

```text
src/
├── app/
│   ├── (dashboard)/     # Authenticated pages
│   ├── api/v1/          # REST API
│   └── login/
├── components/          # UI components
├── lib/
│   ├── assessments/     # Completion orchestration
│   ├── auth/            # Auth.js config
│   ├── db/              # Prisma client
│   ├── recommendations/ # Recommendation engine
│   └── scoring/         # Score calculation
└── generated/prisma/    # Prisma client output
```

## Documentation

See [`docs/`](docs/) for product requirements, scoring rules, API specification, and architecture.

**Entry points:**

- [docs/README.md](docs/README.md) — folder guide and quick links
- [DOC-000 – Documentation Architecture & Index](docs/DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md) — master registry (authoritative)

### Operational guides

| Guide | Description |
|-------|-------------|
| [ENVIRONMENTS.md](docs/50-Development/ENVIRONMENTS.md) | Local vs Vercel (Neon) database setup |
| [DEPLOY.md](docs/50-Development/DEPLOY.md) | Production / pilot deployment |
| [PILOT_GO_LIVE.md](docs/50-Development/PILOT_GO_LIVE.md) | Pre-flight checklist for field use |
| [KNOWN_LIMITATIONS.md](docs/50-Development/KNOWN_LIMITATIONS.md) | What v1.0 includes and excludes |
| [DEVELOPMENT_GUIDE.md](docs/50-Development/DEVELOPMENT_GUIDE.md) | Local setup, env vars, seeding, troubleshooting |
| [PROJECT_STATUS.md](docs/50-Development/PROJECT_STATUS.md) | What's built, MVP gaps, commit checklist |
| [MVP_PRD.md](docs/50-Development/MVP_PRD.md) | Product requirements and user stories |

### Technical specifications (DOC-###)

| Document | Description |
|----------|-------------|
| [DOC-300 – Technical Architecture](docs/30-Architecture/DOC-300%20-%20Technical%20Architecture.md) | Stack, services, deployment |
| [DOC-302 – API Specification](docs/30-Architecture/DOC-302%20-%20API%20Specification.md) | REST API reference |
| [DOC-301 – Database Schema Specification](docs/30-Architecture/DOC-301%20%E2%80%93%20Database%20Schema%20Specification.md) | Relational data model |
| [DOC-303 – RBAC & Security Specification](docs/30-Architecture/DOC-303%20RBAC%20&%20Security%20Specification.md) | Roles and permissions |
| [DOC-111 – Scoring Engine Specification](docs/20-Business-Logic/DOC-111%20%E2%80%93%20Scoring%20Engine%20Specific.md) | Authoritative scoring rules (v2 target) |
| [DOC-111A – v1 Scoring Implementation](docs/20-Business-Logic/DOC-111A%20-%20Scoring%20Engine%20Specification.md) | Active v1 scoring rules |
| [DOC-115 – Question Scoring Matrix](docs/20-Business-Logic/DOC-115%20-%20Question%20Scoring%20Matrix.md) | Question weights and answer scores |
| [DOC-117 – Assessment Question Bank (v1 Legacy)](docs/20-Business-Logic/DOC-117%20%E2%80%93%20Assessment%20Question%20Bank%20%28v1%20Legacy%29.md) | 50 assessment questions (v1) |
| [DOC-112 – Recommendation Engine Specification](docs/20-Business-Logic/DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md) | Recommendation rules |
| [DOC-000 – Documentation Architecture & Index](docs/DOC-000%20%E2%80%93%20Documentation%20Architecture%20&%20Index.md) | Master doc registry |

Legacy filenames (e.g. `Vision.md`, `TechnicalArchitecture.md`) redirect via [`Superceded-*.md`](docs/Superceded-Vision.md) stubs in `docs/`.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start dev server (port 3000) |
| `npm run build` | Generate Prisma client and build |
| `npm run start` | Start production server (port 3000) |
| `npm test` | Run unit tests |
| `npm run smoke` | Post-deploy health + auth smoke check |
| `npm run db:migrate` | Create/apply migrations (dev) |
| `npm run db:migrate:deploy` | Apply migrations (production) |
| `npm run db:setup` | Migrate + seed (fresh install) |
| `npm run db:seed` | Seed assessment data and users |
| `npm run db:studio` | Open Prisma Studio |
