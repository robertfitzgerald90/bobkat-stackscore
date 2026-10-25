# SS-SEC-001 — Authentication, Authorization & Tenant Isolation Audit

| Field | Value |
| --- | --- |
| Status | Investigation complete (audit-only) |
| Date | 2026-04-24 |
| Scope | AuthN, AuthZ, tenant isolation, API access controls |
| Branch audited | `staging` (code review; no production probes) |
| Constraints | No application behavior changes, schema changes, migrations, deploys, or destructive tests |
| Related | [`SECURITY_REMEDIATION_REPORT.md`](../SECURITY_REMEDIATION_REPORT.md) (Phase 1 + SS-OPT-001), [`DOC-303`](../30-Architecture/DOC-303%20RBAC%20%26%20Security%20Specification.md) |
| Companions | [`SS-SEC-001-API-INVENTORY.md`](SS-SEC-001-API-INVENTORY.md), [`SS-SEC-001-TEST-MATRIX.md`](SS-SEC-001-TEST-MATRIX.md) |

---

## Executive summary

| Metric | Count |
| --- | --- |
| API `route.ts` files reviewed | **112** |
| Server Actions found | **0** (mutations are Route Handlers only) |
| Confirmed security weaknesses (at audit time) | **4** (1 Critical, 3 High) — C01, H01, H02, H04 since remediated on staging (SEC-002–004) |
| Potential risks requiring tests / design decisions | **9** (Medium) |
| Low hardening opportunities | **5** |
| Open High (post SEC-002–004) | **H03** (API middleware defense-in-depth) |
| Prior Phase 1 / SS-OPT-001 client-isolation issues | **Treated as remediated** — not re-opened as open CRITICAL findings |
| Existing automated security tests | Primarily `tests/auth/api-client-isolation.test.ts`, `tests/recommendations/visibility.test.ts` |

### Verdict

Phase 1 and SS-OPT-001 substantially closed cross-tenant IDOR gaps on client/assessment/project/recommendation/dashboard surfaces. Core session resolution (`resolveSessionUserFromDb`), workspace helpers (`requireClientWorkspaceAccess`, `requireAssessmentAccess`), webhook signatures, and cron secrets are sound.

**Critical C01** (continue-assessment activation token leak) was remediated in **SS-SEC-002**. **H02** (password-reset policy) was remediated in **SS-SEC-003**. **H01 / H04** (auth abuse rate limits) were remediated in **SS-SEC-004** (PostgreSQL durable limiter on `staging`; not production-deployed).

Remaining audit priorities are defense-in-depth for `/api` (H03), medium public-abuse surfaces, and expanding the automated matrix.

### Recommended remediation order

1. ~~**P0 — SEC-001-C01**~~ **Done (SS-SEC-002)** — stop returning raw `activationUrl` / tokens from unauthenticated `continue-assessment`.
2. ~~**P1 — SEC-001-H01 / H04**~~ **Done (SS-SEC-004)** — durable login / password-reset / activate / snapshot rate limits (staging).
3. ~~**P1 — SEC-001-H02**~~ **Done (SS-SEC-003)** — shared password policy on reset confirm.
4. **P2 — SEC-001-H03 / Medium public abuse** Defense-in-depth for `/api` (shared auth wrapper or middleware allowlist), health/PDF/checkout rate limits.
5. **P3** Expand automated matrix in `SS-SEC-001-TEST-MATRIX.md`; document technician firm-wide access as accepted risk until assignment lands.

---

## 1. Authentication review

### 1.1 Implementation map

