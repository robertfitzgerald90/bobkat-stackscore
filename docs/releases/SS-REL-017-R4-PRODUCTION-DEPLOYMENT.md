# SS-REL-017-R4 — Production Deployment Gate

| Field | Value |
| --- | --- |
| Date | 2026-10-30 |
| Source | `staging` |
| Target | `main` → Vercel Production (`stackscore.tech`) |
| Final release SHA | `39d9ef8e8e4f87cff2ba5bde4a978b2e174b64a3` |
| Decision | **NO-GO — stop before production mutation** |

Phases **1–3** complete. Phase **4** staging browser QA is **blocked**. Phase **5** gate therefore remains **NO-GO** until the operator confirms critical staging workflows (or clears Vercel Authentication for automation). Phases **6–8** not started.

---

## 1. Final release SHA

| Item | Value |
| --- | --- |
| SHA (full) | `39d9ef8e8e4f87cff2ba5bde4a978b2e174b64a3` |
| SHA (short) | `39d9ef8` |
| Subject | fix SS-REL-017-R4 release blockers for PDF typing and maturity test |
| Parent tip | `a37d40c` (*ss-fix pdf reports* — SS-REL-017-R3 PDF remediation) |
| Includes RC | `3748bfb` (SEC-007 route registry + platform redesign) is an ancestor |
| `origin/staging` | **Current** at `39d9ef8` |
| Working tree | Clean of release files (local PDF fixture churn discarded) |
| Commits vs `origin/main` | 51 commits |

---

## 2. Regression results (Phase 2)

| Gate | Result |
| --- | --- |
| Auth / rate-limit / activation / password / snapshot | **PASS** |
| Tenant isolation (`api-client-isolation`) | **PASS** |
| API route-registry + SEC-007 public guardrails | **PASS** |
| Customer UX suites (`tests/ux`) | **PASS** |
| Admin suites (`tests/admin`) | **PASS** |
| Assessments + executive summary | **PASS** |
| PDF (`ss-rel-017-r3`, paper-safe pilot) | **PASS** |
| Public demo (`ss-web-003*`) | **PASS** |
| Stripe unit suites | **PASS** |
| Reliability SS-REL-015 / SS-REL-016 | **PASS** (SS-REL-016 assertion updated to Overview hero after UX decomposition) |
| `npm run lint` | **0 errors** (22 preexisting warnings) |
| `npm run build` | **PASS** |
| `npx tsc --noEmit` | **12 errors, all in `tests/**` only** — matches R1 baseline; **no `src/` errors** after PDF style fix |

Release-blocking fixes landed in `39d9ef8` (PDF `Style` nullability + maturity wiring test path).

---

## 3. Production configuration status (Phase 3)

Verified via Vercel CLI (`bobkat-stackscore` Production env **names**; secret values not printed):

| Variable | Status |
| --- | --- |
| `DATABASE_URL` | Present (Secret) |
| `AUTH_SECRET` | Present |
| `AUTH_URL` / `NEXTAUTH_URL` | Present (values redacted by CLI pull) |
| `NEXT_PUBLIC_APP_URL` | **`https://stackscore.tech`** |
| `STRIPE_SECRET_KEY` / webhook / assessment price | Present |
| `RESEND_API_KEY` / `RESEND_WEBHOOK_SECRET` / `EMAIL_FROM` | Present (`EMAIL_FROM=StackScore <support@bobkatit.com>`) |
| `CRON_SECRET` / `WEBSITE_LEADS_API_SECRET` | Present |
| `SKIP_PRISMA_MIGRATE` | **Present** — Vercel build **will not** auto-migrate |

No Production credentials were recreated or overwritten.

Product-owner statement accepted: Production credentials were configured before the redesign and have processed real purchases.

---

## 4. Neon recovery status

| Item | Value |
| --- | --- |
| Project | `bobkat-stackscore-prod` (`morning-heart-77783541`) |
| Branch | `production` (`br-fancy-frost-at9ut2q6`) |
| Snapshot ID | `snap-morning-waterfall-atig4xhl` |
| Snapshot name | `production at 2026-10-31 02:47:02 UTC (manual)` |
| Created | `2026-10-31T02:47:03Z` |
| Manual | **true** |
| Availability | **Verified via Neon API** this session |

