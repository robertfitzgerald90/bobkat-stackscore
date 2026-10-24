# SS-ENV-001 — Staging / Three-Environment Implementation Plan

**Document ID:** SS-ENV-001  
**Status:** Discovery complete — planning only (no infrastructure changes executed)  
**Date:** October 24, 2026  
**Scope:** Local Development · Staging · Production  
**Related:** [`60-Operations/DOC-021 – Environment & Deployment Strategy.md`](60-Operations/DOC-021%20%E2%80%93%20Environment%20&%20Deployment%20Strategy.md), [`50-Development/ENVIRONMENTS.md`](50-Development/ENVIRONMENTS.md), [`50-Development/DEPLOY.md`](50-Development/DEPLOY.md), `.cursor/skills/production-release/SKILL.md`

**Constraints honored:** No production config changes, migrations, database create/delete, deploys, env-var mutations, Git branches, or GitHub Actions edits. No secrets exposed.

---

## 1. Executive summary

StackScore today is effectively a **two-environment** system:

| Environment | Host / runtime | Database |
| --- | --- | --- |
| Local development | `localhost:3000` | LAN/home PostgreSQL (`.env`) |
| Production | Vercel → `https://stackscore.tech` | Neon PostgreSQL |

There is **no dedicated Staging environment**, **no `.github/workflows` CI**, and **no `staging` Git branch**. DOC-021 describes a future Preview tier; production ops docs (`ENVIRONMENTS.md`, `DEPLOY.md`) document Local vs Vercel Production only.

**Highest risks before adding Staging:**

1. Vercel Preview deployments may inherit **Production** env vars (including `DATABASE_URL`) if Preview scope is not isolated — migrate-on-build would then mutate production.
2. `npm run vercel-build` runs `prisma migrate deploy` whenever `VERCEL=1` (unless `SKIP_PRISMA_MIGRATE=1`).
3. Destructive scripts (`SEED_FULL_RESET`, `cleanup:test-data`, `db push`) are safe only when `DATABASE_URL` points at a non-production database.
4. `APP_ENV` is specified in DOC-021 but **not implemented** in `src/lib/env.ts` (behavior uses `NODE_ENV` / `VERCEL_ENV`).

This plan recommends a **third Neon database (or Neon branch) + Vercel Staging environment** (or Preview-only with hard Preview DB isolation), plus production safeguards and acceptance tests—without changing live systems in this discovery pass.

---

## 2. Existing architecture (as inspected)

### 2.1 Source control and production Git branch

| Item | Finding |
| --- | --- |
| Remote | `https://github.com/robertfitzgerald90/bobkat-stackscore` |
| Production / integration branch | **`main`** (only local + `origin/main` observed) |
| Feature / staging branches | None required by current deploy docs; none present as remotes in this clone |
| GitHub Actions | **None** (no `.github/workflows`) |

Canonical production path today: push/merge to `main` → Vercel Production deploy.

### 2.2 Vercel configuration

| Item | Finding |
| --- | --- |
| Config file | `vercel.json` — cron only (`/api/cron/communications` daily `0 12 * * *`) |
| Build command (documented) | `npm run vercel-build` |
| Install | Default `npm install` |
| Production host | `stackscore.tech` (`CANONICAL_APP_HOST` in `src/lib/url/base-url.ts`) |
| Legacy host | `stackscore.bobkatit.com` → 308 redirect to canonical (non-API paths) |
| Node | `engines.node: 24.x` |

`scripts/vercel-build.mjs` sequence:

1. Require `DATABASE_URL`
2. `npx prisma generate`
3. If `VERCEL=1` and not `SKIP_PRISMA_MIGRATE=1` → `npx prisma migrate deploy`
4. `npx next build --turbopack`

### 2.3 Build / deploy scripts (`package.json`)

