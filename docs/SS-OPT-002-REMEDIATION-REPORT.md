# SS-OPT-002 — Assessment Engine Remediation Report

**Document ID:** SS-OPT-002-REMEDIATION  
**Status:** Complete  
**Date:** October 23, 2026  
**Audit reference:** [`SS-OPT-002-ASSESSMENT-ENGINE-AUDIT.md`](SS-OPT-002-ASSESSMENT-ENGINE-AUDIT.md)

---

## 1. Executive summary

SS-OPT-002 remediation is implemented. The v2 assessment engine now enforces **server-side full-answer completion**, preserves **null vs zero** score semantics, labels incomplete pillars per DOC-119, uses **DOC-119 maturity bands** for display (with a documented Prisma enum bridge), syncs Technology Profile risk counts from **recommendation priorities**, and **withholds stub catalog recommendations** from client portal/email payloads.

DOC-119 scoring math (weights, pillar means, N/A exclusion) is unchanged. Recommendation **content** remains deferred to SS-OPT-003.

**Validation:** 506/506 automated tests passed; ESLint 0 errors; production `npm run build` succeeded. No schema migration.

---

## 2. Defects remediated

| ID | Severity | Status | Resolution |
| --- | --- | --- | --- |
| DEF-001 | Critical | Fixed | `evaluateV2CompletionGuards` + `completeAssessmentV2` require all active questions answered; API returns HTTP 409 |
| DEF-002 | High | Fixed | Incomplete assessments cannot finalize; draft preview labeled; incomplete pillars show “Assessment Incomplete” |
| DEF-003 | High | Fixed | Null overall rejected at complete; history/PDF/API/comparison no longer coerce null → 0 |
| DEF-004 | High | Deferred (gated) | Catalog stubs unchanged; client delivery + assessment-complete email copy filtered (SS-OPT-003 owns rewrite) |
| DEF-005 | Medium | Fixed | `buildRiskSummaryFromPriorities` replaces hardcoded high/medium/low zeros |
| DEF-006 | Medium | Fixed | Score panel + preview maturity labels use Assessment Incomplete |
| DEF-007 | Medium | Fixed | Shared DOC-119 `getTechnologyMaturityLevel`; profile storage bridged to Prisma `MaturityTier` |
| DEF-008 | Medium | Fixed | `syncProfileFromAssessmentV2` reads persisted assessment + `ClientScoreHistory` snapshots (no live library rescore) |
| DEF-009 | Low | Fixed | Completion rejects unrecognized answer labels (HTTP 409) |
| DEF-010 | Low | Partial | Wizard complete disabled until `isCompletionReady`; draft badge in live analytics |

---

## 3. Architectural decisions

1. All active questions must be answered before v2 completion (N/A counts as answered).
2. Completion requires a non-null numeric overall StackScore (all-N/A rejected).
3. Null scores are never silently converted to zero on complete/history/PDF/comparison paths touched in this milestone.
4. Completed assessments remain immutable (existing response lock preserved).
5. DOC-119 is authoritative for maturity **labels**; Prisma `MaturityTier` lacks Managed/Basic/Initial — storage uses a documented bridge:
   - Managed → `mature`
   - Basic → `foundational`
   - Initial → `nascent`
6. Recommendation stub **copy** is OPT-003; this milestone only blocks automatic client publication.
7. v1 completion behavior preserved (`All questions must be answered`).

---

## 4. Files modified

### Core assessment / scoring

- `src/lib/assessments/complete-v2.ts` — completion gates; snapshot-based profile sync
- `src/lib/assessments/completion-guards.ts` — **new** pure guard evaluator
- `src/lib/assessments/index.ts` — preview completeness + incomplete pillar metadata
- `src/lib/assessments/executive-summary.ts` — DOC-119 maturity prose
- `src/lib/assessments/comparison-build.ts` — reject null overall in comparisons
- `src/lib/assessments/reassessment.ts` — null-safe score deltas
- `src/lib/scoring/v2/types.ts` — `isRecognizedV2Answer`
- `src/lib/scoring/v2/maturity-level.ts` — descriptions + label helper
- `src/lib/scoring/v2/index.ts` — exports
- `src/lib/scoring/maturity.ts` — DOC-119 → profile enum bridge; display via DOC-119
- `src/lib/assessment-library/category-mapping.ts` — DOC-119 maturity labels
- `src/types/assessment-preview.ts` — draft / completion-ready / pillar status fields

### API / UI

- `src/app/api/v1/assessments/[id]/complete/route.ts` — 409 mapping; null overall guard
- `src/app/api/v1/assessments/[id]/export/pdf/route.ts` — require numeric overall
- `src/app/api/v1/assessments/[id]/route.ts` — template include for stub filter
- `src/components/assessments/assessment-score-panel.tsx` — draft + incomplete labeling
- `src/components/assessments/assessment-wizard.tsx` — complete disabled until ready

### Recommendations / profile / communications

- `src/lib/recommendations/stubs.ts` — **new** stub catalog detector
- `src/lib/recommendations/risk-summary.ts` — **new** priority risk counts
- `src/lib/recommendations/visibility.ts` — client stub withholding (fail closed without template code)
- `src/lib/recommendations/client-list.ts` — use array presenter
- `src/lib/recommendations/queries.ts` — include template code
- `src/lib/technology-profile/index.ts` — priority risk summary; null-safe score/label
- `src/lib/communications/workflows/triggers.ts` — exclude stubs from email strengths/priorities; null-safe overall

