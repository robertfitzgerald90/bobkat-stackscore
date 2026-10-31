# SS-REL-017-R1 — Final Go / No-Go

| Field | Value |
| --- | --- |
| Date | 2026-10-30 |
| Branch | `staging` |
| Release candidate SHA | `3748bfb7268c0cd2066e3f096b9ad0a619077450` |
| Commit subject | SS-REL-017-R1 finalize production release candidate |
| Production tip (do not modify) | `main` @ `3d436622d0c7ec0fe58d05c0e10bd41971fb09ae` |
| Status | **CONDITIONAL GO — wait for explicit production authorization** |

Related: [`SS-REL-017-PRODUCTION-READINESS.md`](SS-REL-017-PRODUCTION-READINESS.md) · [`SS-REL-017-DEPLOYMENT-CHECKLIST.md`](SS-REL-017-DEPLOYMENT-CHECKLIST.md) · [`SS-REL-017A-DEMO-PRODUCTION-READINESS.md`](SS-REL-017A-DEMO-PRODUCTION-READINESS.md)

---

## 1. Exact release candidate

| Item | Value |
| --- | --- |
| SHA (full) | `3748bfb7268c0cd2066e3f096b9ad0a619077450` |
| SHA (short) | `3748bfb` |
| Subject | SS-REL-017-R1 finalize production release candidate |
| Includes | SEC-007 project API registry (12 routes) · SS-REL-017 readiness · SS-REL-017A demo readiness · deployment checklist · production legacy-demo baseline screenshot |
| Parent | `aa90298` (*ss-retry demo*) |

**Promote this SHA (or a fast-forward tip that contains it and only docs after it).** Do not cherry-pick without the full staging platform tip ancestry.

### Working tree at finalization

- Branch: `staging`
- After RC commit: clean except this go/no-go doc until committed
- Local was **ahead of `origin/staging` by 1** at RC creation (push when authorized to publish tip; **not** a production deploy)

### Final regression (on RC content)

| Gate | Result |
| --- | --- |
| Route registry | **8/8 pass** |
| Auth + tenant isolation + rate limit + password + activation + snapshot | **PASS** |
| Public demo (R0/R1/R2) | **PASS** |
| Customer UX (Explore/Roadmap/Projects/Reports/Comms) | **PASS** |
| Stripe unit suites | **PASS** |
| Admin Command Center | **PASS** |
| Combined targeted | **190/190 pass** |
| `npm run lint` | **0 errors** (22 preexisting warnings) |
| `npm run build` | **PASS** |
| `npx tsc --noEmit` | **12 preexisting errors in `tests/**` fixtures only** — not app compile; build succeeded |

### Migrations (vs production `main`)

1. `20260425010000_auth_rate_limit_bucket`  
2. `20261030100000_project_tasks_milestones_recommendations`  
3. `20261030120000_project_customer_updates`  

All additive. No production migrate until authorized.

---

## 2. Required staging browser checks

Complete on `https://staging.stackscore.tech` (Vercel auth or Protection Bypass) at **1440 / 768 / 390**:

- [ ] Homepage purple-first branding; primary CTAs work  
- [ ] Sign-in, forgot password, activate account render  
- [ ] `/demo` → Overview; nav Overview / Explore / Roadmap / Projects / Reports; DEMO ENVIRONMENT; Sign in  
- [ ] Retired demo paths redirect; `/api/product-overview/pdf` → **410**  
- [ ] Customer: Overview, Explore, Roadmap, Projects, project detail, Reports  
- [ ] Admin: Command Center, Clients, Projects, Leads, Recurring Services, Communications, Operations  
- [ ] Technician sample: admin-only route returns **403**  
- [ ] Project customer update remains manual (preview → confirm send)  
- [ ] Mobile nav usable at 390  

**Redesigned staging UX browser QA was blocked in readiness automation** — this checklist is mandatory for the human operator.

---

## 3. Production environment verification

Confirm in Vercel **Production** (names only; do not paste secrets):

- [ ] `DATABASE_URL` → Production Neon host (not staging)  
- [ ] `AUTH_URL` / `NEXT_PUBLIC_APP_URL` = `https://stackscore.tech`  
- [ ] `STRIPE_SECRET_KEY` = **live**; price IDs + `STRIPE_WEBHOOK_SECRET` match Production webhook endpoint  
- [ ] `RESEND_API_KEY` / `RESEND_WEBHOOK_SECRET` / `EMAIL_FROM`  
- [ ] `CRON_SECRET` / `WEBSITE_LEADS_API_SECRET`  
- [ ] Staging credentials are **not** applied to Production  

---

## 4. Neon backup / recovery checkpoint

- [ ] Record Neon Production PITR / snapshot time before deploy  
- [ ] Confirm who can restore if needed  
- [ ] Acknowledge: migrations are **not** down-migrated; app rollback leaves new tables in place  

---

## 5. Migration execution order

On Production deploy (authorized only), via `npm run vercel-build` → `prisma migrate deploy`:

1. `20260425010000_auth_rate_limit_bucket`  
2. `20261030100000_project_tasks_milestones_recommendations` (includes safe backfill)  
3. `20261030120000_project_customer_updates`  

If `SKIP_PRISMA_MIGRATE=1`, run `npm run db:migrate:deploy` against Production Neon **before** serving the new app.

**Do not run these against production until explicitly authorized.**

---

## 6. Production smoke tests

After deploy:

- [ ] `npm run smoke -- https://stackscore.tech` → `{status:"ok"}` + CSRF  
- [ ] `/` purple homepage  
- [ ] `/login` works for staff and a sample customer  
- [ ] `/demo/overview` customer-parity demo  
- [ ] `/api/product-overview/pdf` → 410  
- [ ] Command Center loads  
- [ ] Stripe Dashboard webhook deliveries succeed (signature OK)  
- [ ] Spot-check tenant isolation on one customer  

---

## 7. Rollback procedure

1. Vercel → Production → **Promote previous deployment** immediately.  
2. Leave additive DB tables in place; do not drop.  
3. Re-check Stripe webhook endpoint health.  
4. If migrate failed mid-build: fix forward; never rewrite migration history.  
5. Catastrophic data issue only: Neon PITR (last resort).  

---

## 8. Final go / no-go status

| Criterion | Met? |
| --- | --- |
| RC finalized on `staging` with registry + docs | **Yes** (`3748bfb`) |
| Automated regression / lint / build | **Yes** |
| `tsc` fixture failures accepted as non-blocking | **Yes** (preexisting) |
| Operator staging browser QA | **Outstanding** |
| Production env dual-check | **Outstanding** |
| Neon backup checkpoint | **Outstanding** |
| Explicit production deploy authorization | **Outstanding** |

### Decision

# **CONDITIONAL GO**

The release candidate **`3748bfb`** is finalized for production promotion of the approved platform (customer UX, admin redesign, purple branding, homepage, interactive demo, security tip).

**NO-GO for deploy until** operator checks (§2–§4) and **explicit production authorization** are complete.

Do not merge to `main`, deploy, migrate production, change production env, charge live Stripe, or send production email from this ticket.

---

*SS-REL-017-R1 finalization complete. Waiting for deploy authorization.*