| Script | Role |
| --- | --- |
| `dev` | Local Next.js Turbopack `:3000` |
| `build` | `prisma generate` + `next build` (no migrate) |
| `vercel-build` | Generate + migrate deploy (on Vercel) + build |
| `start` | `next start -p 3000` |
| `db:migrate` | `prisma migrate dev` (local authoring) |
| `db:migrate:deploy` | `prisma migrate deploy` |
| `db:setup` / `db:neon:setup` | migrate deploy + seed |
| `db:push` | Schema push (**destructive risk** if aimed at prod) |
| `db:seed` | `tsx prisma/seed.ts` |
| `smoke` | Health + auth CSRF against a base URL |
| `cleanup:test-data` | Selective client/lead deletion |
| `seed:demo-client` / `demo:reset` | Demo client seed/reset |

### 2.4 Preview deployment behavior (inferred)

- Repo does not define a Staging project or Preview env matrix.
- Vercel’s default for GitHub-connected projects: **Preview deployments on non-production branches/PRs**.
- Env vars in Vercel can be scoped to Production / Preview / Development. Docs instruct setting Production vars; they do **not** document Preview isolation.
- **Risk:** If Preview uses Production `DATABASE_URL`, Preview builds run migrations against production Neon.

`getBaseUrl()` falls back to `https://${VERCEL_URL}` when `NEXT_PUBLIC_APP_URL` / `AUTH_URL` are unset — Preview can self-host URLs, but auth cookies/callbacks break unless Preview has its own `AUTH_URL` / `AUTH_SECRET` and matching DB.

### 2.5 Database configuration

