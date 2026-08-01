---
name: assessments
description: >-
  Implements assessment scoring in this repo — questions, answers, weights,
  v1/v2 engines, completion. Use when changing the assessment library, scoring,
  or completeAssessment flow (not roadmap/PDF alone).
---

# Assessment Framework

## Scope

**StackScore-only product domain.** Do not recreate Assessment/Technology Profile models or DOC-119 scoring in other repositories.

## Purpose

Preserve the real assessment pipeline: catalog questions → responses → scoring engine (v1/v2) → category/pillar scores → recommendation triggers → profile/history updates.

## When to use

- Question library, weights, answer options, categories/pillars
- Scoring engine changes (DOC-119 v2 / legacy v1)
- Completing assessments, comparisons, reassessment

## When not to use

- Recommendation generation details → `recommendations`
- Roadmap/TIP materialization → `roadmap`
- PDF export only → `reporting`

## Repository locations to inspect

| Area | Path |
|------|------|
| Schema | `Assessment*`, `AssessmentQuestion`, `AnswerOption`, `AssessmentCategory`, `AssessmentCategoryScore` |
| Complete | `src/lib/assessments/index.ts`, `complete-v2.ts` |
| Scoring v1 | `src/lib/scoring/index.ts` |
| Scoring v2 | `src/lib/scoring/v2/` |
| Library | `src/lib/assessment-library/`, `data/v2-question-library.json` |
| Pillars | `src/lib/technology-maturity/pillars.ts` |
| Report data | `src/lib/assessments/report-data.ts` |
| Docs | DOC-111/111A, DOC-119, DOC-120 |

## Required implementation workflow

```
Questions (AssessmentQuestion.weight, riskLevel, responseType)
  ↓
Answers (AnswerOption.scoreValue, triggersRecommendation, triggersCriticalFlag)
  ↓
Scoring (scoringEngineVersion v1|v2 on Assessment)
  ↓
Categories / pillars (AssessmentCategoryScore; v2 pillar weighted averages)
  ↓
Weights (v1 category weights in scoring/index; v2 question.weight per pillar)
  ↓
→ recommendations skill (triggers)
  ↓
→ roadmap skill (materializeDraftRoadmap on v2 complete)
```

1. Read scoring docs before changing formulas.
2. Prefer v2 paths for new work (`ScoringEngineVersion.v2` default).
3. Persist via `completeAssessment` — do not fork ad-hoc score writers.
4. Keep critical exposure from `triggersCriticalFlag`.
5. Update catalog JSON + seed/backfill helpers when library changes.
6. Align UI/results with `results-summary` / comparison modules.

## Required architecture

| Engine | Behavior |
|--------|----------|
| v1 | Category % + fixed category weights; pillar columns on Assessment |
| v2 | Yes=100 / Partially=50 / No=0; pillar weighted avg; overall = mean of complete pillars |

- Unique response per `(assessmentId, questionId)`.
- Technology Profile / `ClientScoreHistory` updated on complete (v2).

## Validation commands

```bash
npm test -- tests/scoring/
npm test -- tests/assessments/
npm run lint
npm run build
```

## Definition of done

- [ ] Catalog/schema/scoring paths consistent
- [ ] Completion still syncs recommendations (and roadmap when applicable)
- [ ] Docs updated if scoring behavior changes
- [ ] Tests cover score math regressions

## Common implementation mistakes

- Mixing v1 and v2 formulas
- Inventing ROI/effort fields on Assessment
- Completing assessments without going through `completeAssessment`
- Editing questions without seed/catalog sync

## Example invocation

> "Adjust v2 pillar weighting for incomplete pillars — use **assessments** and DOC-119."
