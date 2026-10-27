# SS-REL-002-R1 — Staging Database Correction & Revalidation

| Field | Value |
| --- | --- |
| Status | **Complete** |
| Date | 2026-10-25 |
| Branch | `staging` |
| Local commit | `68f88c9` (`SS-FIX DB URL`) — includes `eebbaa1` as ancestor |
| Staging URL | `https://staging.stackscore.tech` |
| Prior reports (preserved) | [`SS-REL-001-STAGING-VALIDATION.md`](SS-REL-001-STAGING-VALIDATION.md), [`SS-REL-002-LIVE-STAGING-VALIDATION.md`](SS-REL-002-LIVE-STAGING-VALIDATION.md) |
| Constraints | Read-only DB inspection; no migrations; no password resets; no user creation; no deploys/commits; no secrets in this report |

### Final recommendation

# **CONDITIONALLY READY**

Database correction **worked**. Administrator authentication on staging **succeeds**. Core security regressions remain **PASS**. Stripe / vCIO / website-leads remain **unconfigured** on staging. Exact Vercel deploy SHA and Production↔Staging Neon dual-check in the Vercel UI still require operator confirmation before **READY FOR PRODUCTION REVIEW**.

---

## Executive Summary

SS-REL-002 failed admin login and could not use the prior local “staging” Neon URL (shadow DB without app tables). The operator corrected connection strings. This revision revalidated against the new local Neon target and live staging HTTP.

**Key outcomes vs SS-REL-002:**

| Topic | SS-REL-002 | SS-REL-002-R1 |
| --- | --- | --- |
| Local DB usable | FAIL (shadow DB, no `Client`) | **PASS** (`ep-patient-credit-…` / `neondb`, app tables present) |
| SEC-004 migration locally | N/A / mismatch | **PASS** (31/31; `AuthRateLimitBucket` present) |
| Admin login on staging | **FAIL** | **PASS** |
| Session / logout | BLOCKED | **PASS** |
| Staff APIs / RBAC sample | BLOCKED | **PASS** (admin users 200; technician → users **403**) |
| Assessment create | BLOCKED | **PASS** (201 with correct payload) |
| Security regressions | PASS | **PASS** (reconfirmed) |
| Stripe / leads / vCIO | FAIL (not configured) | **FAIL** (unchanged) |

Staging was reachable **without** Vercel Authentication HTML during this run (operator window). Do not treat that as permission to leave protection off.

---

## Environment Verification

| Check | Status | Evidence |
| --- | --- | --- |
| Git branch `staging` | **PASS** | `git branch --show-current` |
| Local commit | **PASS** | `68f88c9`; `eebbaa1` is ancestor |
| Local Neon host | **PASS** | `ep-patient-credit-atddo1zm.c-9.us-east-1.aws.neon.tech` / db `neondb` |
| Not labeled production host | **PASS** | Host is **not** `ep-autumn-wave-…` (commented production endpoint in `.env`) |
| Prisma connect + app tables | **PASS** | `User`, `Client`, `Assessment`, `AuthRateLimitBucket`, `_prisma_migrations` present |
| Migration status | **PASS** | `Database schema is up to date!` (31 migrations); includes `20260425010000_auth_rate_limit_bucket` |
| `AuthRateLimitBucket` exists | **PASS** | Relation present (0 rows at inspection time) |
| Auth user rows | **PASS** | `admin@bobkatit.com` admin/active + password hash; `technician@bobkatit.com` technician/active + hash; 1 client-role user |
| Row-scale sanity | **PASS** | clients=1, users=4, assessments=2 (seed-scale, not production-volume) |
| Local ≡ Vercel Staging DB | **PASS** (inferred) | Seed admin password authenticates against **deployed** staging; same behavioral DB as local inspection |
| Vercel env UI dual-check | **BLOCKED** | No Vercel CLI/dashboard access this session — cannot independently print Production vs Staging `DATABASE_URL` hosts from Vercel |
| Auth.js `Account`/`Session` tables | **NOT TESTED** / N/A | Not present; app uses JWT strategy (`User` is the auth store) |

**Critical stop rule:** Production host was **not** selected; DB operations continued as read-only only.

---

## Staging Deployment Verification

| Check | Status | Evidence |
| --- | --- | --- |
| Staging reachable | **PASS** | Health + CSRF JSON |
| Vercel Authentication wall | **PASS** (open during test) | No `Login - Vercel` HTML |
| SEC-007 RC fingerprint | **PASS** | Staging `{"status":"ok"}`; production still returns `checks` + `environment` |
| Deployed commit == `68f88c9` / `eebbaa1` | **BLOCKED** | Behavioral match only; SHA not readable without Vercel |
| Staging DB env corrected on Vercel | **PASS** (inferred) | Login success after local URL fix strongly indicates Staging runtime DB aligns with corrected Neon |

---

## Authentication Results

| Check | Status | Evidence |
| --- | --- | --- |
| Invalid credentials | **PASS** | `CredentialsSignin` redirect |
| Administrator login | **PASS** | Redirect to `/dashboard`; `/api/v1/auth/me` → `role=admin` |
| Session persistence | **PASS** | Cookie session calls succeed after login |
| Logout | **PASS** | `/api/v1/auth/me` → **401** after signout |
| Staff dashboard (API) | **PASS** | `/api/v1/dashboard/summary` → **200** |
| Staff dashboard (HTML heuristic) | **PASS*** | Initial HTML check false-negative (`Sign In` string); API summary confirms staff access |
| Technician login | **PASS** | Credentials accepted |
| Technician blocked from admin users | **PASS** | `GET /api/v1/users` → **403** |
| Client login (seed password) | **FAIL** | Client-role user exists; seed password does **not** authenticate (`me` 401) |
| Password reset / activation | **NOT TESTED** | Avoid outbound email |

