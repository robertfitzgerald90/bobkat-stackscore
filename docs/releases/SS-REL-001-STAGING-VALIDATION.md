# SS-REL-001 — Consolidated Staging Release Validation

| Field | Value |
| --- | --- |
| Status | **Complete (validation report)** — staging runtime largely **BLOCKED** |
| Date | 2026-10-25 |
| Branch validated (git) | `staging` @ `eebbaa10b6472109bfd64d658f9285b242a30838` (`SS-API GUARDRAILS`) |
| Remote sync | Local `HEAD` ≡ `origin/staging` |
| Ahead of `main` | **8 commits** (includes SS-SEC-002…007 / env / learn-page commits) |
| Scope | Release validation only — no features, architecture changes, migrations, deploys, or commits |
| Related | SS-SEC-001…007, SS-ENV-001/003, `docs/50-Development/ENVIRONMENTS.md` |

### Status legend

| Status | Meaning |
| --- | --- |
| **PASS** | Evidence collected in this run supports the check |
| **FAIL** | Evidence shows the check does not meet release criteria |
| **BLOCKED** | Cannot complete without operator action / credentials / access |
| **NOT TESTED** | Intentionally not executed (constraint, dependency on blocked item, or out of scope) |

### Final recommendation

# **NOT READY**

Staging release validation is **incomplete**. Deployed staging is unreachable behind Vercel Authentication; Neon isolation vs production cannot be dual-confirmed from this workstation; and the Neon database reachable via local `.env` has **not** applied `20260425010000_auth_rate_limit_bucket`. Do **not** promote to production until the blockers in §9 are cleared and live staging checks are re-run.

---

## 1. Executive summary

SS-REL-001 attempted end-to-end validation of the security hardening release candidate on `staging`.

**What was confirmed locally (code / CI gates):**

- Git branch is `staging` and matches `origin/staging` at `eebbaa1`.
- Full Vitest suite **641/641** passed; ESLint **0 errors**; production `npm run build` succeeded earlier in this session.
- Lockfile includes intended SEC-006 versions: `next@15.5.28`, `next-auth@5.0.0-beta.32`, `sharp@0.35.5`.
- Automated security regressions (route registry, public endpoint guardrails, rate-limit, password policy, client isolation, continue-assessment) **PASS** in unit/integration tests.

**What blocked live staging validation:**

| Blocker | Impact |
| --- | --- |
| `https://staging.stackscore.tech` returns Vercel Authentication login (`title=Login - Vercel`, `X-Matched-Path=/login`) for `/api/v1/health` and other paths | Cannot smoke health, auth, APIs, or workflows against deployed staging |
| No Vercel CLI / GitHub CLI / linked `.vercel` project on this machine | Cannot read Preview/Staging vs Production env var scopes or deployment SHA |
| Staging vs Production Neon host IDs not dual-confirmed | Isolation evidence incomplete — **no migrate executed** (per constraint) |
| Local Neon (`ep-autumn-wave-…`) missing SEC-004 migration / `AuthRateLimitBucket` table | Rate-limit runtime cannot be claimed on that database |

**Production observation (baseline only, not a staging PASS):**

- `GET https://stackscore.tech/api/v1/health` → JSON with `checks` + `environment` (pre–SS-SEC-007 shape). Confirms production has **not** received the staging security RC (expected).

---

## 2. Environment isolation evidence

| Check | Status | Evidence |
| --- | --- | --- |
| Current branch is `staging` | **PASS** | `git branch --show-current` → `staging`; `HEAD` = `eebbaa10…` |
| Local matches intended RC tip | **PASS** | `HEAD` ≡ `origin/staging`; tip message `SS-API GUARDRAILS` |
| Deployed staging matches RC SHA | **BLOCKED** | Staging host serves Vercel login HTML, not app responses; no deployment metadata API available without Vercel access |
| Staging vs production separate Neon DBs | **BLOCKED** | Cannot read Vercel Production vs Preview/Staging `DATABASE_URL` hosts. Local `.env` Neon host fingerprint: `ep-autumn-wave-atiercwu.c-9.us-east-1.aws.neon.tech` / db `neondb`. Production Neon host **not** available for comparison in this session. |
| Distinct `AUTH_SECRET` staging vs production | **BLOCKED** | Secrets not readable from Vercel; local presence only (`AUTH_SECRET` length=44). Values not disclosed. |
| Staging env vars reference correct services | **BLOCKED** | Requires Vercel project Settings → Environment Variables (Preview/Staging vs Production) |
| Production data not accessible via staging | **BLOCKED** (circumstantial only) | Read-only aggregates on local Neon: `clients=1`, `users=4`, `assessments=2`, `websiteLeads=0`, `snapshotLeads=2` — consistent with seed/staging scale, **not** proof of isolation. |
| Production data safety (no prod migrate) | **PASS** | No `migrate deploy` / prod DB write performed |

