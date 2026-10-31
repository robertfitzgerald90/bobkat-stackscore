# SS-REL-017-R5 — Production Deployment Verification

| Field | Value |
| --- | --- |
| Date | 2026-10-30 (America/Chicago) |
| Authorization | Product owner — controlled production deployment approved |
| Approved release SHA | `39d9ef8e8e4f87cff2ba5bde4a978b2e174b64a3` |
| Production URL | https://stackscore.tech |
| Final status | **DEPLOYED — public smoke PASS; authenticated prod workflows not re-tested in this session** |

---

## 1. Safety verification (pre-mutation)

| Check | Result |
| --- | --- |
| `origin/staging` contains `39d9ef8` | **PASS** (ancestor; tip later had docs-only `a13f4c5` which was **not** promoted) |
| Release candidate unchanged | **PASS** — promoted exactly `39d9ef8` |
| Working tree clean of release edits | **PASS** |
| `main` fast-forward to `39d9ef8` | **PASS** (`3d43662` → `39d9ef8`, 51 commits) |
| Neon recovery snapshot available | **PASS** — `snap-morning-waterfall-atig4xhl` (`production at 2026-10-31 02:47:02 UTC (manual)`) |
| Production DB target | **PASS** — `bobkat-stackscore-prod` / branch `production` / db `neondb` / host `ep-autumn-wave-atiercwu` |
| Production env intact | **PASS** — required names present (`DATABASE_URL`, Auth, Stripe, Resend, `NEXT_PUBLIC_APP_URL`, etc.); secrets not overwritten |

---

## 2. Migration results

Executed against Production Neon **before** application promote:

| Migration | Result |
| --- | --- |
| `20260425010000_auth_rate_limit_bucket` | **Applied** |
| `20261030100000_project_tasks_milestones_recommendations` | **Applied** |
| `20261030120000_project_customer_updates` | **Applied** |

Post-check: `npx prisma migrate status` → **Database schema is up to date!** (33 / 33)

No `migrate reset`, no `db push`, no record mutation beyond migration DDL/backfill.

---

## 3. Application promotion

| Step | Result |
| --- | --- |
| `git checkout main` + `merge --ff-only 39d9ef8` | **PASS** |
| `git push origin main` | **PASS** (`3d43662..39d9ef8`) |
| Vercel Production deploy started | **PASS** |
| Deployment Ready | **PASS** (~3m build) |
| Deployed commit | **`39d9ef8`** (matches `origin/main`; deployment created from this push) |
| Production aliases | `https://stackscore.tech`, `https://stackscore.bobkatit.com`, project `.vercel.app` |

### Deployment identity

| Field | Value |
| --- | --- |
| Deployment ID | `dpl_BxFWva1WEWZuf58Ses2jKDK3H8tp` |
| Deployment URL | https://bobkat-stackscore-2zodgoael-robertfitzgerald90-8984s-projects.vercel.app |
| Environment | Production |
| Created | 2026-10-30 ~22:44 CDT |
| Status | Ready |
| Build duration | ~3m 7s |

Note: Production still has `SKIP_PRISMA_MIGRATE` set; migrations were applied manually first (correct ordering for this tip).

---

## 4. Production smoke-test results

### Public experience — **PASS**

| Check | Result |
| --- | --- |
| Homepage `https://stackscore.tech` | **PASS** — redesigned title “Technology Intelligence by Bobkat IT”; purple-first hero |
| Sign-in `/login` | **PASS** — email/password form, Forgot Password, Activate Account |
| Purple interactive demo `/demo/overview` | **PASS** — Northstar Manufacturing fictional sample; StackScore 60 |
| Demo navigation | **PASS** — Overview / Explore / Roadmap / Projects / Reports all **200** |
| Fictional-data notice | **PASS** — explicit fictional/sample copy present |
| Legacy `/demo` | **PASS** — redirects (307) |
| Legacy `/product-overview` | **PASS** — redirects (308) |
| Legacy `/api/product-overview/pdf` | **PASS** — **410** |
| Health `/api/v1/health` | **PASS** — `{"status":"ok"}` (SEC-007 minimal payload) |

### Customer experience (authenticated production) — **NOT PERFORMED**

No production customer credentials used in this session. Product owner previously confirmed staging customer workspace. Operator should spot-check live customer Overview → Explore → Roadmap → Projects → Reports → PDF on production when convenient.

### Administrative experience (authenticated production) — **NOT PERFORMED**

Same constraint. PO confirmed staging admin workspace. Spot-check Command Center, Clients, Projects, Leads, Recurring Services, Communications, Operations on production recommended.

### Integrations

| Check | Result |
| --- | --- |
| Database connectivity | **PASS** — migrate status + demo/app serving against Production Neon |
| Authentication surface | **PASS** — login UI loads; full login not exercised |
| Stripe configuration | **Present** in Vercel Production env (names); **recent webhook delivery health not queried** this session |
| Resend configuration | **Present** in Vercel Production env (names); no outbound test send |
| API health | **PASS** |

No live purchases initiated. No unsolicited customer emails sent.

---

## 5. Outstanding issues / follow-ups

1. **Authenticated production smoke** — customer + admin paths not logged in this session; recommend quick operator pass.
2. **Stripe webhook delivery health** — confirm in Stripe Dashboard that the production endpoint is healthy after deploy.
3. **Staging tip** `a13f4c5` (R4 NO-GO doc) remains ahead of production on `staging` only — intentional; production is exactly `39d9ef8`.
4. Consider documenting whether `SKIP_PRISMA_MIGRATE` should remain set long-term (manual migrate discipline).

---

## 6. Rollback reference

| Layer | Action |
| --- | --- |
| Application | Promote prior Ready Production deployment in Vercel (previous Ready: `bobkat-stackscore-my3oosrvr-…`, ~7d prior) |
| Database | Additive migrations are **not** down-migrated; app rollback leaves new tables in place. Emergency recovery: Neon snapshot `snap-morning-waterfall-atig4xhl` |
| Git | `main` at `39d9ef8`; prior production tip was `3d43662` |

---

## 7. Final deployment status

# **PRODUCTION DEPLOYMENT COMPLETE**

- Migrations applied  
- `main` @ `39d9ef8` live on `stackscore.tech`  
- Public + demo smoke **PASS**  
- Authenticated customer/admin production login paths **not re-verified in-session** (await optional operator spot-check)