| Item | Finding |
| --- | --- |
| Provider (prod docs) | **Neon** PostgreSQL |
| Provider (local docs) | Self-hosted / LAN PostgreSQL (example host `192.168.1.106:5433`) |
| ORM | Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`, `pg` Pool) |
| Schema | `prisma/schema.prisma` — `provider = "postgresql"`, URL via `prisma.config.ts` |
| Connection | `DATABASE_URL` only (normalized in `src/lib/db/connection.ts`; Neon SSL heuristics) |
| Migrations | `prisma/migrations/*` (30+ folders); lock `postgresql` |
| Seed | `prisma/seed.ts` via `package.json` `prisma.seed` |
| Pool | Vercel: max 3; local: max 10 |

**Does local development connect to production?**  
By design **no** — `.env.example` points at LAN Postgres; Neon URL is documented for Vercel/dashboard only. Accidental override is possible if a developer sets Neon Production URL in local `.env`.

**Did Preview deployments previously share production credentials?**  
Cannot prove historical Vercel dashboard state from the repo. Documented guidance only configures **Production**. Treat “Preview may share Production DB” as a **default risk until verified in the Vercel UI**.

### 2.6 Potentially destructive database operations

| Operation | Trigger | Risk |
| --- | --- | --- |
| `prisma migrate deploy` | `vercel-build` on Vercel; `db:migrate:deploy` | Schema change on whichever DB `DATABASE_URL` targets |
| `prisma migrate dev` | Local authoring | May reset/create migration history on local DB |
| `prisma db push` | `db:push`; ENVIRONMENTS emergency notes | Mutates schema without migration history discipline |
| `SEED_FULL_RESET=true` + seed | `prisma/seed.ts` | **Deletes all clients and related data** (`clearAllClientData`) |
| `SEED_RESET_ASSESSMENTS=true` + seed | `prisma/seed.ts` | Deletes assessment-related data |
| `npm run cleanup:test-data -- --confirm` | Script | Deletes scoped clients/leads; production ack gates exist but require correct URL |
| `demo:reset` / Acme cleanup | Demo seed | Deletes demo client subtree only |
| Neon reset / new branch | Neon console | Wipes or forks DB (manual ops) |

**Never** run `SEED_FULL_RESET`, `db:push`, or cleanup `--confirm` against production without explicit, separate authorization and backups.

### 2.7 Authentication

| Item | Finding |
| --- | --- |
| Library | **NextAuth v5** (`next-auth@^5.0.0-beta.31`) |
| Provider | **Credentials only** (email/password + bcrypt); no Google/OAuth providers in code |
| Session | JWT, `maxAge` 24 hours |
| Required vars | `AUTH_SECRET` (32+ in production runtime), `AUTH_URL` (canonical origin) |
| Related | `NEXT_PUBLIC_APP_URL` for links/emails/Stripe redirects |
| Callbacks | App Router `/api/auth/*`; `safe-callback-url`; login page `/login` |
| Activation / reset | Dedicated public routes + token tables |

Environment-specific needs:

- Distinct `AUTH_SECRET` per environment (session isolation).
- `AUTH_URL` / `NEXT_PUBLIC_APP_URL` must match the browser origin (staging hostname ≠ production).
- No OAuth console redirect URIs today (Credentials-only simplifies staging).

### 2.8 External integrations

| Integration | Env vars (names only) | Staging need |
| --- | --- | --- |
| **Stripe** | `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_ASSESSMENT_PRICE_ID`, `STRIPE_VCIO_PRICE_ID`, `VCIO_PAYMENT_GRACE_PERIOD_DAYS` | **Separate test mode** keys + prices + webhook endpoint to staging URL |
| **Resend** | `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`, optional `EMAIL_ASSET_BASE_URL` | Separate API key or restricted domain; webhook → staging; avoid customer mail |
| **Cron** | `CRON_SECRET`; `vercel.json` path `/api/cron/communications` | Staging cron secret; disable or isolate cron if Preview noise is unwanted |
| **Website leads** | `WEBSITE_LEADS_API_SECRET`, optional `BOBKAT_NOTIFICATION_EMAIL` | Staging secret; do not point bobkatit.com production form at staging without intent |
| **GA4** | `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_ENABLE_ANALYTICS` | Prefer **disabled** on staging (`false`) |
| **Booking CTAs** | `NEXT_PUBLIC_TECHNOLOGY_ASSESSMENT_BOOKING_URL` (aliases) | Optional staging-safe URLs |
| **Brand contact** | `BOBKAT_IT_*` | Can share non-secret defaults |
| **Demo seed** | `DEMO_CLIENT_*`, `ALLOW_DEMO_SEED` | Staging-only demo data OK |

Webhook routes:

- `POST /api/webhooks/stripe`
- `POST /api/webhooks/resend`
- `GET/POST /api/cron/communications` (Bearer `CRON_SECRET`)

---

## 3. Identified risks

| ID | Risk | Severity |
| --- | --- | --- |
| R1 | Preview/Staging build uses Production `DATABASE_URL` → migrate/seed hits live data | **Critical** |
| R2 | Stripe **live** keys on staging → real charges / subscription mutations | **Critical** |
| R3 | Resend production key + real `EMAIL_FROM` → emails to real customers from staging | **High** |
| R4 | Cron on staging with shared secrets → duplicate outbound communications | **High** |
| R5 | `SEED_FULL_RESET` or cleanup aimed at wrong `DATABASE_URL` | **Critical** |
| R6 | Auth secret/URL shared across envs → cross-env session confusion | **Medium** |
| R7 | Website leads production form pointed at staging (or vice versa) | **Medium** |
| R8 | No CI → broken `main` can deploy before tests run | **Medium** |
| R9 | DOC-021 `APP_ENV` unused → env behavior inferred from `NODE_ENV`/`VERCEL_ENV` only | **Low** |
| R10 | Staff PDFs / demo seeds pollute staging if mistaken for production | **Low** |

---

## 4. Recommended target architecture

```text
Local Dev (.env → LAN Postgres)
        │
        ▼
   Feature branches / PRs  ──optional──► Vercel Preview (ephemeral)
        │                                  └── Preview Neon branch (optional)
        ▼
   staging branch (or main→Staging promotion)
        │
        ▼
   Vercel Environment: Staging
        ├── Host: staging.stackscore.tech (recommended)
        └── Neon: dedicated Staging DB (or long-lived Neon branch)
        │
        ▼
   main → Vercel Production
        ├── Host: stackscore.tech
        └── Neon: Production DB (current)
```

**Principles**

1. **One Neon database (or branch) per durable environment** — never share Production `DATABASE_URL` with Staging/Preview.
2. **Vercel env scopes** — Production / Preview / Development explicitly separated.
3. **Stripe test mode** on Staging; live keys only on Production.
4. **Migrate forward only** (`migrate deploy`); no `db push` / `SEED_FULL_RESET` on Staging or Production without change control.
5. Keep **`main` as production source of truth**; introduce `staging` as promotion branch **or** use Vercel Staging tied to `main` with manual promote (choose one model and stick to it).

**Preferred branching model (simple for current solo/small team):**

| Branch | Deploys to |
| --- | --- |
| `feature/*` | Vercel Preview (optional; Preview DB required if migrate-on-build) |
| `staging` | Vercel Staging |
| `main` | Vercel Production |

Promotion: PR `feature` → `staging` → verify → PR `staging` → `main`.

**Alternative (fewer branches):** `main` → Production; Staging = Vercel Preview of `main` with Staging env — weaker separation; not recommended while migrate-on-build is enabled.

---

## 5. Database provisioning instructions (to execute later — not now)

### Staging Neon

1. Neon console → create project **or** branch from Production **schema-only** (prefer empty + migrate, not data clone of clients).
2. Create role/DB; copy **pooled** and **direct** connection strings (`sslmode=require`).
3. From a secure workstation (never commit URL):

```powershell
$env:DATABASE_URL="<STAGING_NEON_URL>"
npm run db:migrate:deploy
npm run db:seed
# Optional demo (non-prod only):
# $env:ALLOW_DEMO_SEED="true"
# npm run seed:demo-client
```

4. Confirm Staging has **no production client PII** unless intentionally anonymized later.
5. Store Staging URL only in Vercel Staging (and optionally local `.env.staging` gitignored).

### Local

Keep LAN Postgres per `.env.example`. Never put Production Neon URL in committed files.

### Production

Unchanged in this plan. Continue backups before schema migrations; prefer migrate via controlled Production deploy or documented `SKIP_PRISMA_MIGRATE` + manual deploy.

---

## 6. Vercel configuration instructions (to execute later — not now)

1. **Vercel project** (existing StackScore project):
   - Production: domain `stackscore.tech` (+ legacy redirect host if still required).
   - Add domain `staging.stackscore.tech` → **Staging** environment (or Preview with alias — prefer Staging env).
2. **Build & Development Settings** (all envs): Build Command = `npm run vercel-build`.
3. **Environment variables** — set per scope (see §7). Critical: Staging/Preview **must not** list Production `DATABASE_URL`.
4. **Git**:
   - Production branch: `main`.
   - Staging branch: `staging` (if using branch model).
5. **Cron**: Confirm Staging cron either uses Staging-only `CRON_SECRET` and Staging DB, or disable cron for Staging/Preview if Vercel allows env-specific cron (validate in dashboard; `vercel.json` is global today).
6. **Stripe / Resend webhooks**: Register Staging endpoints:
   - `https://staging.stackscore.tech/api/webhooks/stripe`
   - `https://staging.stackscore.tech/api/webhooks/resend`

---

## 7. Staging environment variable matrix

Values are **names and guidance only** — do not paste secrets into docs or git.

| Variable | Local | Staging | Production |
| --- | --- | --- | --- |
| `DATABASE_URL` | LAN Postgres | Staging Neon | Production Neon |
| `AUTH_SECRET` | Local secret | **Unique** staging secret (≥32) | Unique production secret |
| `AUTH_URL` | `http://localhost:3000` | `https://staging.stackscore.tech` | `https://stackscore.tech` |
| `NEXT_PUBLIC_APP_URL` | Same as local AUTH_URL | Staging origin | Production origin |
| `NODE_ENV` | `development` | `production` (Vercel runtime) | `production` |
| `SKIP_PRISMA_MIGRATE` | n/a | Prefer unset (migrate Staging) | Optional if manual migrate |
| `STRIPE_SECRET_KEY` | `sk_test_…` | `sk_test_…` | `sk_live_…` only |
| `STRIPE_WEBHOOK_SECRET` | Local CLI / test | Staging webhook signing secret | Production webhook secret |
| `STRIPE_ASSESSMENT_PRICE_ID` | Test price | Test price | Live price |
| `STRIPE_VCIO_PRICE_ID` | Test price | Test price | Live price |
| `RESEND_API_KEY` | Dev/test | Staging-restricted | Production |
| `EMAIL_FROM` | Dev mailbox | Staging-safe from-address | Production from-address |
| `RESEND_WEBHOOK_SECRET` | Optional | Staging | Production |
| `CRON_SECRET` | Optional local | Staging-only | Production-only |
| `WEBSITE_LEADS_API_SECRET` | Local test | Staging | Production |
| `BOBKAT_NOTIFICATION_EMAIL` | Dev inbox | Internal staging inbox | Ops inbox |
| `NEXT_PUBLIC_ENABLE_ANALYTICS` | `false` | `false` | `true` only if intended |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | empty | empty / staging property | Production GA4 |
| `SEED_ADMIN_PASSWORD` | Local only | Staging seed once | Never casual re-seed |
| `SEED_FULL_RESET` | Local only if needed | **Forbidden** unless empty staging wipe authorized | **Forbidden** |
| `ALLOW_DEMO_SEED` | Optional | Optional | Only with explicit approval |
| `REQUIRE_PRODUCTION_CLEANUP_ACK` | — | Optional | Recommended `true` |
| `APP_ENV` (future) | `development` | `staging` / `preview` | `production` |

Optional future: implement DOC-021 `APP_ENV` in `getEnv()` for banners/feature gates (not required to stand up Staging DB/host).

---

## 8. Git branching strategy

### Recommended

1. Create `staging` branch from current `main` when ready to implement (not in this discovery task).
2. Protect `main`: require PR + checks (once CI exists).
3. Protect `staging`: require PR from feature branches.
4. Hotfixes: PR to `main` then backport to `staging`, or dual-PR.

### Preview branches

If Preview deploys remain enabled:

- Either assign Preview env a **Neon branch DB** and allow migrate-on-build, **or**
- Set `SKIP_PRISMA_MIGRATE=1` on Preview and never attach Production DB.

---

## 9. Prisma migration strategy

| Environment | Command | Who |
| --- | --- | --- |
| Local | `npm run db:migrate` (author) | Developer |
| Staging | `migrate deploy` via `vercel-build` or manual against Staging URL | Deploy / ops |
| Production | `migrate deploy` via Production `vercel-build` or manual with Production URL + backup | Ops |

Rules:

1. Migrations are **forward-only**; never rewrite applied history on shared DBs.
2. Do not use `db push` on Staging/Production except documented emergency with backup.
3. Seed is idempotent for library/users; **not** a substitute for migrations.
4. `SEED_FULL_RESET` / `SEED_RESET_ASSESSMENTS` are local/empty-DB tools only.
5. After creating Staging DB, baseline is unnecessary if database starts empty — run `migrate deploy` from scratch.

---

## 10. CI/CD implementation recommendations

**Current gap:** no GitHub Actions.

**Phase A (minimum):**

- Workflow on PR to `staging` / `main`: `npm ci`, `lint`, `test`, `build` (build may need dummy `DATABASE_URL` for generate — already handled in `prisma.config.ts` for `CI`).

**Phase B:**

- Deploy Staging automatically on push to `staging` (Vercel Git integration).
- Deploy Production on push to `main` (existing) after Staging smoke.

**Phase C:**

- Optional: `npm run smoke -- https://staging.stackscore.tech` in CI after deploy (needs auth-safe health only — current smoke fits).

Do **not** put production secrets in GitHub Actions until OIDC/Vercel secrets strategy is defined.

---

## 11. Production safeguards

1. Verify Vercel **Preview** and **Staging** env scopes do not include Production `DATABASE_URL`.
2. Keep Stripe live keys Production-only.
3. Set `REQUIRE_PRODUCTION_CLEANUP_ACK=true` on Production; never set `ALLOW_PRODUCTION_CLEANUP` casually.
4. Ban `SEED_FULL_RESET` on Production/Staging with data.
5. Backup Neon Production before every Production migration deploy.
6. Prefer Staging soak before `main` releases that include migrations.
7. Confirm cron + Resend cannot double-send (Staging uses different secrets and preferably suppressed auto-send).
8. Retain legacy host redirect behavior for Production only.

---

## 12. Staging acceptance tests

After Staging exists (manual checklist):

### Infrastructure

- [ ] `GET https://staging.stackscore.tech/api/v1/health` → `status: ok`
- [ ] `npm run smoke -- https://staging.stackscore.tech` passes
- [ ] Staging `DATABASE_URL` host ≠ Production Neon endpoint
- [ ] Login works with Staging-seeded admin (not production passwords reused casually)

### Auth / URLs

- [ ] `AUTH_URL` / `NEXT_PUBLIC_APP_URL` are staging origin
- [ ] Activation / password-reset links in emails point to staging
- [ ] No production cookie/session accepted on staging (different `AUTH_SECRET`)

### Data isolation

- [ ] Staging DB has no unexpected production client rows
- [ ] Completing a staging assessment does not appear in production

### Integrations

- [ ] Stripe Checkout in **test mode** succeeds; webhook delivery 2xx on staging
- [ ] Resend test send goes only to allowlisted inbox
- [ ] Cron either disabled or processes staging queue only
- [ ] Analytics disabled or on a non-production GA property

### App smoke (client + staff)

- [ ] Create client → assessment → complete → recommendations (B1 visibility rules)
- [ ] Client PDF vs staff `-internal` PDF
- [ ] Published proposal client view
- [ ] No unpublished stub titles on vCIO/projects for client role

### Build

- [ ] Staging deploy runs `vercel-build` successfully
- [ ] Pending migrations apply only to Staging

---

## 13. Suggested implementation sequence (future work authorization)

1. **Verify** current Vercel Preview/Production env scopes (dashboard audit) — fix R1 if Preview shares Production DB **before** any other work.
2. Provision Staging Neon + migrate + seed.
3. Configure Vercel Staging domain + env matrix (§7).
4. Create `staging` branch + branch protection (when authorized).
5. Wire Stripe/Resend staging webhooks.
6. Add minimal GitHub Actions PR checks.
7. Run §12 acceptance tests.
8. Document go-live cutover: feature → staging → main.

**Out of scope for this document’s execution:** performing any of the above steps.

---

## 14. Gap summary vs DOC-021

| DOC-021 intent | Current code/docs reality |
| --- | --- |
| Dev / Preview / Production | Dev + Production; Preview/Staging not operationalized |
| `APP_ENV` drives behavior | Not in `src/lib/env.ts`; use `NODE_ENV` / `VERCEL_ENV` |
| Preview DB isolation | Not documented in ENVIRONMENTS.md |
| Visual env banners | Future only |

SS-ENV-001 proposes Staging as the concrete realization of DOC-021’s Preview/isolation goals for Bobkat’s three-environment target (Local / Staging / Production).

---

## 15. Stop state

Discovery and planning complete. No repositories, Vercel projects, Neon databases, env vars, branches, workflows, or deployments were modified by this task.

**Next step:** Await explicit authorization to implement (starting with Vercel env-scope audit + Staging Neon provisioning).
