---
name: resend
description: >-
  Implements Resend + react-email delivery in this repo — templates, registry,
  tracked outbound, queue/cron, and delivery webhooks. Use when changing
  customer/staff email send paths or Resend webhook handling.
---

# Resend Integration

## Scope

**This repository only** unless extracting patterns deliberately. Do not copy StackScore template keys (`EMAIL-001`…), founder signature copy, or vCIO/assessment workflows into other products. See [Portable Pattern vs StackScore Binding](#portable-pattern-vs-stackscore-binding).

## Purpose

Send email via Resend using react-email templates, communications registry, tracked outbound (`recordAndSendCommunication`), DB queue + cron, and Svix-verified delivery webhooks.

## When to use

- New/changed transactional or workflow email content or send path
- Communications registry / automation / preview
- Resend delivery webhook or communications queue/cron behavior

## When not to use

| Situation | Use instead |
|-----------|-------------|
| PDF generation | `reporting` |
| In-app notification with no email | domain UI / notifications modules |
| Stripe payment webhook | `stripe` |
| Shared-secret route scaffolding only | `integration-endpoints` |

## Repository locations to inspect

| Area | Path |
|------|------|
| Transport | `src/lib/email/send.ts`, `config.ts` |
| Templates | `src/emails/` (`account-activation`, `assessment-invitation`, `workflow-notification`) |
| Render / tokens | `src/emails/render-email.tsx`, `tokens.ts`, `components/` |
| Tracking | `src/lib/communications/tracking/record-outbound.ts` |
| Registry | `src/lib/communications/registry.ts`, `dispatcher.ts`, `automation-registry.ts` |
| Queue / cron | `src/lib/communications/queue/service.ts`, `src/app/api/cron/communications/route.ts` |
| Webhook | `src/app/api/webhooks/resend/route.ts`, `src/lib/communications/webhooks/resend-handler.ts` |
| Brand / signature | `src/lib/communications/brand-settings.ts`, `src/lib/email/bobkat-founder-signature.ts`, `src/emails/components/email-closing-signature.tsx` |

## Required implementation workflow

1. Check `docs/email/` for intended template key / copy.
2. Prefer `WorkflowNotificationEmail` for registry-driven mail; dedicated TSX only when activation/invitation patterns require it.
3. Render HTML + text via `renderEmailTemplate`.
4. Customer lifecycle mail: `recordAndSendCommunication` with `templateKey`, `eventKey`, `idempotencyKey`.
5. Register admin-editable templates in the communications registry.
6. Multi-line signatures: `EmailClosingSignature` / `founderClosing` — not `\n` inside one `<Text>`.
7. Delayed/review sends: `enqueueCommunication`; cron uses `CRON_SECRET`.
8. Delivery webhook: verify `RESEND_WEBHOOK_SECRET` (Svix) → `applyCommunicationProviderEvent`.

## Required architecture (this repo)

| Topic | Fact |
|-------|------|
| Mutations / ingress | Route Handlers — **no Server Actions** |
| Missing API key | Console fallback in `send.ts` (local) |
| Env names | `RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`, `EMAIL_ASSET_BASE_URL`, `CRON_SECRET` |
| Invoice exception | `src/lib/billing/send-invoice-email.ts` — raw HTML, not registry |
| ABSENT here | Magic-link login, email-verify templates, Excel-driven sends |

## Portable Pattern vs StackScore Binding

### Reusable in other projects

- react-email components + `render` → `{ html, text }`
- Thin transport wrapper around Resend SDK
- Outbound message row + idempotency key before/around send
- Provider delivery webhook (Svix) updating message status
- Optional DB queue + scheduled worker/cron for delayed sends
- Brand tokens / shared layout components for consistent mail
- Console/dev fallback when API key unset (local only)

### StackScore-specific (do not copy blindly)

- Files under `src/emails/`, `src/lib/email/`, `src/lib/communications/**`
- Registry keys `EMAIL-001`…`EMAIL-010`, `LEGACY-*`, `VCIO-*`
- Models: `CommunicationMessage`, `CommunicationEvent`, `CommunicationQueueItem`, brand settings
- Flows: assessment activation, prospect invitation, password reset queue, VCIO welcome
- Founder signature helper and Bobkat brand defaults
- Cron path `/api/cron/communications` + `vercel.json` schedule

### Environment variables to supply (names only)

`RESEND_API_KEY`, `EMAIL_FROM`, `RESEND_WEBHOOK_SECRET`, `EMAIL_ASSET_BASE_URL`, `CRON_SECRET`, `NEXT_PUBLIC_APP_URL` (links/assets)

### Entities to map in a destination repository

| Email concept | Map to destination |
|---------------|--------------------|
| Template key | Your template catalog id |
| Outbound message | Your message/log table |
| Idempotency key | Stable key per business event |
| Queue item | Your job/outbox row (if any) |
| Recipient | Your user/contact model |

### Do not copy blindly

- StackScore EMAIL-* numbering or assessment/vCIO copy
- Assuming invoice mail is untracked (fix that inconsistency deliberately)
- Multi-line signatures via a single text node
- Sending lifecycle mail with raw transport and no idempotency

## Validation commands

```bash
npm test -- tests/email/
npm test -- tests/communications/
npm test -- tests/vcio/customer-email-copy.test.ts
npm run build
```

## Definition of done

- [ ] HTML + text produced
- [ ] Customer lifecycle sends tracked with idempotency
- [ ] Registry/docs updated when keys change
- [ ] Signature line breaks verified
- [ ] Relevant email/communications tests pass

## Common implementation mistakes

- Raw `sendEmail` for tracked customer lifecycle mail
- Hardcoded absolute URLs instead of app URL helpers
- Missing idempotency on webhook/Stripe-triggered sends

## Example invocation

> "Add a confirmation email via WorkflowNotificationEmail and recordAndSendCommunication — use **resend**."
