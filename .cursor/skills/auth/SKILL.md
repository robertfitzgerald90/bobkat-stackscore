---
name: auth
description: >-
  Implements NextAuth v5 JWT auth and RBAC in this repo — sessions, middleware,
  role guards, portal path limits, activation, password reset. Use when changing
  login, protected routes, or role checks.
---

# Authentication & Authorization

## Scope

**StackScore repository.** Roles (`admin` | `technician` | `client`), portal allowlists, and activation/reset flows are product-specific. Portable idea: JWT session + per-route API auth (middleware does not protect `/api`). Do not transplant these role names or portal rules into other apps.

## Purpose

Apply layered auth already in this codebase: NextAuth JWT, page guards, API helpers, and domain access checks.

## When to use

- Page or API role gates
- Client-portal path allowlist changes (`auth.config.ts`)
- Session resolution, activation, password reset
- Wiring `requireAdmin` / `requireConsultantOrAdmin` / domain `require*` helpers

## When not to use

| Situation | Use instead |
|-----------|-------------|
| `clientId` ownership / workspace scoping | `organization` |
| Shared-secret, webhook, cron auth | `integration-endpoints` |
| CRUD handler shape without new auth rules | `api-server-actions` |
| Stripe signature verification | `stripe` |

## Repository locations to inspect

| Area | Path |
|------|------|
| NextAuth | `src/lib/auth/config.ts`, `auth.config.ts`, `index.ts` |
| Session resolve | `src/lib/auth/resolve-session-user.ts` |
| Activation / reset | `src/lib/auth/activation.ts`, `password-reset.ts` |
| Middleware | `src/middleware.ts` |
| API guards | `src/lib/api/helpers.ts`, `access.ts` |
| Billing / comms auth | `src/lib/billing/api-auth.ts`, `src/lib/communications/auth.ts` |
| Portal mode | `src/lib/navigation/portal-mode.ts` |
| Route access | `src/lib/command-center/route-access.ts` |
| Types | `src/types/next-auth.d.ts` |
| Docs | DOC-122, DOC-303 |
| Env names | `AUTH_SECRET`, `AUTH_URL` (see `.env.example`) |

## Required implementation workflow

1. Identify actor using existing `UserRole` enum — do not invent new roles without docs + schema.
2. Pages: `auth()` + redirect; keep portal paths inside `authorized()` allowlist.
3. APIs: `getSessionUser()` → role/domain guard (middleware **excludes** `/api/*`).
4. Resource checks: prefer existing helpers (`requireAssessmentAccess`, `requireClientWorkspaceAccess`, billing/comms).
5. Activation/reset: public routes under `src/app/api/v1/public/`; keep anti-enumeration on reset.

## Required architecture (this repo)

- NextAuth v5, JWT, 24h; DB re-check `isActive` + role on refresh
- Credentials + bcrypt only (no OAuth providers in-repo)
- Route Handlers for auth-related APIs — **no Server Actions**
- Tenant boundary for portal users is **Client** via `User.clientId` (`organization`)

## Validation commands

```bash
npm test -- tests/auth/
npm test -- tests/client-roadmap/permissions.test.ts
npm test -- tests/routing/safe-callback-url.test.ts
npm run lint
npm run build
```

## Definition of done

- [ ] Unauthenticated → redirect or 401 JSON
- [ ] Forbidden role → redirect or 403 JSON
- [ ] Portal role cannot hit staff/admin surfaces (page + API + command palette)
- [ ] No auth secrets committed

## Common implementation mistakes

- Assuming middleware protects API routes
- Trusting JWT claims without `getSessionUser()` DB resolve
- Portal user accessing another client's id
- Public path not added to `auth.config.ts` allowlist

## Example invocation

> "Lock a billing route to staff — use **auth** and existing billing api-auth helpers."
