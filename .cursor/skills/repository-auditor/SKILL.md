---
name: repository-auditor
description: >-
  Inspects this repository before coding — finds similar modules, reuses
  components, follows local conventions, avoids duplication. Use at the start
  of any non-trivial feature.
---

# Repository Auditor

## Scope

**Always inspect the current repository first.** Conventions below describe StackScore; in another codebase, discover *that* repo’s patterns instead of importing StackScore models, roles, or product workflows.

## Purpose

Reuse-first pass so agents extend existing verticals rather than inventing parallel stacks.

## When to use

- Starting a non-trivial feature
- User asks “how do we already do X?”
- Cross-layer work with high abstraction risk

## When not to use

| Situation | Use instead |
|-----------|-------------|
| One-file typo/copy fix | Edit directly |
| Skill/rule library maintenance | `cursor-maintenance` |
| Known single-layer task with skill already chosen | That domain skill |

## Repository locations to inspect (this repo)

| Layer | Path |
|-------|------|
| Domain modules | `src/lib/<domain>/`, `src/app/(dashboard)/`, `src/app/api/v1/` |
| CRUD references | website-leads, users → `enterprise-crud` |
| UI | `src/components/ui/`, `premium-ui` references |
| Auth / isolation | `src/lib/api/helpers.ts`, `access.ts`, `src/lib/auth/` |
| Schema | `prisma/schema.prisma` |
| Docs | `docs/` (DOC-120/123/124+) |
| Tests | `tests/<domain>/` |

## Required implementation workflow

1. Search for similar models, routes, sidebar entries, and `src/lib` domains.
2. Cite the closest module to extend before adding files.
3. Reuse primitives/shells already in-repo.
4. Follow **this repo’s** conventions (discover; do not assume):
   - Mutations: Route Handlers under `src/app/api/**` — **no Server Actions** here
   - Tenant: **Client** boundary — no Organization/Workspace models
   - Soft lifecycle: status / `archivedAt` where implemented — not `deletedAt`
   - Files: `Document.fileUrl` + on-demand PDF — not S3 uploads
   - Imports: CSV preview/dedupe — no Excel/rollback
   - Recommendations: only schema fields that exist (`recommendations`)
5. Respect existing `require*` helpers and portal allowlists.
6. Output a short reuse plan (paths to copy/extend), then implement with the matching domain skill.

## Portable principle vs StackScore binding

| Portable | StackScore-bound |
|----------|------------------|
| Find analogs before inventing | Client tenancy, UserRole set, TIP/vCIO, website-leads shape |
| Prefer extend over duplicate | Specific paths under `src/lib/website-leads`, etc. |
| Match local auth/data patterns | DOC-120 vocabulary and product workflows |

## Validation commands

Discovery (workspace tools / ripgrep — not npm scripts):

```bash
# examples — use IDE search or rg if available
# model X → prisma/schema.prisma
# domain symbol → src/lib src/app
```

After implementation, run the domain skill’s `package.json` scripts (`lint`, `test`, `build` as applicable).

## Definition of done

- [ ] Closest existing module cited with paths
- [ ] Reuse plan written before new stacks appear
- [ ] No parallel service/API/UI for the same concern
- [ ] Auth/tenancy matches neighboring code in **this** repo

## Common implementation mistakes

- Generic SaaS templates instead of in-repo references
- New frameworks (Server Actions, Radix, second ORM) against local standards
- Copying StackScore product models into a different repository

## Example invocation

> "Before vendor management, use **repository-auditor** and cite the closest module to extend."
