# SS-REL-004 — Stripe Integration Validation

| Field | Value |
| --- | --- |
| Status | **Revalidated after SS-REL-005 (2026-10-26 evening)** |
| Date | 2026-10-26 (initial) · **revalidation 2026-10-26 ~21:30 local** |
| Branch | `staging` @ `bebfb77` |
| Staging app | `https://staging.stackscore.tech` |
| Expected webhook path | `/api/webhooks/stripe` (query bypass may be appended per SS-REL-005) |
| Stripe target | Bobkat IT **Sandbox** (operator-stated) |
| Related | [`SS-REL-005-WEBHOOK-PROTECTION-RESOLUTION.md`](SS-REL-005-WEBHOOK-PROTECTION-RESOLUTION.md) |
| Constraints | No production Stripe/DB writes; no protection changes; no secrets in report; no live charges; no migrations |

### Final recommendation (post–SS-REL-005 revalidation)

# **BLOCKED — STAGING STRIPE ENV + INDEPENDENT BYPASS PROOF**

Operator reports **Protection Bypass for Automation** is enabled and staging Stripe/Resend webhook destinations were updated. That correctly addresses the prior root cause from SS-REL-005’s recommendation.

This session **could not independently prove** that Stripe/Resend deliveries now reach StackScore handlers, because the automation bypass secret is not available to the validator (not in local env; Vercel CLI logged out). Probes **without** the bypass still receive Vercel Authentication `401` — expected and confirms protection remains enabled.

Separately, **Staging `STRIPE_*` configuration remains unconfirmed** from this workstation (local Stripe vars still **ABSENT**; historical live staging probes when protection was briefly off returned `CHECKOUT_FAILED` / `VCIO_CHECKOUT_FAILED`). That alone blocks a complete sandbox checkout even if webhooks clear the edge.

Code review + `tests/stripe` (**16** tests) remain green. Production was not modified.

---

## Revalidation scoreboard (this pass)

| # | Check | Result |
| --- | --- | --- |
| 1 | Staging Stripe env (presence / `sk_test_` mode, no secret values) | **NOT VERIFIED on Vercel** — local all `STRIPE_*` **ABSENT**; Vercel CLI **logged out** |
| 2 | Staging Stripe webhook reachable (test delivery) | **NOT INDEPENDENTLY VERIFIED** — no bypass secret in validator context; operator-stated config only |
| 3 | Response from StackScore (not Vercel Auth) when allowed | **Control PASS on production**; staging **without bypass = Vercel 401**; staging **with bypass = not probed** |
| 4 | Resend webhook connectivity | Same as Stripe — **401 without bypass**; with-bypass **not probed** |
| 5 | Webhook delivery errors (provider dashboards) | **NOT READ** — no Stripe/Resend dashboard API access this session |
| 6 | Staging DB isolated from production | **PASS (local/.env evidence)** — active `ep-patient-credit-…` / `neondb`; distinct from commented prod `ep-autumn-wave-…`; `prisma db execute` succeeded. **Vercel UI dual-check still operator-owned** |
| 7 | Remaining sandbox-checkout blockers | See § Remaining Blockers below |

---

## Executive Summary (cumulative)

| Area | Result |
| --- | --- |
| Webhook route exists at expected path | **PASS** — `src/app/api/webhooks/stripe/route.ts` → `POST /api/webhooks/stripe` |
| Signature verification | **PASS** (code) — raw body + `constructEvent` + reject missing/invalid signature |
| Assessment checkout mode | **PASS** (code) — `mode: "payment"` (one-time) |
| vCIO checkout mode | **PASS** (code) — `mode: "subscription"` |
| Fulfillment trusts client payment flags | **PASS** (code) — webhook session `payment_status === "paid"`; success pages re-fetch Stripe |
| Duplicate delivery | **PASS** (code) — `StripeWebhookEvent` idempotency |
| Local Stripe env configured | **FAIL** — all Stripe vars **ABSENT** in local `.env` |
| Vercel Staging Stripe env | **UNKNOWN** this session (CLI logged out); historically **FAIL** when staging was briefly unprotected (SS-REL-002) |
| Deployment Protection | **Still ON** — unauthenticated staging POSTs → `401` `Protected by Vercel Authentication` |
| Operator Protection Bypass + webhook URL update | **STATED DONE** — not independently re-probed with bypass secret |
| Live sandbox checkout / charge | **NOT TESTED** (blocked + not authorized) |
| Automated `tests/stripe` | **PASS** — 5 files / **16** tests (re-run 2026-10-26) |

