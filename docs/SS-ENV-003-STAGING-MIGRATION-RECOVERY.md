# SS-ENV-003 — Staging Migration Failure Investigation & Recovery Plan

**Document ID:** SS-ENV-003  
**Status:** Investigation complete — recovery not executed  
**Date:** October 24, 2026  
**Branch context:** `staging` (investigation only)  
**Related:** [`SS-ENV-001-STAGING-IMPLEMENTATION-PLAN.md`](SS-ENV-001-STAGING-IMPLEMENTATION-PLAN.md), [`50-Development/ENVIRONMENTS.md`](50-Development/ENVIRONMENTS.md), `scripts/vercel-build.mjs`

**Constraints honored:** No database resets, migrations, Prisma history edits, production changes, redeploys, or environment-variable mutations were performed in this investigation.

---

## 1. Incident summary

| Item | Detail |
| --- | --- |
| Staging DB | Neon PostgreSQL branch created **Schema Only** from production |
| Vercel | Preview deployment with staging `DATABASE_URL` |
| Failure | Prisma **P3018** on migration `20250626000000_init` |
| Postgres | **42710** — `ERROR: type "UserRole" already exists` |
| Expected control | `SKIP_PRISMA_MIGRATE=1` should skip migrate on build |

Migrations **did run** during the Preview build. The init migration tried to create enums/tables that already existed on the schema-only branch.

---

## 2. Root cause

### 2.1 Why migrations executed (despite intended skip)

`scripts/vercel-build.mjs` only skips migrate when **all** of the following are true:

1. `process.env.VERCEL === "1"` (true on Vercel builds), **and**
2. `process.env.SKIP_PRISMA_MIGRATE === "1"` (**exact string** `"1"`).

```48:57:scripts/vercel-build.mjs
if (process.env.VERCEL === "1") {
  if (process.env.SKIP_PRISMA_MIGRATE === "1") {
    console.log("\n> Skipping prisma migrate deploy (SKIP_PRISMA_MIGRATE=1)");
  } else {
    try {
      run("npx prisma migrate deploy");
    } catch (error) {
      fail("prisma migrate deploy", error);
    }
  }
}
```

If migrate ran and failed with P3018, then at **Build** time `SKIP_PRISMA_MIGRATE` was **not** exactly `"1"`.

Most likely configuration causes (verify in Vercel UI — not modified here):

| Cause | Effect |
| --- | --- |
| Variable unset on **Preview** scope | Migrate runs |
| Variable set for **Runtime** only, not **Build** | Migrate runs during build |
| Value is `true`, `yes`, `1 ` (space), or quoted oddly | Strict `=== "1"` fails → migrate runs |
| Variable only on Production, not Preview | Preview still migrates |
| Build Command bypasses `vercel-build` | Unlikely if logs show this script; `npm run build` does **not** migrate |

`package.json`:

- `vercel-build` → `node scripts/vercel-build.mjs` (migrate when Vercel + no skip)
- `build` → `prisma generate && next build` (no migrate)

`prisma.config.ts` only resolves `DATABASE_URL` for Prisma tooling; it does **not** control skip logic.

**Conclusion:** Code behavior matches “migrate attempted.” The skip flag was ineffective for that Preview build’s environment injection. Confirm Build logs for either `Skipping prisma migrate deploy` or `> npx prisma migrate deploy`.

### 2.2 Why `UserRole` already exists (schema-only branch)

Neon **Schema Only** branching copies **schema objects** (enums, tables, indexes, etc.) from the parent (production) without copying row data.

Consequences for Prisma:

| Object | Typical Schema Only result |
| --- | --- |
| Enums (`UserRole`, …) | **Present** (copied DDL) |
| Application tables | **Present** (empty) |
| `_prisma_migrations` table | Structure may exist; **applied migration rows usually absent** (no data copy) |

`prisma migrate deploy` then:

1. Sees **no** (or incomplete) applied migration history.
2. Attempts to apply `20250626000000_init` from the repo.
3. Init SQL begins with `CREATE TYPE "UserRole" AS ENUM (...)`.
4. Postgres rejects with **42710** → Prisma **P3018**.

This is the same class of failure documented in `ENVIRONMENTS.md` for “schema not empty / already exists,” triggered here by **schema-only clone + empty migration history**, not by a bug in the init SQL itself.

```3:5:prisma/migrations/20250626000000_init/migration.sql
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'technician', 'client');
```