**Stop rule honored:** Database isolation was **not** confirmed → **no migrations executed**.

### Manual operator actions required (isolation)

1. In **Vercel → Project → Settings → Environment Variables**, record (hosts only, never paste secrets into tickets):
   - Production `DATABASE_URL` Neon endpoint hostname
   - Preview/Staging `DATABASE_URL` Neon endpoint hostname  
   Confirm they differ.
2. Confirm Production vs Staging/Preview `AUTH_SECRET` are distinct (compare fingerprints/lengths in UI only).
3. Confirm Staging `AUTH_URL` / `NEXT_PUBLIC_APP_URL` = `https://staging.stackscore.tech` (or the actual staging alias).
4. Confirm Stripe/Resend/cron secrets for Staging are **test / non-prod** scoped.
5. Provide a **Protection Bypass for Automation** secret or Shareable Link / Vercel team login so validators can reach the app behind Deployment Protection.

---

## 3. Migration status

| Check | Status | Evidence |
| --- | --- | --- |
| Prisma migration status (local `.env` Neon) | **FAIL** (pending) | `npx prisma migrate status` against local `DATABASE_URL` host `ep-autumn-wave-…`: **31** migrations in repo; **pending:** `20260425010000_auth_rate_limit_bucket` |
| SEC-004 `AuthRateLimitBucket` applied | **FAIL** on reachable Neon | `to_regclass('public."AuthRateLimitBucket"')` → `null`; `_prisma_migrations` has **30** finished rows; last finished = `20250726000000_admin_audit_event` |
| Staging Neon (deployed) migrate status | **BLOCKED** | Cannot prove local `.env` Neon ≡ Vercel Staging Neon; cannot query via staging HTTP |
| Production migrate / modify | **NOT TESTED** / not performed | Explicitly forbidden; not attempted |

### Exact pending migration (reachable DB)

```text
20260425010000_auth_rate_limit_bucket
```

**Required action (operator, staging Neon only after isolation confirmed):**

```powershell
# ONLY after confirming DATABASE_URL host is staging Neon (not production)
$env:DATABASE_URL = "<STAGING_NEON_URL>"
npx prisma migrate status    # expect pending SEC-004
npx prisma migrate deploy    # apply AuthRateLimitBucket
npx prisma migrate status    # expect up to date
```

Do **not** run against production. Do **not** use `db push` for this release.

---

## 4. Authentication validation results

| Check | Status | Evidence |
| --- | --- | --- |
| Login / logout (deployed staging) | **BLOCKED** | Staging host gated by Vercel Authentication |
| Invalid credentials (deployed) | **BLOCKED** | Same |
| Password-reset request/confirm (deployed) | **BLOCKED** | Same — also avoid real customer email; needs staging Resend + test mailbox |
| Account activation (deployed) | **BLOCKED** | Same |
| Password policy enforcement | **PASS** (automated) | `tests/auth/password-policy.test.ts` — 11 passed (min length 10, reject short before token consume) |
| Auth rate limiting | **PASS** (automated) / **FAIL** (runtime on reachable Neon) | Unit/integration: `tests/auth/rate-limit.test.ts` 29 passed. Runtime: `AuthRateLimitBucket` **missing** on local Neon → durable limits cannot work until migrate |
| Session persistence (deployed) | **BLOCKED** | Staging inaccessible |
| Client vs staff authorization | **PASS** (automated) | `tests/auth/api-client-isolation.test.ts` — 14 passed |
| Continue-assessment hardening | **PASS** (automated) | `tests/auth/continue-snapshot-security.test.ts` included in security subset |
| Post–SEC-006 dependency auth smoke (deployed) | **BLOCKED** | Needs live staging after unlock |
| Production CSRF reachable | **PASS** (baseline) | `GET https://stackscore.tech/api/auth/csrf` → 200 + `csrfToken` (production, not staging RC) |

---

## 5. API security validation results

