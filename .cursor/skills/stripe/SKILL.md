---
name: stripe
description: >-
  Implements secure Stripe billing — Checkout, subscriptions, customers, Billing
  Portal, signed webhooks, idempotency, and local sync. Use when adding or
  changing paid products, webhooks, entitlements after payment, or billing portal
  (not non-Stripe payments or pricing-page-only work).
---

# Stripe Integration

## Scope

Extract StackScore’s proven Stripe patterns into a **portable** workflow. Destination apps need env vars, price configuration, entity mapping, and app-specific provisioning — **not** blind copies of `Client`, vCIO, or assessment models. See §30.

**No secrets in this skill.** Env **names** only. Never paste keys, webhook secrets, live price IDs, or customer IDs.

## 1. Purpose

Govern secure Stripe billing for one-time payments, recurring subscriptions, customer management, Checkout, Billing Portal, and webhook-driven state synchronization — with local persistence, entitlements, communications, audit, tests, and deploy checks.

## 2. When to Use

- Adding Stripe to an application
- Creating a new paid product (one-time or subscription Checkout)
- Customer billing management via **Billing Portal** (StackScore has no custom upgrade/downgrade API)
- Handling Stripe webhooks / syncing subscription state
- Provisioning entitlements after payment
- Troubleshooting Stripe integration behavior

## 3. When Not to Use

| Situation | Use instead |
|-----------|-------------|
| Non-Stripe payment providers | Out of scope |
| Informational pricing pages only | Marketing/UI skills |
| Manual invoicing with no Stripe API | `src/lib/billing/` math only |
| Accounting unrelated to Stripe | Domain billing docs |
| Front-end-only price display | UI skills |
| Tax/regulatory advice | Human experts |
| Shared-secret route scaffolding only | `integration-endpoints` then return here |
| Session RBAC without Stripe calls | `auth` |

## 4. Canonical StackScore References

| Reference | Responsibility |
|-----------|----------------|
| `src/lib/stripe/client.ts` | Lazy singleton `getStripe()` — server-only |
| `src/lib/stripe/config.ts` | Env validation: secret, webhook, price IDs |
| `src/lib/stripe/products.ts` | Internal product type constants / guards |
| `src/lib/stripe/app-url.ts` | Success/cancel base URL resolution |
| `src/lib/stripe/assessment-checkout.ts` | Assessment Checkout metadata builder |
| `src/app/api/checkout/create-session/route.ts` | Public one-time Checkout (`payment` mode) |
| `src/app/api/checkout/vcio/route.ts` | Subscription Checkout (`subscription` mode) |
| `src/lib/billing/stripe-checkout.ts` | Invoice Checkout; webhook idempotency helpers |
| `src/app/api/webhooks/stripe/route.ts` | Raw body, signature, dispatch, assessment fulfill |
| `src/lib/billing/stripe-webhook.ts` | Billing/vCIO/invoice/refund event handlers |
| `src/lib/stripe/fulfillment/technology-assessment.ts` | One-time purchase fulfillment |
| `src/lib/vcio/stripe-customers.ts` | Customer create/reuse on `ClientBillingProfile` |
| `src/lib/vcio/subscriptions.ts` | Subscription sync + status mapping |
| `src/lib/vcio/invoices.ts` / `initialization.ts` / `emails.ts` | Invoice sync, entitlements, lifecycle email |
| `src/app/api/v1/clients/[id]/billing/portal/route.ts` | Billing Portal session (auth + ownership) |
| `src/lib/billing/api-auth.ts` / `access.ts` | Staff vs client billing authorization |
| `src/lib/billing/audit.ts` | Billing audit events |
| `src/lib/email/purchase-fulfillment.ts` | Post-purchase email (tracked) |
| `src/app/assessment-purchased/page.tsx`, `subscription-activated/page.tsx` | Server-side session re-verify (`verifyAssessmentConfirmation` / `verifySubscriptionConfirmation`); legacy success routes redirect |
| `tests/stripe/` | Mostly **static contract** tests (see §25) |
| `docs/60-Operations/STRIPE_ONBOARDING_E2E.md`, `VCIO_SUBSCRIPTION_SETUP.md` | Ops/deploy |
| Prisma | `StripeWebhookEvent`, `Subscription`, `AssessmentPurchase`, `ClientBillingProfile` |

## 5. Architecture Overview