**Root cause (combined):** Schema-only staging already contained production-shaped DDL, while Prisma treated the database as unmigrated; Preview build ran `migrate deploy` because `SKIP_PRISMA_MIGRATE` was not effective as `"1"` at Build time.

---

## 3. Recovery options compared

### Option A — Recreate staging as an **empty** database; migrate from scratch

**Approach:** Delete/replace the schema-only branch (or create a new empty Neon DB/branch with no parent schema). Point Preview/Staging `DATABASE_URL` at it. Run `prisma migrate deploy` (then seed).

| Pros | Cons |
| --- | --- |
| Clean Prisma history matching repo migrations | Staging branch recreate / DNS cutover |
| Matches SS-ENV-001 recommendation | Loses any staging-only schema experiments (none expected yet) |
| Lowest long-term ambiguity | Requires careful URL verification |

**Safety for new staging:** **Highest.**

### Option B — Reconcile migration history with existing schema

**Approach:** Keep schema-only objects; mark migrations as applied (`prisma migrate resolve --applied …` for each folder) **or** baseline init then deploy remainder — only if schema is proven identical to what migrations would produce.

| Pros | Cons |
| --- | --- |
| Avoids recreating the Neon branch | Easy to mark applied when schema is **incomplete** vs later migrations |
| Faster if schema is already full | Schema-only from prod *should* be full, but verifying 30 migrations is error-prone |
| | Failed P3018 may leave `_prisma_migrations` in a **failed** state (P3009) needing resolve first |

**Safety:** Medium — acceptable only after exhaustive schema vs migration audit; not preferred for a brand-new empty staging purpose.

### Option C — Different Neon branching strategy

**Approach:** Prefer **empty database** or **data+schema** branch only when intentionally cloning data (not recommended for staging with PII). Avoid Schema Only when the consumer is Prisma migrate-from-zero.

| Pros | Cons |
| --- | --- |
| Prevents recurrence of P3018 class failures | Must not clone production **data** into staging without policy |
| Aligns Neon topology with Prisma | Requires ops discipline |

**Safety:** High when choosing empty DB; **do not** clone production customer data into staging without explicit approval.

---

## 4. Recommended recovery

**Recommend Option A (+ Option C practice going forward).**

For a newly created staging environment with no staging-specific data to preserve:

1. Replace the schema-only branch with an **empty** Neon database/branch.
2. Apply all repo migrations with `prisma migrate deploy` against that URL only.
3. Seed staging (non-destructive upsert seed; do **not** use `SEED_FULL_RESET`).
4. Fix Vercel Preview/Staging env so either:
   - **Preferred for durable Staging:** leave `SKIP_PRISMA_MIGRATE` unset and allow migrate-on-build against the **staging-only** URL, **or**
   - Set `SKIP_PRISMA_MIGRATE=1` for **Build + Runtime** on Preview and run migrate manually against staging after schema changes.
5. Re-deploy Preview/Staging only after URL and skip-flag verification.

Do **not** mark thirty migrations `--applied` on a half-failed schema-only DB unless Option A is impossible.

---

## 5. Preconditions (mandatory before any destructive or migrate command)

Before running **any** command that touches a database, verify **all** of the following on the machine/session that will execute it:

| # | Check | How |
| --- | --- | --- |
| 1 | Target URL is the **staging** Neon branch/project | Neon console: copy staging connection string; compare host `ep-…` / branch name |
| 2 | Target is **not** production | Production host/branch name differs; do not paste Production URL into the shell |
| 3 | No production customer records on target | Staging empty DB: zero clients expected; if schema-only copy of structure only, still confirm **row counts** for `Client` / `User` are 0 (or staging-only) before wipe |
| 4 | Shell `DATABASE_URL` override is staging | In PowerShell: print host only, e.g. parse URI host — **never log passwords** |
| 5 | Vercel Production env untouched | Do not change Production variables during staging recovery |
| 6 | No Production migrate from this session | Do not run migrate without `$env:DATABASE_URL` set to staging for that session |

**Stop** if any check fails.

Suggested non-secret verification queries (run only against confirmed staging URL later):

```sql
SELECT current_database(), inet_server_addr();
SELECT COUNT(*) AS clients FROM "Client";
SELECT COUNT(*) AS users FROM "User";
SELECT migration_name, finished_at, rolled_back_at
FROM "_prisma_migrations"
ORDER BY started_at;
```

