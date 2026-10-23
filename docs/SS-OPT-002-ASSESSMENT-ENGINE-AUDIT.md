# SS-OPT-002 — Assessment Engine Audit

**Document ID:** SS-OPT-002  
**Status:** Complete (read-only investigation)  
**Date:** October 23, 2026  
**Owner:** Bobkat IT / StackScore engineering  
**Scope:** Assessment lifecycle, scoring, completion, recommendation integration, historical integrity, UX, and test coverage  
**Constraints honored:** No application code, schema, tests, or dependency changes

**Governing references:** DOC-109, DOC-119, DOC-122, DOC-151A–H, DOC-152, DOC-153, `docs/STACKSCORE_PRODUCT_DISCOVERY.md`

---

## 1. Executive summary

The StackScore v2 assessment engine is **structurally sound and deterministic** for fully answered assessments: eight Technology Pillars, weighted Yes / Partially / No / N/A scoring (DOC-119), immutable completed snapshots, and recommendation sync with dedupe and assessment trigger lineage (DOC-152).

It is **not yet suitable for unattended paid delivery** without process controls or remediation of completion and presentation gaps.

| Verdict area | Result |
| --- | --- |
| Scoring math (full pillar answers) | Accurate and deterministic |
| Incomplete / partial assessments | High delivery risk |
| Completion gates | UI strict; API permissive (v2) |
| Historical snapshots | Largely immutable and sound |
| Recommendation generation | Deterministic; catalog content is stubbed |
| Automated test coverage of completion/API | Insufficient |

**Bottom line:** Treat full 80-question completion via the wizard as the only supported paid path until API completion rules, partial-score labeling, and recommendation copy (SS-OPT-003) are fixed. Do not rely on the API alone to enforce assessment readiness.

---

## 2. Current architecture

### 2.1 Domain model (Prisma)

| Model | Role |
| --- | --- |
| `Assessment` | Tenant-scoped run; `status` ∈ `draft` \| `completed` \| `archived`; `scoringEngineVersion` ∈ `v1` \| `v2` (default **v2**); persisted `overallScore`, `executiveSummary`, `hasCriticalExposure` |
| `AssessmentResponse` | One answer per `(assessmentId, questionId)`; `scoreEarned`, notes, evidence |
| `AssessmentQuestion` / `AnswerOption` / `AssessmentCategory` | Active library (v2 codes map to Technology Pillars) |
| `AssessmentCategoryScore` | Per-category snapshot written at completion (complete pillars with a numeric score only) |
| `AssessmentRecommendation` | Client-level recommendations with `dedupeKey`, workflow status, `latestAssessmentId` |
| `RecommendationAssessmentTrigger` | Evidence link: recommendation ↔ assessment (+ `triggerReason`) |
| `ClientScoreHistory` | Historical overall + `pillarScores` JSON at completion |
| `TechnologyProfile` / `TechnologyProfileSnapshot` | Living profile refreshed after completion |

### 2.2 Source map

| Concern | Primary paths |
| --- | --- |
| Create assessment | `src/app/api/v1/clients/[id]/assessments/route.ts` |
| Save / update response | `src/app/api/v1/assessments/[id]/responses/[questionId]/route.ts` |
| Live preview | `src/lib/assessments/index.ts` → `getAssessmentPreview` |
| Complete (router) | `src/app/api/v1/assessments/[id]/complete/route.ts` → `completeAssessment` |
| Complete v1 / v2 | `src/lib/assessments/index.ts`, `src/lib/assessments/complete-v2.ts` |
| Scoring v2 | `src/lib/scoring/v2/**` (`pillar-score.ts`, `maturity-level.ts`, `types.ts`) |
| Scoring v1 (legacy) | `src/lib/scoring/index.ts` |
| Question library | `data/v2-question-library.json` (80 questions, 8 pillars) |
| Recommendation catalog | `data/RecommendationCatalogV2.json` (80 templates, all `isStub: true`) |
| Recommendation engine | `src/lib/recommendations/v2-engine.ts`, `sync.ts`, `dedupe.ts` |
| Reassessment / history | `src/lib/assessments/reassessment.ts` |
| Comparison | `src/lib/assessments/comparison.ts`, `comparison-build.ts` |
| PDF export | `src/app/api/v1/assessments/[id]/export/pdf/route.ts`, `src/lib/pdf/assessment-report.tsx` |
| Assessor UX | `src/components/assessments/assessment-wizard.tsx`, `assessment-score-panel.tsx`, response list components |

