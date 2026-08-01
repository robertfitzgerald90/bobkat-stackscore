---
name: integration-endpoints
description: >-
  Builds non-session ingress in this repo — shared-secret APIs, webhook/cron
  route shape, public POST endpoints. Use for integrations/* and cron scaffolding;
  Stripe/Resend domain logic stays in stripe/resend skills.
---

# Integration Endpoints

## Scope

**StackScore repository.** Covers ingress **shape** (secrets, raw body, rate limits). For Stripe or Resend **behavior**, load `stripe` / `resend` instead of duplicating those skills.

## Purpose

Implement inbound surfaces that bypass session auth: shared-secret APIs, provider webhook/cron route conventions, and public POSTs — with validation and idempotent processing patterns.

## When to use

- `src/app/api/integrations/**` partner POSTs
- New `webhooks/` or `cron/` **route scaffolding** (then domain skill for handler body)
- Public unauthenticated POSTs under `src/app/api/v1/public/`
- Rate-limit / shared-secret helpers

## When not to use

| Situation | Use instead |
|-----------|-------------|
| Session `/api/v1` CRUD | `api-server-actions` |
| Stripe Checkout/webhook/subscription logic | `stripe` |
| Resend send/tracking/webhook logic | `resend` |
| Page session auth | `auth` |

## Files to inspect first

| Area | Path |
|------|------|
| Website leads integration | `src/app/api/integrations/website-leads/route.ts` |
| Secret auth | `src/lib/website-leads/auth.ts` |
| Rate limit | `src/lib/website-leads/rate-limit.ts` |
| Stripe webhook | `src/app/api/webhooks/stripe/route.ts`, `src/lib/billing/stripe-webhook.ts` |
| Resend webhook | `src/app/api/webhooks/resend/route.ts` |
| Cron | `src/app/api/cron/communications/route.ts` |
| Checkout | `src/app/api/checkout/create-session/route.ts`, `vcio/route.ts` |
| Public snapshot | `src/app/api/v1/public/technology-snapshot/route.ts` |
| Middleware public paths | `src/lib/auth/auth.config.ts` |
| Ops docs | `docs/60-Operations/WEBSITE_LEADS_INTEGRATION.md`, `STRIPE_ONBOARDING_E2E.md` |
| Fulfillment | `src/lib/stripe/fulfillment/` |

## Required workflow

1. **Classify ingress type:** shared secret, HMAC webhook signature, or fully public.
2. **Auth implementation:**
   - Shared secret: constant-time compare (`timingSafeEqual`) — see `website-leads/auth.ts`
   - Stripe: verify signature via `requireStripeWebhookSecret()`
   - Cron: `Authorization: Bearer ${CRON_SECRET}`
3. **Validate body** with Zod schema in `src/lib/<domain>/schemas.ts`.
4. **Rate limit** sensitive public endpoints (in-memory pattern in `rate-limit.ts` — 429 + `Retry-After`).
5. **Persist first, side effects second** — e.g. create lead record, then send emails; email failure must not roll back persistence when documented.
6. **Idempotency** on external IDs (`submissionId` → 409 CONFLICT on duplicate).
7. **Document** env vars in `.env.example` and `docs/60-Operations/`.

## Architectural requirements

- Never expose integration secrets in client-side code.
- Return generic errors externally; log details server-side.
- Webhook handlers must be idempotent for provider retries.
- Preserve existing Stripe checkout → fulfillment → provisioning flows (assessment, vCIO).
- Add middleware public path whitelist entry if route must bypass login redirect.
- Audit significant conversions via domain audit helpers (`recordAdminAuditEvent`, domain `audit.ts`).

## Validation commands

```bash
npm test -- tests/website-leads/
npm test -- tests/stripe/
npm run lint
npm run build
```

Manual: curl POST with valid/invalid secret; Stripe CLI webhook replay when touching fulfillment.

## Completion criteria

- Auth mechanism documented with required env vars
- Zod validation on all structured POST bodies
- Duplicate/replay handling defined (409 or idempotent no-op)
- Rate limiting on abuse-prone public ingress
- Ops doc updated in `docs/60-Operations/` for external integrators
- Confirmation/notification emails wired without breaking primary transaction

## Common mistakes

- String comparison for secrets instead of `timingSafeEqual`
- No rate limit on public integration POST
- Throwing 500 on duplicate submission instead of 409
- Failing entity creation when async email send fails
- Forgetting to whitelist new public API paths in `auth.config.ts`

## Example invocation

> "Add a secure POST integration for inbound X with bearer auth and rate limiting — use integration-endpoints and mirror website-leads."
