# SS-REL-003 — Authenticated Workflow & Integration Validation

| Field | Value |
| --- | --- |
| Status | **Complete** |
| Date | 2026-10-26 |
| Branch | `staging` @ `68f88c9` |
| Staging public URL | `https://staging.stackscore.tech` |
| Workflow test target | **Local Next.js** (`http://localhost:3000`) bound to staging Neon `ep-patient-credit-…` / `neondb` |
| Prior reports (preserved) | SS-REL-001, SS-REL-002, SS-REL-002-R1 |
| Constraints | No prod mutations; no migrations; no password resets without approval; no deploys; no secrets in report |

### Final recommendation

# **CONDITIONALLY READY**

Client authentication **root cause resolved** (wrong password assumed in R1). Full assessment lifecycle + completed PDF **PASS** against staging data via local app. Deployed staging HTTP remains **BLOCKED** by Vercel Authentication. Stripe / website-leads still **unconfigured**. Second synthetic client for peer tenant tests still needs operator approval.

---

## 1. Executive Summary

SS-REL-002-R1 left client login and end-to-end assessment export open. This milestone:

1. Proved the staging client user is active, role=`client`, with a valid password hash that matches the **demo client password** (not `SEED_ADMIN_PASSWORD`).
2. Could **not** call `staging.stackscore.tech` APIs (Vercel Authentication → `Login - Vercel`). Per constraints, protection was **not** disabled.
3. Executed authenticated workflows against the **same staging Neon database** using the local Next.js server (explicitly documented as a protection workaround, not a substitute for a final deployed-staging smoke).
4. Completed create → answer (80/80) → complete → recommendations GET → PDF (`%PDF`, ~60KB) → client PDF access → logout.
5. Confirmed client cannot call admin APIs; foreign client/assessment IDs return 403/404; technician still denied admin users.

**Production review:** Still **CONDITIONALLY READY** until (a) deployed staging is re-validated with protection briefly opened or bypassed, (b) Stripe test + website-leads secrets are set on Staging, (c) optional second synthetic client for peer isolation.

---

## 2. Client Authentication

### Findings (read-only DB)

| Fact | Result |
| --- | --- |
| Client account exists | **Yes** — Pinnacle Engineering demo client (`notes` mark demo); 1 linked user |
| Active | **Yes** (`isActive=true`) |
| Role | **`client`** with `clientId` set |
| Password hash present | **Yes** (bcrypt, length 60) |
| Same auth provider as staff | **Yes** — shared NextAuth Credentials `authorize()` |
| `SEED_ADMIN_PASSWORD` matches client hash | **No** (boolean compare) |
| Demo default password matches client hash | **Yes** (boolean compare; value comes from `resolveDemoClientPassword()` when `DEMO_CLIENT_PASSWORD` unset) |
| `DEMO_CLIENT_PASSWORD` in local `.env` | **ABSENT** |

### Root cause (R1 failure)

R1 tested client login with **staff seed password**. The staging client was seeded by the **Acme/Pinnacle demo seed**, which sets a **different** password (`resolveDemoClientPassword()`, default used when env unset). Not an Auth.js defect.

### Live login evidence

| Check | Status | Evidence |
| --- | --- | --- |
| Client login (demo password) via local app + staging DB | **PASS** | Session `role=client` |
| Deployed staging client login | **BLOCKED** | Vercel Authentication on public staging URL |

### Remediation (no mutation performed)

Approved paths if credentials must be rotated later:

1. **Staff admin API** — `PATCH /api/v1/users/[id]` with `password` (policy min 10) while authenticated as admin.
2. **Password-reset email** — `requestPasswordReset` / confirm (needs staging Resend).
3. **Re-seed demo client** — `seed:demo-client` with explicit `DEMO_CLIENT_EMAIL` / `DEMO_CLIENT_PASSWORD` (destructive to demo fixture).

**Operator approval required** before any of the above. This run did **not** reset or create users.

**Recommended next action:** Document the demo client credential channel for QA (or set `DEMO_CLIENT_PASSWORD` in a secure operator store). Do not commit passwords.

---

## 3. Client Portal

### Actual routes (from source)

| Intent | Route |
| --- | --- |
| Sign-in | `/login` (shared) |
| Customer post-login | `/dashboard` redirects clients → `/clients/{clientId}/technology-profile` (or vCIO if entitled) |
| Customer workspace home | `/clients/{clientId}/technology-profile` (`customerAssessmentDashboardPath`) |
| Assessments section | `/clients/{clientId}/assessments` |
| Recommendations | `/clients/{clientId}/recommendations` |
| Reports | `/clients/{clientId}/executive-reports` (and assessment report paths under `/assessments/{id}/…`) |
| vCIO (entitled) | `/portal/vcio`, `/portal/vcio/onboarding`, `/portal/billing` |
| Onboarding | `/onboarding` if incomplete |