### 2.3 Dual engines

- **v2 (default):** DOC-119 pillar scoring; recommendations from `RecommendationCatalogV2` via answer triggers.
- **v1 (legacy):** Category-weighted scoring; requires **all** active questions answered; separate recommendation generate path.

New assessments are created with `scoringEngineVersion: "v2"`. Historical v1 rows remain on the v1 path via `completeAssessment` branching.

---

## 3. Assessment lifecycle

```text
POST /clients/{id}/assessments
        → Assessment (draft, v2)
        → optional reassessment: copy responses from completed baseline

PUT /assessments/{id}/responses/{questionId}
        → upsert answer (draft only)
        → return live getAssessmentPreview()

POST /assessments/{id}/complete
        → completeAssessment → completeAssessmentV2 | V1
        → persist scores, sync recommendations, ClientScoreHistory
        → sync Technology Profile + snapshot
        → materialize draft roadmap (best-effort)
        → communications / workflow triggers

GET /assessments/{id}/export/pdf
        → requires status === completed

Reassessment
        → new draft linked via sourceAssessmentId
        → prior completed assessment unchanged
```

### Status transitions

| From | To | How |
| --- | --- | --- |
| (none) | `draft` | Create / reassessment |
| `draft` | `completed` | Complete API (success) |
| `completed` | (responses locked) | PUT responses returns conflict |
| `completed` | `archived` | Archive flows (not a reopen) |

**Confirmed:** Completed assessments cannot have responses edited. There is **no reopen-to-draft** path for completed assessments. Historical integrity for answers and completion-time scores is strong.

---

## 4. Scoring methodology

### 4.1 Answer normalization (v2)

| Answer text | Normalized score |
| --- | --- |
| Yes | 100 |
| Partially | 50 |
| No | 0 |
| Not Applicable | Excluded (null; weight omitted from pillar denominator) |
| Any other text | Treated as N/A (null) |

Source: `normalizeAnswerScore` in `src/lib/scoring/v2/types.ts`.

**Note:** Response rows also store `scoreEarned` from `AnswerOption.scoreValue`. **v2 completion and preview score from `answerText`**, not `scoreEarned`. Determinism depends on answer labels remaining exact.

### 4.2 Pillar score

For each Technology Pillar:

1. Pillar is **incomplete** until every active question in that pillar has a response (including N/A).
2. Incomplete → `percentScore = null`, no maturity level (`ASSESSMENT_INCOMPLETE_LABEL` exists in code but is not used in the live score panel).
3. Complete → weighted average of scorable (non-N/A) answers; all-N/A pillar → `status: complete`, `percentScore: null` (excluded from overall).

### 4.3 Overall StackScore

```text
overall = round( mean( percentScore of complete pillars with non-null score ) )
```

Incomplete pillars are **omitted**, not scored as zero. This matches DOC-119’s “renormalize over complete pillars” rule and is covered by unit tests in `tests/scoring/v2.test.ts`.

**Delivery implication:** Two strong pillars and six unanswered pillars can produce a high overall StackScore that looks company-wide. The data model knows pillars are incomplete; the headline number does not communicate that.

### 4.4 Category weighting

- Question weights (1–5) apply **within** a pillar only.
- Pillars contribute **equally** to overall when complete (not weighted by question count or weight sum).
- v1 used different category field weights; v2 does not use legacy `securityScore` … `strategicScore` columns (cleared to null on v2 complete).

### 4.5 Determinism and ranges

| Question | Finding |
| --- | --- |
| Unanswered questions affect scoring? | Yes — make pillar incomplete; incomplete pillars excluded from overall |
| Partial assessments misleading? | **Yes** if completed/presented without labeling (see defects) |
| Category weights consistent? | Yes within DOC-119 rules |
| Scores exceed 0–100? | No under normal Yes/Partially/No/N/A inputs |
| Null / missing responses? | Handled as unanswered; pillar incomplete |
| Deterministic? | Yes for fixed library + answer texts |
| Completion changes scoring math? | Same `calculateV2Scores` used in preview and complete |
| Historical scores stable? | `Assessment.overallScore` + `AssessmentCategoryScore` + `ClientScoreHistory` persist; not recalculated on read |

---

## 5. Identified findings

