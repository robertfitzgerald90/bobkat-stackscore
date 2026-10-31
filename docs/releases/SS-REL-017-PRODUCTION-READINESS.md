# SS-REL-017 — StackScore Production Release Preparation

| Field | Value |
| --- | --- |
| Project | StackScore |
| Branch reviewed | `staging` |
| Date | 2026-10-30 |
| Priority | P0 — Production Release |
| Type | Release engineering / stabilization (assessment + documentation) |
| Constraints | Staging + read-only production inspection only · no prod deploy/merge/migrate · no live Stripe · no prod emails · no new features · no SS-SNAP-001 |
| Related | [`SS-REL-017A-DEMO-PRODUCTION-READINESS.md`](SS-REL-017A-DEMO-PRODUCTION-READINESS.md), SS-SEC-005…007, SS-REL-002-R1, SS-REL-004/005 |

### Recommendation

# **CONDITIONAL GO — wait for explicit production authorization**

Staging tip **`aa90298`** contains the approved customer experience, admin redesign, purple-first branding, updated public homepage, and customer-parity interactive demo. Automated gates for the release surfaces are green. **Full staging→production promotion** is the smallest coherent release.

**Not ready to deploy tonight without clearing the operator gates in §13.** Do not cherry-pick the demo alone.

---

## 1. Release inventory

### Branch / commit references

| Ref | SHA | Subject | When |
| --- | --- | --- | --- |
| **Production branch** | `main` / `origin/main` | — | — |
| **Production tip** | `3d436622d0c7ec0fe58d05c0e10bd41971fb09ae` | SS-staging fix | 2026-10-24 |
| **Staging branch** | `staging` / `origin/staging` | — | — |
| **Staging tip (RC)** | `aa902983a24749b2c696e51f75ccea55c5fe0966` | ss-retry demo | 2026-10-30 |
| Delta | **46 commits** | `origin/main..origin/staging` | — |

Local `staging` matches `origin/staging` at validation time.

### Uncommitted working-tree items (not on tip)

| Path | Notes |
| --- | --- |
| `docs/releases/SS-REL-017A-DEMO-PRODUCTION-READINESS.md` | Demo-specific readiness (prior pass) |
| `docs/releases/assets/` | Production baseline screenshots |
| `docs/releases/SS-REL-017-PRODUCTION-READINESS.md` | This document |
| `src/lib/api/route-registry.ts` | **Remediation in this pass** — register 12 project delivery APIs (SEC-007) |

Commit these before promote (or fold into a follow-up RC tip).

### Commits not yet in production (grouped)

| Theme | Example SHAs | Include? |
| --- | --- | --- |
| Security hardening | `58e0a3c` … `eebbaa1` (SEC-003…007, guardrails) | **Required** |
| Ops / env / Stripe staging wiring | `68f88c9`, `bebfb77`, `12a7733`, `e6471a9` | **Required** (with env verification) |
| Customer UX platform | `44c7310` … `056e5c6` (nav, explore, roadmap, projects, reports) | **Required — core** |
| Admin / Command Center | `46a8cd3`, `ffa475a`, `0c29954`, `4b39911`, `a8bc42d`, `715cade` | **Required** (approved admin redesign) |
| Brand / public homepage / auth chrome | `1ea1e38`, `c889f6a`, `9c1fec7`, logo fixes | **Required** |
| Public demo parity + legacy retirement | `361b01d`, `aa90298` (+ WEB-003 lineage) | **Required** |
| Learn page | `0020f8a` | Included on tip; not blocking |
| Staging bootstrap | `94e987e` | Already historical on tip |

### Incomplete / deferred (out of release scope)

| Item | Status |
| --- | --- |
| SS-SNAP-001 | **Deferred** — do not start |
| Unfinished roadmap / optional enhancements | **Do not implement** |
| SEC-001-M09 session invalidation after password change | Open — not Critical; accept or schedule |
| SEC-001-L01 / L04 cookie/host / error disclosure | Open Low |
| Formal accept of M05/L02/L03 | Per SS-SEC-005 |

### External dependencies