**Note:** Bare `/portal` is **not** the customer home (404 observed in R1). Subpaths under `/portal/*` are vCIO/billing specific.

### Functionality (local + staging DB)

| Check | Status | Evidence |
| --- | --- | --- |
| Client login | **PASS** | Credentials session |
| Session | **PASS** | `/api/v1/auth/me` → `client` |
| Dashboard redirect / workspace | **PASS** | `/dashboard` redirect toward `/clients/{id}/…`; workspace fetch 307/200 |
| Assigned assessments API | **PASS** | Client `GET …/clients/{id}/assessments` → 200 |
| Assessment progress / own assessment | **PASS** | Client `GET /api/v1/assessments/{id}` → 200 |
| Recommendations (API after complete) | **PASS** | Staff/client readable path exercised; list endpoint 200 |
| Report / PDF access | **PASS** | Client PDF export → 200 on completed assessment |
| Logout | **PASS** | After signout cookie refresh, `/api/v1/auth/me` → **401** |
| Deployed portal UI smoke | **BLOCKED** | Vercel Authentication |

---

## 4. Tenant Isolation

| Check | Status | Evidence |
| --- | --- | --- |
| Client → foreign client id | **PASS** | **403** |
| Client → foreign assessment id | **PASS** | **404** |
| Client → own assessment | **PASS** | **200** |
| Client → `/api/v1/users` | **PASS** | **403** |
| Technician → `/api/v1/users` | **PASS** | **403** |
| Client A vs Client B peer isolation | **BLOCKED** | Only **one** synthetic client in staging DB; creating a second requires operator approval |
| Automated isolation suite | **PASS** | `tests/auth/api-client-isolation.test.ts` (14) |

---

## 5. Assessment Lifecycle

Executed on local app against staging Neon (synthetic assessment on demo client).

| Step | Status | Evidence |
| --- | --- | --- |
| Create assessment | **PASS** | **201** |
| Retrieve questions | **PASS** | **200**; **80** active questions |
| Submit answers | **PASS** | **80/80** PUT responses OK |
| Save / resume | **PASS** | Mid-run `GET` assessment **200** |
| Complete | **PASS** | **200**; `status=completed`; `overallScore=100` |
| Scoring present | **PASS** | Score + rating in complete payload |
| Recommendations retrieve | **PASS** | **200** (0 items for this all-first-option / exceptional path — retrieval OK) |

Deployed staging lifecycle: **BLOCKED** (Vercel Auth).

---

## 6. PDF Generation

| Check | Status | Evidence |
| --- | --- | --- |
| Export after **completed** assessment | **PASS** | **200**, `Content-Type` PDF, body starts with `%PDF`, ~60 920 bytes |
| Client can download completed PDF | **PASS** | **200** |
| Incomplete draft PDF (from R1) | N/A | Prior 404 on draft — **not** treated as product defect |

---

## 7. Stripe Integration

### Required staging variables (names only)

| Variable | Purpose |
| --- | --- |
| `STRIPE_SECRET_KEY` | Must be **`sk_test_…`** on staging (never `sk_live_`) |
| `STRIPE_ASSESSMENT_PRICE_ID` | Assessment Checkout price |
| `STRIPE_VCIO_PRICE_ID` | vCIO subscription Checkout price |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verify (`whsec_…` test) |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | Success/cancel URLs resolve via `getAppUrl()` (assessment success → purchased path; cancel → `/assessment-offer`) |

### Results

| Check | Status | Evidence |
| --- | --- | --- |
| Staging/local checkout create | **FAIL** (config) | `500` `CHECKOUT_FAILED` / “Payment is not configured yet” |
| vCIO checkout | **FAIL** (config) | `500` `VCIO_CHECKOUT_FAILED` |
| Live charges | **NOT TESTED** | Forbidden |
| Code/wiring tests | **PASS** | `tests/stripe/routes.test.ts` |

### Operator setup

1. In Vercel **Staging/Preview** env (not Production): set test-mode Stripe vars above.
2. Confirm webhook endpoint for staging host only.
3. Re-run `POST /api/checkout/create-session` expecting `url` + `sessionId` (test Checkout).
4. Do not point staging at live keys.

---

## 8. Website Lead Integration

### Design (from code)

| Item | Detail |
| --- | --- |
| Env | `WEBSITE_LEADS_API_SECRET` |
| Auth | `Authorization: Bearer …` or `x-website-leads-secret` (timing-safe compare) |
| Route | `POST /api/integrations/website-leads` |
| Rate limit | Durable `website_leads_ip` (SS-SEC-007) |
| Schema | Integration Zod schema (name, company, phone, email, message, source, …) |