| Concern | Location | Observation |
| --- | --- | --- |
| NextAuth / Auth.js | `src/lib/auth/config.ts`, `src/lib/auth/auth.config.ts`, `src/app/api/auth/[...nextauth]/route.ts` | Credentials provider only; JWT strategy; `maxAge` 24h |
| Password verify | `config.ts` `authorize` | `bcrypt.compare` against `user.passwordHash`; inactive users rejected |
| Password hash | `src/lib/users/password.ts`, activation path | `BCRYPT_ROUNDS = 12` (matches DOC-303) |
| Session resolution for APIs | `src/lib/auth/resolve-session-user.ts` | DB lookup by session **email**; refreshes `id`/`role`/`clientId`/`isActive` |
| JWT refresh | `config.ts` `jwt` callback | Re-reads user by email; sets `token.invalid` if inactive |
| Cookie / pages guard | `auth.config.ts` `authorized` + `src/middleware.ts` | UI path guards only; **matcher excludes `api`** |
| Password reset | `src/lib/auth/password-reset.ts`, `api/v1/public/password-reset` | Tokens SHA-256 hashed at rest; 60m TTL; anti-enumeration on request |
| Account activation | `src/lib/auth/activation.ts` | Token hashed; min password 10; client-role only |
| Secrets | `AUTH_SECRET`, Stripe/Resend/cron/website-leads secrets | Present in env; health probes secret **presence** |

### 1.2 Controls validated

- Inactive users cannot authorize or keep a valid session after JWT refresh (`token.invalid` → empty session user).
- Failed login returns `null` (generic failure path); no email existence signal in credentials authorize.
- Password-reset **request** always returns success to callers (`password-reset.ts` lines 19–22).
- Activation and reset tokens stored as SHA-256 hashes, not plaintext.
- Session duration matches DOC-303 (24 hours).
- API auth decisions use DB-backed role/`clientId`, not client-supplied role claims alone.

### 1.3 Weaknesses (see findings)

- ~~No login throttling (SEC-001-H01)~~ — remediated SS-SEC-004.
- ~~Password-reset confirm accepts any non-empty password length at the route layer (SEC-001-H02)~~ — remediated SS-SEC-003.
- ~~Public continue-assessment returns activation URL (SEC-001-C01)~~ — remediated SS-SEC-002.
- ~~Public auth-adjacent endpoints lack rate limits (SEC-001-H04)~~ — remediated SS-SEC-004.
- Middleware does not enforce API authentication (SEC-001-H03).

---

## 2. Authorization review

### 2.1 Role model (implemented)

| Role | Scope in practice |
| --- | --- |
| `admin` | Full staff + deletes, user management, portfolio, archive/restore, assessment library |
| `technician` | Firm-wide consulting read/write via `requireConsultantOrAdmin` (no per-client assignment) |
| `client` | Own `User.clientId` workspace only via `requireClientWorkspaceAccess` / `requireAssessmentAccess` |

DOC-303 still describes client as “dormant”; **code has an active portal**. Treat DOC-303 as partially stale for client portal status.

Helpers:

- `requireAdmin` / `requireConsultantOrAdmin` / `requireRole` — `src/lib/api/helpers.ts`
- `requireClientWorkspaceAccess` / `requireAssessmentAccess` / `getSessionUserWithClient` — `src/lib/api/access.ts`
- Billing — `src/lib/billing/api-auth.ts` (`requireBillingClientAccess`, `requireBillingManagement`)

### 2.2 Server Actions

No `"use server"` modules found under `src/`. Authorization surface is **API Route Handlers only**.

### 2.3 Patterns

- Protected operations generally call `getSessionUser` / `getSessionUserWithClient` first, then role and/or ownership helpers.
- Staff operations that mutate firm data correctly gate with `requireConsultantOrAdmin` or `requireAdmin`.
- Portal anti-enumeration: foreign assessment/project → **404** (not 403) for clients (`access.ts` lines 44–45; projects GET).
- Recommendation field filtering for clients remains in place (SS-OPT-001) via `presentRecommendationForRole`.

### 2.4 Residual authorization notes

- Technician = firm-wide tenant access by design (documented in SECURITY_REMEDIATION_REPORT §2.3). Not a client↔client IDOR, but a blast-radius concern if a technician account is compromised (SEC-001-M05).
- UI middleware redirects clients away from `/admin/*` etc.; **APIs must still enforce** (and generally do).