```
User / public checkout
  → (optional) authenticate + authorize billable account
  → resolve app account + Stripe customer (when attached)
  → resolve server-controlled Price ID from config/env
  → create Checkout Session (metadata with stable internal IDs)
  → redirect to Stripe-hosted Checkout
  → browser success URL (UX only — re-fetch session server-side)
  → Stripe webhook (authoritative)
       → verify Stripe-Signature on raw body
       → idempotency check (event.id)
       → update local billing state
       → provision entitlements
       → audit + communications
```

**Webhook is authoritative completion.** Do not fulfill solely from success redirect.

## 6. Required Destination Mapping

Before coding, document destination equivalents (do **not** copy StackScore names blindly):

| Concern | Map to destination |
|---------|-------------------|
| Authenticated user | User/session model |
| Billable account / tenant | Account/org/customer boundary |
| Ownership rule | Who may buy/manage for that account |
| Product catalog | Internal product keys |
| Prices | Env or config → Stripe Price IDs |
| Subscription / purchase rows | Local billing tables |
| Entitlements | Feature flags / seats / access |
| Audit / communications | Existing audit + email systems |
| Success / cancel routes | App URLs |
| Deploy / webhook URL | Host + `/api/webhooks/stripe` (or local path) |

## 7. Environment Variables

**Names only** (from StackScore `.env.example` / config):

| Name | Role | Browser? |
|------|------|----------|
| `STRIPE_SECRET_KEY` | Server SDK | **No** |
| `STRIPE_WEBHOOK_SECRET` | Signature verify | **No** |
| `STRIPE_ASSESSMENT_PRICE_ID` | One-time Price | **No** |
| `STRIPE_VCIO_PRICE_ID` | Subscription Price | **No** |
| `VCIO_PAYMENT_GRACE_PERIOD_DAYS` | Past-due policy | **No** |
| `NEXT_PUBLIC_APP_URL` / `AUTH_URL` | Redirects / app URL | Public URL only |

**Absent in StackScore:** publishable key / `NEXT_PUBLIC_STRIPE_*` (redirect Checkout only). Other apps may add Elements — that is a product choice, not this repo’s pattern.

Validate at request/startup with clear errors (`getStripeConfig`, `requireStripeWebhookSecret`, `requireVcioPriceId`). **Never log secret values.**

## 8. Stripe SDK Initialization

- Server-only: `getStripe()` lazy singleton in `src/lib/stripe/client.ts`
- Construct with secret from `getStripeConfig()` — throw if missing
- Reuse one client instance per process
- **Never** import secret-key client into `"use client"` components
- API version: SDK default (repo does not pin a custom version in `client.ts`)

## 9. Product and Price Configuration

- Prices live in Stripe Dashboard; apps reference **env Price IDs**
- Exported constants in `products.ts`: `technology_assessment`, `stackscore_vcio` (+ `STACKSCORE_VCIO` service type)
- Invoice discriminator is metadata string `"stackscore_invoice"` in `stripe-checkout.ts` / webhook — **not** currently exported from `products.ts`
- Server selects Price ID or builds `price_data` — **never** trust browser-submitted amounts/prices
- Distinguish `payment` vs `subscription` modes
- Verify metadata `productType` on webhook before fulfilling

## 10. Customer Management

Pattern: `getOrCreateStripeCustomerForClient`

1. Lookup persisted `stripeCustomerId` on billing profile
2. If present, reuse
3. Else `customers.create` with email/name + **stable metadata** (`clientId`)
4. Upsert local mapping
5. Identity = internal ID metadata / stored Stripe ID — **not** mutable display name search

Handle missing client; avoid duplicate creates on retries by checking local mapping first.

## 11. Checkout Session Creation

Required sequence:

1. Authenticate when the product requires an account (StackScore assessment checkout is **public**; vCIO optional session; invoice/portal require session).
2. Authorize billable account access when attached.
3. Validate internal product key / mode.
4. Resolve server-controlled Price ID (or server `price_data`).
5. Resolve/create Stripe customer when attaching to an account.
6. `checkout.sessions.create` with mode `payment` or `subscription`.
7. Attach stable IDs via `metadata` / `subscription_data.metadata` / `client_reference_id` as appropriate.
8. Configure `success_url` / `cancel_url` from app URL helpers.
9. Return only `{ url }` / session id needed for redirect.
10. Audit/log without secrets or full card data.

**Do not** mark purchase complete when the session is merely created.

