# SS-REL-002 — Live Staging Validation & Security Sign-Off

| Field | Value |
| --- | --- |
| Status | **Complete (live HTTP validation)** |
| Date | 2026-10-25 |
| Staging URL | `https://staging.stackscore.tech` |
| Production URL | `https://stackscore.tech` (read-only baseline only) |
| Git branch (local) | `staging` @ `eebbaa1` |
| Prior report | [`SS-REL-001-STAGING-VALIDATION.md`](SS-REL-001-STAGING-VALIDATION.md) |
| Constraints honored | No prod mutations; no migrations; no commits/deploys; no real customer email; Stripe live charges not created |

### Final recommendation

# **CONDITIONALLY READY** (staging security controls verified; auth/workflows incomplete)

**Re-enable Vercel Deployment Protection immediately** — live HTTP testing for this milestone is complete.

Staging is suitable for continued staging hardening and selective promote planning, but **not** for unconditional production promotion until authenticated workflow sign-off and staging Stripe/lead secrets are configured.

---

## 1. Executive summary

Vercel Deployment Protection was disabled long enough to run live probes against `https://staging.stackscore.tech`.

**Confirmed live:**

- Staging responds without Vercel Authentication HTML.
- `/api/v1/health` returns SEC-007 minimal JSON `{"status":"ok"}` (no `checks` / `environment`).
- `/api/auth/csrf` returns a CSRF token.
- Production still serves pre–SEC-007 health with `checks` — staging RC fingerprint differs from production.
- Anonymous protected APIs return **401**.
- PostgreSQL-backed rate limiting is **live**: health returned **429** with generic `RATE_LIMITED` body after ~59 requests.
- Public product-overview PDF returns **200** with `Cache-Control: public, max-age=300`.

**Not confirmed / failed:**

- Seed credentials (`admin@bobkatit.com` + local `SEED_ADMIN_PASSWORD`) **do not** authenticate on staging (`CredentialsSignin` / UI “Invalid email or password”). Authenticated staff/client workflows therefore **BLOCKED**.
- Staging Stripe checkout and website-leads integration return **not configured** (500 with stable error codes).
- Local `.env` “STAGING” Neon host (`ep-crimson-frog-…`, shadow DB name) has **no** `Client` table — it is **not** a usable mirror of the deployed staging app DB. Deployed rate-limit success proves the **Vercel Staging** database has `AuthRateLimitBucket`; local comment labels must not be trusted without host dual-check in Vercel.

---

## 2. Staging connectivity results

| Check | Status | Evidence |
| --- | --- | --- |
| Staging reachable without Vercel login | **PASS** | Health/CSRF JSON; login page title `Bobkat StackScore` (not `Login - Vercel`) |
| `GET /api/v1/health` minimal JSON | **PASS** | `200` `{"status":"ok"}` |
| `GET /api/auth/csrf` | **PASS** | `200` with `csrfToken` |
| Stop rule if Vercel login HTML | **PASS** (not triggered) | Continued HTTP testing |

---

## 3. Deployment commit verification

| Check | Status | Evidence |
| --- | --- | --- |
| Local tip is `eebbaa1` | **PASS** | `git rev-parse --short HEAD` → `eebbaa1` on `staging` |
| Deployed staging serves SEC-007+ RC behavior | **PASS** (behavioral) | Minimal health; PDF cache header; durable 429 — matches SS-SEC-007, absent on production |
| Exact deployed git SHA == `eebbaa1` | **BLOCKED** | No Vercel deployment API / CLI on this workstation; HTML build comment `P6GW8OGqZes2ZaNrctsk5` observed but not mapped to git SHA |

**Operator:** Confirm Vercel Staging deployment commit in the dashboard equals `eebbaa1` or newer approved tip.

---

## 4. Authentication results

| Check | Status | Evidence |
| --- | --- | --- |
| Invalid login | **PASS** | Credentials callback → `302` …`error=CredentialsSignin`; browser alert “Invalid email or password” |
| Valid login (seed admin) | **FAIL** | Same CredentialsSignin with local seed password; browser confirm |
| Logout / session | **BLOCKED** | No authenticated session established |
| Staff dashboard authenticated | **BLOCKED** | Depends on login |
| Client portal authenticated | **BLOCKED** | Depends on login |
| Login page loads | **PASS** | `GET /login` 200 — StackScore client portal sign-in |
| Anon `/dashboard` | **PASS** (gate) | Returns login-shell HTML (unauthenticated users do not receive an authenticated dashboard) |
| Password reset / activation | **NOT TESTED** | No confirmed staging mailbox / tokens; avoid outbound email |
| Password policy | **NOT TESTED** (live) | Still **PASS** in automated suite from REL-001; live confirm needs auth |

---

## 5. Authorization results

| Check | Status | Evidence |
| --- | --- | --- |
| Public health accessible | **PASS** | `200` |
| Anon `GET /api/v1/users` | **PASS** | `401` |
| Anon `GET /api/v1/clients` | **PASS** | `401` |
| Admin-only with admin session | **BLOCKED** | No admin session |
| Staff-only rejects client | **BLOCKED** | No client/staff sessions |
| Tenant isolation live | **BLOCKED** | Requires authenticated multi-tenant fixtures |
| Route registry completeness | **PASS** | Deferred to REL-001 automated proof (112 routes); not re-audited statically |

