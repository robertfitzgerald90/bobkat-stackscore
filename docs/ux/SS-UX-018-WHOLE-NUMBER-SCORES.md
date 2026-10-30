# SS-UX-018 — Whole-Number Score Presentation

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Type:** UX refinement / score presentation  
**Status:** Implementation complete — staging validation  
**Scope:** Display-only maturity score labels  
**Out of scope:** Scoring engines, maturity thresholds, stored scores, recommendation logic, project progress, branding, SS-BRAND-003

---

## 1. Executive summary

Technology maturity scores now render as **whole numbers** across customer, administrative, on-screen report, PDF gauge, and marketing-demo surfaces via a single presentation helper:

`formatMaturityScore(51.43) → "51"`

Underlying numeric precision is preserved for progress bars, color classification, aggregation, persistence, and recommendation engines. Null / unavailable scores continue to show `—` and are never coerced to `0`.

---

## 2. Score-display inventory

| Location | Score type | Action |
| --- | --- | --- |
| Customer Overview — official StackScore | Official overall | Formatted |
| Customer Overview — pillar cards / strengths / exposure | Official pillar | Formatted |
| Explore — selector, tile, overview | Official pillar | Formatted |
| Explore — maturity summary prose | Official pillar (label text) | Formatted in DTO string |
| Assessment live panel / results / history / comparison | Overall + pillar / category | Formatted |
| Assessment report (on-screen) | Overall, projected, pillars | Formatted; bars keep full precision |
| Assessment PDF category cards + PdfScoreGauge | Overall / category | Formatted labels; bar width uses full precision |
| TIP on-screen report maturity cards | Current / projected / category | Formatted |
| Command Center portfolio scores | Official overall | Formatted |
| Clients table / portfolio cards | Official / projected | Formatted |
| Client 360 “Current StackScore” | Official overall | Formatted |
| Roadmap KPI / effective score journey | Official / effective / projected | Formatted |
| Journey progress ladder | Historical / current / projected | Formatted |
| Analytics trend tooltip / maturity timeline | Historical | Formatted |
| Improvement summary | Previous / current / category | Formatted |
| Marketing demo maturity + executive stages | Demo maturity scores | Formatted (same helper) |
| Snapshot lead totalScore | Snapshot quiz score (not StackScore maturity) | **Unchanged** |
| Billing / currency / completion % / project progress | Non-maturity percentages | **Unchanged** |
| Client Health Score (commercial composite) | Non-maturity composite | **Unchanged** |
| Assessment progress bar (% questions answered) | Workflow progress | **Unchanged** |

---

## 3. Shared formatter implementation

**Canonical module:** `src/lib/scoring/score-display.ts`  
**Re-export:** `src/lib/scoring/index.ts`  
**Demo re-export:** `src/components/marketing-demo/utils/score-display.ts` → canonical helper (no competing logic)

```ts
formatMaturityScore(score: number | null | undefined, unavailable = "—"): string
```

Behavior:

- `Math.round` (half-up) for finite numbers.
- `null` / `undefined` / `NaN` / ±Infinity → unavailable label (`—` by default).
- Does not mutate inputs.

Color helpers (`getScoreTextColorClass`, `getScoreBarColorClass`) still receive **raw** scores so threshold boundaries are not shifted by presentation rounding.

---

## 4. Files changed

### New

- `tests/scoring/format-maturity-score.test.ts`
- `docs/ux/SS-UX-018-WHOLE-NUMBER-SCORES.md`

### Core

- `src/lib/scoring/score-display.ts`
- `src/lib/scoring/index.ts`
- `src/lib/customer-portal/pillar-detail-dto.ts` (display text only)
- `src/lib/pdf/shared/components/score-gauge.tsx`
- `src/lib/pdf/assessment-report.tsx`

### Customer / shared UI

- Overview hero, strengths/exposure, Explore tile/selector/overview
- `client-score-hero.tsx`
- Journey progress summary

