# SS-SEC-007 — API Security Guardrails

| Field | Value |
| --- | --- |
| Status | Implemented on `staging` (code + tests; not production-deployed) |
| Date | 2026-10-25 |
| Branch | `staging` |
| Addresses | **SEC-001-H03**, **SEC-001-M01**, **SEC-001-M02**, **SEC-001-M03**, **SEC-001-M06**, **SEC-001-M07** |
| Related | [`SS-SEC-001-AUDIT.md`](SS-SEC-001-AUDIT.md), [`SS-SEC-001-API-INVENTORY.md`](SS-SEC-001-API-INVENTORY.md), [`SS-SEC-004-AUTH-ABUSE-PROTECTION.md`](SS-SEC-004-AUTH-ABUSE-PROTECTION.md), [`SS-SEC-005-SECURITY-CLOSURE.md`](SS-SEC-005-SECURITY-CLOSURE.md) |

---

## 1. API classification inventory

Canonical registry: `src/lib/api/route-registry.ts` (`API_ROUTE_REGISTRY`).

| Classification | Meaning | Count (at implementation) |
| --- | --- | --- |
| `public` | Intentional unauthenticated (Auth.js, health, public acquisition, assessment checkout, demo PDF) | 8 |
| `mixed` | Method- or session-optional split (documented in `notes`) | 12 |
| `authenticated` | Any signed-in user (`getSessionUser` / equivalent) | 6 |
| `client_scoped` | Portal/tenant object access (`requireClientWorkspaceAccess`, assessment/billing helpers) | ~30 |
| `staff` | `requireConsultantOrAdmin` (or equivalent role gate) | ~35 |
| `admin` | `requireAdmin` | ~25 |
| `internal` | Shared secret / webhook signature / cron bearer | 4 |

**Total:** 112 `src/app/api/**/route.ts` files — registry must equal filesystem (CI).

Intentional `public` paths:

- `auth/[...nextauth]/route.ts`
- `checkout/create-session/route.ts`
- `product-overview/pdf/route.ts`
- `v1/health/route.ts`
- `v1/public/activate-account/route.ts`
- `v1/public/password-reset/route.ts`
- `v1/public/technology-snapshot/route.ts`
- `v1/public/technology-snapshot/[leadId]/continue-assessment/route.ts`

`checkout/vcio` remains **`mixed`** (optional session; anonymous Checkout allowed by product design) with durable IP rate limiting.

Human-readable companion tables remain in [`SS-SEC-001-API-INVENTORY.md`](SS-SEC-001-API-INVENTORY.md); the registry is authoritative for CI completeness.

---

## 2. Authorization architecture

### Existing model (unchanged)

- NextAuth middleware **excludes** `/api/*` (`src/middleware.ts`).
- Route handlers enforce auth via existing helpers in `src/lib/api/helpers.ts`, access modules, and integration/webhook secrets.
- Object-level / Client-tenant checks (`requireClientWorkspaceAccess`, `requireAssessmentAccess`, billing gates) are preserved.

### SS-SEC-007 addition (no second auth system)

| Control | Role |
| --- | --- |
| `API_ROUTE_REGISTRY` | Explicit classification of every `route.ts` |
| `tests/api/route-registry.test.ts` | Fails CI if filesystem and registry diverge; locks intentional public set |
| Per-route helpers | Unchanged runtime authorization |

**Not introduced:** a parallel `withApiAuth` middleware layer that could conflict with method-split (`mixed`) routes or tenant helpers.

**Developer rule:** any new `src/app/api/**/route.ts` must add a registry entry in the same change; otherwise `route-registry` tests fail.

---

## 3. Security controls implemented

### 3.1 Classification guardrails (H03)

- Registry + automated completeness / public-allowlist tests.
- Prevents *unclassified* routes from shipping unnoticed (primary AI-regression risk).

### 3.2 Public endpoint hardening (reuse SS-SEC-004)

New `AuthRateLimitBucket` scopes in `src/lib/auth/rate-limit/config.ts`:

| Scope | Limit | Window | Fail mode | Finding |
| --- | --- | --- | --- | --- |
| `health_ip` | 60 | 1 min | open | M01 |
| `product_overview_pdf_ip` | 10 | 15 min | closed | M02 |
| `checkout_create_ip` | 10 | 15 min | closed | M03 |
| `checkout_vcio_ip` | 10 | 15 min | closed | M06 |
| `website_leads_ip` | 30 | 1 min | closed | M07 |