---

## Configuration

### Required variables (from `src/lib/stripe/config.ts` + checkout routes)

| Variable | Required for | Notes |
| --- | --- | --- |
| `STRIPE_SECRET_KEY` | All Stripe API | Must be `sk_test_…` on staging |
| `STRIPE_ASSESSMENT_PRICE_ID` | Assessment Checkout | `price_…` in same sandbox account |
| `STRIPE_VCIO_PRICE_ID` | vCIO Checkout | `price_…`; optional for assessment-only |
| `STRIPE_WEBHOOK_SECRET` | Webhook verify | `whsec_…` for the **staging** endpoint |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | Success/cancel URLs | Via `getAppUrl()` — staging must be `https://staging.stackscore.tech` on Vercel Staging |
| `RESEND_WEBHOOK_SECRET` | Resend Svix verify | Staging Resend endpoint |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | Edge only | System env from Protection Bypass; **not** used by app signature logic |

### Local presence check (this workstation — revalidation)

| Variable | Status |
| --- | --- |
| `STRIPE_SECRET_KEY` | **ABSENT** |
| `STRIPE_ASSESSMENT_PRICE_ID` | **ABSENT** |
| `STRIPE_VCIO_PRICE_ID` | **ABSENT** |
| `STRIPE_WEBHOOK_SECRET` | **ABSENT** |
| `RESEND_WEBHOOK_SECRET` | **ABSENT** |
| `VERCEL_AUTOMATION_BYPASS_SECRET` | **ABSENT** (expected — do not commit) |
| `DATABASE_URL` | **PRESENT** — host `ep-patient-credit-atddo1zm.c-9.us-east-1.aws.neon.tech` / db `neondb` |
| `AUTH_URL` / `NEXT_PUBLIC_APP_URL` | Present — hosts `localhost` (local-oriented) |

### Sandbox key mode

- **Cannot verify** Vercel Staging secret mode this session (Vercel CLI: **Logged out**).
- Local key absent → local checkout returns `CHECKOUT_FAILED` / `VCIO_CHECKOUT_FAILED`.
- Prior live staging (SS-REL-002, protection temporarily off): assessment/vCIO returned not-configured failures — treat Staging Stripe env as **suspect until operator confirms** `sk_test_` + price IDs + `whsec_`.

### Price / product model

| Product | Checkout mode | Price env |
| --- | --- | --- |
| Technology Assessment | **One-time** `payment` | `STRIPE_ASSESSMENT_PRICE_ID` |
| StackScore vCIO / Strategic IT Consulting | **Subscription** `subscription` | `STRIPE_VCIO_PRICE_ID` |

---

## Webhook Routing

### Route confirmation

| Check | Status | Evidence |
| --- | --- | --- |
| Route file exists | **PASS** | `src/app/api/webhooks/stripe/route.ts` |
| HTTP method | **PASS** | Exports `POST` |
| Expected public path | **PASS** | `/api/webhooks/stripe` |
| Raw body for signature | **PASS** | `const rawBody = await request.text()` before `constructEvent` |
| `Stripe-Signature` required | **PASS** | Missing → **400** `MISSING_SIGNATURE` |
| Invalid signature rejected | **PASS** | `constructEvent` catch → **400** `INVALID_SIGNATURE` |
| Missing webhook secret | **PASS** | **500** `WEBHOOK_NOT_CONFIGURED` |
| Untrusted client payment status | **PASS** | Fulfillment uses Stripe session from signed event |
| Duplicate events | **PASS** | `StripeWebhookEvent` idempotency |

