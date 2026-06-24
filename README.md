# BobKat StackScore

Technology maturity assessment platform for BobKat IT. Evaluates client environments across seven categories, calculates StackScores, generates recommendations, and tracks improvement over time.

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

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Start dev server |
| `npm run build` | Generate Prisma client and build |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed assessment data and users |
| `npm run db:studio` | Open Prisma Studio |