| Service | Role |
| --- | --- |
| Vercel | App host (Production + Staging) |
| Neon PostgreSQL | Production / Staging databases (must remain isolated) |
| Auth.js (NextAuth v5) | JWT sessions |
| Stripe | Assessment checkout + vCIO subscription |
| Resend | Transactional email + delivery webhooks |
| Bobkat IT marketing site | External CTAs / solutions links |

---

## 2. Release candidate verification (code + tests)

### Customer experience

| Surface | Status | Evidence |
| --- | --- | --- |
| Overview | **PASS (code/tests)** | `CustomerExecutiveDashboard`; UX suites |
| Explore | **PASS** | Intelligence Center tests (`ss-ux-016`) |
| Roadmap | **PASS** | `ss-ux-007` |
| Projects / detail | **PASS** | `ss-ux-012`, `ss-ux-014` |
| Reports | **PASS** | `ss-ux-008` |
| Assessment access | **PASS (isolation tests)** | `api-client-isolation`, continue-snapshot security |
| Recommendation relationships | **PASS (code)** | ProjectRecommendation join + staff APIs |

Authenticated **browser** QA on staging: **not performed** (Vercel Deployment Protection).

### Administrative experience

| Surface | Status | Evidence |
| --- | --- | --- |
| Command Center | **PASS (unit)** | `ss-admin-004-command-center` |
| Clients / Projects / Leads / Comms / Ops | **PASS (code presence)** | Command Center nav modules; prior SS-REL-002-R1 admin login on staging |
| Recurring Services | **PASS (code)** | Commit `a8bc42d` on tip |

Live admin browser matrix: **pending operator**.

### Public experience

| Surface | Status | Evidence |
| --- | --- | --- |
| Homepage (staging tip) | **PASS (code)** | Purple public marketing (`c889f6a`) |
| Homepage (production live) | Legacy green gateway — will change on promote | Browser capture 2026-10-30 |
| Sign-in / activation / reset | **PASS (code + auth tests)** | Routes present; production login still green-branded |
| Interactive demo | **PASS (code + tests)** | Customer-parity `/demo/*`; see SS-REL-017A |
| Demo read-only isolation | **PASS** | Fixtures only; PDF **410**; no mutations |

### Branding

| Check | Status |
| --- | --- |
| Purple-first system on tip | **PASS (code)** — brand tokens / public themes |
| Transparent / tight logo | **PASS (code)** — BRAND-004 lineage on tip |
| Production live still green | Confirmed — expected until promote |

---

## 3. Blockers and findings

### P0 — Release blocking (must clear before go)

| ID | Finding | Disposition |
| --- | --- | --- |
| P0-1 | **No explicit production deploy authorization yet** | Wait for operator go |
| P0-2 | **Production Neon must apply 3 new migrations** during promote | Plan in §4; do not run until authorized |
| P0-3 | **Authenticated staging browser QA incomplete** (Vercel protection) | Operator must complete checklist §10 before go |
| P0-4 | **Production Stripe live continuity** after tip promote unproven in this session | Operator verify live keys/webhooks remain Production-scoped; no staging secrets |

No new Critical authz/tenant bugs found in this pass’s regression suites. Historical Critical C01 remains remediated (SS-SEC-005).

### P1 — Must resolve before launch

| ID | Finding | Disposition |
| --- | --- | --- |
| P1-1 | **12 project APIs missing from SEC-007 route registry** | **Fixed in working tree** (`route-registry.ts`); tests green — **commit before promote** |
| P1-2 | Staging Stripe historically **not fully proven** (SS-REL-004) | Does not block prod if Production Stripe stays correct; verify post-deploy smoke |
| P1-3 | Uncommitted readiness docs / registry fix | Commit onto `staging` before promote |
| P1-4 | Customer UX blast radius (real clients get new portal) | Confirm product acceptance of full tip (assumed from business priority) |

### P2 — Deferrable

| ID | Finding |
| --- | --- |
| P2-1 | `tsc --noEmit` fixture failures in TIP/QBR/recommendations tests (12 errors) — **not in `src/` app compile**; `npm run build` passes |
| P2-2 | ESLint 22 preexisting warnings |
| P2-3 | SEC-001-M09 / L01 / L04 residual |
| P2-4 | Minor copy / visual polish |