---

## 5. Migration readiness

Production Neon (`neondb` @ `ep-autumn-wave-atiercwu`) migrate status:

**33** migrations in repo; **3 pending** (not yet applied):

1. `20260425010000_auth_rate_limit_bucket` — additive `AuthRateLimitBucket`
2. `20261030100000_project_tasks_milestones_recommendations` — additive tables/enums + **INSERT** backfill only
3. `20261030120000_project_customer_updates` — additive `ProjectCustomerUpdate`

| Check | Result |
| --- | --- |
| Already applied on production? | **No** (all three pending) |
| Ordering | Correct (timestamp order) |
| Destructive ops | **None** (no DROP of customer/payment tables) |
| `migrate reset` / `db push` | **Forbidden** |

### Required application / migration ordering

Because Production sets `SKIP_PRISMA_MIGRATE`, Vercel will **not** run `prisma migrate deploy` during build.

**Authorized order when Phase 6 is cleared:**

1. **Apply the three migrations first** against Production Neon (`neondb`) via `npm run db:migrate:deploy` with Production `DATABASE_URL` (additive — current production app remains compatible).
2. **Then** merge `39d9ef8` → `main` and push to trigger Vercel Production deploy.
3. Confirm Production deployment healthy + smoke.

Do **not** ship the new app version against a schema missing the three migrations.

---

## 6. Staging validation status (Phase 4)

| Check | Result |
| --- | --- |
| `https://staging.stackscore.tech/demo/overview` | **BLOCKED** — Vercel Authentication login interstitial |
| Authenticated customer / admin workflows | **NOT PERFORMED** |
| Public demo navigation after PDF remediation | **NOT PERFORMED** |

Do **not** treat these as passed.

### Operator confirmation required

Please confirm on `https://staging.stackscore.tech` (after Vercel SSO / Protection Bypass):

1. Public homepage + sign-in render  
2. Demo Overview → Explore → Roadmap → Projects → Reports (fictional data only)  
3. Customer Overview / Explore / Roadmap / Projects / Reports + PDF download  
4. Admin Command Center / Clients / Projects / Leads / Recurring Services / Communications  

Reply with confirmation (or paste a brief checklist) to clear this gate.

---

## 7. Exact production deployment procedure (ready when GO)

```text
# A. Migrations FIRST (Production Neon only — never reset)
npx neonctl connection-string production --project-id morning-heart-77783541 --database-name neondb --prisma
# set DATABASE_URL from that string in the shell without logging it
npm run db:migrate:deploy
npx prisma migrate status   # expect: Database schema is up to date

# B. Promote application
git checkout main
git pull origin main
git merge --ff-only 39d9ef8   # or merge origin/staging at that SHA
git push origin main

# C. Verify Vercel Production deployment for bobkat-stackscore
npx vercel ls bobkat-stackscore --prod
# confirm Ready + health

# D. Smoke
curl -sS https://stackscore.tech/api/v1/health
# then browser smoke per Phase 7 of SS-REL-017-R4 ticket
```

Rollback reference: promote prior Vercel Production deployment for the app; DB tables from additive migrations remain (forward-fix only — no down-migrate). Recovery snapshot: `snap-morning-waterfall-atig4xhl`.

---

## 8. GO / NO-GO

# **NO-GO**

Mandatory Phase **4** staging browser validation is unresolved. Per ticket rules: stop before modifying production.

**Cleared so far:** RC SHA · regression · build · Neon snapshot · additive migration plan · Production env names · PO deploy intent for PDF/platform tip.

**Blocking:** Operator confirmation of critical staging workflows (or removal of the Vercel Authentication barrier for automation).

When staging is confirmed, re-run Phase 5 → proceed Phase 6–8 without new features or scoring/billing changes.

---

## 9. Deployment / smoke results

| Item | Status |
| --- | --- |
| Production deployment ID | *Not started* |
| Deployment timestamp | *Not started* |
| Migration results | Pending apply (inventory complete) |
| Production smoke | *Not started* |
| Final release status | **NO-GO (pre-promotion)** |
