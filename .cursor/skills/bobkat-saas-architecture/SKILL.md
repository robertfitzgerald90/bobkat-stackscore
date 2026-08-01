---
name: bobkat-saas-architecture
description: >-
  Orients work to this repo’s architecture — App Router, Prisma 7, Client
  tenancy, Route Handler mutations, lib services. Use when choosing layers or
  where code belongs (not for single-domain CRUD/UI/schema tasks).
---

# Bobkat SaaS Architecture

## Scope

**StackScore repository.** Facts such as Client tenancy, no Server Actions, and DOC-120 vocabulary are product-bound. Do not recreate StackScore models or roles in other apps.

## Purpose

Preserve this app’s production architecture: documentation-driven domain logic, thin routes/UI, Prisma on PostgreSQL, NextAuth JWT, and **Client** as the customer boundary.

## When to use

- Starting a feature and choosing folder/layer placement
- Deciding between RSC page, API route, and `src/lib` service
- Naming modules, aligning with DOC-120 vocabulary
- Orienting on data flow before coding

## When not to use

| Situation | Use instead |
|-----------|-------------|
| Full CRUD vertical | `enterprise-crud` |
| Schema/migration | `prisma-postgres` |
| Auth/RBAC details | `auth` |
| Visual design tokens | `premium-ui` |
| Spec alignment before inventing behavior | `documentation-driven-development` |

## Repository locations to inspect

| Area | Path |
|------|------|
| Constitution | `docs/30-Architecture/DOC-129 – AI Development Rules & Engineering Constitution.md` |
| Domain model | `docs/30-Architecture/DOC-120 – Domain Model Specification.md` |
| Service layer | `docs/30-Architecture/DOC-124 – Service Layer Specification.md` |
| App Router | `src/app/` — `(dashboard)` group + public routes |
| Domain services | `src/lib/<domain>/` |
| UI primitives | `src/components/ui/`, `src/components/<domain>/` |
| DB | `prisma/schema.prisma`, `src/lib/db/` |
| API helpers | `src/lib/api/helpers.ts`, `access.ts` |
| Package | `package.json` (Node 20.x, Next 15, React 19, Prisma 7) |

## Required implementation workflow

1. Read governing docs for the domain (DOC-120/123/124 + module docs under `docs/40-Modules/`).
2. Find a comparable vertical (canonical: `website-leads` — page + `src/lib/website-leads/` + `src/app/api/v1/website-leads/`).
3. Place code by layer:
   - **Schema** → `prisma/schema.prisma` + migration (`prisma-postgres`)
   - **Logic** → `src/lib/<domain>/` (`service.ts`, `schemas.ts`, queries)
   - **HTTP** → `src/app/api/**/route.ts` (`api-server-actions`)
   - **UI** → RSC page under `src/app/(dashboard)/` + client components under `src/components/<domain>/`
4. Wire navigation (`src/lib/navigation/`, sidebar) and access (`auth`, `organization`).
5. Validate with targeted `npm test`, `lint`, `build` as risk warrants.

## Required architecture

| Topic | StackScore rule |
|-------|-----------------|
| Framework | Next.js **15** App Router, React **19**, TypeScript **strict**, `@/*` → `src/*` |
| Mutations | **No Server Actions** (`"use server"` absent). Client `fetch` → Route Handlers |
| Data | Prisma **7** + PostgreSQL (Neon prod); `prisma` from `@/lib/db`; types from `@/generated/prisma/client` |
| Tenancy | **Client** is the isolation boundary — no Organization/Workspace tenant models |
| Auth | NextAuth v5 JWT; pages via `auth()`; APIs self-guard (middleware excludes `/api`) |
| UI | shadcn `base-nova` + `@base-ui/react` + Tailwind v4 CSS-first |
| Email / PDF | `src/emails/` + Resend; `@react-pdf/renderer` via `src/lib/pdf/generate.tsx` |
| Folders | Domain kebab-case under `src/lib/` and `src/components/`; tests under `tests/<domain>/` |
| Naming | Prisma models PascalCase; routes REST under `/api/v1`; env names in `.env.example` only |

### Data flow

```
RSC page (auth + load)
  → src/lib/<domain> service
    → prisma (@/lib/db)
Client UI mutation
  → fetch /api/v1/...
    → route handler (guards + Zod)
      → src/lib/<domain> service
        → prisma
```

Simple reads may call Prisma in the page; rich domains prefer services.

### Folder organization

- `src/app/(dashboard)/` — authenticated shell
- `src/app/api/v1/` — session APIs; `integrations/`, `webhooks/`, `cron/`, `checkout/` — ingress
- `src/lib/` — business logic only
- `src/components/ui/` — primitives; feature folders for domain UI
- `prisma/` — schema, migrations, seeds
- `docs/` — authoritative product/architecture specs

## Validation commands

```bash
npm run lint
npm test -- tests/<domain>/
npm run build
```

## Definition of done

- [ ] Code lives in the correct layer; no business rules in JSX or fat routes
- [ ] Comparable module pattern reused
- [ ] DOC-120 language respected; no invented CRM/org tenancy
- [ ] No secrets committed; no Server Actions introduced

## Common implementation mistakes

- Adding `"use server"` or a second data-access stack
- Treating “workspace” UI wording as a DB tenant
- Putting scoring/pricing rules in components
- Creating parallel shells instead of `DashboardShell` / `ClientWorkspaceShell`

## Example invocation

> "Where should a new consulting note feature live? Use **bobkat-saas-architecture** and mirror website-leads layering."