---

## 3. Tenant isolation review

### 3.1 Ownership graph

```
User (role, clientId?)
  └── Client (tenant boundary)
        ├── Assessment → AssessmentResponse, AssessmentRecommendation, scores
        ├── Project
        ├── Technology deployments / profile
        ├── ClientRoadmap / phases / initiatives
        ├── PhaseProposal, TIP, QBR
        ├── Billing (invoices, portal, deposits)
        ├── Documents / generated PDFs (on-demand routes)
        └── Contacts, activity, notifications (user-scoped)
TechnologySnapshotLead (pre-tenant) → may provision Client + User + Assessment
AssessmentPurchase / Stripe fulfillment → Client + User
```

Tenant key: **`Client.id`**, linked from `User.clientId` for portal users. Nested resources must be loaded with parent `clientId` (or assessment→clientId) checks.

### 3.2 Validated isolation

| Path | Control |
| --- | --- |
| `GET/PATCH` assessments by id | `requireAssessmentAccess` |
| Client workspace nested routes | `requireClientWorkspaceAccess(user, clientId)` |
| Projects by id (client) | Compare `user.clientId` to `project.clientId`; foreign → 404 |
| Clients list (portal) | Scoped to own client (Phase 1) |
| Dashboard firm summary | Staff only (`requireConsultantOrAdmin`) |
| Universal search (client) | Filters by `userClientId` |
| Notifications PATCH | Service called with `user.id` |
| Billing overview / invoices | `requireBillingClientAccess` |
| Assessment PDF export | `requireAssessmentAccess` before generate |
| QBR / phase-proposal PDFs | Workspace access + parent `clientId` lookup |

### 3.3 Cross-tenant risk focus (this audit)

| Risk | Status |
| --- | --- |
| Classic portal IDOR on assessments/clients/projects | **Remediated** (Phase 1 / SS-OPT-001) — regression via existing tests |
| Pre-auth snapshot → activation token | **Confirmed Critical** (SEC-001-C01) |
| Staff reading all clients | **Accepted design** (SEC-001-M05) |
| Nested tipId/qbrId mismatch across clients | **Potential** — services typically take `(clientId, resourceId)`; matrix includes explicit tests |

---

## 4. API security review

| Topic | Result |
| --- | --- |
| Auth enforcement | Per-route; middleware excludes `/api` |
| RBAC | Role helpers on admin/staff routes; see inventory |
| Input validation | Zod on many write paths; some public routes use ad-hoc body checks |
| Rate limiting | Website-leads integration only (in-memory); login/reset/snapshot unprotected |
| Error responses | Mostly coded JSON; some `badRequest(error.message)` may leak internal strings |
| Data exposure | Recommendation visibility filter for clients; health config probe |
| HTTP methods | Method-specific handlers; no catch-all observed |
| Uploads | No general file-upload API; PDFs generated server-side |
| Webhooks | Stripe `constructEvent`; Resend Svix verify |
| Cron | `Authorization: Bearer ${CRON_SECRET}` |
| Integrations | `WEBSITE_LEADS_API_SECRET` |

Flagged routes that are intentionally public but abuse-sensitive: health, checkout, product-overview PDF, technology-snapshot POST, continue-assessment, password-reset, activate-account.

---

## 5. Automated security tests (current)

| Suite | Coverage |
| --- | --- |
| `tests/auth/api-client-isolation.test.ts` | Portal vs staff on clients/assessments/projects/recommendations; foreign id → 404; field stripping |
| `tests/recommendations/visibility.test.ts` | Role-based recommendation field presentation |

### Gaps (see test matrix)

Unauthenticated access to protected routes; wrong-role matrices; continue-assessment token leak; login/reset rate limits; password policy on reset; webhook signature failure; cron without secret; cross-tenant nested IDs; privilege escalation (client → admin via PATCH user — admin-only already).