Legend: **Confirmed defect** = incorrect or unsafe for paid delivery relative to product requirements / DOC intent. **Risk** = correct per DOC-119 math but dangerous if misused. **Enhancement** = improvement opportunity.

### DEF-001 — v2 API completion requires only ≥1 answer (Critical)

**Type:** Confirmed defect (gate mismatch)

- UI (`assessment-wizard.tsx`): Complete disabled unless `answeredCount >= totalCount`.
- API / `completeAssessmentV2`: throws only if `responses.length === 0`.
- v1 correctly requires all active questions.

**Business impact:** Any client of the complete API (script, integration, future UI regression) can mark a partial assessment completed, generate recommendations, PDF, history, and profile updates from an incomplete interview.

**Remediation:** Align `completeAssessmentV2` with wizard policy: require all active questions answered (or all eight pillars complete with scorable overall). Return conflict with clear message. Add API tests.

---

### DEF-002 — Partial overall score presented as full company StackScore (High)

**Type:** Risk (DOC-119-aligned math) + presentation defect

DOC-119 intentionally averages complete pillars only. Product discovery and paid-delivery standards require either:

- block publish until all eight pillars are complete, **or**
- label partial results as incomplete on screen, API, PDF, and history.

Today, PDF / results / executive summary treat `overallScore` as the StackScore without a “partial assessment” banner. Incomplete pillars are omitted from `AssessmentCategoryScore` rows (silent gaps).

**Business impact:** Customers and QBRs can over-trust a score that ignores unassessed domains; Bobkat liability / credibility risk on paid assessments.

**Remediation:** Prefer hard gate (DEF-001) for customer-facing complete; additionally persist `completePillarCount` / `isPartial` and label PDF + UI if any soft-complete path remains.

---

### DEF-003 — Null overall coerced to 0 in multiple surfaces (High)

**Type:** Confirmed defect

When no pillar has a numeric score, `overallStackScore` is `null`, but:

- Executive summary uses `overallScore = scoring.overallStackScore ?? 0`
- `ClientScoreHistory.overallScore` stores `?? 0`
- Complete API response: `Number(result.overallScore ?? 0)` → rating **critical**
- Comparison / PDF builders often use `Number(overallScore ?? 0)`
- Profile snapshot stores `overallStackScore ?? 0`

**Business impact:** “No scoreable data” is indistinguishable from a true zero / critical environment.

**Remediation:** Preserve null through persistence where schema allows; never display 0 without an explicit “insufficient data” state; block PDF until a real overall exists.

---

### DEF-004 — All recommendation catalog entries are stubs (High)

**Type:** Confirmed defect for paid deliverables (content; engine OK)

`data/RecommendationCatalogV2.json`: **80 / 80** templates have `isStub: true`, with mechanical titles/descriptions derived from question text.

Triggers and sync are deterministic; **customer-facing copy is not delivery-ready**.

**Business impact:** Paid reports and portals surface low-quality / generic remediation language.

**Remediation:** Owned by **SS-OPT-003** (do not rewrite here). Until then: hide stubs from client-facing views or require consultant edit before send (as product discovery recommends).

---

### DEF-005 — Risk summary high / medium / low always zero (Medium)

**Type:** Confirmed defect

`syncProfileFromAssessmentV2` sets:

```text
critical: count(triggersCriticalFlag)
high: 0, medium: 0, low: 0
```

**Business impact:** Technology Profile risk breakdown understates non-critical findings; dashboards that trust `riskSummary` are wrong.

**Remediation:** Derive counts from recommendation priorities or answer severity flags consistently with DOC-113 / DOC-152.

---

### DEF-006 — Incomplete pillars not labeled per DOC-119 in UX (Medium)

**Type:** Confirmed defect (presentation)

DOC-119 requires incomplete pillars to display **“Assessment Incomplete”** and distinguish low maturity from insufficient data. `ASSESSMENT_INCOMPLETE_LABEL` exists in scoring code; the score panel shows “—” and progress counts only.

Live overall can appear while some pillars are still incomplete (preview path).

**Business impact:** Assessor and customer confusion; risk of treating incomplete work as scored maturity.

**Remediation:** Surface incomplete label on pillars and suppress or watermark overall until all pillars complete (or until DEF-001 hard gate).

---

### DEF-007 — Maturity band dual mapping (Medium)

**Type:** Confirmed inconsistency

