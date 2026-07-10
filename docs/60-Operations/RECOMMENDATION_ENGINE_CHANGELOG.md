# Recommendation Engine — Sprint 2 (DOC-112)

**Date:** June 2026  
**Spec:** [DOC-112 – Recommendation Engine Specification](DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md)  
**Catalog:** `data/RecommendationRuleCatalog.json` (50 templates, 6 consolidation groups)

---

## Sprint goal

When an assessment is completed, StackScore automatically produces:

- **Recommendations** — title, description, suggested service
- **Priorities** — critical / high / medium / low with remediation timelines
- **Business explanations** — `businessImpact` per DOC-112
- **Estimated point improvements** — per recommendation + projected overall score

**Out of scope for Sprint 2:** pricing, investment estimates, service catalog quoting.

---

## Architecture

```
Assessment responses (worst-tier / partial answers)
        ↓
collectTriggeredResponses()     ← src/lib/recommendations/generate.ts
        ↓
evaluateTriggers()              ← src/lib/recommendations/engine.ts
        ↓  (consolidation groups supersede individuals)
AssessmentRecommendation rows   ← completeAssessment() transaction
        ↓
Results UI + PDF + projects
```

### Module layout

| File | Responsibility |
|------|----------------|
| `engine.ts` | Trigger evaluation, consolidation, projection math, executive summary |
| `generate.ts` | Orchestration from saved assessment responses |
| `display.ts` | Priority timelines, sorting, UI grouping helpers |
| `data/RecommendationRuleCatalog.json` | Machine-readable DOC-112 rules |

---

## Completion flow

1. User finishes all 50 questions in the assessment wizard.
2. `POST /api/v1/assessments/:id/complete` calls `completeAssessment()`.
3. Scores are calculated (DOC-111A).
4. Recommendations are generated deterministically from answer triggers.
5. Records are persisted in a single transaction with category scores and client history.
6. User is redirected to results (or improvement view for reassessments).
7. Toast confirms how many recommendations were generated.

---

## UI (assessment results)

Recommendations are grouped by priority with:

- Recommended action (`description`)
- Business impact explanation
- Suggested BobKat service (not pricing)
- Estimated score improvement (+pts)
- Target remediation timeline (from catalog)
- Status workflow + convert to project

---

## Tests

Run `npm test` — `tests/recommendations/index.test.ts` covers:

- Single trigger (MFA)
- Partial-score trigger
- Consolidation superseding
- Priority sort order
- Category-deduped projection impact
- End-to-end `generateRecommendations()`

---

## Related docs

- [ASSESSMENT_ENGINE_CHANGELOG.md](ASSESSMENT_ENGINE_CHANGELOG.md) — Sprint 1 scoring + library
- [STABILIZATION_CHANGELOG.md](STABILIZATION_CHANGELOG.md) — Pilot hardening
