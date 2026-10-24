# SS-SEC-001 — Security Test Matrix

| Field | Value |
| --- | --- |
| Companion | [`SS-SEC-001-AUDIT.md`](SS-SEC-001-AUDIT.md), [`SS-SEC-001-API-INVENTORY.md`](SS-SEC-001-API-INVENTORY.md) |
| Purpose | Proposed automated / staging tests for authz boundaries |
| Constraint | **Do not** run destructive tests against production |
| Existing coverage | `tests/auth/api-client-isolation.test.ts`, `tests/recommendations/visibility.test.ts` |

### How to use

- **Expected**: response status / body shape that proves the boundary.
- **Priority**: P0 = ship-blocking with C01/H0x; P1 = High; P2 = Medium; P3 = Low / hygiene.
- Prefer Vitest route-handler tests with mocked Prisma/session (match existing isolation suite). Staging smoke only on non-prod.

---

## A. Unauthenticated access

| ID | Boundary | Request | Expected | Priority | Finding |
| --- | --- | --- | --- | --- | --- |
| TM-U-01 | Protected client read | `GET /api/v1/clients/{foreignId}` no cookie | 401 | P1 | H03 |
| TM-U-02 | Assessment read | `GET /api/v1/assessments/{id}` no cookie | 401 | P1 | H03 |
| TM-U-03 | Assessment PDF | `GET /api/v1/assessments/{id}/export/pdf` no cookie | 401 | P1 | H03 |
| TM-U-04 | Recommendation PATCH | `PATCH /api/v1/recommendations/{id}` no cookie | 401 | P1 | H03 |
| TM-U-05 | Users list | `GET /api/v1/users` no cookie | 401 | P1 | H03 |
| TM-U-06 | Admin prospects | `GET /api/v1/admin/prospects` no cookie | 401 | P1 | H03 |
| TM-U-07 | Cron without secret | `GET /api/cron/communications` | 401 | P1 | — |
| TM-U-08 | Stripe webhook bad sig | `POST /api/webhooks/stripe` garbage body | 4xx | P1 | — |
| TM-U-09 | Resend webhook bad sig | `POST /api/webhooks/resend` | 400 | P1 | — |
| TM-U-10 | Website-leads bad secret | `POST /api/integrations/website-leads` | 401 | P1 | — |
| TM-U-11 | Health public | `GET /api/v1/health` | 200/503 JSON (today) | P2 | M01 — assert desired post-fix behavior |
| TM-U-12 | Snapshot public | `POST /api/v1/public/technology-snapshot` valid body | 201 | P2 | M04 |

---

## B. Wrong role / privilege escalation

| ID | Boundary | Actor | Request | Expected | Priority |
| --- | --- | --- | --- | --- | --- |
| TM-R-01 | Client → admin users | client session | `GET /api/v1/users` | 403 | P1 |
| TM-R-02 | Client → delete client | client | `DELETE /api/v1/clients/{ownId}` | 403 | P1 |
| TM-R-03 | Client → archive assessment | client | `POST .../assessments/{id}/archive` | 403 | P1 |
| TM-R-04 | Client → firm dashboard | client | `GET /api/v1/dashboard/summary` | 403 | P1 |
| TM-R-05 | Client → portfolio | client | `GET /api/v1/portfolio/summary` | 403 | P1 |
| TM-R-06 | Client → customer 360 | client | `GET /api/v1/clients/{ownId}/360` | 403 | P1 |
| TM-R-07 | Client → recommendation PATCH | client | `PATCH /api/v1/recommendations/{id}` | 403 | P1 |
| TM-R-08 | Technician → delete user | technician | `DELETE /api/v1/users/{id}` | 403 | P1 |
| TM-R-09 | Technician → create user | technician | `POST /api/v1/users` | 403 | P1 |
| TM-R-10 | Technician → assessment library write | technician | `POST /api/v1/admin/assessment-library` | 403 | P1 |
| TM-R-11 | Technician firm read (by design) | technician | `GET /api/v1/clients` | 200 all clients | P3 | M05 documented |
| TM-R-12 | Client cannot elevate via body | client | `PATCH /api/v1/users/{self}` with `role:admin` | 403 or route N/A | P1 |

---

## C. Cross-tenant / IDOR

| ID | Boundary | Actor | Request | Expected | Priority | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| TM-T-01 | Foreign client GET | client A | `GET /api/v1/clients/{B}` | 403 | P0 | Existing suite |
| TM-T-02 | Foreign assessment GET | client A | `GET /api/v1/assessments/{B}` | **404** | P0 | Anti-enum |
| TM-T-03 | Foreign assessment PDF | client A | `.../export/pdf` | 404 | P0 | |
| TM-T-04 | Foreign project GET | client A | `GET /api/v1/projects/{B}` | 404 | P0 | Existing |
| TM-T-05 | Foreign billing invoice | client A | `GET .../billing/invoices/{B-invoice}` under A path or B path | 403/404 | P1 | |
| TM-T-06 | Nested QBR wrong client | client A | `GET /api/v1/clients/{A}/qbr/{B-qbrId}` | 404 | P1 | |
| TM-T-07 | Nested TIP wrong client | staff | `GET /api/v1/clients/{A}/tip/{B-tipId}` | 404 | P1 | |
| TM-T-08 | Nested proposal PDF | client A | proposal id of B under A | 404 | P1 | |
| TM-T-09 | Notification foreign id | client A | `PATCH /api/v1/notifications/{B-notif}` | no-op / 404 / not mark B | P1 | |
| TM-T-10 | Onboarding ignore body clientId | client A | POST onboarding with `clientId: B` | updates A only | P1 | |
| TM-T-11 | Search no foreign hits | client A | `GET /api/v1/search?q=...` | only A resources | P1 | |
| TM-T-12 | Recommendation fields | client | GET own assessment | no `templateCode` / trigger fields | P1 | Existing visibility |

