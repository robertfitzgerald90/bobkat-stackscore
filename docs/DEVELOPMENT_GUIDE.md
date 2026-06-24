# BobKat StackScore — Development Guide

## Purpose

This guide covers local setup, environment configuration, database seeding, authentication, and common troubleshooting for developers working on BobKat StackScore.

---

## Prerequisites

| Requirement | Version |
|-------------|---------|
| Node.js | 20+ (project tested on 24.x) |
| npm | 10+ |
| PostgreSQL | 15+ (accessible from your dev machine) |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and AUTH_SECRET

# 3. Generate Prisma client
npm run db:generate

# 4. Create database schema
npm run db:push

# 5. Seed assessment data and users
npm run db:seed

# 6. Start dev server (keep terminal open)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you will be redirected to `/login`.

---

## Environment Variables

See [`.env.example`](../.env.example) for the full template.

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string for Prisma and the app |
| `AUTH_SECRET` | Yes | Signs Auth.js JWT session tokens |
| `AUTH_URL` | Yes (local) | Canonical app URL (`http://localhost:3000`) |
| `NODE_ENV` | Optional | `development` for local work |
| `SEED_ADMIN_PASSWORD` | Optional | Password for seeded users (default: `ChangeMe123!`) |
| `NEXT_PUBLIC_APP_URL` | Optional | Reserved for future client-side use |

**Never commit `.env`** — it is listed in `.gitignore`.

---

## Default Login Credentials

After running `npm run db:seed`:

| Email | Password | Role |
|-------|----------|------|
| `admin@bobkatit.com` | Value of `SEED_ADMIN_PASSWORD` (default `ChangeMe123!`) | admin |
| `technician@bobkatit.com` | Same as above | technician |

If login fails after seeding:

1. Re-run `npm run db:seed` to refresh password hashes
2. Confirm `DATABASE_URL` in `.env` matches the database you seeded
3. Restart `npm run dev` after changing `.env`
4. Use the exact email addresses above (case-insensitive)

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server (Turbopack) on port 3000 |
| `npm run build` | Generate Prisma client and production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate Prisma client to `src/generated/prisma/` |
| `npm run db:push` | Push schema to database (no migration files) |
| `npm run db:migrate` | Create/apply Prisma migrations |
| `npm run db:seed` | Seed categories, questions, templates, users |
| `npm run db:studio` | Open Prisma Studio |

---

## Project Structure

```text
bobkat-stackscore/
├── docs/                    # Product and technical documentation
├── data/                    # RecommendationRuleCatalog.json (seed input)
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── seed.ts              # Seed orchestration
│   └── seed-data.ts         # 50 questions with scores
├── src/
│   ├── app/                 # Next.js App Router (pages + API)
│   ├── components/          # React UI components
│   ├── lib/
│   │   ├── assessments/     # Assessment completion logic
│   │   ├── auth/            # Auth.js configuration
│   │   ├── db/              # Prisma client (PostgreSQL adapter)
│   │   ├── recommendations/ # Recommendation engine
│   │   └── scoring/         # Score calculation engine
│   └── generated/prisma/    # Generated Prisma client (gitignored)
└── tests/scoring/           # Scoring unit tests (Vitest not yet configured)
```

---

## Architecture Summary

BobKat StackScore is a **monolithic Next.js 15 application**:

- **Frontend:** React + Tailwind 4 + shadcn/ui
- **API:** Next.js Route Handlers under `/api/v1/`
- **Auth:** Auth.js v5 (NextAuth) with credentials provider and JWT sessions
- **Database:** PostgreSQL via Prisma 7 with `@prisma/adapter-pg`

### Core workflow

```text
Login → Client → Assessment (draft) → Complete → Scores + Recommendations → Results
```

---

## Troubleshooting

### `ERR_CONNECTION_REFUSED` on localhost:3000

Nothing is listening on port 3000. Run `npm run dev` and keep the terminal open.

If the server exits immediately, check the terminal for errors. A common cause was mixed dynamic route segment names (`[id]` vs `[clientId]`) under `api/v1/clients/` — now standardized to `[id]`.

### Login returns "Invalid email or password"

| Check | Action |
|-------|--------|
| Users not seeded | Run `npm run db:seed` |
| Wrong database | Verify `DATABASE_URL` matches seeded DB |
| Stale password hash | Re-run `npm run db:seed` |
| Auth env missing | Ensure `AUTH_SECRET` and `AUTH_URL` are set in `.env` |
| Server not restarted | Restart `npm run dev` after `.env` changes |

Auth API routes run on the **Node.js runtime** (required for Prisma database access during login).

### `npm run db:seed` — "No seed command configured"

Ensure `prisma.config.ts` includes:

```ts
migrations: {
  path: "prisma/migrations",
  seed: "tsx prisma/seed.ts",
},
```

### Prisma client not found

Run `npm run db:generate` before `dev` or `build`. The build script runs generate automatically.

### PowerShell script execution policy

If `npm` fails with a security error, run:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

Or use `npm.cmd` instead of `npm`.

---

## Related Documentation

| Document | Description |
|----------|-------------|
| [PROJECT_STATUS.md](PROJECT_STATUS.md) | What is built, what remains for MVP |
| [MVP_PRD.md](MVP_PRD.md) | Product requirements |
| [TechnicalArchitecture.md](TechnicalArchitecture.md) | Stack and service design |
| [API_Specification.md](API_Specification.md) | REST API reference |
| [ScoringSpecification.md](ScoringSpecification.md) | Authoritative scoring rules |