---

## 6. Findings

Status legend: **Confirmed** = code evidence of exploitable weakness. **Potential** = weakness or design risk needing staging tests / product decision.

### SEC-001-C01 — Unauthenticated continue-assessment returns activation token URL

| Field | Detail |
| --- | --- |
| Severity | **CRITICAL** |
| Status | **Remediated in SS-SEC-002** (was Confirmed) |
| Component | `POST /api/v1/public/technology-snapshot/[leadId]/continue-assessment` |
| Description | Public handler calls `continueSnapshotToFullAssessment` with no authentication, email proof, or rate limit. On provision path it returns `activationUrl` containing the raw activation token, plus `assessmentId` and `clientId`. |
| Evidence | `src/app/api/v1/public/technology-snapshot/[leadId]/continue-assessment/route.ts` (entire handler unauthenticated); `src/lib/communications/outreach/convert-snapshot-to-assessment.ts` lines 128–132 (`activationUrl: ...?token=${provisioned.activationToken}`) |
| Exploitation | Attacker submits Technology Snapshot with victim email (`POST .../technology-snapshot` returns `id`), then POSTs continue-assessment for that `leadId`, receives activation URL, sets password, owns the client portal for that email before the victim. |
| Business impact | Account takeover of newly provisioned clients; unauthorized access to assessments and company workspace; trust/compliance failure. |
| Remediation | Never return raw activation tokens to unauthenticated callers. Deliver token only via email to lead address (or require magic-link challenge). Require possession of email inbox. Add rate limits and audit logging. Consider binding continue to a signed short-lived lead capability token. |
| Regression tests | TM-C01-a through TM-C01-d in test matrix |

### SEC-001-H01 — No login brute-force / rate limiting

| Field | Detail |
| --- | --- |
| Severity | **HIGH** |
| Status | **Remediated in SS-SEC-004** (was Confirmed; staging implementation — not production-deployed) |
| Component | Credentials `authorize` in `src/lib/auth/config.ts`; login UI → Auth.js |
| Description | No application-level attempt counters, lockout, or IP/email rate limit on credential authentication. bcrypt cost 12 slows guessing but does not stop distributed attacks. |
| Evidence | `src/lib/auth/config.ts` `authorize` — validate and compare only; no throttle helper. Contrast: `src/lib/website-leads/rate-limit.ts` exists for integrations only. |
| Exploitation | Online password spraying against known staff/client emails. |
| Business impact | Account compromise → firm-wide data access for staff accounts. |
| Remediation | Per-email and per-IP rate limits; progressive delay or temporary lockout; optional CAPTCHA after N failures; monitor Auth failures. Prefer edge/WAF + app-level counters durable across instances. |
| Implementation | PostgreSQL `AuthRateLimitBucket` via `src/lib/auth/rate-limit` — IP attempts (20/15m) + email failures (5/15m); fail-open on limiter backend errors. See [`SS-SEC-004-AUTH-ABUSE-PROTECTION.md`](SS-SEC-004-AUTH-ABUSE-PROTECTION.md). |
| Regression tests | TM-H01-* (`tests/auth/rate-limit.test.ts`) |

### SEC-001-H02 — Password-reset confirm bypasses minimum password length

| Field | Detail |
| --- | --- |
| Severity | **HIGH** |
| Status | **Remediated in SS-SEC-003** (was Confirmed) |
| Component | `PUT /api/v1/public/password-reset` → `confirmPasswordReset` |
| Description | Activation and user-create schemas enforce `min(10)`. Reset confirm hashes whatever password string is provided after a token check. Route only requires `token` and `password` truthiness. |
| Evidence | `src/app/api/v1/public/password-reset/route.ts` lines 12–17; `src/lib/auth/password-reset.ts` `confirmPasswordReset` (no length Zod); contrast `src/lib/auth/activation.ts` line 9 and `src/lib/users/schemas.ts`. |
| Exploitation | Attacker with a reset token (or user resetting) can set a 1-character password, weakening subsequent auth. |
| Business impact | Weak credentials; policy non-compliance with DOC-303. |
| Remediation | Shared password policy Zod schema (min 10+) on reset confirm and any password change path. |
| Regression tests | TM-H02-* |

