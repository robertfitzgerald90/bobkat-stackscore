---
name: recommendations
description: >-
  Implements recommendation engines in this repo — triggers, catalogs, priority,
  businessImpact, estimatedImpactPoints, dedupe sync. Use when changing engines,
  catalogs, or AssessmentRecommendation sync (schema fields only — no invented ROI).
---

# Recommendation Engine

## Scope

**StackScore-only.** Recommendation field set must match Prisma — **no** `technicalImpact`, `roi`, or recommendation-level `cost`/`effort`. Do not invent those columns for “completeness,” and do not port this engine to other apps as-is.

## Purpose

Generate and sync recommendations from assessment triggers using v1/v2 catalogs and the **fields that actually exist**.

## When to use

- Trigger evaluation, catalog JSON, template codes
- `AssessmentRecommendation` sync/dedupe/status
- Priority / business impact / estimated impact points

## When not to use

- Scoring math → `assessments`
- Phases/TIP/projects → `roadmap`
- Playbook effort weeks → TIP playbook catalog (not recommendation columns)

## Repository locations to inspect

| Area | Path |
|------|------|
| Schema | `RecommendationTemplate`, `AssessmentRecommendation`, `RecommendationAssessmentTrigger` |
| Engines | `src/lib/recommendations/engine.ts`, `v2-engine.ts`, `generate.ts`, `sync.ts`, `dedupe.ts` |
| Catalogs | `data/RecommendationRuleCatalog.json`, `data/RecommendationCatalogV2.json` |
| Playbooks (effort) | `data/SolutionPlaybookCatalog.json` |
| Queries/UI | `queries.ts`, `display.ts`, `sort.ts`, `client-list.ts` |
| Docs | DOC-112, related business-logic docs |

## Required implementation workflow

```
Risk (AssessmentQuestion.riskLevel — not on recommendation)
  ↓
Priority (Priority enum on template + AssessmentRecommendation)
  ↓
Business impact (businessImpact text)
  ↓
Technical impact — ABSENT as a field (do not invent)
  ↓
Cost — ABSENT on recommendation (lives on Project / roadmap investments)
  ↓
Effort — ABSENT on recommendation (playbook effortLevel)
  ↓
ROI — ABSENT (effectivenessJson placeholder only on initiatives)
  ↓
Generation: triggers → evaluateTriggers / evaluateV2Triggers → syncClientRecommendations
```

1. Collect triggers from `AnswerOption.triggersRecommendation` + catalog rules.
2. Evaluate with the engine matching `scoringEngineVersion`.
3. Sync with dedupe key; write `RecommendationAssessmentTrigger` rows.
4. Expose status transitions via existing APIs/UI — do not invent parallel stores.

## Required architecture

**Exists on recommendations:** `priority`, `businessImpact`, `estimatedImpactPoints`, `suggestedService`, `status`, `dedupeKey`, consolidation groups.

**Does not exist:** `technicalImpact`, `roi`, recommendation-level `cost`/`effort`.

## Validation commands

```bash
npm test -- tests/recommendations/
npm test -- tests/scoring/
npm run lint
```

## Definition of done

- [ ] Catalog + engine + sync path consistent
- [ ] No fake ROI/effort columns added without `prisma-postgres` + docs
- [ ] Dedupe preserves client history
- [ ] Tests cover trigger/priority behavior

## Common implementation mistakes

- Adding ROI/effort fields because “engines usually have them”
- Bypassing `syncClientRecommendations`
- Ignoring v2 stub catalog (`RecommendationCatalogV2.json`)
- Coupling playbook effort into AssessmentRecommendation schema casually

## Example invocation

> "Tune consolidation groups for overlapping recs — use **recommendations** and RecommendationRuleCatalog."