### Tests / docs

- `tests/assessments/ss-opt-002-remediation.test.ts` — **new** regression suite
- `tests/recommendations/visibility.test.ts` — stub delivery cases
- `tests/scoring/index.test.ts`, `tests/assessments/executive-summary.test.ts` — DOC-119 expectations
- `docs/SS-OPT-002-REMEDIATION-REPORT.md` — this report
- `docs/DOC-000 – Documentation Architecture & Index.md` — index entry

---

## 5. Database changes

**None.** No Prisma migrations. No destructive operations.

**Documented schema limitation (DEF-007 / DEF-008):**

- `MaturityTier` enum cannot store Managed / Basic / Initial without a migration. Display uses DOC-119 labels from numeric scores; storage uses the bridge above.
- `ClientScoreHistory.overallScore` remains a required Decimal; after this remediation, completed assessments always write a real numeric overall, so null coercion is no longer required on that write path.
- Optional future migration (not implemented): add `completePillarCount`, `scoringCompleteness`, or expand `MaturityTier` to DOC-119 codes.

---

## 6. Tests added

| File | Coverage |
| --- | --- |
| `tests/assessments/ss-opt-002-remediation.test.ts` | Zero/one/full/all-N/A completion guards; null vs zero; incomplete pillars; DOC-119 boundaries; answer recognition; risk summary; stubs; dedupe; historical null contract |
| `tests/recommendations/visibility.test.ts` | Stub withholding for clients; staff visibility retained |

Existing scoring/executive-summary/comparison tests updated for DOC-119 labels.

---

## 7. Validation results

| Check | Result |
| --- | --- |
| `npm test -- tests/assessments/ss-opt-002-remediation.test.ts` (+ related) | Pass |
| Full `npm test` | **506 / 506 passed** |
| `npm run lint` | **0 errors** (pre-existing warnings only) |
| `npx tsc --noEmit` | Pre-existing test-file type errors only; no new src regressions identified in remediation paths |
| `npm run build` | **Success** |

---

## 8. Remaining limitations

1. **Recommendation stubs (DEF-004):** All 80 catalog templates remain `isStub: true`. Clients see **no** stub recommendations until OPT-003 approves copy. Consultants retain full visibility. Assessment-complete email already requires manual review (`autoSend: false`); stub titles are also stripped from email payload lists.
2. **Prisma maturity enum bridge:** Stored `MaturityTier` values for Managed/Basic/Initial scores are approximated; UI labels derived from score use true DOC-119 names.
3. **Fail-closed client delivery:** Recommendations without a resolvable template code are hidden from clients (safety). Legacy rows without templates need staff review / OPT-003 linkage.
4. **Draft preview overall:** While answering, preview may still show a partial mean of complete pillars; UI now marks it as **Draft preview** / not finalized. Completion itself is blocked until all questions are answered and overall is numeric.
5. **PDF for consultants** may still list stub recommendations (internal delivery). Client portal APIs filter stubs.
6. **SS-OPT-003 not started** (per scope).

---

## 9. Manual verification checklist

- [ ] Create a draft v2 assessment; answer one question; confirm Complete stays disabled and API `POST .../complete` returns 409 with unanswered count.
- [ ] Answer all questions with a mix of Yes/Partially/No; complete successfully; confirm overall and eight pillar scores; PDF downloads.
- [ ] Attempt all-N/A answers across all questions; confirm completion rejected (no overall).
- [ ] Confirm incomplete pillars show “Assessment Incomplete” in live analytics.
- [ ] Confirm draft panel shows “Draft preview” / not finalized messaging.
- [ ] As client role, open recommendations — stub rows hidden; as admin/technician, stubs visible.
- [ ] Complete assessment; confirm Technology Profile riskSummary high/medium/low are non-zero when matching open priorities exist.
- [ ] Confirm completed assessment responses cannot be edited (existing lock).
- [ ] Confirm maturity label for score 72 displays **Managed** (not Mature) in preview/summary surfaces.

---

## 10. Production-readiness assessment

| Criterion | Status |
| --- | --- |
| Incomplete v2 assessments cannot be finalized | Met |
| Null scores distinguishable from zero | Met on remediated paths |
| Draft results not mistaken for completed | Met (labeling + completion gate) |
| Maturity classifications consistent (DOC-119 display) | Met |
| Technology Profile risk metrics accurate | Met (priority-based) |
| Historical assessment scores stable | Met (no rewrite; snapshot sync) |
| Invalid answer labels cannot silently score | Met at completion |
| Unapproved stubs not auto-delivered to clients | Met (portal + email payload) |
| Automated tests + production build | Met |
| Remaining risks documented | Met (§8) |

**Verdict:** Assessment engine completion integrity is suitable for paid consulting workflows **when assessors use the product UI or the hardened API**. Customer-facing recommendation **language** still requires SS-OPT-003 before stubs should be published.

**Do not begin SS-OPT-003 until this report is accepted.**

---

## Appendix — Implementation sequence completed

1. Phase A — Completion integrity  
2. Phase B — Scoring / null / incomplete labeling  
3. Phase C — DOC-119 maturity mapping  
4. Phase D — Profile risk + snapshot sync  
5. Phase E — Answer label validation  
6. Phase F — Stub client-delivery safety  
7. Phase G — Regression tests + lint/build  
8. Phase H — This report  