### SEC-001-H03 — API routes excluded from middleware authentication

| Field | Detail |
| --- | --- |
| Severity | **HIGH** (defense-in-depth / residual) |
| Status | **Confirmed** (architectural); individual protected routes largely enforce auth after Phase 1 |
| Component | `src/middleware.ts` matcher `(?!api\|...)`; `auth.config.ts` public API allowlist unused for actual `/api` traffic |
| Description | NextAuth middleware never runs for `/api/*`. Every handler must independently call session helpers. A newly added route that forgets auth is immediately internet-reachable. |
| Evidence | `src/middleware.ts` lines 15–17; SECURITY_REMEDIATION_REPORT notes the same. |
| Exploitation | Future regression: new sensitive route without `getSessionUser` → unauthenticated access. |
| Business impact | High if a sensitive route ships without guards; current inventory shows intentional public exceptions only (plus C01). |
| Remediation | Central `withApiAuth` wrapper; CI lint forbidding `route.ts` without auth helper or explicit `PUBLIC_ROUTE` marker; optional middleware allowlist for `/api/v1/**`. |
| Regression tests | TM-H03-* (inventory lint / unauthenticated sweep) |

### SEC-001-H04 — Auth recovery and public acquisition flows lack rate limits

| Field | Detail |
| --- | --- |
| Severity | **HIGH** |
| Status | **Remediated in SS-SEC-004** (was Confirmed; staging implementation — not production-deployed) |
| Component | password-reset POST/PUT; activate-account; technology-snapshot POST; continue-assessment |
| Description | These endpoints are unauthenticated and unbounded. Enables reset-email bombing, token spraying, snapshot spam, and amplifies C01. |
| Evidence | Public routes under `src/app/api/v1/public/**` and `technology-snapshot/route.ts` have no rate-limit calls. |
| Exploitation | Abuse inbox; amplify C01; fill DB with leads. |
| Business impact | Operational cost, email reputation, support burden, attack amplification. |
| Remediation | Shared durable rate limiter (not only in-memory Map); tighter limits on token redeem endpoints. |
| Implementation | Same PostgreSQL limiter as H01 — IP + identifier scopes; reset-request and snapshot create/continue fail-closed; confirm/activation fail-open. Limits run before token redemption. See [`SS-SEC-004-AUTH-ABUSE-PROTECTION.md`](SS-SEC-004-AUTH-ABUSE-PROTECTION.md). |
| Regression tests | TM-H04-* (`tests/auth/rate-limit.test.ts`) |

### SEC-001-M01 — Public health endpoint exposes configuration posture

| Field | Detail |
| --- | --- |
| Severity | **MEDIUM** |
| Status | **Confirmed** |
| Component | `GET /api/v1/health` |
| Description | Unauthenticated JSON reports `authSecret` ok/error, `authUrl` warn/error, database ok/error, `environment`. |
| Evidence | `src/app/api/v1/health/route.ts` lines 6–47 |
| Exploitation | Recon for misconfiguration (missing secret, localhost AUTH_URL in production). |
| Remediation | Authenticate or restrict to internal networks; return minimal public `ok` without check detail. |
| Regression tests | TM-M01-* |

### SEC-001-M02 — Unauthenticated product-overview PDF generation (DoS / cost)

| Field | Detail |
| --- | --- |
| Severity | **MEDIUM** |
| Status | **Confirmed** |
| Component | `GET /api/product-overview/pdf` |
| Description | Generates PDF via `@react-pdf/renderer` with query params; no auth or rate limit. |
| Evidence | `src/app/api/product-overview/pdf/route.ts` |
| Exploitation | CPU/memory exhaustion via repeated PDF requests. |
| Remediation | Rate limit; cache; CDN; or require session/bot protection. |
| Regression tests | TM-M02-* |

