# StackScore Cursor Skills & Rules Index

**Last reviewed:** 2026-07-31 (`premium-ui` + `stripe` audited against source; inventories synced)  
**Machine-readable inventory:** [skills-inventory.csv](./skills-inventory.csv)  
**Skills root:** `.cursor/skills/<name>/SKILL.md`  
**Rules root:** `.cursor/rules/*.mdc`  
**Maintenance skill:** `cursor-maintenance` — must update this index and the CSV together on every skill-library change

> **Warning:** This inventory is a **navigation aid**, not an additional source of architectural truth. If an inventory summary conflicts with a `SKILL.md`, repository code, `package.json` scripts, or current documentation, inspect the underlying source and update the inventory.

---

## Rules (always / file-scoped)

| Rule | Apply | Role |
|------|--------|------|
| `stackscore-core.mdc` | Always | Doc-driven constitution; Route Handlers (no Server Actions); Prisma/Client tenancy; skill loading |
| `git-safety.mdc` | Always | Stay on `main`; no unsolicited/destructive git ops |
| `api-routes.mdc` | `src/app/api/**/*.ts` | Thin handlers; self-auth; points to `api-server-actions` / `integration-endpoints` |
| `prisma-database.mdc` | `prisma/**/*` | Migrations over `db push`; points to `prisma-postgres` |

No Cursor command files or custom subagent definitions were found under `.cursor/` beyond skills and rules. Product authority remains in `docs/`.

---

## Skill Selection Guide

Cursor may **automatically** select skills from YAML `description` fields (and file-scoped rules from globs). That is helpful but incomplete.

For important work, **explicitly name** the skills the agent must load:

```text
Use the stripe skill to implement checkout and webhook processing.
```

```text
Use repository-auditor first, followed by enterprise-crud and premium-ui.
```

```text
Use prisma-postgres and production-release for this schema change and deployment.
```

```text
Use resend for this notification workflow (current equivalent of former communications-email).
```

**Recommended order for non-trivial features:**

1. `repository-auditor` (and `documentation-driven-development` when behavior is specified in docs)
2. Domain skill(s)
3. `testing-validation` (and `production-release` when shipping)

---

## Skills by Category

### Architecture

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `bobkat-saas-architecture` | Orient to App Router, Prisma, Client tenancy, lib services | Choosing layers / data flow | No | `repository-auditor`, `documentation-driven-development` |
| `documentation-driven-development` | Align code with `docs/` before inventing behavior | Scoring, pricing, permissions, workflows | No | Domain skills, `bobkat-saas-architecture` |

### Feature Development

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `enterprise-crud` | End-to-end staff CRUD vertical | New managed entity (list/detail/API) | Partial | `repository-auditor`, `prisma-postgres`, `api-server-actions`, `auth`, `premium-ui`, `audit` |
| `api-server-actions` | Session Route Handlers + Zod (no Server Actions) | `/api/v1` handlers | Partial | `auth`, `organization`, `audit`, `testing-validation` |

### UI and Dashboards

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `premium-ui` | Polished SaaS UI from canonical screens (hierarchy, tables/forms, states) | Building/redesigning pages; fixing generic/cluttered UI | Partial | `enterprise-crud`, `dashboard-framework`, `repository-auditor`, `testing-validation` |
| `dashboard-framework` | KPI cards, Recharts, summaries | Portal/analytics dashboards | Partial | `premium-ui`, `reporting` (export only) |

### Database and Data

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `prisma-postgres` | Safe Prisma migrations + dependent layers | Schema/migration changes | Yes | `imports`, `testing-validation`, `production-release` |
| `imports` | CSV preview/dedupe + idempotent seeds | CSV/seed scripts | Partial | `prisma-postgres`, `resend`, `testing-validation` |
| `file-storage` | `Document.fileUrl` + on-demand PDF paths | Document registry / “uploads” questions | No | `reporting`, `auth` |

### Authentication and Security

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `auth` | NextAuth JWT, roles, portal allowlists | Login, guards, activation/reset | Partial | `organization`, `api-server-actions` |
| `organization` | **Client** isolation / `clientId` ownership | Workspace scoping (not Org models) | No | `auth`, `api-server-actions` |
| `audit` | Admin/billing/client activity + archive | Audit trails, archive/restore | No | `enterprise-crud`, `auth` |

### Integrations

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `stripe` | Secure Checkout/webhooks/subscriptions/Portal + idempotent sync | Paid products, webhooks, entitlements, portal | Yes | `auth`, `organization`, `prisma-postgres`, `resend`, `audit`, `testing-validation`, `production-release` |
| `integration-endpoints` | Shared-secret / webhook / cron **scaffolding** | New ingress routes | Partial | `stripe`, `resend`, `api-server-actions` |

### Communications

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `resend` | react-email, registry, tracked send, Resend webhooks | Email workflows (replaces `communications-email`) | Yes | `integration-endpoints`, `stripe`, `testing-validation` |

### Reporting

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `reporting` | `@react-pdf/renderer` + on-screen reports | PDF/export/report DTOs | Partial | `file-storage`, `assessments`, `roadmap` |

### Deployment and Validation

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `testing-validation` | Vitest, ESLint, build | Adding tests / pre-PR checks | Yes | Any domain skill |
| `production-release` | Vercel+Neon migrate/smoke | Deploy readiness / build failures | Partial | `testing-validation`, `prisma-postgres` |

### Repository and Skill Maintenance

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `repository-auditor` | Inspect/reuse before coding | Start of non-trivial features | Yes | Then domain skills |
| `cursor-maintenance` | Audit/merge `.cursor` knowledge; sync index + CSV | Skill create/update/rename/merge/deprecate/remove or drift | Yes | Must update this index + `skills-inventory.csv` in the same change |

