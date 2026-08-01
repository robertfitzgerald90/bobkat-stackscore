---
name: enterprise-crud
description: >-
  Builds end-to-end staff CRUD in this repo — schema, Zod, service, API,
  list/detail UI, archive/delete, audit, nav. Use when adding a managed entity
  following website-leads or users (not scoring/roadmap domains).
---

# Enterprise CRUD Module

## Scope

**StackScore repository.** Mirror website-leads/users here; do not export those models to other products. Portable idea: schema → service → Route Handler → list/detail UI.

## Purpose

Ship a complete module the way production modules are built here: schema → service → API → list/detail UI → permissions → audit → navigation.

## When to use

- New admin/staff-managed entity with list + detail + mutations
- Extending an existing CRUD surface (status, convert, notes, delete)
- Wiring filters, search, responsive tables, and destructive flows

## When not to use

| Situation | Use instead |
|-----------|-------------|
| Schema-only | `prisma-postgres` |
| API handler only | `api-server-actions` |
| Visual polish only | `premium-ui` |
| CSV bulk ingest | `imports` |
| Assessment/scoring domain | `assessments` / `recommendations` |

## Repository locations to inspect

**Canonical reference — Website Leads:**

| Layer | Path |
|-------|------|
| Schema | `WebsiteLead` in `prisma/schema.prisma` |
| Zod | `src/lib/website-leads/schemas.ts` |
| Service | `src/lib/website-leads/service.ts` |
| Audit | `src/lib/website-leads/audit.ts` |
| API | `src/app/api/v1/website-leads/`, `[id]/`, `[id]/convert/` |
| Ingress create | `src/app/api/integrations/website-leads/` (external) |
| List page | `src/app/(dashboard)/website-leads/page.tsx` |
| Detail page | `src/app/(dashboard)/website-leads/[id]/page.tsx` |
| List UI | `src/components/admin/website-leads-management.tsx` |
| Detail UI | `src/components/admin/website-lead-detail-view.tsx` |
| Nav | `src/lib/navigation/sidebar-nav.ts`, `page-titles.ts` |

**Create-in-UI + permanent delete reference — Users:** `src/components/admin/users-management.tsx`, `src/app/api/v1/users/`, `PermanentDeleteDialog`.

**Archive/restore reference — Clients:** `src/lib/records/cleanup.ts`, `.../clients/[id]/archive|restore`.

## Required implementation workflow

1. **Model** — Add Prisma model/enums; migrate via `prisma-postgres`.
2. **Validation** — Zod in `src/lib/<domain>/schemas.ts`; mirror enum members exactly.
3. **Service** — CRUD + domain rules in `src/lib/<domain>/service.ts`; export barrel `index.ts`.
4. **Permissions** — Staff/admin via `requireAdmin` / `requireConsultantOrAdmin`; client-scoped resources via `requireClientWorkspaceAccess` (`auth`, `organization`).
5. **API** — Thin `route.ts` under `/api/v1/...`; `safeParse` → service → JSON (`api-server-actions`).
6. **List UI** — RSC page loads data; client component: stats, filters/search (`useMemo`), desktop `Table` + mobile `MobileDataCard`.
7. **Detail UI** — Notes/status/actions; `fetch` + `toast` + `router.refresh()`; Dialogs for confirm.
8. **Delete flow** — Soft lifecycle (status `archived` / `archivedAt` where used) or permanent delete with typed confirm (`PermanentDeleteDialog`) — match the entity’s existing pattern. **No `deletedAt` column** in this schema.
9. **Audit** — `recordAdminAuditEvent` (or domain wrapper) on significant mutations (`audit`).
10. **Navigation** — `sidebar-nav.ts`, page titles, command palette modules if staff-facing.
11. **Reports** — Only if the domain already exports PDF/reports; otherwise skip (`reporting`).
12. **Responsive** — Follow `premium-ui` table/card split; no inventing new shells.

## Required architecture

- Business logic in `src/lib`; UI and routes stay thin.
- Forms: controlled React state + `Input`/`Select`/`Label` — **no** react-hook-form.
- List filters often client-side over `initial*` props (website-leads); API may still accept query params.
- Create may be UI form (users) or external integration (website-leads) — do not assume an in-app create form.

## Validation commands

```bash
npm test -- tests/<domain>/
npm run lint
npm run build
```

## Definition of done

- [ ] Schema + migration + Zod + service + API + list + detail
- [ ] Role gates on page and API
- [ ] Desktop table + mobile cards; empty/error/loading handled
- [ ] Delete/archive matches sibling entity pattern
- [ ] Audit events for admin mutations where siblings record them
- [ ] Nav/titles wired for discoverability

## Common implementation mistakes

- UI-only module without API/service
- Server Actions for mutations
- Skipping mobile card list
- Hard delete without confirmation pattern used by users/clients
- Forgetting sidebar / command-palette access mirrors

## Example invocation

> "Add an admin CRUD module for vendor contacts — use **enterprise-crud** and mirror website-leads + users delete patterns."