Expect on a **new empty** staging DB before migrate: no app tables yet (or connect fails until migrate). Expect after Option A migrate: migrations listed as finished; seed users only (e.g. admin/technician), not production clients.

---

## 6. Exact commands (for authorized execution later)

### 6.1 Fix skip flag (Vercel dashboard — manual)

1. Project → Settings → Environment Variables.
2. For **Preview** (and Staging if separate):
   - Either **remove** `SKIP_PRISMA_MIGRATE` (allow migrate on staging DB), **or**
   - Set `SKIP_PRISMA_MIGRATE` = `1` with scopes **Build** and **Runtime**.
3. Confirm `DATABASE_URL` for Preview/Staging is the **staging** Neon URL only.
4. Confirm Production `DATABASE_URL` unchanged.

### 6.2 Option A — Empty staging + migrate + seed

**In Neon (UI):** Create a new **empty** branch/database (do not use Schema Only from production). Update Vercel Preview/Staging `DATABASE_URL` to that URL.

**On a secure workstation** (after §5 preconditions):

```powershell
cd "C:\Cursor Projects\Apps\Bobkat-Stackscore"

# REQUIRED: staging URL only — do not use production
$env:DATABASE_URL = "<STAGING_NEON_URL_WITH_sslmode=require>"

# Apply all migrations from prisma/migrations
npm run db:migrate:deploy

# Idempotent library/users seed — do NOT set SEED_FULL_RESET
npm run db:seed
```

Optional demo data (staging only):

```powershell
$env:ALLOW_DEMO_SEED = "true"
npm run seed:demo-client
```

### 6.3 If keeping the failed schema-only DB temporarily (not recommended)

Only if Option A is blocked and the failed migrate left a P3009 record:

```powershell
$env:DATABASE_URL = "<STAGING_NEON_URL>"
npx prisma migrate resolve --rolled-back 20250626000000_init
```

Then prefer **dropping/recreating empty** over resolving all migrations as applied.

### 6.4 Redeploy

After DB + env verification, trigger a new Preview/Staging deployment. Build log should show either:

- `> Skipping prisma migrate deploy (SKIP_PRISMA_MIGRATE=1)`, or  
- `> npx prisma migrate deploy` completing with no P3018.

Then: `npm run smoke -- https://<staging-or-preview-host>`.

---

## 7. Verification steps

| Step | Pass criteria |
| --- | --- |
| Build log | No P3018; migrate skipped or deploy succeeds |
| `_prisma_migrations` | All repo migrations present with `finished_at` set; none failed |
| App health | `/api/v1/health` → `ok` |
| Smoke | `npm run smoke -- <staging-base-url>` passes |
| Isolation | Staging `Client` count is 0 or demo-only; production unchanged |
| Auth URLs | Staging `AUTH_URL` / `NEXT_PUBLIC_APP_URL` match staging host |

---

## 8. Risks

| Risk | Mitigation |
| --- | --- |
| Wrong `DATABASE_URL` wipes or migrates production | §5 preconditions; compare Neon hosts; never reuse Production session env |
| Schema-only reconcile marks migrations applied incorrectly | Prefer Option A |
| `SKIP_PRISMA_MIGRATE` set again without Build scope | Document exact value `1` + Build+Runtime |
| Seeding production | Never run seed against Production URL in this recovery |
| Preview still points at old schema-only branch | Update Vercel env before redeploy |

---

## 9. Expected results

After Option A:

1. Staging database schema matches migration history exactly.
2. Preview/Staging deploy builds successfully.
3. Staging contains seed/admin (and optional demo) data only — **not** production customer data.
4. Future schema changes apply cleanly via `migrate deploy` on staging, then production.
5. Schema-only-from-production is **not** reused as a Prisma migrate target.

---

## 10. Production safeguards (reminder)

This recovery must **not**:

- Change Production Neon.
- Run migrate/seed without a staging-confirmed `DATABASE_URL`.
- Enable `SEED_FULL_RESET` against any shared DB.
- Point Preview `DATABASE_URL` back at Production.

If any command fails with connection errors, **stop** and re-verify the URL host before retrying.

---

## 11. Stop state

Investigation and recovery documentation complete. No databases were reset, no migrations executed, no Prisma history modified, no production or Vercel settings changed, and no redeploy was triggered by this task.

**Next step:** Await explicit authorization to execute Option A (empty staging DB + migrate + seed) and to correct Preview `SKIP_PRISMA_MIGRATE` / `DATABASE_URL` scopes in Vercel.
