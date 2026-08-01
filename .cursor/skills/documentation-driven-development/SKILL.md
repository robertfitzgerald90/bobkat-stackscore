---
name: documentation-driven-development
description: >-
  Aligns implementation with governing docs in this repo before coding. Use for
  business logic, scoring, pricing, or permissions that must match docs/ specs
  (not pure UI polish or deploy-only work).
---

# Documentation-Driven Development

## Scope

**StackScore `docs/` are authoritative here** (DOC-129). Do not invent product behavior; do not apply StackScore DOC numbers as law in other repositories.

## Purpose

Ensure features implement documented requirements rather than invented business logic.

## When to use

- Any new business workflow, scoring change, pricing logic, or permission model
- Features touching Technology Profile, assessments, recommendations, billing, vCIO
- When user asks "how should this work?" for domain behavior
- Before creating new database entities or service boundaries

## When not to use

- Pure UI spacing/styling tweaks with no behavior change
- Mechanical refactors that preserve documented behavior
- Infrastructure/deploy tasks

## Files to inspect first

| Priority | Path |
|----------|------|
| Constitution | `docs/30-Architecture/DOC-129 – AI Development Rules & Engineering Constitution.md` |
| Index | `docs/DOC-000 – Documentation Architecture & Index.md` |
| Domain model | `docs/30-Architecture/DOC-120 – Domain Model Specification.md` |
| Workflows | `docs/30-Architecture/DOC-123 – Application Workflow Specification.md` |
| Services | `docs/30-Architecture/DOC-124 – Service Layer Specification.md` |
| Module specs | `docs/40-Modules/DOC-200+` |
| Engineering | `docs/50-Development/DEV-001 - Engineering Standards.md` |
| Migration plan | `docs/50-Development/DEV-002 – Next Generation Migration Plan.md` |

## Required workflow

1. **Identify governing documents** from DOC-000 index for the feature area.
2. **Read relevant specs** before writing code (workflow, domain model, RBAC, module PRD).
3. **Note conflicts** between docs or between docs and code — ask user which source wins; do not silently invent behavior.
4. **Assess regression risk** when changing acquisition, checkout, billing, auth, or email paths — run before finishing:
   ```bash
   npm test -- tests/stripe/
   npm test -- tests/marketing/
   ```
5. **Implement** using existing services; extend rather than duplicate (DEV-001).
6. **Update documentation** when approved behavior changes (same PR/session as code).
7. **Register new docs** in DOC-000 — no parallel undocumented spec files.

## Architectural requirements

- Documentation outranks stale code until intentionally revised (DOC-129).
- Technology Profile is central — do not bypass it for client-facing features.
- StackScore is not a CRM — Business Profile stays lightweight.
- Follow DEV-002 phase order for v2 migration work.
- Comments on business logic should cite governing doc IDs (DEV-001).

## Validation commands

No automated doc lint — verify manually:

- Cross-check implementation against spec acceptance criteria
- `npm test -- tests/<domain>/` for behavioral regression
- Confirm DOC-000 index if new doc added

## Completion criteria

- Feature traceable to at least one governing document
- No undocumented business rules introduced
- Docs updated when behavior intentionally changed
- DEV-001 comment standards applied to complex domain logic

## Common mistakes

- Treating existing code as authoritative when it contradicts docs
- Creating new entity names outside DOC-120 vocabulary
- Skipping DOC-122 permission review for new UI/API surfaces
- Implementing future DEV-002 phases out of order
- Leaving docs stale after architectural changes
- Refactoring shared funnels (assessment offer, Stripe checkout, vCIO) without running `tests/stripe/` or `tests/marketing/`

## Example invocation

> "Implement the client conversion workflow per documented specs — use documentation-driven-development and read DOC-123 first."
