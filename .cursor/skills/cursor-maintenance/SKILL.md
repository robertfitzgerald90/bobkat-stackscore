---
name: cursor-maintenance
description: >-
  Audits .cursor rules/skills and keeps SKILLS_INDEX.md plus
  skills-inventory.csv in sync. Use when creating, updating, renaming, merging,
  deprecating, or removing skills — or refreshing agent knowledge after drift.
---

# Cursor Skill Maintenance

## Scope

**This repository’s `.cursor/` only.** Do not modify `src/` unless separately requested. When extracting skills to a shared Bobkat library, strip StackScore bindings first.

## Purpose

Keep `.cursor/rules` and `.cursor/skills` accurate, minimal, and non-redundant — and keep the human/machine inventories synchronized with every skill-library change.

## When to use

- Create, update, rename, merge, deprecate, or remove a skill
- Audit/refresh rules or skills after major features or drift
- Codify repeated corrections into `.cursor/`
- Scripts/architecture drift vs skill text
- Inventory / index out of sync with skill directories

## When not to use

- Normal feature development (use domain skills)
- Changing `src/`, `prisma/`, or tests without explicit request
- Rewriting product docs as a substitute for reading `docs/`

## Repository locations to inspect

| Area | Path |
|------|------|
| Rules | `.cursor/rules/*.mdc` |
| Skills | `.cursor/skills/*/SKILL.md` |
| Markdown index | `.cursor/SKILLS_INDEX.md` |
| CSV inventory | `.cursor/skills-inventory.csv` |
| Scripts truth | `package.json` |
| Constitution | DOC-129 |
| Deploy/env | DEPLOY.md, ENVIRONMENTS.md, `.env.example` (**names only**) |

## Required implementation workflow

Execute in order:

### 1. Inspect current state

- List every `.cursor/skills/*/SKILL.md` (name + description).
- Read `.cursor/rules/*.mdc`.
- Read `package.json` scripts (command source of truth).
- Read `.cursor/SKILLS_INDEX.md` and `.cursor/skills-inventory.csv`.

### 2. Apply skill-library changes

- Evidence bar: **≥2 signals** before permanent guidance.
- Prefer **update/merge** over create; delete obsolete duplicates.
- Keep always-applied rules short; details in skills.
- Classify: always-applied rule vs file-scoped rule vs skill vs `docs/` vs nowhere.

### 3. Update both inventories in the same change (mandatory)

Whenever a skill is **created, updated, renamed, merged, deprecated, or removed**, update **both** in the **same** change set:

1. `.cursor/SKILLS_INDEX.md`
2. `.cursor/skills-inventory.csv`

Do not ship skill directory edits without inventory updates.

| Event | Index (`SKILLS_INDEX.md`) | CSV (`skills-inventory.csv`) |
|-------|---------------------------|------------------------------|
| Create | Add to category + snapshot counts; add bundles only if warranted | Add one new row |
| Update (substantial) | Refresh purpose/when/portable/bundles if affected | Update columns from current `SKILL.md` |
| Rename | Replace all references; add former→current map | Change `Skill Name`; fix Dependencies/Notes |
| Merge | Keep survivor; remove loser from categories/bundles | One row for survivor; drop merged-away name |
| Deprecate | Mark deprecated; **remove from recommended bundles** | `Status=Deprecated`; clear from active lists |
| Remove | Delete all references and snapshot counts | Delete the row |

Inventories are **navigation summaries** — do **not** paste full `SKILL.md` bodies into either file.

### 4. Inventory verification checklist (mandatory)

Before finishing, verify:

- [ ] Every **active** skill directory with a `SKILL.md` appears in **both** inventories
- [ ] Every inventory entry corresponds to an **existing** skill directory (or is explicitly `Deprecated` and documented)
- [ ] CSV/index purpose and use-when **accurately reflect** the current `SKILL.md` (re-read changed skills; do not invent from filenames)
- [ ] Skill **bundles** in the index use **current** skill names only
- [ ] **Deprecated** skills are **not** listed in recommended bundles
- [ ] `Last Reviewed` (CSV) is updated **only** for skills whose `SKILL.md` was actually inspected this pass — do not bump the whole catalog
- [ ] Neither inventory duplicates full skill content
- [ ] **No secrets** and **no environment variable values** in either inventory (env **names** only, if needed)

### 5. Consistency pass

- Diff `npm run` / `npx` commands in skills against `package.json`.
- Resolve contradictions in favor of `docs/` (behavior) or current code patterns (agent procedure) with 2+ evidence.
- Present a change plan for large restructures; apply when the user asked to maintain/update.

## Safeguards

| Rule | Enforcement |
|------|-------------|
| Inventories stay paired | Same change as skill create/update/rename/merge/deprecate/remove |
| No single-file inference | 2+ signals before permanent guidance |
| Scripts match package.json | Verify every maintenance pass |
| No secrets | Env **names** only — never values, connection strings, or `.env` contents |
| No app changes | `.cursor/` (+ optional docs) only unless asked |
| Focused skills | Never one “general development” mega-skill |
| Index is not truth | If inventory conflicts with `SKILL.md`/code/docs, fix the inventory |

## Current inventory (summary)

**Authoritative lists:** `.cursor/SKILLS_INDEX.md` and `.cursor/skills-inventory.csv`.

**Rules:** `stackscore-core.mdc`, `api-routes.mdc`, `prisma-database.mdc`, `git-safety.mdc`

**Active skills (23):** see CSV / index — do not maintain a second full list here beyond pointing at those files.

## Validation commands

```bash
# Scripts source of truth
node -e "console.log(Object.keys(require('./package.json').scripts).join('\n'))"

# Active skill directories vs CSV names (PowerShell)
# $dirs = (Get-ChildItem .cursor/skills -Directory).Name | Sort-Object
# $csv  = (Import-Csv .cursor/skills-inventory.csv).'Skill Name' | Sort-Object
# Compare-Object $dirs $csv
```

Also manually confirm bundles in `SKILLS_INDEX.md` contain only non-deprecated current names.

## Definition of done

- [ ] Skill/rule edits complete and non-redundant
- [ ] `.cursor/SKILLS_INDEX.md` and `.cursor/skills-inventory.csv` updated in the same change
- [ ] Inventory verification checklist passed
- [ ] Descriptions unique and scannable
- [ ] No obsolete commands left in `.cursor/`
- [ ] Application code untouched (unless separately instructed)

## Common implementation mistakes

- Editing a skill without updating both inventories
- Bumping every row’s `Last Reviewed` without inspecting those skills
- Leaving deprecated names in Common Skill Bundles
- Copying entire `SKILL.md` bodies into the index/CSV
- Codifying one-off chat preferences
- Preserving `db push` as the production migration path

## Example invocation

> "Audit Cursor skills after the billing release — use **cursor-maintenance** and sync SKILLS_INDEX.md + skills-inventory.csv."