- Per-pillar / overall DOC-119 levels: Optimized ≥95, Mature ≥85, Managed ≥70, Developing ≥55, Basic ≥40, Initial &lt;40.
- Profile tier mapping in `complete-v2.ts`: optimized ≥95, mature ≥70, developing ≥55, foundational ≥40, nascent &lt;40 (skips Managed; different Mature threshold).

**Business impact:** Same numeric score can imply different maturity language on report vs Technology Profile.

**Remediation:** Single mapping module aligned to DOC-113 / DOC-119 disposition; use everywhere.

---

### DEF-008 — Profile resync recalculates from current active library (Medium)

**Type:** Risk

`Assessment` scores are immutable after complete. `syncProfileFromAssessmentV2` **recomputes** `calculateV2Scores` from **current** `isActive` questions + stored responses. Today it runs once at complete; a future re-call after library edits could diverge profile from the assessment snapshot.

**Business impact:** Living profile could disagree with the paid assessment record after library maintenance.

**Remediation:** Profile sync should prefer persisted `AssessmentCategoryScore` / history snapshots, not live library recompute; or freeze question set version on the assessment.

---

### DEF-009 — Answer text mismatch silently becomes N/A (Low)

**Type:** Risk

Unknown `answerText` → null score (excluded). Typos or future option labels quietly reduce scorable weight instead of failing validation.

**Business impact:** Rare under seeded options; dangerous if options are edited manually in DB.

**Remediation:** Validate answer option IDs only (already done on PUT); optionally assert known texts at complete.

---

### DEF-010 — Wizard vs API progress messaging (Low / Enhancement)

**Type:** Enhancement

Wizard correctly blocks incomplete completion and shows `answeredCount/totalCount`. Complete success toast does not remind that all pillars were required. PDF has no “full assessment” attestation.

**Business impact:** Low if DEF-001 fixed; process training still needed for assessors.

---

## 6. Business impact summary

| ID | Severity | Paid-delivery impact |
| --- | --- | --- |
| DEF-001 | Critical | Incomplete assessments can be finalized via API |
| DEF-002 | High | Misleading company-wide StackScore |
| DEF-003 | High | Insufficient data looks like score 0 / critical |
| DEF-004 | High | Stub recommendations in customer deliverables |
| DEF-005 | Medium | Profile risk KPIs wrong |
| DEF-006 | Medium | Incomplete vs low maturity not distinguished in UI |
| DEF-007 | Medium | Inconsistent maturity language across surfaces |
| DEF-008 | Medium | Future library drift risk on profile |
| DEF-009 | Low | Silent scoring exclusion on bad labels |
| DEF-010 | Low | Process / messaging polish |

---

## 7. Severity classification (definitions used)

| Severity | Meaning |
| --- | --- |
| **Critical** | Can produce an invalid completed paid assessment without UI safeguards |
| **High** | Customer-facing score or content can materially mislead |
| **Medium** | Incorrect secondary metrics or inconsistent maturity presentation |
| **Low** | Edge-case or polish; limited blast radius under normal seeding |
| **Enhancement** | Quality / clarity improvement, not a functional defect |

---

## 8. Recommended remediation

### Phase A — Completion integrity (block partial publish)

1. Change `completeAssessmentV2` to require all active questions answered (match wizard / v1 intent), **or** require `completePillarCount === totalPillarCount` and non-null overall.
2. Persist metadata: `completePillarCount`, `totalPillarCount`, optional `scoringCompleteness: full | partial`.
3. Stop coercing null overall to `0` in history, API JSON, executive summary, and PDF; reject PDF when overall is null.
4. Add conflict messages consistent with the complete route’s existing “answered” handling.

### Phase B — Honest presentation

1. Use `ASSESSMENT_INCOMPLETE_LABEL` on incomplete pillars in wizard score panel and results UI.
2. If any partial path remains, watermark PDF and portal: “Partial assessment — N of 8 pillars complete.”
3. Unify maturity mapping (DEF-007).

### Phase C — Recommendations (SS-OPT-003)

1. Replace stub catalog copy; clear `isStub` when approved.
2. Until then, filter stubs from client-visible recommendation lists / auto emails (already flagged in product discovery).

### Phase D — Profile & risk accuracy

1. Fix `riskSummary` priority counts (DEF-005).
2. Drive profile updates from frozen assessment snapshots (DEF-008).

### Phase E — Tests

See §10 acceptance criteria and §9 sequence.

**Out of scope for remediation approval:** schema redesign, billing, recommendation prose rewrite (except gating stubs), visual redesign.