### Results

| Check | Status | Evidence |
| --- | --- | --- |
| Staging/local submit | **FAIL** (config) | `500` `NOT_CONFIGURED` |
| Automated schema/auth wiring | **PASS** | `tests/website-leads/integration.test.ts` |
| Production CRM send | **NOT TESTED** | Forbidden |

### Operator setup

Set `WEBSITE_LEADS_API_SECRET` on Staging (≥32 chars). Submit synthetic lead with Bearer secret; expect 2xx and a `WebsiteLead` row. Do not wire production marketing destinations.

---

## 9. Security Regression

| Control | Status | Evidence |
| --- | --- | --- |
| RBAC (client/tech vs admin) | **PASS** | Live 403s + automated isolation |
| Tenant isolation (IDOR foreign ids) | **PASS** | 403/404 |
| Session enforcement | **PASS** | Anon 401 (R1/R2); logout 401 |
| Route registry | **PASS** | Automated 112-route completeness |
| Password policy | **PASS** | Automated suite |
| Continue-assessment hardening | **PASS** | Automated suite |
| Deployed public health/rate-limit re-burst | **BLOCKED** | Vercel Auth (previously PASS in REL-002) |

Automated subset this run: **59/59** passed (`api-client-isolation`, `password-policy`, `continue-snapshot-security`, `route-registry`, `website-leads`, `stripe/routes`).

---

## 10. Remaining Blockers

1. **Vercel Deployment Protection** on `staging.stackscore.tech` blocks deployed HTTP confirmation of this milestone.
2. **Stripe test-mode env** missing on staging (`STRIPE_SECRET_KEY`, price IDs, webhook secret).
3. **`WEBSITE_LEADS_API_SECRET`** missing on staging.
4. **Second synthetic client** not present — peer tenant test incomplete (foreign-id tests already PASS).
5. **Operator dual-check** of Vercel Staging vs Production Neon hosts / deploy SHA (carried from R1).
6. Document/share **demo client credential** process for QA (no password in git).

---

## 11. Release Recommendation

| Choice | **CONDITIONALLY READY** |
| --- | --- |
| Why not READY FOR PRODUCTION REVIEW | Deployed staging not re-smoked; Stripe/leads unconfigured; peer-client fixture gap |
| Why not NOT READY | Client auth understood and working; full assessment→PDF path green on staging data; RBAC/tenant controls hold |
| Why not BLOCKED | Core workflows validated via local↔staging-DB path with clear protection caveat |

---

## Comparison vs SS-REL-002-R1

| Item | R1 | REL-003 |
| --- | --- | --- |
| Client login | FAIL (wrong password) | **PASS** (demo password; root cause documented) |
| Client portal | BLOCKED | **PASS** (local↔staging DB) |
| Assessment complete + PDF | Incomplete / 404 draft | **PASS** completed PDF |
| Tenant foreign-id | Not fully run | **PASS** |
| Two-client peer | — | **BLOCKED** (fixture) |
| Stripe / leads | FAIL config | **FAIL** config (unchanged) |
| Deployed staging HTTP | Open then re-protected | **BLOCKED** (Require Login on) |

---

## Scoreboard

| Status | Count (approx.) |
| --- | --- |
| **PASS** | 28 |
| **FAIL** | 3 (Stripe checkout, vCIO checkout, website-leads config) |
| **BLOCKED** | 4 (deployed staging HTTP; two-client peer; optional deployed re-smoke of public controls) |
| **NOT TESTED** | 2 (live Stripe charge; production CRM) |

---

## Final Output Summary

1. **Totals:** ~28 PASS / 3 FAIL / 4 BLOCKED / 2 NOT TESTED  
2. **Client authentication:** **PASS** (root cause: demo password ≠ staff seed password)  
3. **Tenant isolation:** **PASS** for foreign-id + RBAC; peer A/B **BLOCKED** (one client)  
4. **Assessment lifecycle:** **PASS** (80 answers → complete → score)  
5. **PDF generation:** **PASS** (valid completed PDF; client can download)  
6. **Stripe:** **FAIL** — not configured (test vars listed above)  
7. **Website leads:** **FAIL** — `WEBSITE_LEADS_API_SECRET` missing  
8. **Remaining blockers:** Vercel protection for deployed smoke; Stripe/leads env; optional 2nd client; Vercel host/SHA confirm  
9. **Next actions:**  
   - Operator: brief Staging protection bypass/window → smoke health + client login on public URL  
   - Operator: set Stripe test + website-leads secrets on Staging  
   - Operator: approve second synthetic client **or** accept foreign-id tests as sufficient  
   - QA: use demo client password channel (not staff seed) for portal tests  

**No account mutations, migrations, or protection changes were made in this milestone.**
