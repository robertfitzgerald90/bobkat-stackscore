---
name: organization
description: >-
  Applies Client-scoped data isolation in this repo — Client tenant boundary,
  portal ownership, workspace UI under clients/[id]. Use when scoping queries
  or APIs by clientId (not multi-org tenancy).
---

# Client Isolation (Organization skill)

## Scope

**StackScore repository.** There are **no** `Organization` or `Workspace` database models. The tenant boundary is **`Client`**. “Workspace” means UI under `clients/[id]/…`. Do not create Organization/Workspace tables to “match the skill name,” and do not export this tenancy model into other products without mapping their real tenant entity.

## Purpose

Enforce ownership and isolation the way this app already works: staff may access clients after role checks; portal users (`role: client`) only their `user.clientId`.

## When to use

- Filtering/scoping by `clientId`
- Client workspace layouts, shells, subnav
- Portal vs consultant data access on client-owned records
- Activity timeline keyed by client (`OrganizationActivityEvent` — name is historical)

## When not to use

| Situation | Use instead |
|-----------|-------------|
| Login, JWT, role enums, portal path allowlist | `auth` |
| Designing multi-tenant Org/Workspace SaaS | Out of scope — not this product |
| Admin entities with no client FK | `auth` roles only |

## Repository locations to inspect

| Concept | Path |
|---------|------|
| Tenant model | `prisma/schema.prisma` → `model Client` |
| Portal link | `User.clientId` (optional, unique) |
| Access helper | `src/lib/api/access.ts` → `requireClientWorkspaceAccess` |
| Layout / shell | `src/app/(dashboard)/clients/[id]/layout.tsx`, `src/components/client-workspace/client-workspace-shell.tsx` |
| Workspace lib | `src/lib/client-workspace/` |
| Portal mode | `src/lib/navigation/portal-mode.ts` |
| Activity | `OrganizationActivityEvent`, `src/lib/communications/activity/record-activity.ts` |
| Billing scope | `src/lib/billing/api-auth.ts` |

## Required implementation workflow

1. Confirm the resource is client-owned (FK/`clientId`).
2. Staff: role gate then allow client id; portal: `user.clientId === resource.clientId`.
3. Prefer `getSessionUserWithClient()` when portal context is required.
4. Keep UI under `clients/[id]/…` — do not invent a parallel org router.
5. Client activity: `recordOrganizationActivity` (Client-scoped despite the name).

## Required architecture (this repo)

| Fact | Detail |
|------|--------|
| Tenant | **Client** only |
| ABSENT | `Organization`, `Workspace` models |
| Soft lifecycle | Status archive / `archivedAt` on some entities — **no** `deletedAt` |
| Auth split | Identity/roles → `auth`; ownership → this skill |

## Validation commands

```bash
npm test -- tests/auth/
npm test -- tests/client-roadmap/permissions.test.ts
npm run lint
```

## Definition of done

- [ ] Client-owned queries include `clientId` scope
- [ ] Portal user cannot read/write other clients
- [ ] No new Organization/Workspace schema added
- [ ] Workspace UI remains under `clients/[id]`

## Common implementation mistakes

- Adding Organization/Workspace “for SaaS completeness”
- Role check without `clientId` match
- Treating `OrganizationActivityEvent` as a tenant org
- Exposing staff list routes to `client` role

## Example invocation

> "Scope notes API to the client workspace — use **organization** and requireClientWorkspaceAccess."