---

## 4. Database migration readiness

### Inventory (not on `main`)

| Order | Migration | Type | Destructive? |
| --- | --- | --- | --- |
| 1 | `20260425010000_auth_rate_limit_bucket` | Additive `AuthRateLimitBucket` | **No** |
| 2 | `20261030100000_project_tasks_milestones_recommendations` | New enums/tables + **backfill** `ProjectRecommendation` from `Project.recommendationId` | **No DROP**; INSERT backfill only |
| 3 | `20261030120000_project_customer_updates` | Additive `ProjectCustomerUpdate` | **No** |

Ordering timestamps are chronological (20260425 → 20261030). Compatible with existing production schema on `main` tip.

### Data preservation

- No `DROP TABLE` / `DROP COLUMN` / truncate in these migrations.
- Backfill uses `gen_random_uuid()` — already used in older production migrations (`20250630*`); Neon historically supports it.
- Unique on `ProjectRecommendation.recommendationId` means one primary project link per recommendation; `ON CONFLICT DO NOTHING` skips duplicates safely.

### Application dependencies

| Migration | App feature |
| --- | --- |
| Auth rate limit | SEC-004 login/reset/snapshot limits |
| Tasks/milestones/recs | Customer + staff project delivery UX |
| Customer updates | Manual project update emails (SS-UX-015) |

### Production migration plan (authorized deploy only)

1. Neon Production backup / snapshot (Neon PITR or branch checkpoint).
2. Confirm Production `DATABASE_URL` on Vercel Build + Runtime.
3. Deploy app tip → `vercel-build` runs `prisma migrate deploy` (unless `SKIP_PRISMA_MIGRATE=1`, in which case run migrate manually **before** traffic).
4. Verify `_prisma_migrations` contains the three new names; spot-check tables exist.
5. Smoke health + login + one staff project page.

**Do not run migrations against production from this readiness ticket.**

### Rollback considerations

| Layer | Strategy |
| --- | --- |
| App | Vercel promote previous Production deployment |
| DB | Migrations are **not safely reversible** by down-migration. Keep schema; roll app back. Forward-fix if defect. |
| Recovery | Neon point-in-time restore only if catastrophic corruption (unlikely for additive DDL) |

---

## 5. Environment configuration

Compare by **names only** — no secrets copied.

| Variable | Production need | Staging need | Notes |
| --- | --- | --- | --- |
| `DATABASE_URL` | Neon **Production** | Neon **Staging** | Must remain distinct |
| `AUTH_SECRET` | Prod secret | Staging secret | Do not share |
| `AUTH_URL` | `https://stackscore.tech` | `https://staging.stackscore.tech` | |
| `NEXT_PUBLIC_APP_URL` | Same as AUTH_URL | Staging URL | |
| `STRIPE_SECRET_KEY` | **Live** `sk_live_…` | **Test** `sk_test_…` | Never copy staging→prod |
| `STRIPE_*_PRICE_ID` | Live prices | Test prices | |
| `STRIPE_WEBHOOK_SECRET` | Prod endpoint secret | Staging endpoint (+ bypass query if used) | |
| `RESEND_API_KEY` / `RESEND_WEBHOOK_SECRET` | Prod | Staging | |
| `EMAIL_FROM` | Prod sender | Staging | |
| `EMAIL_ASSET_BASE_URL` | Optional; tip docs default `https://stackscore.tech` | Optional | `.env.example` comment-only delta |
| `CRON_SECRET` | Required | Required | |
| `WEBSITE_LEADS_API_SECRET` | Required | Required | |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | N/A for public prod | Staging protection bypass for webhooks | Edge only |

**Findings:** No new required env **names** for the demo itself. Tip only changes `.env.example` commentary for email assets. Operator must dual-check Vercel Production vs Staging Stripe/Resend/DB hosts before promote (historical SS-REL-004 gap on staging does not authorize mixing credentials).

---

## 6. Security verification