### Administrative / assessments / reports / demo

- Command Center, clients table, portfolio card, client 360
- Assessment score panel, results, history, comparison, report hero/preview, accordion, improvement summary
- Technology profile category scores / panel / journey timeline
- Roadmap KPI strip / effective score journey
- Analytics score summary / trend / maturity timeline
- TIP report sections
- Marketing demo maturity + executive stages

---

## 5. Customer changes

- Official StackScore and pillar labels show whole numbers.
- Explore selector/overview/aria labels use whole numbers.
- Progress bars continue to use full-precision widths.
- Maturity classifications unchanged (still evaluated on raw scores).

---

## 6. Administrative changes

- Command Center client scores, clients list, portfolio cards, assessment surfaces, technology profile, roadmap KPIs, analytics tooltips, commercial 360 StackScore label — consistent whole-number presentation.
- KPI calculations and dashboard aggregation untouched.

---

## 7. Report changes

| Surface | Approach |
| --- | --- |
| On-screen assessment / TIP reports | Labels via `formatMaturityScore` |
| PDF `PdfScoreGauge` | Label formatted; fill width still derived from score (rounded for CSS % clamp as before where applicable) |
| PDF category cards | Label formatted; **fill width uses full-precision `percentScore`** |
| Report content / recommendations / maturity labels | Unchanged methodology |

No PDF redesign. No recommendation or scoring changes.

---

## 8. Demo changes

Marketing-demo maturity and executive report stages import the canonical formatter. Example data values were not rewritten.

---

## 9. Test results

| Check | Result |
| --- | --- |
| `tests/scoring/format-maturity-score.test.ts` | Pass (6) |
| Scoring index + Explore + customer nav + Command Center | Pass (49 total in targeted run) |
| `npm run lint` | Exit 0 (preexisting warnings only) |
| `npm run build` | Exit 0 |
| `npx tsc --noEmit` | Exit 2 — **baseline TIP/QBR/content fixture debt only**; no new SS-UX-018 errors |

---

## 10. Scoring integrity verification

Confirmed by design and code review:

- No changes to `calculateCategoryScores`, `calculateOverallScore`, `getRating`, DOC-119 maturity helpers, or recommendation engines.
- No Prisma schema / migrations / score persistence writes.
- Progress bars still bind to full-precision values where updated.
- Color classification still uses raw scores.
- Ticket examples (`51.43` → `51`, `27.78` → `28`, …) covered by unit tests.

---

## 11. Known limitations

- Browser validation blocked (no authenticated session in this pass).
- Some prose strings outside the inventory (email templates, QBR narrative builders) may still interpolate raw overall scores; overall scores are already integer from calculation — low risk. Follow-up optional sweep.
- Snapshot quiz scores intentionally not remapped.
- Chart axis ticks / Recharts raw series still use stored numbers (tooltips formatted).

---

## 12. Production readiness assessment

| Criterion | Status |
| --- | --- |
| Whole-number maturity labels in customer + admin primary surfaces | Met |
| Shared formatter / no competing formatters | Met |
| Scoring / thresholds / stored data unchanged | Met |
| Progress bars retain precision | Met |
| Automated tests for formatter | Met |
| Lint / build | Met |
| Browser QA | Not run — checklist below |
| Production deploy | **Do not deploy** — staging only |

### Manual QA checklist (staging)

1. Customer Overview — pillars show integers; bars look continuous.  
2. Explore — selector + overview scores are integers; null shows `—`.  
3. Assessment results — category decimals rounded for labels only.  
4. Download assessment PDF — category % labels whole; layout unchanged.  
5. Command Center + Clients list — StackScore integers.  
6. Confirm a known pillar DB value still stores decimals if previously decimal.  
7. Confirm maturity badge text unchanged for boundary scores (e.g. 59.6 still classifies on raw value).

**Verdict:** SS-UX-018 implementation and automated validation are complete on `staging`. Promote only after staging visual spot-check.