## 12. One-Time Payment Workflow (StackScore: assessment + invoice)

| Step | Behavior |
|------|----------|
| Mode | `payment` |
| Completion | Webhook `checkout.session.completed` / `async_payment_succeeded` |
| Local record | `AssessmentPurchase` (assessment) or `BillingPayment` on invoice |
| Duplicate prevention | Unique `stripeSessionId`; fulfillment outcomes like `already_fulfilled` |
| Entitlement | Create/link assessment + activation token when needed |
| Refunds | `charge.refunded` → billing/vCIO refund paths |
| Failed/expired | Do not provision; confirmation pages re-verify session |
| Communication | `sendPurchaseFulfillmentEmail` (tracked) for assessment |
| Audit | Billing audits on invoice payment paths |

## 13. Subscription Workflow (StackScore: vCIO)

**Prisma `SubscriptionStatus`:** `active` | `trialing` | `past_due` | `unpaid` | `canceled` | `incomplete` | `incomplete_expired` | `paused` | `unknown`

Mapped from Stripe via `normalizeStripeSubscriptionStatus` / `syncVcioSubscriptionFromStripe`:

- Persist provider subscription/customer/price IDs, periods, `cancelAtPeriodEnd`, trial, latest invoice, payment failure timestamps
- RecurringService status mirrors coarse lifecycle
- First transition to `active`/`trialing` → `initializeVcioClient` (entitlements + welcome email)
- Cancel-at-period-end and ended → lifecycle emails
- Blocking duplicate checkout: `active` | `trialing` | `past_due` | `incomplete`

**Do not** collapse status to a single boolean. Plan changes: customers use **Billing Portal** / Stripe; local state updates via `customer.subscription.*` webhooks. There is **no** StackScore subscriptions.update upgrade/downgrade route.

## 14. Billing Portal

- Session required; `requireClientWorkspaceAccess` + staff **or** owning client
- Resolve `stripeCustomerId` from billing profile or subscription — **never** from browser body
- `billingPortal.sessions.create({ customer, return_url })` with `return_url` **server-built** from `getAppUrl()` (not browser-supplied)
- Audit: `recordBillingAudit` with action `invoice_viewed` and metadata `billing_portal_opened` (action name is historical)

## 15. Webhook Security

Exact Route Handler pattern (`src/app/api/webhooks/stripe/route.ts`):

```
runtime = "nodejs"; dynamic = "force-dynamic";
POST:
  requireStripeWebhookSecret()
  require stripe-signature header
  rawBody = await request.text()
  event = stripe.webhooks.constructEvent(rawBody, signature, secret)
  … handle …
```

- Reject missing/invalid signatures with 400
- Server-only; middleware excludes `/api/*` — route is unauthenticated by design
- **No** trust in browser callbacks as payment confirmation

## 16. Webhook Idempotency

Model: `StripeWebhookEvent` — `eventId` `@unique`, `eventType`, `processedAt`, `payloadJson?`

Helpers: `isStripeWebhookProcessed` / `markStripeWebhookProcessed` in `stripe-checkout.ts`

Workflow:

1. Verify signature  
2. If `event.id` already stored → ack `{ received: true }`  
3. Process handler  
4. Mark processed **after successful handling** (assessment path: only if HTTP status `< 400` so Stripe can retry 5xx)  
5. Avoid duplicate provisioning inside fulfillers (`already_fulfilled`, upserts)

**StackScore pattern:** check → process → mark (not insert-claim-first). **Gaps:** some unhandled types return 200 without a row (Stripe may retry); concurrent duplicates rely on unique `eventId`. New apps may tighten to claim-then-process — that is an improvement, not current StackScore behavior.

## 17. Required Webhook Events (handled here)

| Event | Why | Local effect | Provision | Email |
|-------|-----|--------------|-----------|-------|
| `checkout.session.completed` | Pay/subscribe/invoice pay | vCIO fulfill / invoice payment / assessment fulfill | Yes when matched | Assessment / admin / welcome paths |
| `checkout.session.async_payment_succeeded` | Delayed payment OK | vCIO / assessment | Yes | Assessment path |
| `checkout.session.async_payment_failed` | Delayed payment fail | Audit / mark | No | — |
| `customer.subscription.created/updated/deleted/paused/resumed` | Lifecycle sync | `Subscription` upsert | Init on active/trialing | Cancel/ended/welcome |
| `invoice.created/finalized/paid` | Sub invoices | vCIO invoice sync | Access via status | — |
| `invoice.payment_failed` | Past due | Mark failed | Policy/grace | Payment-failed email |
| `invoice.payment_action_required` | SCA/action | Mark action required | — | — |
| `invoice.voided` | Void | Mark voided | — | — |
| `payment_intent.payment_failed` | Invoice PI fail | BillingPayment failed | — | — |
| `charge.refunded` | Refund | vCIO/billing refund | May revoke | — |
| `charge.dispute.created` | Dispute | Mark disputed | — | — |