| Check | Status | Evidence |
| --- | --- | --- |
| All API routes classified | **PASS** (automated) | `tests/api/route-registry.test.ts` — filesystem ≡ `API_ROUTE_REGISTRY` (112 routes) |
| Public endpoints intentionally accessible (deployed staging) | **BLOCKED** | Staging returns Vercel login HTML for `/api/v1/health`, `/api/auth/csrf`, etc. |
| Protected endpoints reject unauthorized (deployed) | **BLOCKED** | Cannot invoke staging APIs |
| Client data isolation | **PASS** (automated) | Isolation test suite above |
| Admin role enforcement | **PASS** (automated / inventory) | Covered by isolation + registry classifications; live admin calls **NOT TESTED** on staging |
| Public endpoint rate limits (deployed) | **BLOCKED** | Staging gated; even if unlocked, staging Neon must have SEC-004 table |
| Website-leads durable counters | **PASS** (code/tests) / **BLOCKED** (deployed) | Wiring tests assert `enforceWebsiteLeadsIpLimits`; live POST **NOT TESTED** |
| Health disclosure remediation on staging | **BLOCKED** | Cannot read staging health JSON |
| Health disclosure on production (baseline) | **FAIL** vs SEC-007 target (expected pre-promote) | Production still returns `checks` + `environment` — confirms RC not on prod |

---

## 6. Business workflow validation results

All live workflow checks against **deployed staging** are **BLOCKED** (Vercel Authentication). No real customer emails or live Stripe charges were attempted.

| Check | Status | Notes |
| --- | --- | --- |
| Assessment creation | **BLOCKED** | Needs staging app + staff/client test account |
| Assessment completion | **BLOCKED** | Same |
| Recommendation generation | **BLOCKED** | Same |
| Client portal access | **BLOCKED** | Same |
| PDF generation | **BLOCKED** | Product-overview PDF + assessment PDF; also needs rate-limit table for public PDF |
| Checkout session creation | **BLOCKED** | Must use Stripe **test mode** keys on staging only |
| Website-lead submission | **BLOCKED** | Must use staging `WEBSITE_LEADS_API_SECRET`; no production CRM fan-out |

**Automated substitutes (not a substitute for staging smoke):** Stripe route wiring + website-leads schema/auth tests pass in Vitest.

---

## 7. Automated quality gate results

| Gate | Status | Exact result |
| --- | --- | --- |
| Full Vitest suite | **PASS** | `133` files / **641** tests passed (2026-10-25) |
| ESLint | **PASS** | **0** errors; **32** preexisting warnings (unused vars / hooks) |
| TypeScript `tsc --noEmit` | **FAIL** (preexisting) | Errors confined to `tests/**` fixtures (customer-portal, tip, env, layout regex target, etc.). **No new SEC/REL source errors identified.** Classify as **existing issue**, not SEC-007 regression. |
| Production build (`npm run build`) | **PASS** | Compiled successfully (exit 0) in this validation window; expected dynamic-route “headers” noises during static analysis |
| Production dependency audit (`npm audit --omit=dev`) | **FAIL** (residual) | **5** vulnerabilities (**4 high**, **1 moderate**, **0 critical**): `nanoid`, `postcss` (via `next`), `source-map-js`, `fast-uri`. SEC-006 Auth.js/Next critical set appears upgraded (`next@15.5.28`, `next-auth@5.0.0-beta.32`). Remaining audit items are **outstanding** — triage before prod or accept with owner sign-off. |
| Prisma migrate status (reachable Neon) | **FAIL** | Pending `20260425010000_auth_rate_limit_bucket` |

### Existing vs new

| Item | Classification |
| --- | --- |
| `tsc` errors under `tests/**` | **Existing** |
| ESLint unused-var warnings | **Existing** |
| `npm audit` high on postcss/nanoid/source-map-js/fast-uri | **Existing residual** after SEC-006 (not Auth.js critical set) |
| Missing `AuthRateLimitBucket` on reachable Neon | **Outstanding ops** (migration never applied to that DB) |
| Staging Vercel Authentication blocking probes | **Environment/ops** — blocks REL-001 live matrix |

---

## 8. Outstanding findings

1. **Staging Deployment Protection** blocks all unauthenticated HTTP validation.
2. **Neon isolation** not dual-confirmed (Vercel Production vs Staging hosts).
3. **SEC-004 migration pending** on the Neon instance used by local `.env`.
4. **Deployed staging ≠ proven RC** (cannot read app health / headers / commit).
5. **Production still on pre–SEC-007 health payload** (expected until promote).
6. **`tsc --noEmit` test-file debt** remains.
7. **npm audit** still reports 4 high / 1 moderate in production dependency tree.
8. Open product/security residuals from SEC-005 register (not re-validated live): **M06** (anon vCIO checkout by design), **M09** (JWT after password change), **L01**, **L04**; accepted risks **M05/L02/L03**.