---

## 6. Rate-limiting results

| Check | Status | Evidence |
| --- | --- | --- |
| Rate-limit table exists (deployed staging DB) | **PASS** (inferred) | Durable 429 requires working `AuthRateLimitBucket` consume path |
| Counters persist / enforce | **PASS** | Health burst → **429** at attempt **59** (policy `health_ip` limit 60) |
| Generic 429 body | **PASS** | `{"error":"Too many requests. Please wait a moment and try again.","code":"RATE_LIMITED"}` — no secrets |
| Product-overview PDF under limit | **PASS** | `200` application/pdf; `Cache-Control: public, max-age=300` |
| Local Neon table inspection | **BLOCKED** / mismatch | Local labeled “STAGING” URL is shadow DB without app tables — **not used** for deploy conclusions |
| Fail-closed by killing DB | **NOT TESTED** | Forbidden by milestone |

---

## 7. Business workflow results

| Check | Status | Evidence |
| --- | --- | --- |
| Staff dashboard (authenticated) | **BLOCKED** | Login failed |
| Client portal (authenticated) | **BLOCKED** | Login failed; `/portal` → 404 (route may differ) |
| Assessment create/complete/recs/PDF | **BLOCKED** | Needs staff session |
| Public product-overview PDF | **PASS** | See §6 |
| Checkout create-session (Stripe test) | **FAIL** / config | `500` `{"error":"Payment is not configured yet","code":"CHECKOUT_FAILED"}` — no live charge |
| vCIO checkout | **FAIL** / config | `500` `VCIO_CHECKOUT_FAILED` — not configured |
| Website-lead submission | **BLOCKED** / config | `500` `{"error":"Integration is not configured","code":"NOT_CONFIGURED"}` |

No live payments and no customer emails were sent.

---

## 8. Previously blocked items now verified (vs SS-REL-001)

| REL-001 item | REL-002 status |
| --- | --- |
| Staging Vercel Authentication blocking probes | **Resolved — PASS** |
| Health minimal JSON on staging | **Resolved — PASS** |
| CSRF on staging | **Resolved — PASS** |
| Public API anonymous rejects | **Resolved — PASS** |
| Public rate limits on staging | **Resolved — PASS** |
| Product-overview PDF + cache | **Resolved — PASS** |
| SEC-007 vs production fingerprint | **Resolved — PASS** |
| Auth login / logout / roles | **Still FAIL/BLOCKED** (credentials) |
| Authenticated workflows | **Still BLOCKED** |
| Checkout / website-leads live | **Still FAIL/BLOCKED** (env config) |
| Exact deploy SHA | **Still BLOCKED** |
| Dual-confirm Neon isolation in Vercel UI | **Still BLOCKED** (ops) |

---

## 9. Remaining blockers

| # | Blocker | Blocks production? |
| --- | --- | --- |
| R1 | Staging test account passwords unknown / seed mismatch | Yes for full sign-off |
| R2 | Stripe keys / price IDs not configured on staging | Yes for commerce path |
| R3 | `WEBSITE_LEADS_API_SECRET` (and related) not configured on staging | Yes for lead ingress |
| R4 | Vercel deploy SHA not confirmed as `eebbaa1` | Should confirm before promote |
| R5 | Vercel Production vs Staging Neon host dual-check still operator-owned | Yes (safety) |
| R6 | Residual `npm audit` highs / `tsc` test debt from REL-001 | Triage or accept |
| R7 | Open product residuals (M06/M09/L01/L04) unchanged | Per SEC-005 |

---

## 10. Final release recommendation

| Question | Answer |
| --- | --- |
| Staging suitable for production promotion? | **Not yet unconditionally** — security middleware/rate-limit/public API posture looks good; auth workflows + Stripe/leads config incomplete |
| Recommendation | **CONDITIONALLY READY** for continued staging use / protection re-enable; **NOT READY** for production cutover until R1–R5 addressed |
| Re-enable Vercel Require Login? | **YES — IMMEDIATELY** |

### Scoreboard (this run’s check rows)

| Status | Count |
| --- | --- |
| **PASS** | **16** |
| **FAIL** | **3** (admin login; checkout config; vcio config) |
| **BLOCKED** | **12** |
| **NOT TESTED** | **3** |

---

## Operator notice

**STAGING HTTP TESTING COMPLETE — RE-ENABLE VERCEL REQUIRE LOGIN NOW.**

---

## Appendix — Safety notes

- All mutating/authenticated attempts targeted `https://staging.stackscore.tech` only.
- Production was only used for read-only health comparison.
- No `prisma migrate deploy` executed.
- Local `.env` contains a Neon URL labeled staging that is a **shadow/empty** database — do not treat it as the Vercel Staging app database when validating schema.
- Temporary probe scripts used during this run should be deleted if still present under `scripts/tmp-rel002-*`.