Do not invent handlers for unlisted events unless product requires them.

## 18. Local State Synchronization

Persist enough to authorize access **without** calling Stripe every request:

- Customer ID, subscription ID, price/product IDs, status, period dates, cancel flags, checkout/session/payment IDs, timestamps, internal account FK (`clientId`)

Reconciliation: re-run sync from Stripe subscription retrieve / Dashboard; ops docs for onboarding. Prefer webhook + optional admin resync over page-load Stripe calls.

## 19. Entitlements and Provisioning

Separate **billing state** from **entitlement logic**.

Destination must define: what was bought, who receives access, start/end, past-due behavior, cancel/refund, duplicate events, admin overrides.

**StackScore examples (binding, not portable law):** assessment activation tokens; `initializeVcioClient` on first active/trialing; `VCIO_PAYMENT_GRACE_PERIOD_DAYS`.

## 20. Authorization and Tenant Isolation

| Surface | Auth |
|---------|------|
| Assessment Checkout | Public |
| vCIO Checkout | Optional session; attach client when portal user |
| Invoice Checkout | Staff billing management |
| Portal | Session + workspace access + ownership |
| Webhook | Signature only |

Never accept browser-supplied Stripe customer IDs as ownership proof. Map Stripe IDs → internal account via DB, then check `auth` / `organization`.

## 21. Communication Integration

Prefer `resend` / `recordAndSendCommunication` for customer lifecycle mail.

| Trigger | StackScore path |
|---------|-----------------|
| Assessment purchase | Tracked fulfillment email |
| vCIO welcome / cancel / ended / payment failed | VCIO email helpers + registry keys |
| Admin new subscription | Internal notify |
| Staff invoice send | **Inconsistency:** raw `sendEmail` — not communications registry |

Load `resend` for template/tracking patterns; do not duplicate email skill content here.

## 22. Audit Logging

Use `audit` / `recordBillingAudit` for: checkout-related payments, subscription activated/canceled/paused, payment failed, refunds, disputes, portal opened.

Do not log full webhook payloads with PII/card data, secrets, or unnecessary personal data.

## 23. Error Handling

| Failure | Customer-facing | Server |
|---------|-----------------|--------|
| Missing config | Generic unavailable | Throw/log code (`STRIPE_*` missing) |
| Invalid product | Bad request | Reject metadata |
| Unauthorized | 401/403 | `billing/api-auth` |
| Stripe API error | Generic checkout failed | Log Stripe message server-side |
| Invalid signature | 400 | No processing |
| Fulfillment throw | Stripe retries (5xx) | Leave event unmarked |
| Email failure after fulfill | User may miss email | **StackScore:** caught → still 200 (gap) |
| Duplicate event | Silent ack | Idempotency row |

Do not expose raw Stripe errors to end users.

## 24. Transactions and Failure Boundaries

External Stripe calls are **not** DB-transactional.

| Scenario | Approach |
|----------|----------|
| Customer created, DB persist fails | Retry create path keyed by local mapping; reconcile by metadata `clientId` |
| Checkout created, audit fails | Do not fail checkout UX; log |
| Webhook verified, DB fails | Return 5xx; leave unmarked; Stripe retries |
| Sub updated, email fails | Prefer not blocking sync; queue/retry email (`resend`) |
| Concurrent duplicate webhook | Unique `eventId`; upserts in sync |

Design fulfillers to be retry-safe.

## 25. Testing Workflow

```bash
npm test -- tests/stripe/
npm test -- tests/billing/
npm run lint
npm run build
```

**Actual coverage today:** mostly static source contracts (routes/env/metadata/confirmation). Strengthen new work with mocked Stripe for: authz, product validation, customer reuse, signature rejection, idempotent duplicate delivery, status transitions, cross-tenant denial, missing env.