---

## D. Continue-assessment / activation (Critical)

| ID | Boundary | Request | Expected (target after fix) | Priority | Finding |
| --- | --- | --- | --- | --- | --- |
| TM-C01-a | No raw token in JSON | Unauth `POST .../continue-assessment` after provision | **Must not** include `activationUrl` with token or raw token fields | P0 | C01 |
| TM-C01-b | Email-gated redeem | Attacker with leadId only | Cannot activate without email possession | P0 | C01 |
| TM-C01-c | Existing account | Unauth continue for active user lead | No `assessmentId` leak (generic message) | P1 | M08 |
| TM-C01-d | Rate limit | N continues from same IP | 429 after threshold | P1 | H04 |
| TM-C01-e | Today’s broken behavior (characterization) | Same as a | Documents current leak until remediated — quarantine test | P0 | C01 |

Run TM-C01-e only on **local/staging** fixtures; never production.

---

## E. Authentication & session

| ID | Boundary | Request | Expected | Priority | Finding |
| --- | --- | --- | --- | --- | --- |
| TM-H01-a | Login spray | N failed Auth.js credentials for same email | Throttle / lockout after fix | P1 | H01 |
| TM-H01-b | Inactive user | Login `isActive=false` | Failure | P1 | — |
| TM-H01-c | Wrong password | Login | Generic failure (no enum) | P1 | — |
| TM-M09-a | Post-reset JWT | Old session cookie after password reset | 401 on API after fix | P2 | M09 |
| TM-S-01 | Disabled mid-session | `isActive=false` then API call | 401 after JWT refresh path | P1 | — |
| TM-S-02 | `/api/v1/auth/me` | Valid session | 200 self only | P2 | — |

---

## F. Password reset & activation policy

| ID | Boundary | Request | Expected | Priority | Finding |
| --- | --- | --- | --- | --- | --- |
| TM-H02-a | Short password on reset | `PUT .../password-reset` password `"a"` valid token | **400** after fix | P0 | H02 |
| TM-H02-b | Min 10 on reset | password length 10 | 200 | P0 | H02 |
| TM-H02-c | Activation min 10 | activate with short password | 400 (already) | P1 | — |
| TM-H04-a | Reset request flood | Many POST reset same email/IP | 429 after fix | P1 | H04 |
| TM-PR-01 | Unknown email request | POST reset | 200 success shape (no enum) | P1 | — |
| TM-PR-02 | Used/expired token | PUT reset | 400 | P1 | — |

---

## G. Malformed / method abuse

| ID | Boundary | Request | Expected | Priority |
| --- | --- | --- | --- | --- |
| TM-M-01 | Invalid JSON body | POST protected with `{` | 400 | P2 |
| TM-M-02 | Wrong HTTP method | `DELETE` on GET-only health | 405 | P3 |
| TM-M-03 | Oversized snapshot body | Huge POST snapshot | 400/413 | P2 |
| TM-M-04 | Invalid assessment id | Non-UUID / garbage | 404/400 | P2 |

---

## H. Public abuse & webhooks (staging only)

| ID | Boundary | Expected after hardening | Priority | Finding |
| --- | --- | --- | --- | --- |
| TM-M01-a | Health detail | Unauth gets minimal body OR auth required | P2 | M01 |
| TM-M02-a | PDF rate limit | Burst → 429 | P2 | M02 |
| TM-M03-a | Checkout rate limit | Burst → 429 | P2 | M03 |
| TM-M04-a | Snapshot rate limit | Burst → 429 | P2 | M04 |
| TM-M06-a | VCIO anon checkout | Product decision: 401 or rate-limited | P2 | M06 |
| TM-W-01 | Stripe replay | Duplicate event id | Idempotent / no double fulfill | P1 | — |

---

## I. Coverage map vs existing tests

| Area | Existing? | Gap |
| --- | --- | --- |
| Client isolation (clients/assessments/projects) | Yes | Extend PDF, billing, nested tip/qbr |
| Recommendation visibility | Yes | Keep |
| Unauthenticated sweep of inventory | No | TM-U-* |
| Role matrix admin vs technician vs client | Partial | TM-R-* |
| Continue-assessment token | No | TM-C01-* |
| Login / reset rate limits | No | TM-H01 / H04 |
| Password policy on reset | No | TM-H02 |
| Webhook/cron secrets | No / light | TM-U-07–10, TM-W-01 |

---

## J. Suggested implementation order

1. Characterization test **TM-C01-e** (fails red until C01 fixed) on staging fixtures.
2. Expand `api-client-isolation` with TM-U-*, TM-T-05–12, TM-R-01–10.
3. Unit tests for password schema shared by reset/activation (TM-H02).
4. Rate-limit tests behind feature flags or in-process limiter doubles.
5. Staging smoke checklist (manual): webhooks, cron secret, checkout happy path — no production.

---

## K. Explicit non-goals for this matrix phase

- Production destructive testing
- Full penetration test engagement
- Load testing that bills Stripe live mode
- Social engineering / phishing of real customers
