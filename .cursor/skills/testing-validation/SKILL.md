---
name: testing-validation
description: >-
  Runs quality checks in this repo — Vitest under tests/, ESLint, build. Use when
  adding tests or validating a change (deploy/smoke → production-release).
---

# Testing & Validation

## Scope

**This repository’s** `tests/`, `npm test`, `npm run lint`, `npm run build`. No separate `typecheck` script — use `npx tsc --noEmit` when needed.

## Purpose

Verify changes with Vitest, ESLint, and build — prefer business-behavior tests over trivial assertions.

## When to use

- Adding or updating tests in `tests/`
- Pre-PR validation of a feature area
- Regression checks after refactors (scoring, billing, stripe, routing)
- Validating email/PDF render output

## When not to use

- Production deployment steps → `production-release`
- Writing product specs or architecture docs

## Files to inspect first

| Area | Path |
|------|------|
| Vitest config | `vitest.config.ts` |
| Test layout | `tests/**/*.test.ts` (106+ files) |
| Example domain tests | `tests/scoring/`, `tests/billing/`, `tests/website-leads/` |
| Email test | `tests/email/bobkat-founder-signature.test.ts` |
| Layout/routing tests | `tests/layout/`, `tests/routing/` |
| Engineering standards | `docs/50-Development/DEV-001 - Engineering Standards.md` |
| Scripts | `package.json` (`test`, `lint`, `build`) |

## Required workflow

1. **Identify the closest existing test folder** for the domain (`tests/billing/`, `tests/communications/`, etc.).
2. **Write focused tests** for business rules, schemas, URL builders, permissions — not framework boilerplate.
3. **Use Vitest** with `@/` alias (configured in `vitest.config.ts`).
4. **Node environment** by default; JSX injected for react-email/PDF component tests.
5. **Run targeted tests first**, then broaden if needed:
   ```bash
   npm test -- tests/website-leads/integration.test.ts
   npm test -- tests/<domain>/
   ```
6. **Lint and build** before declaring complete on risky changes:
   ```bash
   npm run lint
   npm run build
   ```

## Architectural requirements

- Tests live under `tests/`, not co-located in `src/` (project convention).
- Prefer testing pure functions and schemas over full HTTP integration unless necessary.
- Meaningful tests only — avoid asserting obvious framework behavior (DEV-001 / user rules).
- Do not mock away business logic under test for scoring, dedupe, or billing calculations.
- File-system source inspection tests (e.g. resilience patterns) exist — follow that style when appropriate.

## Validation commands

| Command | Purpose |
|---------|---------|
| `npm test` | Full Vitest suite |
| `npm test -- tests/<path>` | Targeted domain |
| `npm run test:watch` | Interactive development |
| `npm run lint` | ESLint (Next core-web-vitals + TypeScript) |
| `npm run build` | Prisma generate + Next production build |

Note: No separate `typecheck` script — `next build` and ESLint cover TypeScript validation.

## Completion criteria

- New business logic has tests when risk is high or user requested
- Targeted tests pass for affected domains
- `npm run lint` clean on touched files
- `npm run build` passes for structural/architectural changes
- Tests use stable assertions (not time-sensitive or env-dependent without mocks)

## Common mistakes

- Running only lint and skipping tests for scoring/billing/stripe changes
- Adding tests that duplicate implementation line-for-line without behavioral value
- Importing from wrong paths (use `@/` alias)
- Assuming Jest — project uses **Vitest**
- Full suite run when a targeted path would suffice (wastes context/time)

## Example invocation

> "Add schema tests for the new lead conversion payload and run testing-validation on the website-leads folder."