### SEC-001-M03 — Unauthenticated assessment Checkout session creation

| Field | Detail |
| --- | --- |
| Severity | **MEDIUM** |
| Status | **Confirmed** (abuse / cost; commerce intentional) |
| Component | `POST /api/checkout/create-session` |
| Description | Anyone can create Stripe Checkout sessions with optional metadata. |
| Evidence | `src/app/api/checkout/create-session/route.ts` |
| Exploitation | Session spam; Stripe API quota; metadata pollution. |
| Remediation | Rate limit; bot protection; validate metadata allowlist. |
| Regression tests | TM-M03-* |

### SEC-001-M04 — Public Technology Snapshot submission unbounded

| Field | Detail |
| --- | --- |
| Severity | **MEDIUM** |
| Status | **Confirmed** |
| Component | `POST /api/v1/public/technology-snapshot` |
| Description | Creates leads and scores without rate limit; returns lead `id` used by C01. |
| Evidence | `src/app/api/v1/public/technology-snapshot/route.ts` |
| Remediation | Rate limit by IP/email; CAPTCHA; shorter-lived lead tokens. |
| Regression tests | TM-M04-* |

### SEC-001-M05 — Technician firm-wide access (no client assignment)

| Field | Detail |
| --- | --- |
| Severity | **MEDIUM** |
| Status | **Accepted design / Potential product risk** |
| Component | `requireConsultantOrAdmin`; all staff consulting routes |
| Description | Any technician can read/write all clients. Documented in SS-OPT-001; not a portal isolation bug. |
| Evidence | `src/lib/api/helpers.ts` `requireConsultantOrAdmin`; SECURITY_REMEDIATION_REPORT §2.3 |
| Remediation | Future per-client assignment; until then treat technician credentials as tier-0 secrets. |
| Regression tests | Document expected staff cross-client access; test clients **cannot** |

### SEC-001-M06 — VCIO checkout allows unauthenticated subscription session

| Field | Detail |
| --- | --- |
| Severity | **MEDIUM** |
| Status | **Potential** (product-dependent) |
| Component | `POST /api/checkout/vcio` |
| Description | Resolves session if present; still creates Checkout when unauthenticated (no client attachment). |
| Evidence | `src/app/api/checkout/vcio/route.ts` lines 37–114 |
| Remediation | Require auth for subscription attach; rate limit anonymous starts. |
| Regression tests | TM-M06-* |

### SEC-001-M07 — Website-leads rate limit is process-local memory

| Field | Detail |
| --- | --- |
| Severity | **MEDIUM** |
| Status | **Confirmed** (limited effectiveness on serverless) |
| Component | `src/lib/website-leads/rate-limit.ts` |
| Description | `Map` buckets reset per instance; ineffective under multi-instance Vercel. |
| Remediation | Redis/Upstash or edge rate limit. |
| Regression tests | Document; integration test in single-process only |

### SEC-001-M08 — continue-assessment leaks assessmentId for existing accounts

| Field | Detail |
| --- | --- |
| Severity | **MEDIUM** |
| Status | **Remediated in SS-SEC-002** (was Confirmed) |
| Component | `continueSnapshotToFullAssessment` existing_account branch |
| Description | Unauthenticated caller with `leadId` receives `loginUrl` and `assessmentId`. |
| Evidence | `convert-snapshot-to-assessment.ts` lines 76–82 |
| Remediation | Return generic “check your email / log in” without ids. |
| Regression tests | TM-C01-c |

### SEC-001-M09 — Password change does not explicitly invalidate other JWTs beyond inactivity