| Control | Result |
| --- | --- |
| Authentication / password policy | **PASS** (tests + SEC-003/004 code) |
| Tenant isolation | **PASS** (`api-client-isolation`, lifecycle isolation) |
| Admin / technician boundaries | **PASS** (code + prior REL-002-R1 staff samples) |
| Customer access controls | **PASS** (workspace helpers + tests) |
| Demo data isolation | **PASS** (fixtures; no Prisma tenant reads) |
| API registry completeness | **PASS after fix** (was P1-1) |
| Rate limiting | **Implemented**; production table arrives with migration #1 |
| Stripe webhook signature | **PASS (code)** — `constructEvent` |
| Email-trigger authorization | Project updates staff-gated; send requires `confirm: true` |
| Residual open SEC items | M09, L01, L04 — **not Critical** |

Security is **not marked complete solely because tests pass** — staging authenticated browser + production post-deploy smoke remain required.

---

## 7. Stripe and subscription workflows

| Flow | Validation this pass |
| --- | --- |
| Architecture (assessment payment + vCIO subscription) | **PASS (code review)** |
| Webhook signature + idempotency | **PASS (code + `tests/stripe` 16/16)** |
| Checkout rate limits (SEC-007) | **PASS (code)** |
| Live payments | **Not triggered** (forbidden) |
| Stripe test-mode end-to-end on staging | **Not re-proven** (protection / prior REL-004) |
| Diff vs `main` | Small: checkout rate-limit wiring + confirmation helper (`eebbaa1`, `e6471a9`) |

**Production risk:** Low code churn on Stripe; high operational risk if env scopes are wrong. Post-deploy: one **test** assessment checkout is **not** available on live keys — use Stripe Dashboard webhook delivery logs + a controlled low-value live check only with separate authorization.

---

## 8. Communications and customer updates

| Check | Result |
| --- | --- |
| Templates / Resend registry | Present; EMAIL-011 for project updates |
| Project customer updates | **Manual only** — `Never auto-sends` in `customer-update-service.ts`; send API requires `confirm: true` |
| Preview / edit / send | Staff APIs under `/api/v1/projects/[id]/customer-updates/**` |
| Automatic customer update delivery | **Not enabled** |
| Unit coverage | `ss-ux-015-project-communications` **15/15 pass** |

No production emails sent in this pass.

---

## 9. Automated validation results

| Gate | Result |
| --- | --- |
| Targeted regression (demo, UX customer, admin CC, auth, stripe, lifecycle) | **177/177 pass** |
| `tests/api/route-registry.test.ts` after registry fix | **8/8 pass** |
| `npm run lint` | **0 errors** / 22 warnings |
| `npm run build` | **PASS** |
| `npx tsc --noEmit` | **12 errors — all in `tests/**` fixtures** (TIP/QBR/recommendations/technology-profile) |

### TypeScript fixture failure analysis

| Risk? | Conclusion |
| --- | --- |
| Genuine runtime release risk? | **No** — Next production build typechecks application graph successfully |
| Isolated test-fixture drift? | **Yes** — outdated TIP report shapes / priority typing / EventTarget mocks |
| Action | **Defer (P2)** — track cleanup; do not block release |

---

## 10. Browser validation

| Target | Result |
| --- | --- |
| `https://staging.stackscore.tech` | **BLOCKED** — Vercel Authentication |
| `https://stackscore.tech/` | **Inspected** — legacy green gateway homepage |
| `https://stackscore.tech/login` | **Inspected** — legacy green login |
| `https://stackscore.tech/demo` | **Inspected** — legacy green interactive tour (Budget/Proposal/legacy pillars) |
| Authenticated customer/admin/tech | **Not performed** |
| Stripe test checkout UI | **Not performed** |
| Viewports 1440 / 768 / 390 (new UX) | **Not performed** |

**Do not claim browser validation passed for the redesigned platform.**

### Manual QA checklist (operator)

Use staging with Vercel login or Protection Bypass, then repeat smoke on production after promote:

**Public (390 / 768 / 1440)**

1. `/` purple homepage; CTAs to Sign In, assessment, demo  
2. `/login`, forgot password, activate account pages render  
3. `/demo` → Overview; nav Overview/Explore/Roadmap/Projects/Reports; DEMO ENVIRONMENT; Sign in  
4. Retired demo URLs redirect; `/api/product-overview/pdf` → 410  
5. No `$` speculative pricing in demo  

