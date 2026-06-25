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

```bash
npm run db:push
npm run db:seed
```

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

See the [`docs/`](docs/) folder for product requirements, scoring rules, API specification, and architecture.

### Operational guides

| Guide | Description |
|-------|-------------|
| [DEVELOPMENT_GUIDE.md](docs/DEVELOPMENT_GUIDE.md) | Local setup, env vars, seeding, troubleshooting |
| [PROJECT_STATUS.md](docs/PROJECT_STATUS.md) | What's built, MVP gaps, commit checklist |
| [MVP_PRD.md](docs/MVP_PRD.md) | Product requirements and user stories |

### Technical specifications (DOC-###)

| Document | Description |
|----------|-------------|
| [DOC-300 – Technical Architecture](docs/DOC-300%20-%20Technical%20Architecture.md) | Stack, services, deployment |
| [DOC-302 – API Specification](docs/DOC-302%20-%20API%20Specification.md) | REST API reference |
| [DOC-301 – Database Schema Specification](docs/DOC301%20-%20Database%20Schema%20Specification.md) | Relational data model |
| [DOC-303 – RBAC & Security Specification](docs/DOC-303%20RBAC%20&%20Security%20Specification.md) | Roles and permissions |
| [DOC-111A – Scoring Engine Specification](docs/DOC-111A%20-%20Scoring%20Engine%20Specification.md) | Authoritative scoring rules |
| [DOC-115 – Question Scoring Matrix](docs/DOC-115%20-%20Question%20Scoring%20Matrix.md) | Question weights and answer scores |
| [DOC-114 – Assessment Question Bank Specification](docs/DOC-114%20-%20Assessment%20Question%20Bank%20Specification.md) | 50 assessment questions (v1) |
| [DOC-112 – Recommendation Engine Specification](docs/DOC112%20-%20Recommendation%20Engine%20Specification.md) | Recommendation rules |

Legacy filenames (e.g. `TechnicalArchitecture.md`, `ScoringSpecification.md`) redirect to the canonical DOC-### documents above.

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client and build |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed assessment data and users |
| `npm run db:studio` | Open Prisma Studio |
