---
name: api-server-actions
description: >-
  Implements session JSON APIs as Next.js Route Handlers in this repo (Server
  Actions are not used). Use when adding or changing src/app/api handlers,
  Zod validation, or error shapes.
---

# API Route Standards

## Scope

**StackScore repository.** Name is historical: **Server Actions are not part of the current architecture** and must not be added here. Other repositories may use Server Actions — inspect that repo before applying this skill. Portable idea: thin HTTP handlers + service layer + explicit auth.

## Purpose

Implement `/api/**` Route Handlers that authenticate themselves, validate input, and delegate to `src/lib/**`.

## When to use

- Authenticated `/api/v1/**` (including admin, public, clients/[id])
- Choosing RSC read vs `fetch` mutation to an API route
- Standardizing `{ error, code }` and pagination helpers

## When not to use

| Situation | Use instead |
|-----------|-------------|
| Webhooks, cron, shared-secret ingress | `integration-endpoints` |
| Stripe checkout/webhook domain logic | `stripe` |
| Resend webhook / email send | `resend` |
| UI-only | `premium-ui` / `enterprise-crud` |

## Repository locations to inspect

| Area | Path |
|------|------|
| Helpers | `src/lib/api/helpers.ts`, `access.ts` |
| Examples | `src/app/api/v1/users/route.ts`, `website-leads/route.ts` |
| Nested | `src/app/api/v1/clients/[id]/billing/invoices/route.ts` |
| Specs | DOC-302, DOC-124 |

## Required implementation workflow

1. Place route under the correct `/api/v1/...` namespace.
2. Auth in-handler: `getSessionUser` → role/domain guard (`auth` / `organization`). Middleware **excludes** `/api/*`.
3. Zod in `src/lib/<domain>/schemas.ts`; `safeParse` → `badRequest`.
4. Business logic in `src/lib/<domain>/service.ts`.
5. Success/error via helpers (`paginatedResponse`, `{ error, code }`).
6. Next 15: `params: Promise<{ ... }>`.
7. `runtime = "nodejs"` when using Prisma/bcrypt (match neighbors).
8. Significant admin mutations → `audit` helpers when siblings do.

### Server Actions

**Do not add `"use server"` in this repository.** Browser mutations use `fetch('/api/v1/...')`.

## Required architecture (this repo)

- Thin route, fat service
- Tenant for customer data: **Client** (`organization`)
- No tRPC / second API framework

## Validation commands

```bash
npm run lint
npm test -- tests/<domain>/
npm run build
```

## Definition of done

- [ ] Correct auth for namespace
- [ ] Zod on structured writes
- [ ] Standard error JSON; service holds logic
- [ ] UI `fetch` updated if applicable
- [ ] No `"use server"` introduced

## Common implementation mistakes

- Adding Server Actions because Next.js docs suggest them
- Assuming middleware secures APIs
- Zod `.parse()` without handling errors
- `{ message }` instead of `{ error, code }`

## Example invocation

> "Add PATCH /api/v1/website-leads/[id] — use **api-server-actions**, mirror users auth."