\*HTML `/dashboard` returned 200 with `x-matched-path=/dashboard` under admin cookie; treated as pass with API corroboration.

**Likely cause of prior REL-002 login failure:** wrong Neon database (shadow/empty) vs app DB — not an Auth.js regression. After correction, admin/technician hashes validate.

**Client auth:** Do not reset password without operator approval. Client workflow remains blocked until a known staging client credential is provided.

---

## Security Regression Results

| Check | Status | Evidence |
| --- | --- | --- |
| Health minimal JSON | **PASS** | `{"status":"ok"}` |
| CSRF | **PASS** | Token present |
| Anon `/api/v1/users` | **PASS** | **401** |
| Anon `/api/v1/clients` | **PASS** | **401** |
| Public product-overview PDF | **PASS** | **200** PDF + `Cache-Control: public, max-age=300` |
| Rate limiting | **PASS** | Table exists; bounded retest avoided heavy burst; REL-002 previously proved live **429** on staging |

---

## Business Workflow Results

| Check | Status | Evidence |
| --- | --- | --- |
| Clients list (staff) | **PASS** | count=1 |
| Assessment create (synthetic) | **PASS** | **201** with `assessmentName` + `assessmentType` |
| Assessment complete | **PASS*** | **409** — expected for unanswered draft (not a 5xx) |
| Recommendations | **PASS** | **200** |
| Assessment PDF | **FAIL** / incomplete fixture | **404** on draft/incomplete assessment export |
| Client portal route `/portal` | **NOT TESTED** | **404** (path may differ in app routing) |
| Tenant isolation (client↔client) | **BLOCKED** | No working client credential |

\*Completion endpoint exercised; full happy-path completion needs answered assessment — not pursued beyond synthetic create.

---

## Integration Readiness

Observed via staging HTTP error codes (values not printed). Local `.env` also lacks these keys (presence check only).

| Integration | Status | Missing / symptom |
| --- | --- | --- |
| Stripe assessment checkout | **FAIL** | Staging returns `CHECKOUT_FAILED` / “Payment is not configured yet” — expect Staging env: `STRIPE_SECRET_KEY` (test), `STRIPE_ASSESSMENT_PRICE_ID`, related Stripe config |
| vCIO checkout | **FAIL** | `VCIO_CHECKOUT_FAILED` / not configured — expect `STRIPE_VCIO_PRICE_ID` (+ Stripe secret) |
| Website leads | **FAIL** | `NOT_CONFIGURED` — expect `WEBSITE_LEADS_API_SECRET` (and any related lead integration vars) |
| Live payment / customer email | **NOT TESTED** | Forbidden |

---

## Remaining Blockers

1. **Operator:** Confirm in Vercel that Staging `DATABASE_URL` host is `ep-patient-credit-…` and Production remains `ep-autumn-wave-…` (or current prod host) — dual-check still not dashboard-proven here.
2. **Operator:** Confirm Staging deployment commit is `68f88c9` (or approved tip).
3. **Config:** Add Stripe **test-mode** secrets/price IDs on Staging.
4. **Config:** Add `WEBSITE_LEADS_API_SECRET` on Staging.
5. **Credentials:** Provide/approve staging **client** test password (or approved reset) for portal/tenant tests.
6. **Product residuals** from SEC register (M06/M09/L01/L04) unchanged.
7. **Re-enable / keep** Vercel Deployment Protection for staging when validation windows end.

---

## Comparison vs SS-REL-002

| Previously blocked / failed | R1 result |
| --- | --- |
| Local DB wrong / no app tables | **Resolved** |
| Admin login | **Resolved — PASS** |
| Session / logout / staff APIs | **Resolved — PASS** |
| Tech RBAC sample | **Resolved — PASS** |
| Assessment create | **Resolved — PASS** |
| Security public controls | **Still PASS** |
| Checkout / vCIO / leads | **Still FAIL** (config) |
| Client portal auth | **Still blocked/fail** |
| Exact deploy SHA | **Still BLOCKED** |

---

## Scoreboard (this revision)

| Status | Count (approx.) |
| --- | --- |
| **PASS** | 24 |
| **FAIL** | 5 (client login; assessment PDF for incomplete draft; Stripe; vCIO; website-leads) |
| **BLOCKED** | 2 (Vercel SHA/UI dual-check; client tenant isolation) |
| **NOT TESTED** | 3 |

---

## Final Output Answers

1. **Did the database correction work?** **Yes.** Local Neon is a real StackScore schema with SEC-004 applied; staging admin auth now succeeds against the live site.
2. **Does administrator authentication succeed?** **Yes.**
3. **Previously blocked tests now passing:** admin login, session, logout, staff dashboard API, admin users, technician login + admin reject, clients list, assessment create, recommendations read.
4. **Still blocked/failed:** Vercel SHA dual-proof, client credential auth/tenant tests, Stripe/vCIO/website-leads configuration, assessment PDF on incomplete draft.
5. **Ready for production review?** **CONDITIONALLY READY** — security + admin auth on staging look good; finish integration env + client fixture + Vercel isolation/SHA confirmation before **READY FOR PRODUCTION REVIEW**.
