# Production environment reference (Vercel + Neon)

**Do not commit real secrets.** Set these in **Vercel → Project → Settings → Environment Variables → Production**.

Check **Production** and ensure variables apply to **Build** and **Runtime**.

| Variable | Example / notes |
|----------|-----------------|
| `DATABASE_URL` | Neon pooled connection string with `?sslmode=require` |
| `AUTH_SECRET` | 32+ char random string (can differ from local) |
| `AUTH_URL` | `https://stackscore.bobkatit.com` |
| `NEXT_PUBLIC_APP_URL` | `https://stackscore.bobkatit.com` |

## One-time Neon database setup

Neon starts **empty**. Your local LAN database already has schema; Neon needs migrations applied once.

**PowerShell** (paste your Neon URL from the Neon console — do not commit it):

```powershell
cd "C:\Cursor Projects\Apps\Bobkat-Stackscore"
$env:DATABASE_URL="postgresql://USER:PASSWORD@ep-xxxx.neon.tech/neondb?sslmode=require"
npm run db:neon:setup
```

This runs `prisma migrate deploy` then `prisma db seed` against Neon only. Your local `.env` can stay on `192.168.1.106` — the `$env:DATABASE_URL` line overrides it for that session only.

Expected output ends with `Seed complete.` and admin credentials.

If migrate fails with **connection** errors, confirm Neon project is active and the URL includes `?sslmode=require`.

### P3005 — “database schema is not empty”

Neon already has tables (e.g. from an old `db push`) but no Prisma migration history:

```powershell
npx prisma migrate resolve --applied 20250626000000_init
npx prisma migrate deploy
```

### P2022 — column does not exist (e.g. `v2CategoryCode`)

You baselined migrations but the DB schema is **older** than the current app (missing columns). The init migration SQL never actually ran.

**Quick fix** (Neon has no data you need to keep):

```powershell
$env:DATABASE_URL="your-neon-url"
npx prisma db push
npm run db:seed
```

`db push` adds missing columns/tables to match `schema.prisma` without re-creating everything.

**Clean-slate fix** (empty Neon branch):

1. Neon dashboard → reset the database (or create a fresh branch)
2. Do **not** baseline unless tables already exist

```powershell
$env:DATABASE_URL="your-neon-url"
npx prisma migrate deploy
npm run db:seed
```

If seed fails after migrate, re-run `npm run db:seed` with the same `$env:DATABASE_URL`.

### Vercel `DATABASE_URL` format

Use the same Neon URL in Vercel (Production, **Build + Runtime**). Recommended suffix:

```text
?sslmode=require&uselibpqcompat=true
```

This matches the app’s connection normalizer and silences the pg SSL warning in Vercel logs.

## Vercel build command

Project Settings → Build & Development Settings:

| Setting | Value |
|---------|--------|
| Build Command | `npm run vercel-build` |
| Install Command | `npm install` (default) |

`vercel-build` runs `prisma generate`, `prisma migrate deploy` (on Vercel only), then `next build`.

### Migrations already applied manually

If `npm run db:migrate:deploy` succeeds against Neon from your machine (no pending migrations), the database is ready. You do **not** need `prisma migrate resolve` — "already exists" errors mean those migrations are already recorded.

If Vercel build still fails during `prisma migrate deploy` (connection/pooler issues), either:

1. Fix the Vercel build log error (see below), or
2. Set `SKIP_PRISMA_MIGRATE=1` in Vercel env vars (Production, **Build** scope) and redeploy. Run `npm run db:migrate:deploy` locally whenever you add new migrations.

### Vercel build still fails

Open the failed deployment → **Build** logs and find the last `>` command:

| Last command | Fix |
|--------------|-----|
| *(immediate exit)* | `DATABASE_URL` missing — enable for **Build** + **Runtime** in Vercel |
| `prisma migrate deploy` | Use Neon **direct** (non-pooler) URL for build, or set `SKIP_PRISMA_MIGRATE=1` |
| `next build` | TypeScript/compile error — read the lines above the exit in the log |

## Local vs production

| | Local (`.env`) | Production (Vercel) |
|--|----------------|-------------------|
| Database | Home/LAN PostgreSQL | Neon |
| `AUTH_URL` | `http://localhost:3000` | `https://stackscore.bobkatit.com` |
| Secrets | `.env` (gitignored) | Vercel env vars only |

See [DEPLOY.md](DEPLOY.md) for full pilot deployment steps.
