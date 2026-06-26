# StackScore Pilot Deployment Guide

**Audience:** BobKat IT — 1–3 internal users  
**Version:** 1.0.0  
**Last updated:** June 2026

---

## Overview

This guide covers deploying StackScore for **field pilot** use: assessments, scoring, recommendations, projects, PDF export, and Technology Profile. It assumes a single PostgreSQL database and one application instance.

---

## Requirements

| Component | Minimum |
|-----------|---------|
| Node.js | 20+ |
| PostgreSQL | 14+ |
| RAM | 1 GB for app + DB connection pool |
| Users | 1–3 (admin + technician) |

---

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `AUTH_SECRET` | Yes | **32+ characters** in production (`openssl rand -base64 32`) |
| `AUTH_URL` | Yes (production) | Canonical URL, e.g. `https://stackscore.bobkatit.local` or `http://192.168.1.106:3000` |
| `NEXT_PUBLIC_APP_URL` | Recommended | Same as `AUTH_URL` for links |
| `SEED_ADMIN_PASSWORD` | First seed only | Change default before first `db:seed` in production |

The dev server is pinned to **port 3000**. Production `npm start` also uses port 3000 unless you override.

---

## Fresh Database Install

```bash
npm install
npm run db:migrate:deploy
npm run db:seed
npm run build
npm start
```

Verify:

```bash
npm run smoke
# or against remote host:
npm run smoke -- http://192.168.1.106:3000
```

---

## Existing Database (previously used `db push`)

If your database already has tables from `prisma db push`, **baseline** the migration without re-running DDL:

```bash
npx prisma migrate resolve --applied 20250626000000_init
npx prisma migrate deploy
npm run db:seed
```

This marks the initial migration as applied and keeps future schema changes on the migration track.

---

## Production Checklist

- [ ] `AUTH_SECRET` is 32+ random characters (not the example value)
- [ ] `AUTH_URL` matches the URL users actually open in the browser
- [ ] `SEED_ADMIN_PASSWORD` changed before first seed
- [ ] PostgreSQL backups scheduled (daily minimum)
- [ ] `npm test` passes
- [ ] `npm run smoke` passes against running instance
- [ ] Sign in → create client → complete assessment → export PDF (manual smoke)

---

## Backup & Recovery

### Database backup (PostgreSQL)

```bash
pg_dump -h HOST -p PORT -U USER -d stackscore -F c -f stackscore_backup.dump
```

### Restore

```bash
pg_restore -h HOST -p PORT -U USER -d stackscore --clean stackscore_backup.dump
```

Back up before every schema migration in production.

---

## Updates (new release)

```bash
git pull
npm install
npm run db:migrate:deploy
npm run build
npm start
npm run smoke
```

Seed is **idempotent** for question bank and users (upsert). Safe to re-run after updates:

```bash
npm run db:seed
```

---

## Health Monitoring

`GET /api/v1/health` returns:

```json
{
  "status": "ok",
  "checks": {
    "database": "ok",
    "authSecret": "ok",
    "authUrl": "ok"
  },
  "version": "1.0.0",
  "environment": "production"
}
```

Returns **503** if database or auth configuration is unhealthy.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Sign-in does nothing | Confirm `AUTH_URL` matches browser URL; see `docs/AUTH_LOGIN_FIX.md` |
| Port already in use | Stop other Node processes; use port 3000 only |
| Migration failed | See "Existing Database" baseline steps above |
| Health `database: error` | Check `DATABASE_URL`, firewall, PostgreSQL running |

---

## Related Docs

- [PILOT_GO_LIVE.md](PILOT_GO_LIVE.md) — pre-flight checklist
- [KNOWN_LIMITATIONS.md](KNOWN_LIMITATIONS.md) — what v1.0 does not include
- [AUTH_LOGIN_FIX.md](AUTH_LOGIN_FIX.md) — login troubleshooting
