# SS-SEC-004 — Authentication Abuse Protection

| Field | Value |
| --- | --- |
| Status | Implemented on `staging` (code + migration; not production-deployed); final security validation complete |
| Date | 2026-04-25 (validation 2026-10-25) |
| Branch | `staging` |
| Addresses | **SEC-001-H01**, **SEC-001-H04** |
| Related | [`SS-SEC-001-AUDIT.md`](SS-SEC-001-AUDIT.md), [`SS-SEC-003-PASSWORD-POLICY.md`](SS-SEC-003-PASSWORD-POLICY.md), DOC-303 |
| Architecture | **Option A** — PostgreSQL / Neon via Prisma (no Redis/Upstash) |

---

## Problem

Credentials login and unauthenticated recovery/acquisition endpoints had no durable application-level rate limits. Process-local maps are ineffective across Vercel serverless instances. SEC-001-H01 (login brute force) and SEC-001-H04 (reset / activation / snapshot abuse) required shared counters.

---

## Architecture

### Design

Reusable PostgreSQL-backed limiter in `src/lib/auth/rate-limit/`:

| Module | Role |
| --- | --- |
| `config.ts` | Scopes, thresholds, windows, fail modes, attempts vs failures |
| `keys.ts` | HMAC bucket keys (`AUTH_SECRET`), client IP extraction, email normalize |
| `limiter.ts` | Atomic UPSERT consume, peek, opportunistic prune |
| `responses.ts` | Generic 429 / 503 JSON (no account hints) |
| `index.ts` | Per-flow enforce helpers |

### Atomic enforcement

```sql
INSERT INTO "AuthRateLimitBucket" (...)
VALUES (...)
ON CONFLICT ("bucketKey") DO UPDATE SET
  "count" = CASE
    WHEN "AuthRateLimitBucket"."windowEndsAt" <= NOW() THEN 1
    ELSE "AuthRateLimitBucket"."count" + 1
  END,
  "windowEndsAt" = CASE
    WHEN "AuthRateLimitBucket"."windowEndsAt" <= NOW() THEN <new window>
    ELSE "AuthRateLimitBucket"."windowEndsAt"
  END,
  "updatedAt" = NOW()
RETURNING "count", "windowEndsAt";
```

- Single round-trip; no read-modify-write race for increments.
- Shared state across all serverless instances via Neon.
- Bucket keys are HMAC-SHA256(`scope:normalizedIdentifier`, `AUTH_SECRET`) — never raw emails, tokens, passwords, or IPs.

### Client IP trust assessment

Resolution order in `resolveClientIp` (`src/lib/auth/rate-limit/keys.ts`):

1. `x-vercel-forwarded-for` (first hop)
2. `x-real-ip`
3. `x-forwarded-for` (first hop)
4. `unknown`