### StackScore-Specific Business Logic

| Skill | Purpose | Invoke when | Portable | Commonly used with |
|-------|---------|-------------|----------|--------------------|
| `assessments` | Questions → scoring v1/v2 → complete | Library/scoring/completion | No | `recommendations`, `roadmap` |
| `recommendations` | Triggers → catalogs → sync (real fields only) | Engines/catalogs/dedupe | No | `assessments`, `roadmap` |
| `roadmap` | TIP → phases/initiatives/proposals | Roadmap/TIP/projects | No | `recommendations`, `reporting`, `premium-ui` |

---

## Common Skill Bundles

### New CRUD Module

1. `repository-auditor`
2. `enterprise-crud`
3. `prisma-postgres` (if schema changes)
4. `api-server-actions`
5. `auth` (+ `organization` if client-scoped)
6. `premium-ui`
7. `audit`
8. `testing-validation`

### Stripe Feature

1. `repository-auditor`
2. `stripe`
3. `auth` (+ `organization` for client billing)
4. `prisma-postgres` (if models change)
5. `api-server-actions` / `integration-endpoints` (session vs public ingress)
6. `resend` (fulfillment/lifecycle email)
7. `audit`
8. `testing-validation`

### Email Workflow

1. `resend` (**current equivalent** of former `communications-email`)
2. `integration-endpoints` (only for webhook/cron route scaffolding)
3. `audit` (when admin-triggered or activity timeline needed)
4. `testing-validation`

### Dashboard

1. `repository-auditor`
2. `dashboard-framework`
3. `premium-ui`
4. `reporting` (only if PDF/export is in scope)

### Database Migration

1. `prisma-postgres`
2. `imports` (when data transformation/backfill/seed required)
3. `testing-validation`
4. `production-release`

### Production Deployment

1. `production-release`
2. `testing-validation`
3. `prisma-postgres` (when migrations are involved)
4. `integration-endpoints` (when external ingress/cron/webhooks are involved)
5. `stripe` / `resend` (when those providers are part of the release risk)

### Assessment Feature

1. `documentation-driven-development`
2. `assessments`
3. `recommendations`
4. `roadmap`
5. `reporting`
6. `premium-ui`
7. `testing-validation`

---

## Explicit Invocation Templates

### One skill

```text
Use the <skill-name> skill for this task. Follow its Required workflow and Definition of done.
```

### Several skills

```text
Use these skills in order:
1. repository-auditor
2. <domain-skill>
3. testing-validation
Do not skip the auditor reuse plan.
```

### Auditing before implementation

```text
Use repository-auditor only. Do not change application code.
Cite the closest existing module and a reuse plan for <feature>.
```

### Planning without changing code

```text
Use documentation-driven-development and bobkat-saas-architecture.
Produce a layer plan (schema/API/UI) for <feature>. Do not edit src/ or prisma/ yet.
```

### Implementing and validating a feature

```text
Use repository-auditor, then <domain skills>, then testing-validation.
Implement the smallest cohesive change. Run the validation commands from each skill before finishing.
```

### Updating skills after a completed feature

```text
Use cursor-maintenance.
In the same change, update .cursor/SKILLS_INDEX.md and .cursor/skills-inventory.csv
for any skill that was created, updated, renamed, merged, deprecated, or removed.
Verify every active skill appears in both inventories; remove deprecated skills from bundles.
Update Last Reviewed only for skills whose SKILL.md was inspected.
Do not modify application code unless separately instructed.
```

---

## Inventory Maintenance

**Required:** Use `cursor-maintenance` for skill-library edits. Update **both** [SKILLS_INDEX.md](./SKILLS_INDEX.md) and [skills-inventory.csv](./skills-inventory.csv) in the **same change** whenever a skill is:

- Created
- Updated (substantially)
- Renamed
- Merged
- Deprecated
- Deleted / removed

### Verification (every maintenance pass)

- Every active skill appears in both inventories
- Every inventory entry maps to an existing skill (or is explicitly Deprecated)
- Summaries match the current `SKILL.md` (not filenames alone)
- Bundles use current names only; deprecated skills excluded from bundles
- `Last Reviewed` bumped only for skills actually inspected
- Inventories stay concise (no full skill paste)
- No secrets or env **values** (names only)

Prefer `cursor-maintenance` for the audit workflow. Treat `SKILL.md` files as source of truth for procedure; treat this index as a map.

---

## Snapshot (2026-07-31)

| Metric | Count |
|--------|------:|
| Active skill directories | 23 |
| Always-applied rules | 2 (`stackscore-core`, `git-safety`) |
| File-scoped rules | 2 (`api-routes`, `prisma-database`) |
| Deprecated skills | 0 |

### Needs review (naming / overlap — skills remain Active for use)

- `api-server-actions` — name implies Server Actions; architecture forbids them
- `organization` — name implies Org tenancy; tenant is **Client**
- `integration-endpoints` — file tables overlap Stripe/Resend; scaffolding vs domain hand-off

### Former names (do not invoke)

| Former | Current |
|--------|---------|
| `communications-email` | `resend` |
| `premium-saas-ui` | `premium-ui` |
| `auth-authorization` | `auth` |
| `api-route-development` | `api-server-actions` |
| `prisma-schema-migrations` / `prisma-postgres-change` | `prisma-postgres` |
| `pdf-report-generation` | `reporting` |
| `data-import-workflows` | `imports` |
| `production-release-verification` | `production-release` |
| `cursor-skill-maintenance` | `cursor-maintenance` |