### Live probes (revalidation)

| Request | Result |
| --- | --- |
| `POST https://staging.stackscore.tech/api/webhooks/stripe` (no bypass) | **401** JSON — `Protected by Vercel Authentication` / `vercel_auth_enabled: true` — **not** StackScore |
| `POST https://staging.stackscore.tech/api/webhooks/resend` (no bypass) | **401** — same Vercel protection payload |
| `POST https://staging.stackscore.tech/api/checkout/create-session` (no bypass) | **401** — Vercel protection |
| `POST https://stackscore.tech/api/webhooks/stripe` (unsigned body) | **400** `{"error":"Missing Stripe signature","code":"MISSING_SIGNATURE"}` — **StackScore handler** (`X-Matched-Path: /api/webhooks/stripe`) |
| Staging with `?x-vercel-protection-bypass=…` | **NOT PROBED** — bypass secret unavailable to validator |
| Stripe Dashboard “Send test webhook” | **NOT OBSERVED** — no dashboard access |

### Deployment protection (post–SS-REL-005)

| Check | Status |
| --- | --- |
| Protection still enabled (no disable by this validation) | **PASS** — staging anonymous still 401 |
| Operator enabled Protection Bypass for Automation | **STATED** (operator) |
| Operator updated Stripe/Resend destinations with bypass query | **STATED** (operator) |
| Independent proof bypass reaches StackScore | **FAIL / PENDING** — need one of: (a) validator temp access to bypass secret for unsigned POST expecting `MISSING_SIGNATURE` / Resend `Invalid webhook`, or (b) Stripe/Resend dashboard screenshot of successful delivery + app JSON body |

**Expected StackScore responses after successful edge bypass (unsigned probe):**

- Stripe: **400** `MISSING_SIGNATURE` (proves app, not Vercel login)
- Resend: **400** `{"error":"Invalid webhook"}` (Svix reject)

A Stripe **signed** test event should return **200** `{ received: true }` (or billing-specific ACK) only if `STRIPE_WEBHOOK_SECRET` matches the staging endpoint.

---

## Database isolation

| Check | Status | Evidence |
| --- | --- | --- |
| Local active Neon host | **PASS** | `ep-patient-credit-atddo1zm.c-9.us-east-1.aws.neon.tech` / `neondb` |
| Distinct from known prod host in `.env` comments | **PASS** | Prod hint `ep-autumn-wave-atiercwu.c-9.us-east-1.aws.neon.tech` is **not** the active URL |
| Connectivity | **PASS** | `prisma db execute` against active URL succeeded |
| Vercel Production vs Staging `DATABASE_URL` hosts | **NOT VERIFIED** this session | Operator dual-check still required (SS-REL-002-R1 open item) |

No production database was targeted. No migrations run.

---

## Assessment Checkout

| Check | Status | Evidence |
| --- | --- | --- |
| Configured Price ID usage | **PASS** (code) | Server uses `getStripeConfig().assessmentPriceId` only |
| Mode | **PASS** | `mode: "payment"` |
| Success / cancel URLs | **PASS** (code) | Staging app URL required at runtime |
| Local session create | **FAIL** | Stripe env absent locally |
| Staging session create (anonymous HTTP) | **BLOCKED** | Vercel Authentication (browser SSO still required for UI) |
| Complete sandbox payment | **NOT TESTED** | Env + independent webhook proof pending |

---

## vCIO Checkout

| Check | Status | Evidence |
| --- | --- | --- |
| Mode / metadata / customer association | **PASS** (code) | Unchanged from initial review |
| Local / staging runtime create | **FAIL / BLOCKED** | Env + protection for anonymous probes |

---

## Webhook Security

| Control | Status |
| --- | --- |
| Raw body + `constructEvent` / Svix | **PASS** (code) |
| Reject missing/invalid signature | **PASS** (code); production unsigned probe confirms Stripe path |
| Bypass secret ≠ payment authorization | **PASS** (design) — business actions still require provider signatures |
| Idempotent event store | **PASS** (code) |

---

## Fulfillment