---

## 9. Production release blockers

| # | Blocker | Owner | Required before READY |
| --- | --- | --- | --- |
| B1 | Unlock staging app access (Vercel login / Shareable Link / automation bypass) | Ops | Yes |
| B2 | Confirm Staging Neon host ≠ Production Neon host; distinct `AUTH_SECRET` | Ops | Yes |
| B3 | Apply `20260425010000_auth_rate_limit_bucket` on **staging Neon only** | Ops/Eng | Yes |
| B4 | Redeploy / confirm staging deployment SHA = `eebbaa10…` (or newer approved tip) | Ops | Yes |
| B5 | Live smoke: health minimal JSON, CSRF, login/logout, reset/activate with **test** accounts | QA/Ops | Yes |
| B6 | Live API: unauthorized 401/404 patterns; public rate-limit 429; website-leads with staging secret | QA/Eng | Yes |
| B7 | Workflow smoke: assessment, portal, PDF, Stripe **test** checkout, website-lead | QA | Yes |
| B8 | Triage or formally accept remaining `npm audit` highs | Eng/Security | Yes (or signed acceptance) |
| B9 | Do **not** run SEC-004 migrate on production until staging checklist green + change control | Ops | Ongoing |

---

## 10. Final release recommendation

| Recommendation | **NOT READY** |
| --- | --- |
| Rationale | Staging runtime validation is **BLOCKED**; SEC-004 schema not present on the reachable Neon; environment isolation not dual-confirmed. Automated code gates are largely green, but they do **not** replace staging proof. |
| Next milestone | Operator completes §2 / §9 actions → re-run SS-REL-001 live matrix (or SS-REL-002 delta) → only then consider **CONDITIONALLY READY** / **READY**. |

### Scoreboard

| Category | PASS | FAIL | BLOCKED | NOT TESTED |
| --- | --- | --- | --- | --- |
| Environment / isolation | 3 | 0 | 5 | 0 |
| Migrations | 1 (prod untouched) | 2 | 1 | 1 |
| Authentication | 3 | 1 (runtime limiter DB) | 6 | 0 |
| API security | 3 | 1 (prod baseline vs SEC-007) | 5 | 1 |
| Business workflows | 0 | 0 | 7 | 0 |
| Automated gates | 3 | 2 | 0 | 0 |

*(Counts are check-rows, not weighted severity.)*

---

## Appendix A — Manual action checklist (copy/paste)

- [ ] Vercel: authenticate to `staging.stackscore.tech` **or** enable Protection Bypass for Automation and share bypass procedure with validators (do not commit the secret).
- [ ] Vercel: screenshot/hosts-only note proving Staging `DATABASE_URL` ≠ Production `DATABASE_URL`.
- [ ] Vercel: Staging `AUTH_SECRET` ≠ Production `AUTH_SECRET`; Staging `AUTH_URL` matches staging host.
- [ ] Confirm deployment for staging domain includes commit `eebbaa10` (SS-API GUARDRAILS) or later approved tip.
- [ ] Against **staging** Neon only: `prisma migrate deploy` for `20260425010000_auth_rate_limit_bucket`.
- [ ] `npm run smoke -- https://staging.stackscore.tech` → health `{status:"ok"}` only + CSRF.
- [ ] Manual auth + workflow matrix with staging test users / Stripe test mode / staging lead secret.
- [ ] Record results into an amended SS-REL-001 appendix or SS-REL-002.

## Appendix B — Commands executed (non-destructive)

```text
git branch --show-current / status / rev-parse / log vs main
HTTP GET https://staging.stackscore.tech/api/v1/health  → Vercel Login HTML
HTTP GET https://stackscore.tech/api/v1/health          → pre-SEC-007 JSON
HTTP GET https://stackscore.tech/api/auth/csrf          → 200
npx prisma migrate status                               → pending 20260425010000_...
Read-only Prisma counts + AuthRateLimitBucket regclass
npm test                                                → 641 passed
npm run lint                                            → 0 errors
npx tsc --noEmit                                        → preexisting test errors
npm run build                                           → success
npm audit --omit=dev                                    → 5 vulns (4 high)
npm ls next next-auth sharp                             → 15.5.28 / beta.32 / 0.35.5
vitest security subset                                  → 79 passed
```

**Not executed:** `prisma migrate deploy`, production DB access, live payments, customer emails, git commit/push/merge, production deploy.