| Field | Detail |
| --- | --- |
| Severity | **MEDIUM** |
| Status | **Potential** |
| Component | JWT sessions; `confirmPasswordReset` / activation |
| Description | DOC-303 says password change should require re-login. JWT remains valid until expiry unless additional versioning exists; inactive flag is checked, password change is not. |
| Evidence | `config.ts` jwt callback checks `isActive` only; reset updates `passwordHash` only. |
| Remediation | Session version / `passwordChangedAt` claim invalidation. |
| Regression tests | TM-M09-* |

### SEC-001-L01 — `trustHost: true` and cookie defaults

| Field | Detail |
| --- | --- |
| Severity | **LOW** |
| Status | Potential hardening |
| Component | `auth.config.ts` line 110 |
| Remediation | Confirm production cookie `Secure`/`HttpOnly`/`SameSite` via Auth.js defaults and staging headers review. |

### SEC-001-L02 — No MFA (DOC-303 Phase 2)

| Severity | **LOW** (known deferral) |
| Remediation | Staff MFA especially for admin/technician. |

### SEC-001-L03 — Password policy lacks complexity / breach checks

| Severity | **LOW** |
| Evidence | DOC-303: min 10, no blocklist |
| Remediation | Optional zxcvbn / HIBP later. |

### SEC-001-L04 — Some handlers surface raw `Error.message` to clients

| Severity | **LOW** |
| Evidence | e.g. continue-assessment `badRequest(error.message)` |
| Remediation | Map to stable public error codes. |

### SEC-001-L05 — In-memory / missing rate limits elsewhere

| Severity | **LOW–MEDIUM** overlap with H04 |
| Notes | Covered under H04 for auth-critical paths. |

---

## 7. Prior findings — remediation status

From [`SECURITY_REMEDIATION_REPORT.md`](../SECURITY_REMEDIATION_REPORT.md):

| Prior issue | SS-SEC-001 status |
| --- | --- |
| Unscoped client/project/assessment APIs | **Remediated** — helpers + tests |
| Client enumeration via clients list | **Remediated** |
| Firm dashboard for any logged-in user | **Remediated** (staff-only) |
| Assessment PDF / recommendations foreign id | **Remediated** |
| Recommendation PATCH by any user | **Remediated** (staff-only) |
| Portal exposure of consulting fields | **Remediated** (visibility filter) |
| Assessment/project enumeration 403 vs 404 | **Remediated** (404) |
| Middleware excludes `/api` | **Still true** — tracked as SEC-001-H03 |
| Technician firm-wide | **Still true** — SEC-001-M05 |

Do **not** re-open Phase 1 items as new Critical findings unless regression tests fail.

---

## 8. Existing controls validated (checklist)

- [x] bcrypt cost 12
- [x] JWT + DB revalidation of `isActive` / role
- [x] Activation tokens hashed at rest
- [x] Password-reset tokens hashed; anti-enumeration on request
- [x] Stripe webhook signature verification
- [x] Resend webhook verification
- [x] Cron bearer secret
- [x] Website-leads shared secret
- [x] Client workspace + assessment ownership helpers
- [x] Portal recommendation field filtering
- [x] No Server Actions attack surface
- [x] Billing routes use billing auth helpers
- [x] Durable auth abuse rate limits (login / reset / activation / snapshot) — SS-SEC-004 on staging

---

## 9. Deliverable index

| Document | Purpose |
| --- | --- |
| This file | Findings, evidence, prioritization |
| [`SS-SEC-001-API-INVENTORY.md`](SS-SEC-001-API-INVENTORY.md) | All 112 routes with auth expectations |
| [`SS-SEC-001-TEST-MATRIX.md`](SS-SEC-001-TEST-MATRIX.md) | Proposed security test matrix |

---

## 10. Out of scope / not performed

- Destructive or live exploitation against production
- Penetration testing of staging with traffic generation beyond code review
- Dependency CVE scanning / SAST tool runs
- Code remediations (explicitly deferred to follow-on sprint)