Unchanged from code review: assessment + vCIO/billing paths fulfill from signed Stripe events with idempotency. **Live fulfillment on staging still not proven.**

---

## Automated Tests

```text
npm test -- tests/stripe
→ 5 files / 16 tests PASSED
```

---

## Remaining Blockers

1. **Independent bypass delivery proof** — Validator cannot present `x-vercel-protection-bypass` (secret not in session). Operator should either re-run Stripe “Send test webhook” and confirm response is StackScore JSON (not Vercel 401), or temporarily provide the bypass to the validator for a no-signature probe.
2. **Staging `STRIPE_*` env** — Confirm on Vercel Staging: `STRIPE_SECRET_KEY=sk_test_…`, `STRIPE_ASSESSMENT_PRICE_ID`, `STRIPE_VCIO_PRICE_ID` (if testing vCIO), `STRIPE_WEBHOOK_SECRET` matching the staging endpoint’s signing secret. Historical live probe suggested these were missing.
3. **Staging `RESEND_WEBHOOK_SECRET`** — Confirm if Resend delivery testing is in scope.
4. **Local Stripe sandbox env** — Still absent; workstation cannot create Checkout sessions without Vercel Staging UI (after Vercel SSO) or local test keys.
5. **Vercel Staging vs Production Neon dual-check** — Still operator-owned in dashboard (local evidence only this session).
6. **Full sandbox purchase** — Not run (no live charges authorized; blockers above).

---

## Exact next steps (operator / next validation)

1. In **Stripe Dashboard → Developers → Webhooks** (Sandbox): open the staging endpoint → **Send test event** (`checkout.session.completed` or endpoint ping).  
   - Success criteria: HTTP response from StackScore (e.g. `400 MISSING_SIGNATURE` for bad/empty body tests, or `200` for properly signed Stripe tests) — **not** Vercel `Protected deployment` / login HTML.  
   - Note any delivery failures in the dashboard attempt log.
2. Confirm Vercel **Staging** env has all `STRIPE_*` test values (presence + `sk_test_` prefix only; do not paste secrets into chat/docs).
3. Optional: same connectivity check for Resend webhook in Resend dashboard.
4. After (1)+(2): create assessment Checkout from staging UI (Vercel SSO → app) or local with test keys; complete **test-mode** card; confirm `AssessmentPurchase` / entitlement / email path on staging Neon only.
5. Replay webhook; confirm no duplicate fulfillment.

---

## Final Recommendation

**BLOCKED — STAGING STRIPE ENV + INDEPENDENT BYPASS PROOF**

Protection bypass configuration (per operator + SS-REL-005) is the right fix for edge reachability. Until Staging Stripe secrets/prices are confirmed and at least one provider test delivery is shown to hit StackScore (not Vercel Auth), a complete sandbox checkout cannot be signed off.

### What remains before a complete sandbox purchase test

1. Prove staging webhook delivery past bypass (dashboard test or validator probe with bypass).  
2. Confirm Staging `STRIPE_*` (`sk_test_` + prices + `whsec_`).  
3. Run test-mode Checkout + webhook fulfillment on staging Neon.  
4. Confirm idempotent replay.

---

## Final Output Answers

1. **Webhook route correct?** **Yes** — `POST /api/webhooks/stripe`.  
2. **Sandbox credentials configured?** **Not on local**; **unknown on Vercel Staging** this session (historically missing).  
3. **Assessment checkout works?** **Code yes**; **runtime not proven**.  
4. **vCIO checkout works?** **Code yes**; **runtime not proven**.  
5. **Webhook signatures validated?** **Yes** in implementation; production unsigned probe confirms handler.  
6. **Fulfillment implemented correctly?** **Yes** (code); **not live-proven** on staging.  
7. **Vercel Authentication still blocks anonymous staging?** **Yes** (expected). Operator bypass for Stripe/Resend URLs: **stated configured**, **not independently verified**.  
8. **Before complete sandbox purchase test?** Bypass delivery proof + Staging `STRIPE_*` + test-mode Checkout + fulfillment verification.
