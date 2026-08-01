---
name: audit
description: >-
  Records admin/billing/client activity in this repo — AdminAuditEvent,
  BillingAuditEvent, OrganizationActivityEvent, archive/restore. Use when
  adding audit calls or archive flows (no deletedAt soft-delete framework).
---

# Audit Logging

## Scope

**StackScore repository.** Three existing writers only. Soft lifecycle uses **status / `archivedAt`** where implemented — **not** `deletedAt`. `OrganizationActivityEvent` is Client-scoped activity despite the name.

## Purpose

Record who changed what using the three existing audit/activity models, and apply archive/restore lifecycles already in code.

## When to use

- Admin mutations that need an audit trail
- Billing/payment/subscription audit
- Client organization activity timeline events
- Archive/restore/permanent delete flows

## When not to use

- Communication delivery tracking → `resend` (`CommunicationMessage` events)
- Stripe webhook idempotency → `stripe` (`StripeWebhookEvent`)
- Inventing a generic `deletedAt` soft-delete framework (absent)

## Repository locations to inspect

| Area | Path |
|------|------|
| Admin audit | `src/lib/admin/audit-log.ts` → `AdminAuditEvent` |
| Billing audit | `src/lib/billing/audit.ts` → `BillingAuditEvent` |
| Client activity | `src/lib/communications/activity/record-activity.ts` → `OrganizationActivityEvent` |
| Website-leads wrapper | `src/lib/website-leads/audit.ts` |
| Archive/restore | `src/lib/records/cleanup.ts`; client archive/restore API routes |
| Snapshot archive | `TechnologySnapshotLead.archivedAt` |

## Required implementation workflow

```
History (append-only audit/activity rows)
  ↓
User tracking (actorUserId / session user id when available)
  ↓
Entity tracking (entityType + entityId or domain FKs)
  ↓
Change logging (action + metadata JSON — follow existing call sites)
  ↓
Soft lifecycle (status archived / archivedAt — not deletedAt)
  ↓
Restore (e.g. restoreClient → status inactive; not universal)
```

1. Pick the correct store: admin vs billing vs client activity.
2. Call `recordAdminAuditEvent` / `recordBillingAudit` / `recordOrganizationActivity` after successful mutation.
3. Admin audit must **not** fail the primary action if persist fails (existing behavior).
4. Destructive: prefer archive; permanent delete uses confirmation helpers in cleanup/API.
5. Do not add `deletedAt` unless product docs + `prisma-postgres` explicitly require it.

## Required architecture

- Three models, three writers — do not collapse into one mega-audit table casually.
- “Organization” in `OrganizationActivityEvent` means Client-scoped activity (`organization` skill).

## Validation commands

```bash
npm test -- tests/<domain>/
npm run lint
```

## Definition of done

- [ ] Correct audit writer used
- [ ] Actor + entity identifiers recorded
- [ ] Archive/restore matches entity pattern
- [ ] Primary mutation still succeeds if admin audit write fails

## Common implementation mistakes

- Skipping audit on admin deletes/converts when siblings log them
- Using billing audit for non-billing admin UI
- Assuming universal soft-delete/restore
- Blocking checkout because audit insert failed

## Example invocation

> "Log admin converts on the new lead type — use **audit** and mirror website-leads/audit.ts."