**Customer (authenticated)**

6. Overview / Explore / Roadmap / Projects / Project detail / Reports  
7. Assessment access for owned client only  
8. Mobile nav usable at 390  

**Admin / technician**

9. Command Center loads  
10. Clients, Projects, Leads, Recurring Services, Communications, Operations  
11. Technician cannot hit admin-only routes (sample 403)  
12. Project update: preview → edit → send requires confirm; no auto-send  

**Payments (careful)**

13. Confirm Production Stripe webhook deliveries succeed post-deploy  
14. Do not use staging secrets on production  

---

## 11. Deployment strategy

### Preference

**Full staging tip promotion** (`aa90298` **plus** commit of registry fix + REL docs) → Production.

Selective cherry-pick of demo/branding **without** customer portal + migrations is **unsafe** (SS-REL-017A).

### Release commit

1. Commit route-registry remediation + SS-REL-017 / 017A docs on `staging`.  
2. Tag or record SHA as **RC** (example: `aa90298` + follow-up = new tip).  
3. Promote that SHA via Vercel Production deploy (or merge `staging`→`main` **only when authorized** — this ticket does not merge).

### Deployment order

1. Pre-check Production env names/scopes (DB, Auth, Stripe live, Resend).  
2. Neon Production backup/PITR note.  
3. Deploy RC → migrate deploy → `next build`.  
4. Smoke: `npm run smoke -- https://stackscore.tech`  
5. Manual QA checklist §10 (subset).  
6. Monitor Vercel logs, Stripe webhooks, Resend, Neon.  
7. Hold / rollback if smoke fails.

### Monitoring

- Vercel deployment + runtime errors  
- `/api/v1/health` → `{status:"ok"}` only  
- Stripe webhook success rate  
- Resend bounce/complaint  
- Auth rate-limit table growth / 429s  

### Go / no-go criteria

| Criterion | Required |
| --- | --- |
| Explicit written deploy authorization | **Yes** |
| RC includes registry fix + docs | **Yes** |
| Operator staging browser checklist complete | **Yes** |
| Production env dual-check (Stripe/DB isolation) | **Yes** |
| Migrations plan acknowledged (additive, irreversible by down) | **Yes** |
| Lint/build/regression green on RC | **Yes** |
| `tsc` fixture failures accepted as P2 | **Yes** |
| SS-SNAP-001 / new features excluded | **Yes** |

---

## 12. Rollback plan

1. **Immediate:** Vercel → Production → Promote previous deployment.  
2. **DB:** Leave additive migrations in place; do not drop tables.  
3. **If migrate failed mid-deploy:** Fix forward; do not rewrite migration history.  
4. **Comms:** Notify staff if public demo/homepage branding rolled back.  
5. **Stripe:** Confirm webhook endpoint still points at live production after app rollback.

---

## 13. Go / no-go recommendation

| Question | Answer |
| --- | --- |
| Is the business-priority platform on `staging`? | **Yes** (`aa90298`) |
| Is automated quality acceptable? | **Yes** (build + targeted tests) |
| Can we deploy without operator gates? | **No** |
| Smallest coherent release? | **Full tip promotion** (customer + admin + brand + demo + security + migrations) |
| Deploy now from this ticket? | **NO** |

### Final call

**CONDITIONAL GO** after:

1. Explicit production authorization  
2. Commit P1-1 registry fix + readiness docs  
3. Operator completes staging authenticated browser QA  
4. Production env / Stripe / Neon preflight  
5. Execute §11 deployment order with rollback ready  

**Stop.** Wait for explicit authorization before production deployment.

---

## Appendix A — Concise release checklist

See [`SS-REL-017-DEPLOYMENT-CHECKLIST.md`](SS-REL-017-DEPLOYMENT-CHECKLIST.md).

## Appendix B — Commands run

```text
git rev-parse origin/main origin/staging
git log --oneline origin/main..origin/staging
npm test -- tests/public-demo tests/stripe tests/auth/... tests/ux/... tests/dashboard/ss-admin-004... 
npm test -- tests/api/route-registry.test.ts
npm run lint
npm run build
npx tsc --noEmit
```