---

## 9. Proposed implementation sequence

| Step | Work | Depends on | Est. risk |
| --- | --- | --- | --- |
| 1 | **Approve** this audit and choose gate policy: hard-block incomplete vs labeled partial | — | — |
| 2 | Implement DEF-001 + DEF-003 in `complete-v2` + complete API response | Step 1 | High value, localized |
| 3 | PDF / results / comparison null-safe + incomplete labeling (DEF-002, DEF-006) | Step 2 | Medium |
| 4 | Maturity mapping unification (DEF-007) | Step 2 | Low |
| 5 | Risk summary fix (DEF-005) + snapshot-based profile sync (DEF-008) | Step 2 | Medium |
| 6 | Automated tests for completion gates, null overall, partial pillars | Steps 2–3 | — |
| 7 | SS-OPT-003 recommendation content | Independent, parallel after gate | Content |
| 8 | Process: Bobkat SOP — wizard-only complete until Step 2 ships | Immediate | Operational |

**Do not start implementation until this plan is approved.**

---

## 10. Acceptance criteria

### Completion & scoring

- [ ] `POST .../complete` for v2 rejects drafts with unanswered active questions (HTTP 409) with a clear message.
- [ ] Completing a full assessment yields overall ∈ [0, 100], eight pillar category scores when all pillars are scorable, deterministic given fixed answers.
- [ ] Unanswered questions never contribute points; N/A never penalizes pillar denominator.
- [ ] Null overall never stored or displayed as `0`; insufficient-data state is explicit.
- [ ] Completed assessments remain immutable (responses locked); history rows unchanged on subsequent library edits.

### Presentation

- [ ] Incomplete pillars show Assessment Incomplete (or equivalent), not a maturity band.
- [ ] Customer-facing overall score is either full-assessment-only or clearly labeled partial everywhere it appears (UI + PDF).
- [ ] Profile and report maturity labels use one documented banding table.

### Recommendations (engine; content = OPT-003)

- [ ] Triggers remain deterministic from answer text / partial rules.
- [ ] Dedupe prevents duplicate active rows per `dedupeKey`.
- [ ] `RecommendationAssessmentTrigger` records source assessment.
- [ ] Stub templates are not shown to clients until OPT-003 clears them (interim gate).

### Tests (new coverage required; not added in this audit)

- [ ] Unit: partial pillars → null overall; full → mean of pillars.
- [ ] Integration: complete with 0 answers → fail; 1 answer → fail (after DEF-001); all answers → succeed.
- [ ] Integration: PUT response on completed → 409.
- [ ] Integration: PDF on draft → not found / forbidden.
- [ ] Recommendation: regeneration / sync on second assessment updates triggers without orphan duplicates.
- [ ] Invalid `selectedAnswerOptionId` → 400.

---

## 11. Assessment completion (audit answers)

| Question | Answer |
| --- | --- |
| Required questions must be answered? | **UI: yes. API v2: no** (only ≥1). v1 API: yes. |
| Incomplete can be marked complete? | **Yes via API** today |
| Can reopen? | **No** (no draft reopen) |
| Responses change after completion? | **No** (conflict) |
| Reports before completion? | **No** (PDF requires `completed`) |
| Completion status = readiness? | **Not reliably** until DEF-001 fixed |

---

## 12. Recommendation integration (audit answers)

| Question | Answer |
| --- | --- |
| What triggers recommendations? | Answer options with `triggersRecommendation` + catalog `triggerAnswers` / `alsoTriggerOnPartial` |
| Deterministic? | **Yes** for fixed catalog + answers |
| Duplicates possible? | **Mitigated** by client-level `dedupeKey` upsert; triggers accumulate per assessment |
| Linked to evidence? | **Yes** — `RecommendationAssessmentTrigger` + `latestTriggerReason` |
| Changing answers updates recommendations? | Draft: preview only. Completed: locked. New assessment: sync on complete |
| Premature generation? | Persisted only on complete; preview computes ephemeral list. Premature **persist** if DEF-001 allows partial complete |

Content quality: **all stubs** → SS-OPT-003.

---

## 13. Historical integrity (audit answers)

| Question | Answer |
| --- | --- |
| Completed scores immutable? | **Yes** on `Assessment` / category scores / responses |
| Historical recommendations preserved? | Client-level rows evolve with workflow; **triggers** preserve per-assessment lineage |
| Comparisons consistent? | Uses stored assessment scores + v2 category maps; null coerced to 0 is a defect (DEF-003) |
| Library changes affect history? | **Do not** rewrite past `Assessment` scores; profile resync **could** recompute (DEF-008) |