Enforce helpers: `enforceHealthIpLimits`, `enforceProductOverviewPdfLimits`, `enforceCheckoutCreateLimits`, `enforceCheckoutVcioLimits`, `enforceWebsiteLeadsIpLimits`.

Additional M01/M02 controls:

- Health JSON is `{ status: "ok" \| "unhealthy" }` only (no `checks` / `environment`).
- Product-overview PDF sets `Cache-Control: public, max-age=300, stale-while-revalidate=60`.
- Website-leads in-memory `Map` limiter removed; integration route uses durable enforce helper.

Legitimate checkout and lead-submission flows remain available under the limits above.

---

## 4. Findings remediated

| Finding | Remediation | Status |
| --- | --- | --- |
| **SEC-001-H03** | Explicit registry + CI completeness; public allowlist locked | **Remediated and verified** (automated); middleware still excludes `/api` by design |
| **SEC-001-M01** | Minimal health body + `health_ip` (fail-open) | **Remediated and verified** |
| **SEC-001-M02** | `product_overview_pdf_ip` + short cache | **Remediated and verified** |
| **SEC-001-M03** | `checkout_create_ip` (fail-closed) | **Remediated and verified** |
| **SEC-001-M06** | `checkout_vcio_ip` (fail-closed); anon Checkout preserved | **Partially remediated** — abuse bounded; product still allows unauthenticated session create |
| **SEC-001-M07** | Durable `website_leads_ip`; in-memory Map removed | **Remediated and verified** |

---

## 5. Remaining risks

| Risk | Notes |
| --- | --- |
| Registry drift without running tests | Mitigated by CI; local skip still possible |
| Classification wrong but present | Registry notes are not statically proven against helper calls |
| M06 product choice | Anonymous vCIO Checkout still allowed (rate-limited) |
| M09 / L01 / L02 / L04 | Outside SS-SEC-007 scope |
| Staging validation | Rate-limit table + smoke against deployed staging still required |
| Health 503 vs probe UX | Aggregates DB/auth env into status only; ops must use logs for detail |

---

## 6. Automated test results

Validation on `staging` (2026-10-25):

| Check | Result |
| --- | --- |
| Targeted SEC-007 + isolation suite | **78 passed** |
| Full `npm test` | **133 files / 641 tests passed** |
| `npm run lint` | **0 errors** (preexisting warnings only) |
| `npx tsc --noEmit` | Preexisting test-file TS errors only (unchanged by SEC-007) |
| `npm run build` | **Compiled successfully** |

Evidence files:

- `tests/api/route-registry.test.ts` — classification completeness
- `tests/api/public-endpoint-guardrails.test.ts` — public access / wiring / health body
- `tests/auth/rate-limit.test.ts` — SEC-007 scopes, fail modes, enforce helpers
- `tests/auth/api-client-isolation.test.ts` — tenant isolation (pre-existing)
- `tests/website-leads/integration.test.ts` — durable leads limiter + submission schemas
- `tests/stripe/routes.test.ts` — checkout still present + rate-limit wiring

---

## 7. Staging validation requirements

1. Deploy **staging** only (no production migrate/deploy from this milestone).
2. Confirm `AuthRateLimitBucket` migration already applied on staging Neon (from SS-SEC-004).
3. Smoke:
   - `GET /api/v1/health` → `{ "status": "ok" }` only (no `checks`).
   - `scripts/smoke-check.ts` against staging base URL.
4. Manual abuse checks (staging):
   - Exceed PDF / checkout / website-leads limits → `429` (or `503` if limiter backend down for fail-closed flows).
   - Health over-limit → `429`; with forced DB limiter failure, health should still answer (fail-open).
5. Legitimate flows:
   - Assessment checkout create-session succeeds under limit.
   - Website-leads integration POST with valid secret succeeds under limit.
6. Do **not** auto-promote to production; require explicit release approval after staging sign-off.

---

## Completion checklist

- [x] Full API inventory classified in registry
- [x] CI rejects unclassified routes
- [x] Public abuse findings M01–M03, M07 remediated; M06 bounded
- [x] Reused SS-SEC-004 limiter (no new infra)
- [x] Docs + SEC-001 / SEC-005 updates
- [x] Full automated suite + lint + production build
- [ ] Staging deploy + manual checklist (operator)
- [ ] Production deploy (explicit, separate)