**Documented Vercel behavior** ([Request headers](https://vercel.com/docs/headers/request-headers)):

- On **direct Vercel** traffic, `x-forwarded-for` / `x-real-ip` are the public client IP and are **overwritten** so clients cannot spoof them.
- `x-vercel-forwarded-for` is identical to that client IP and is preferred because an external reverse proxy may overwrite `x-forwarded-for` while the Vercel-owned header remains the platform value.
- Enterprise **Verified Proxy** is required if StackScore sits behind a custom proxy that must forward true client IPs; without it, Vercel evaluates the connecting proxy IP for platform firewall purposes.

| Topology | Spoofing bypass of IP throttles? |
| --- | --- |
| Direct Vercel (current assumed deploy) | **No** — platform overwrites client-supplied XFF |
| External proxy without Verified Proxy | IP buckets may reflect proxy egress, not end-user; prefer Verified Proxy + `x-vercel-forwarded-for` |
| Local / non-Vercel | Headers are client-controlled; IP limits are best-effort only |

**Correction applied (final validation):** prefer `x-vercel-forwarded-for`; fix inaccurate “Vercel appends client first” comment.

### Cleanup

~2% of successful consumes call `pruneExpiredRateLimitBuckets` (delete rows with `windowEndsAt` older than 24h). Indexed on `windowEndsAt`.

---

## Database schema

**Model:** `AuthRateLimitBucket`

| Column | Type | Notes |
| --- | --- | --- |
| `id` | TEXT PK | UUID |
| `bucketKey` | TEXT UNIQUE | HMAC hex |
| `scope` | TEXT | Policy scope name |
| `count` | INT | Window counter |
| `windowEndsAt` | TIMESTAMP | Sliding fixed window end |
| `createdAt` / `updatedAt` | TIMESTAMP | Audit |

**Migration:** `prisma/migrations/20260425010000_auth_rate_limit_bucket/`

Apply on **staging only** (`prisma migrate deploy` against the staging database). Do **not** run against production until a separate production release approves it.

---

## Protected surfaces

| Flow | Enforcement | Fail mode |
| --- | --- | --- |
| Credentials login (`authorize`) | IP attempts + atomic email admit (clear on success) | **fail-open** |
| `POST` password-reset (request) | IP + email attempts | **fail-closed** (503) |
| `PUT` password-reset (confirm) | IP + token attempts | **fail-open** |
| `GET`/`POST` activate-account | IP + token attempts | **fail-open** |
| `POST` technology-snapshot (create) | IP attempts | **fail-closed** |
| `POST` …/continue-assessment | IP + leadId attempts | **fail-closed** |
| `GET` health *(SS-SEC-007)* | IP attempts | **fail-open** |
| `GET` product-overview PDF *(SS-SEC-007)* | IP attempts | **fail-closed** |
| `POST` checkout create-session *(SS-SEC-007)* | IP attempts | **fail-closed** |
| `POST` checkout vcio *(SS-SEC-007)* | IP attempts | **fail-closed** |
| `POST` integrations/website-leads *(SS-SEC-007)* | IP attempts | **fail-closed** |

Rate checks run **before** token redemption / password hashing side effects so exhausted budgets do not consume valid reset or activation tokens. Public abuse scopes added in [`SS-SEC-007-API-GUARDRAILS.md`](SS-SEC-007-API-GUARDRAILS.md) reuse this same `AuthRateLimitBucket` infrastructure.

---

## Thresholds (starting values)

Limits are **inclusive** (`count > limit` → deny).

| Scope | Limit | Window | Counts | Why |
| --- | --- | --- | --- | --- |
| `login_ip` | 20 | 15 min | **attempts** | Caps distributed spraying from one IP without locking a single account permanently |
| `login_email_failures` | 5 | 15 min | **failures** (atomic admit) | UPSERT increments **before** password verify (atomic under concurrency). Successful login calls `clearLoginEmailFailures` so mistypes do not permanently lock an account |
| `password_reset_request_ip` | 10 | 1 hour | **attempts** | Limits reset-email bombing per IP |
| `password_reset_request_email` | 3 | 1 hour | **attempts** | Limits inbox flooding per address (hashed) |
| `password_reset_confirm_ip` | 5 | 15 min | **attempts** | Token spraying from one IP |
| `password_reset_confirm_token` | 5 | 15 min | **attempts** | Guessing against one token identifier |
| `activation_ip` | 5 | 15 min | **attempts** | Same for activation |
| `activation_token` | 5 | 15 min | **attempts** | Same for activation |
| `snapshot_create_ip` | 10 | 15 min | **attempts** | H04 lead spam / cost control (create was not in the discovery bullet list; starting IP cap for the public POST) |
| `snapshot_continue_ip` | 5 | 15 min | **attempts** | Amplification of continue abuse |
| `snapshot_continue_lead` | 3 | 1 hour | **attempts** | Per-lead continue spam |
| `health_ip` | 60 | 1 min | **attempts** | SS-SEC-007 / M01 probe budget |
| `product_overview_pdf_ip` | 10 | 15 min | **attempts** | SS-SEC-007 / M02 PDF CPU |
| `checkout_create_ip` | 10 | 15 min | **attempts** | SS-SEC-007 / M03 Checkout spam |
| `checkout_vcio_ip` | 10 | 15 min | **attempts** | SS-SEC-007 / M06 vCIO Checkout |
| `website_leads_ip` | 30 | 1 min | **attempts** | SS-SEC-007 / M07 (replaces in-memory Map) |

Temporary throttles only — **no permanent account lockouts**.

---

## Failure behavior

| Flow | Backend limiter error | Client response |
| --- | --- | --- |
| Login | Allow auth to proceed; sanitized `console.warn` | Normal credentials outcome (or rate_limited only when counters work) |
| Password-reset request | Deny | `503` + `TEMPORARILY_UNAVAILABLE` (generic) |
| Password-reset confirm | Allow confirm to proceed | Normal policy/token errors |
| Activation | Allow activation/validation | Normal activation errors |
| Snapshot create / continue | Deny | `503` when backendError; else `429` |

Responses never reveal secrets, account existence, or limiter internals. Login UI maps Auth.js `code=rate_limited` to a generic wait message.

---

## Security invariants preserved

- SS-SEC-003 password policy unchanged.
- Reset/activation token expiry and single-use unchanged.
- Anti-enumeration on reset request and continue-assessment unchanged.
- No passwords, raw tokens, or emails stored in limiter rows or logs.
- HMAC keyed by existing `AUTH_SECRET` (no new secret required).

---

## Configuration / environment

| Variable | Required | Notes |
| --- | --- | --- |
| `AUTH_SECRET` | **Yes** | Already required for Auth.js; also HMAC key for bucket identifiers |
| `DATABASE_URL` | **Yes** | Existing Neon/Postgres connection (staging vs production separation) |

No Redis, Upstash, or additional rate-limit env vars in this release. Thresholds are code constants in `config.ts` (tune in a follow-up if staging metrics warrant).

### Database isolation (staging vs production)

| Concern | Expected configuration |
| --- | --- |
| `DATABASE_URL` | Distinct Neon database/branch per environment (SS-ENV-001) |
| `AuthRateLimitBucket` | Created by migration on whichever DB `migrate deploy` targets — staging and production tables are **not** shared when URLs differ |
| `AUTH_SECRET` | Distinct per environment (HMAC keys are not portable across envs) |
| Production migrate | **Not** part of SS-SEC-004 — run only under a separate production change control |

`vercel-build` runs `prisma migrate deploy` when `VERCEL=1` unless `SKIP_PRISMA_MIGRATE=1`. Staging Preview/Staging env must never point `DATABASE_URL` at production Neon.

---

## Concurrent login enforcement

**Finding (pre-validation):** `getRateLimitCount` peek + post-auth `recordLoginFailure` allowed parallel requests to exceed five password checks per email (bounded only by the IP attempt cap).

**Correction:** `enforceLoginRateLimits` now **atomically consumes** `login_email_failures` via the same UPSERT as other scopes. `authorize` clears the bucket with `clearLoginEmailFailures` only after a successful password match. Failed / inactive / missing-user paths keep the reserved slot.

**Remaining concurrency note:** Inclusive limit still allows exactly `limit` concurrent admissions (by design). Counts may briefly show `> limit` for denied overshoot rows (same as other scopes); those requests are rejected before credential verify when admission fails.

---

## Tests

`tests/auth/rate-limit.test.ts` covers:

- Threshold enforcement (inclusive limits)
- Concurrent consumes against shared store (atomic UPSERT simulation)
- **Concurrent login email admission** cannot exceed inclusive limit
- Window expiration reset
- Distributed-instance shared state
- IP vs identifier dual limits
- Fail-open / fail-closed backend modes
- Route-level 429/503 without invoking token/email side effects
- HMAC hashing / **Vercel-first IP extraction**
- Login email clear-on-success
- Opportunistic prune

Existing auth workflows (`password-policy`, `continue-snapshot-security`, activation lifecycle) remain green; continue route tests mock the limiter allow-path so SEC-002 assertions stay focused.

---

## Staging deployment readiness

| Check | Status |
| --- | --- |
| Migration `20260425010000_auth_rate_limit_bucket` present and valid SQL | Ready |
| Prisma model matches migration | Ready |
| Env vars documented (`AUTH_SECRET`, `DATABASE_URL`) | Ready |
| Fail modes match approved architecture | Ready |
| Staging migrate instructions | Apply with staging `DATABASE_URL` only |
| Production migrate / auto-deploy | **Not** performed |

### Staging steps (manual)

1. Confirm shell/Vercel `DATABASE_URL` host is **staging** Neon (not production).
2. `npx prisma migrate deploy`
3. Confirm migration applied; `AuthRateLimitBucket` exists.
4. Confirm staging `AUTH_SECRET` is set and distinct from production.
5. Manual checklist (below).
6. Do **not** migrate or deploy production as part of SS-SEC-004.

### Manual validation checklist

- [ ] Login: 5+ wrong passwords for one email → temporary block message; successful login clears email budget.
- [ ] Login: many attempts from one IP → IP throttle without permanent lockout.
- [ ] Password reset request: 4th request same email within an hour → 429; unknown emails still get generic success when under limit.
- [ ] Password reset confirm: repeated bad tokens → 429; valid token not consumed when limited.
- [ ] Activation GET/POST: spray → 429; valid token still redeemable after window.
- [ ] Snapshot create: burst from one IP → 429/503 as configured.
- [ ] Continue-assessment: 4th continue same `leadId` within hour → 429; response still has no activation URL.
- [ ] With DB unreachable (staging fault injection if available): login still works; reset request returns 503.

---

## Final security validation results

| Area | Verdict |
| --- | --- |
| Client IP trust (direct Vercel) | Safe; prefer `x-vercel-forwarded-for` (corrected) |
| Concurrent email failure cap | Fixed via atomic admit + clear-on-success |
| Fail modes | Match approval; fail-open during limiter outages is intentional residual risk |
| Token integrity / anti-enumeration | Preserved |
| `npm test` | **619 passed** |
| `npm run lint` | **0 errors** (32 pre-existing warnings) |
| `npx tsc --noEmit` | **0 errors** in SEC-004 sources; **27 pre-existing** test-file TS errors elsewhere |
| `npx next build` | **Succeeded** |
| `npm run build` (`--turbopack`) | Local font resolution failure (pre-existing / env); webpack `next build` is the verified path |

Independent review: [SEC-004 security review](ecc6796c-692a-444a-b8cd-0743dd0bd137) — no critical/high findings; medium residuals are fail-open during outages and conditional proxy topologies.

---

## Remaining risks

1. **Login / confirm / activation fail-open** during limiter DB outages — approved availability tradeoff; spraying possible while Postgres is down.
2. **External reverse proxy without Verified Proxy** — IP buckets may not bind to true end-user IPs.
3. **Email-targeted temporary throttle** — attackers can burn hashed email budgets; short windows; no permanent lockout; success clears login email budget.
4. **Table growth** — probabilistic prune; add cron if staging shows bloat.
5. **Threshold tuning** — starting values may need adjustment after staging traffic.
6. **Website-leads in-memory limiter** — out of scope (separate integration path).

---

## Files touched

| Path | Change |
| --- | --- |
| `prisma/schema.prisma` | `AuthRateLimitBucket` model |
| `prisma/migrations/20260425010000_auth_rate_limit_bucket/` | Staging migration |
| `src/lib/auth/rate-limit/*` | Limiter module; IP trust + atomic login admit |
| `src/lib/auth/config.ts` | Login enforce + clear-on-success |
| `src/components/auth/login-form.tsx` | rate_limited UX |
| `src/app/api/v1/public/password-reset/route.ts` | Request/confirm limits |
| `src/app/api/v1/public/activate-account/route.ts` | GET/POST limits |
| `src/app/api/v1/public/technology-snapshot/route.ts` | Create limits |
| `src/app/api/v1/public/technology-snapshot/[leadId]/continue-assessment/route.ts` | Continue limits |
| `tests/auth/rate-limit.test.ts` | Coverage incl. IP preference + concurrent email admit |
| `docs/security/SS-SEC-001-AUDIT.md` | H01/H04 status |
| `docs/security/SS-SEC-004-AUTH-ABUSE-PROTECTION.md` | This report |