Reassessment copies prior responses into a new draft; baseline remains a snapshot.

---

## 14. User experience (functional)

| Topic | Observation |
| --- | --- |
| Progress | Progress bar + per-section answered counts — **good** |
| Complete control | Disabled until 100% answered — **good** (API not aligned) |
| Live score | Shows overall from complete pillars mid-assessment — can look “done” early (DEF-002/006) |
| Answer states | Clear Yes/Partially/No/N/A; notes/evidence require an answer first |
| Data loss | Upsert per question; draft status; no reopen after complete |
| Completion messaging | Toast with recommendation count; does not warn about partial API risk |
| Question wording | Library quality not fully copy-edited in this audit; stub rec titles echo questions |

No visual redesign recommendations in this milestone.

---

## 15. Testing review (gaps only — no tests changed)

### Existing useful coverage

- `tests/scoring/v2.test.ts` — normalization, incomplete pillar, overall over complete pillars, null overall when none complete, maturity bands
- `tests/scoring/index.test.ts` — v1 scoring
- `tests/assessments/comparison.test.ts`, `executive-summary.test.ts`, `response-view.test.ts`
- Assessment library validation / taxonomy tests
- PDF / marketing funnel tests (adjacent)

### Missing coverage (priority)

| Gap | Why it matters |
| --- | --- |
| `completeAssessmentV2` / complete route with partial answers | Would have caught DEF-001 |
| Null overall end-to-end (API + history + PDF) | DEF-003 |
| Response mutation after complete | Regression lock |
| Recommendation sync + trigger on complete (integration) | Dedupe / premature persist |
| Invalid response payloads | API contract |
| Historical immutability after library change | DEF-008 |
| UI/API gate parity | Prevent future drift |

---

## 16. Suitability verdict

| Criterion | Verdict |
| --- | --- |
| Accurate (full assessments) | **Yes** |
| Reliable (process + UI path) | **Conditionally yes** |
| Reliable (API / automation) | **No** until DEF-001 |
| Explainable | **Mostly** — DOC-119 math clear; incomplete labeling weak |
| Suitable for paid delivery | **Not yet** without SOP + Phase A–B fixes; recommendation stubs block polished delivery (OPT-003) |

---

## 17. Recommended implementation plan (for approval)

1. **Immediate (ops):** Bobkat SOP — complete only via wizard at 100% answered; do not call complete API from scripts; hold auto-send of assessment emails until stubs reviewed.
2. **SS-OPT-002 implementation (after approval):** Phase A → B → D → E above (completion gate, null handling, labeling, risk/profile, tests).
3. **SS-OPT-003:** Recommendation catalog content and client visibility of stubs.
4. **Re-audit:** Short verification pass against §10 acceptance criteria before marketing paid assessments as productized.

**Awaiting approval before any application changes.**

---

## Appendix A — Key code references

| Finding | Location |
| --- | --- |
| v2 ≥1 answer gate | `src/lib/assessments/complete-v2.ts` (responses.length === 0) |
| v1 all-questions gate | `src/lib/assessments/index.ts` (`completeAssessmentV1`) |
| UI complete disabled | `src/components/assessments/assessment-wizard.tsx` (`answeredCount < totalCount`) |
| Overall = mean complete pillars | `src/lib/scoring/v2/pillar-score.ts` (`calculateOverallStackScore`) |
| Null → 0 history | `complete-v2.ts` `ClientScoreHistory.create` |
| Stub catalog | `data/RecommendationCatalogV2.json` (`isStub: true`) |
| Risk summary zeros | `complete-v2.ts` `riskSummary` |
| PDF requires completed | `src/app/api/v1/assessments/[id]/export/pdf/route.ts` |

## Appendix B — Distinction checklist

| Item | Classification |
| --- | --- |
| Mean of complete pillars only | DOC-119 design; **delivery risk** if unlabeled |
| API partial complete | **Confirmed Critical defect** |
| Stub recommendations | **Confirmed High defect** (content) |
| Dual maturity maps | **Confirmed Medium defect** |
| Silent unknown answer → N/A | **Potential risk** |
| Assessor progress UX | **Mostly sound**; incomplete labeling **Enhancement / Medium defect** |