Use Stripe test mode for manual E2E; mock in CI unless explicitly integration-testing.

## 26. Local Development and Stripe CLI

Repo ops docs reference Stripe CLI/dashboard for webhook testing (`docs/60-Operations/STRIPE_ONBOARDING_E2E.md`) but do not ship a scripted CLI workflow.

Practical local setup (no secrets here):

- Test-mode keys and Price IDs in local `.env` (names from §7)
- Optional Stripe CLI forward to `/api/webhooks/stripe`; set `STRIPE_WEBHOOK_SECRET` to the CLI signing secret
- Keep test and live credentials separated
- Webhook route must use **raw** body (`request.text()` + `constructEvent`)

## 27. Deployment Workflow

Pair with `production-release`:

- Set Production env (Build + Runtime): secret, webhook secret, **live** price IDs, app URLs
- Register webhook endpoint to production URL + signing secret
- Apply migrations (`StripeWebhookEvent`, subscription tables)
- Smoke: Checkout test in live carefully; Portal; webhook delivery in Stripe Dashboard
- Never point production at test prices/keys

## 28. Security Requirements

Prohibit:

- Exposing secret key or webhook secret
- Trusting client-submitted prices/amounts
- Fulfilling on success redirect alone
- Unsigned webhooks
- Duplicate fulfillment
- Arbitrary customer IDs from the browser
- Logging sensitive full payloads
- Mixing test and live credentials
- Hardcoding secrets
- Mutable names as primary Stripe identity
- Granting access without ownership verification

## 29. Definition of Done

- [ ] Env names documented/validated; no secrets committed
- [ ] Products/prices server-controlled
- [ ] Auth + tenant authorization enforced where required
- [ ] Customers reused safely
- [ ] Checkout + (if needed) Billing Portal work
- [ ] Webhook signatures verified; processing idempotent
- [ ] Local billing state synced; entitlements correct
- [ ] Failures retry-safe; communications + audit integrated
- [ ] Tests updated; production config documented
- [ ] No StackScore entities copied blindly into other apps

## 30. Portable Pattern vs StackScore Binding

### Portable architecture

Centralized server Stripe client · config validation · server-controlled prices · customer mapping · Checkout · Billing Portal · signed webhooks · event idempotency · subscription sync · entitlements separation · communications · auditing · tests · deploy checks

### StackScore-specific bindings

| Binding | Detail |
|---------|--------|
| Tenant | **Client** (`clientId`) — not Organization |
| Products | `technology_assessment` / `stackscore_vcio` in `products.ts`; invoice metadata `"stackscore_invoice"` |
| Routes | `/api/checkout/*`, `/api/webhooks/stripe`, `/api/v1/clients/[id]/billing/portal` |
| Models | `AssessmentPurchase`, `Subscription`, `ClientBillingProfile`, `StripeWebhookEvent` |
| Roles | `admin` / `technician` / `client` |
| Emails | Activation, VCIO lifecycle keys, admin notify |
| Entitlements | Assessment activation; `initializeVcioClient` |
| Success URLs | `/assessment-purchased`, `/subscription-activated` |

## 31. Skill Dependencies

Reference — do not duplicate: `repository-auditor`, `auth`, `organization`, `prisma-postgres`, `api-server-actions`, `integration-endpoints`, `resend`, `audit`, `testing-validation`, `production-release`.

## 32. Example Invocations

> Use **repository-auditor** followed by **stripe**, **auth**, **prisma-postgres**, **api-server-actions**, **resend**, **audit**, and **testing-validation** to add a recurring subscription product.

> Use the **stripe** skill to add a one-time Checkout flow. Map the purchase to this repository’s account and entitlement models.

> Use the **stripe** skill to audit webhook idempotency and subscription-state synchronization without changing product behavior.

> Use **stripe** and **production-release** to prepare this billing integration for live deployment.

> Use **stripe** to add Billing Portal access. Do not accept customer IDs from the browser.

## Implementation inconsistencies (StackScore — do not romanticize)

- Assessment email failures still mark webhook processed (no Stripe retry for mail)
- Some unhandled events ack 200 without `StripeWebhookEvent` row (retry noise)
- Staff invoice email bypasses communications registry (`sendEmail` raw)
- Portal audit action labeled `invoice_viewed` for portal open
- `tests/stripe` lack live handler/idempotency unit tests
- `lastStripeEventCreatedAt` not used as ordering guard against out-of-order events
