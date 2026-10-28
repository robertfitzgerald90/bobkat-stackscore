# SS-REL-014 — Full Assessment Integrity Audit

| Field | Value |
| --- | --- |
| Status | **Complete — read-only audit** |
| Date | 2026-10-27 |
| Branch | `staging` |
| Context | Post SS-CONTENT-006 (80 approved / 0 stub v2 catalog) |
| Scope | Scoring, recommendations, projected maturity, roadmap, customer surfaces |
| Constraints | No code changes; no scoring/metadata edits; no DB writes; no production changes |

**Primary regression fixture:** ABC LLC — overall maturity **39**, triggered recommendations **57**, modeled projected score **100** (observations, not hardcoded scoring expectations).

**Related:** SS-REL-012 (report integrity), SS-REL-013 (projection consistency), SS-CONTENT-001…006 (catalog publication).

---

## 1. Executive summary

### Verdict

The v2 assessment scoring engine is **internally consistent and deterministic** against DOC-119. Recommendation triggering for the completed 80-template catalog is **structurally sound** (1:1 question mapping, No/Partially triggers, client fail-closed visibility). The **projected maturity model is mathematically consistent** with its documented design, but it is a **catalog-impact heuristic**, not a recomputed future StackScore — and after full catalog publication it readily **saturates at 100**, which customers can misread as a guaranteed maturity outcome.

Roadmap construction is **priority-band sequencing**, not capacity-, dependency-, or effort-aware planning. Customer-facing assessment PDF/report/email narrative paths are largely aligned after SS-REL-013, but **several presentation and coupling issues remain** that can mislead customers about strengths, projections, and what “improvement” means.

### Bottom line for customer delivery

| Area | Suitability |
| --- | --- |
| Current maturity scoring (39) | **Suitable** — DOC-119 v2 math is sound |
| Recommendation generation | **Suitable with caveats** — volume and editorial impact points need careful presentation |
| Projected score (100) | **Not suitable as a literal forecast** without stronger uncertainty labeling and methodology education |
| Roadmap | **Suitable as a prioritized backlog** — not as a capacity-realistic delivery plan |
| Cross-surface consistency | **Mostly good** post SS-REL-013; residual High/Medium presentation defects remain |

### Top findings (preview)

| ID | Severity | One-line |
| --- | --- | --- |
| REL-014-C1 | Critical | Projected maturity saturates at 100 and reads like a future StackScore |
| REL-014-C2 | Critical | Assessment-complete email labels low/medium recommendations as “strengths” |
| REL-014-H1 | High | Dual maturity label systems (DOC-119 vs Rating) on the same score |
| REL-014-H2 | High | Client dashboard projected score can follow hidden TIP wizard state |
| REL-014-H3 | High | Recommendation card count (57) ≠ projection math (category-max) |
| REL-014-H4 | High | Impact points are editorial constants, not empirically tied to score lift |
| REL-014-M1 | Medium | Roadmap phases ignore effort, dependencies, and capacity |
| REL-014-M2 | Medium | Initiative completion updates “effective” scores, not official StackScore |
| REL-014-M3 | Medium | Draft preview / staff surfaces can overstate customer-visible projection |
| REL-014-L1 | Low | Terminology drift (“Technology Health Score” vs “StackScore”) |

---

## 2. Scoring architecture

### 2.1 How answers contribute

| Answer text | Normalized score `n` | Pillar math |
| --- | --- | --- |
| Yes | 100 | Included |
| Partially | 50 | Included |
| No | 0 | Included |
| Not Applicable | excluded (`null`) | Omitted from numerator and denominator |

**Implementation:** `normalizeAnswerScore()` — `src/lib/scoring/v2/types.ts`.

**Important:** v2 scoring uses **`answerText`**, not persisted `scoreEarned`. Seeded `AnswerOption.scoreValue` for N/A is **-1**, which must never be mistaken for the DOC-119 normalized score.

### 2.2 Question weights

- 80 questions in `data/v2-question-library.json` (10 per pillar).
- Weights **1–5** affect **within-pillar** weighted averages only.
- Weights do **not** set relative importance of pillars in the overall score.

### 2.3 Pillar score

For a **complete** pillar (all questions answered):

\[
\text{pillar\%} = \mathrm{round}_2\left(\frac{\sum (n_i \cdot w_i)}{\sum w_i}\right)
\]

over non-N/A answers. Incomplete pillars: `percentScore = null`.

**Implementation:** `calculatePillarScore()` — `src/lib/scoring/v2/pillar-score.ts`.

### 2.4 Overall maturity (StackScore)

\[
\text{StackScore} = \mathrm{round}\left(\mathrm{mean}(\text{pillar\% for complete pillars with non-null \%})\right)
\]

When all eight pillars contribute, this equals equal 12.5% weighting. Pillars that are complete but all-N/A are omitted, renormalizing remaining pillars.

**Implementation:** `calculateOverallStackScore()` / `calculateV2Scores()`.

### 2.5 Maturity classifications

| System | Bands | Used for |
| --- | --- | --- |
| DOC-119 Technology Maturity | Initial / Basic / Developing / Managed / Mature / Optimized | Executive narrative maturity language, pillar maturity levels |
| Prisma `Rating` (`getRating`) | Critical / At Risk / Stable / Strong / Exceptional | Category score ratings, some UI badges |
| Profile `MaturityTier` | Collapsed enum mapped from DOC-119 | Technology Profile storage |

**Example:** score **72** → DOC-119 **Managed** and Rating **Stable** simultaneously.

### 2.6 Missing / unanswered handling

| Scenario | Behavior |
| --- | --- |
| Unanswered at completion | Blocked — `evaluateV2CompletionGuards` requires all active questions |
| Unrecognized answer text at completion | Blocked |
| N/A | Excluded from pillar weight sum |
| Draft preview | Can show overall from only completed pillars (misleading if read as final) |

### 2.7 Determinism

Pure functions of questions + responses; no randomness. Depends on exact answer strings. Deterministic for a fixed library and response set.

### 2.8 Completion recalculation

- Preview and complete both call `calculateV2Scores`.
- Completion persists `overallScore`, category scores, and history.
- Historical assessments are **not** rescored when the question library changes (by design).
- Profile sync after complete reads persisted scores (does not re-score live library).

### 2.9 Scoring inconsistencies / misleading interpretations

1. **`scoreEarned` vs `answerText`** — storage and scoring can diverge conceptually (especially N/A = -1).
2. **Two public label systems** on one score (DOC-119 vs Rating).
3. **Draft preview renormalization** — incomplete assessments can show high overall before all pillars finish.
4. **v1 vs v2 category models** — v1 `CATEGORY_WEIGHTS` in `scoring/index.ts` are irrelevant to v2 overall math.

---

## 3. Recommendation architecture

### 3.1 Triggering

1. Seeded `AnswerOption.triggersRecommendation` for **No** and **Partially**.
2. `collectV2TriggeredResponses` → `evaluateV2Triggers` (`src/lib/recommendations/v2-engine.ts`).
3. Catalog rule: `triggerAnswers` includes answer **or** (`alsoTriggerOnPartial` and `0 < scoreEarned < 100`).

All 80 published templates use `["No","Partially"]` + `alsoTriggerOnPartial: true`.

### 3.2 Partial answers

Partially scores **50** and always triggers catalog recommendations. Treated as a maturity gap, not a “half recommendation.”

### 3.3 Mapping

| Check | Status |
| --- | --- |
| 80 templates, 10 × 8 pillars | Pass |
| `id === REC-{questionId}` | Pass |
| Catalog published (`isStub: false`) | Pass (SS-CONTENT-006) |
| No mechanical Improve titles on published templates | Pass (PC-008 titled “Reduce …”) |

### 3.4 Deduplication

- Per client: `dedupeKey = template:{code}`.
- One active recommendation row per template.
- Retrigger **preserves** title/description/priority/impact (consultant-edit safety).
- v2 catalog has **no** consolidation groups (v1 catalog still does).

### 3.5 Priority vs severity

Recommendation `priority` is **authored catalog metadata**, not derived from live pillar deficit or question `riskLevel`. Sorting: priority band → `estimatedImpactPoints` desc. Critical exposure flags are orthogonal to recommendation priority.

### 3.6 Estimated impact points

Authored constants (typically 3–10). Used only for projection via **per-pillar MAX**, then sum. Not validated against actual post-remediation score lift. Not recalculated from question weight.

### 3.7 Contradiction risk

No automated cross-pillar conflict detection. Overlapping advice across pillars is intentional in places (e.g. inventory, lifecycle) but can feel duplicated to customers. Projection under-counts vs naive card-sum because only the max per pillar contributes.

### 3.8 Historical assessments + catalog updates

| Event | Behavior |
| --- | --- |
| New completion | Triggers + sync full set; customer projection from deliverable set |
| Catalog template sync | Updates `RecommendationTemplate`; does not auto-rewrite assessment rows |
| Improve-title refresh | Optional ops path for unedited stub titles only |
| Client views | Regenerate narrative/projection from filtered set |
| Staff views | May retain stored historical executive summary |

---

## 4. Projection analysis

### 4.1 Exact calculation

```
projectionImpact = Σ over pillars MAX(estimatedImpactPoints among eligible recommendations)
projectedScore   = MIN(100, baselineOverall + projectionImpact)
```

**Implementations:**

| Concern | Location |
| --- | --- |
| Category/pillar max sum | `calculateProjectionImpacts` — `src/lib/recommendations/engine.ts` |
| Cap at 100 | `calculateProjectedScore` — `src/lib/scoring/index.ts` |
| Assessment results | `buildAssessmentResultsSummary` — `results-summary.ts` |
| Customer audience | `buildAudienceAssessmentPresentation` — `customer-facing-report.ts` |
| v2 completion persist | `complete-v2.ts` (customer-filtered set) |
| TIP / roadmap phases | `technology-improvement-plan/roadmap.ts`, `client-roadmap/effective-score.ts` |

### 4.2 Which impacts contribute

Eligible recommendations typically exclude `completed` / `declined`. Customer paths first apply `filterClientDeliverableRecommendations`.

### 4.3 Double-counting

- **Avoided** for overall projection within a pillar (MAX).
- **Not avoided** in diagnostic `rawImpactSum` (sum of all card points) — must not be presented as expected gain.
- Across pillars, impacts **do** add (up to 8 × max ≈ 80 before global cap).

### 4.4 Pillar maximums

Only one max impact **per pillar name** toward overall projection. There is no separate projected pillar % model.

### 4.5 How projection reaches 100 (ABC LLC)

| Observation | Value |
| --- | --- |
| Baseline StackScore | **39** |
| Triggered recommendations | **57** |
| Modeled projected score | **100** |

Interpretation: with triggers across most/all eight pillars, per-pillar max impacts (often 8–10) commonly sum to **≥ 61**. Then `MIN(100, 39 + ≥61) = 100`.

**57 recommendations do not mean +57 points.** Card count and projection math are different models.

### 4.6 Realistic future maturity?

**No — not as currently labeled.** Projection is:

- Additive catalog points, not a re-run of DOC-119 pillar scoring after hypothetical remediations.
- Independent of whether recommendations are sequenced, funded, or feasible.
- Sensitive to catalog publication (more deliverable templates → higher customer projection).
- Capped at 100, so low baselines with broad triggers look “fully remediable.”

### 4.7 Catalog availability effect

As stub pillars were published (SS-CONTENT-002/004/006), customer-eligible sets grew and ABC’s customer projection rose (historically ~59 with IA/SO-only deliverables → higher after DK/TS/EP/DP → **100** with full catalog). The **formula** did not change; the **eligible set** did.

### 4.8 Roadmap initiative completion

Completing initiatives updates **effective / remaining** presentation scores on the living roadmap. It does **not** change `Assessment.overallScore` or Technology Profile StackScore until reassessment.

### 4.9 Uncertainty communication

Post SS-REL-013, executive narrative uses softer “potential gain” language. KPI cards and many dashboards still present a single projected number without equivalent uncertainty framing. That gap is the primary customer-risk amplifier for the 100 ceiling.

---

## 5. Roadmap analysis

### 5.1 How recommendations become initiatives

1. Assessment complete syncs recommendations.
2. `materializeDraftRoadmap` filters client-deliverable open/active rows.
3. `assignRecommendationsToPhases` maps catalog priority → Critical / High / Operational / Strategic phases.
4. Initiatives stored 1:1 with recommendations (`ClientRoadmapInitiative`).

Active roadmaps are not auto-refreshed when the catalog changes (draft-only rematerialize).

### 5.2 Ranking

Catalog priority + estimated impact. Not derived from current pillar scores, capacity, or dependencies.

### 5.3 Difficulty / dependencies / capacity / sequencing

| Factor | Status |
| --- | --- |
| Sequencing | Priority-band phases + timeline labels only |
| Dependencies | Not modeled |
| Capacity | Not modeled |
| Effort | Playbook weeks exist in TIP layer; not first-class on assessment recommendations or materialize ranking |

### 5.4 Initiative completion vs maturity

Roadmap “effective score” can rise as initiatives complete. Official StackScore remains assessment-bound. Progress metrics (`riskReductionPercent` by impact points completed) are **not** StackScore deltas.

### 5.5 Roadmap vs dashboard projection

Shared math engine, but **input sets can differ**:

- Assessment report / PDF: deliverable actionable recommendations.
- Living Execution Plan: visible initiatives (client recompute).
- Technology Profile / executive dashboard: may use **TIP wizard projected score** when an incomplete TIP exists — even though clients have `activeTip` nulled in the detail payload.

### 5.6 Credibility improvements (no redesign)

1. One client projection source (deliverable open recs **or** roadmap journey — not hidden TIP).
2. Label “StackScore (last assessment)” vs “Projected if recommendations addressed” vs “Effective (work completed).”
3. Explain phase `scoreDelta = 0` when category caps saturate.
4. Optionally surface playbook effort weeks read-only beside initiatives.
5. Document rematerialize policy after catalog publication.

---

## 6. Customer-facing consistency findings

### Surfaces reviewed

Assessment dashboard / results summary, pillar summaries, recommendations, executive narrative, customer roadmap, PDF report, assessment completion email, demo/executive briefing paths.

### Generally aligned (post SS-REL-013)

- Client PDF and on-screen report share audience presentation helper.
- Email regenerates customer-safe narrative (does not overwrite stored staff summary).
- Recommendation APIs apply role visibility filters.
- Draft roadmap materialize uses deliverable set.

### Residual inconsistencies

| Issue | Surfaces | Risk |
| --- | --- | --- |
| Email “strengths” = low/medium **recommendation titles** | Assessment complete email vs executive summary (pillar strengths) | Critical — contradicts meaning of “strength” |
| Projected KPI can follow TIP while TIP UI is hidden | Client technology profile / executive dashboard | High |
| 57 cards vs projection impact points | Recommendations list vs projected score | High |
| DOC-119 maturity vs Rating badges | Narrative vs some widgets | High |
| Official score vs roadmap effective score | Profile vs Living Execution Plan | Medium |
| “Open recommendations” definitions differ | Summary open-only vs active statuses elsewhere | Medium |
| Demo / briefing trend copy | Executive OS briefing | Medium |
| “Technology Health Score” vs “StackScore” | Email vs app | Low |

### ABC LLC consistency snapshot (staging, post SS-CONTENT-006)

| Metric | Value | Consistent across dashboard & audience presentation? |
| --- | --- | --- |
| Overall score | 39 | Yes |
| Client-visible triggered recs | 57 | Yes (dashboard summary = audience presentation) |
| Projected score | 100 | Yes between those two paths |
| Projection impact | 78 | Yes |
| Stub titles on client | 0 | Yes |

---

## 7. Prioritized remediation backlog

### Critical

#### REL-014-C1 — Projected maturity reads as a guaranteed future StackScore

| Field | Detail |
| --- | --- |
| Description | `MIN(100, baseline + Σ pillar MAX(impact))` saturates at 100 for broad-trigger low baselines (ABC: 39 → 100). Customers can treat this as a recomputed maturity forecast. |
| Evidence | `calculateProjectionImpacts`, `calculateProjectedScore`; ABC observations 39 / 57 / 100; formula independent of DOC-119 recompute |
| Type | Methodology limitation + presentation problem |
| Customer impact | Overconfidence; distrust if later reassessment does not approach 100 |
| Remediation | (a) Relabel as “potential maximum under catalog model”; (b) show projectionImpact and methodology footnote; (c) optional: cap display or require scenario assumptions; (d) longer-term: simulate remediation into pillar scores |
| Dependencies | Copy/UX; optional product decision on projection redesign |
| Complexity | Low–Medium for labeling; High for true score simulation |

#### REL-014-C2 — Assessment-complete email mislabels “strengths”

| Field | Detail |
| --- | --- |
| Description | Email builds strengths from **low/medium priority recommendation titles**, while executive summary strengths are **top pillar categories**. |
| Evidence | `src/lib/communications/workflows/triggers.ts` lines ~38–41 |
| Type | Presentation / calculation-of-content defect |
| Customer impact | Customer receives “strengths” that are actually lesser-priority gaps |
| Remediation | Use pillar strengths from results summary (same as narrative) or omit strengths section |
| Dependencies | Email template fields |
| Complexity | Low |

### High

#### REL-014-H1 — Dual maturity label systems

| Field | Detail |
| --- | --- |
| Description | DOC-119 six-level maturity and five-band `Rating` both appear on customer/staff surfaces for the same numeric score. |
| Evidence | `getTechnologyMaturityLevel` vs `getRating`; category scores store Rating |
| Type | Presentation problem |
| Customer impact | Conflicting language (“Managed” vs “Stable”) |
| Remediation | Standardize customer surfaces on DOC-119 labels; confine Rating to legacy/staff only |
| Dependencies | UI/PDF/email copy audit |
| Complexity | Medium |

#### REL-014-H2 — Client projected score can follow hidden TIP state

| Field | Detail |
| --- | --- |
| Description | `getTechnologyProfileDetail` nulls `activeTip` for clients but may still set `projectedScore` from TIP-derived context. |
| Evidence | `src/lib/technology-profile/detail.ts` (`resolveActiveTipContext`, client branch sets `activeTip: null` while KPI uses `projectedScore`) |
| Type | Calculation input / presentation coupling defect |
| Customer impact | Projection changes based on consultant wizard choices the customer cannot see |
| Remediation | For `audience === "client"`, always derive projectedScore from deliverable recommendations or roadmap journey — never unfinished TIP |
| Dependencies | Technology profile detail + dashboard KPIs |
| Complexity | Medium |

#### REL-014-H3 — Recommendation count ≠ projection contribution

| Field | Detail |
| --- | --- |
| Description | Customers see dozens of cards (ABC: 57) while projection uses at most one max impact per pillar (~8 contributions). |
| Evidence | Projection formula; ABC 57 vs impact 78 → score 100 |
| Type | Presentation / methodology communication |
| Customer impact | Expectation that completing all 57 linearly adds to score |
| Remediation | UI copy: “Projected impact uses the highest-impact item per technology area”; show pillar contribution breakdown |
| Dependencies | Results summary / PDF / dashboard |
| Complexity | Low–Medium |

#### REL-014-H4 — Impact points lack empirical defensibility

| Field | Detail |
| --- | --- |
| Description | `estimatedImpactPoints` are authored constants, not derived from assessment gap size or validated remediations. |
| Evidence | Catalog JSON; projection uses them directly |
| Type | Methodology limitation |
| Customer impact | Projection credibility risk under scrutiny |
| Remediation | Document methodology; optional calibration against reassessment deltas; avoid presenting as measured ROI |
| Dependencies | Content governance; optional analytics |
| Complexity | Medium–High (calibration); Low (documentation) |

### Medium

#### REL-014-M1 — Roadmap ignores effort, dependencies, and capacity

| Field | Detail |
| --- | --- |
| Description | Phases are priority buckets with timeline labels, not sequenced delivery plans. |
| Evidence | `assignRecommendationsToPhases`; playbook effort not used in materialize ranking |
| Type | Methodology limitation |
| Customer impact | Unrealistic sequencing expectations |
| Remediation | Label phases as priority waves; optionally display playbook effort weeks; defer full dependency engine |
| Dependencies | TIP playbooks already exist |
| Complexity | Low (labeling); Medium (effort display) |

#### REL-014-M2 — Initiative completion vs official StackScore

| Field | Detail |
| --- | --- |
| Description | Completing roadmap work updates effective scores only; official maturity requires reassessment. |
| Evidence | `computeEffectiveScoreJourney`; profile sync on assessment complete |
| Type | Presentation problem |
| Customer impact | Confusion when “progress” doesn’t move StackScore |
| Remediation | Explicit dual labels on dashboard; educate in narrative |
| Dependencies | Executive dashboard / roadmap UI |
| Complexity | Low |

#### REL-014-M3 — Staff/draft preview overstatement

| Field | Detail |
| --- | --- |
| Description | In-progress assessment preview can project from unfiltered trigger sets; staff see stubs. |
| Evidence | Assessment index preview paths; visibility rules |
| Type | Presentation / consistency |
| Customer impact | Indirect — staff may quote non-customer numbers |
| Remediation | “Customer view” toggle on preview using deliverable filter |
| Dependencies | Assessment preview UI |
| Complexity | Low–Medium |

#### REL-014-M4 — Retrigger content freeze vs catalog publication

| Field | Detail |
| --- | --- |
| Description | Existing assessment recommendation rows keep old copy/impact on retrigger; catalog sync doesn’t rewrite them (except Improve-title refresh). |
| Evidence | `sync.ts` preserve content; SS-CONTENT refresh ops |
| Type | Historical data consistency |
| Customer impact | Stale titles/impacts on older synced rows until new assessments |
| Remediation | Document policy; optional controlled refresh for unedited rows after catalog publish |
| Dependencies | Ops workflow |
| Complexity | Low–Medium |

#### REL-014-M5 — Open-recommendation count semantics

| Field | Detail |
| --- | --- |
| Description | Some summaries count `status === "open"` only; others include accepted/in_progress. |
| Evidence | Results summary vs client recommendation lists |
| Type | Presentation inconsistency |
| Customer impact | Mismatched counts across widgets |
| Remediation | Single shared status set for customer KPIs |
| Dependencies | Results summary + dashboard |
| Complexity | Low |

### Low

#### REL-014-L1 — Terminology drift

| Field | Detail |
| --- | --- |
| Description | “Overall Technology Health Score”, “StackScore”, “technology health” used interchangeably. |
| Evidence | Email-data vs app copy |
| Type | Editorial |
| Customer impact | Mild confusion |
| Remediation | Glossary + copy pass |
| Complexity | Low |

#### REL-014-L2 — Briefing trend heuristics

| Field | Detail |
| --- | --- |
| Description | Executive briefing can claim upward trends / decreasing risk from score thresholds not tied to open critical exposure or reassessment. |
| Evidence | `src/lib/executive-os/briefing.ts` |
| Type | Presentation |
| Customer impact | Overstated narrative confidence |
| Remediation | Tie trend language to score history deltas and exposure flags |
| Complexity | Low |

#### REL-014-L3 — Legacy non-v2 Improve template in staging

| Field | Detail |
| --- | --- |
| Description | Staging DB still has `INF-WIRELESS` / “Improve Wireless Coverage” outside v2 catalog. |
| Evidence | SS-CONTENT-006 sync check |
| Type | Historical data |
| Customer impact | Low if not linked to v2 assessments |
| Remediation | Ops cleanup |
| Complexity | Low |

---

## Finding classification summary

| Class | Count | IDs |
| --- | --- | --- |
| Critical | 2 | C1, C2 |
| High | 4 | H1–H4 |
| Medium | 5 | M1–M5 |
| Low | 3 | L1–L3 |

| Type | Findings |
| --- | --- |
| Calculation defects | C2 (wrong content selection), H2 (wrong projection input set), M5 |
| Methodology limitations | C1 (as forecast), H4, M1 |
| Presentation problems | C1 (labeling), H1, H3, M2, M3, L1, L2 |
| Historical data consistency | M4, L3 |

---

## 8. Recommended implementation sequence

### Wave 1 — Stop misleading customers (fast, low risk)

1. **REL-014-C2** — Fix email strengths to use pillar strengths.
2. **REL-014-H2** — Decouple client projected KPI from hidden TIP.
3. **REL-014-C1 (labeling only)** — Relabel projected score / add methodology footnote on assessment report, PDF, and dashboard KPI.
4. **REL-014-H3** — Explain category-max in UI near projected score.
5. **REL-014-M2 / L1** — Clarify StackScore vs projected vs effective wording.

### Wave 2 — Consistency hardening

6. **REL-014-H1** — DOC-119-only customer maturity vocabulary.
7. **REL-014-M5** — Unify open-recommendation counts.
8. **REL-014-M3** — Customer-view preview for staff.
9. **REL-014-M1 (light)** — Phase labeling + optional effort weeks display.
10. **REL-014-L2** — Briefing copy guards.

### Wave 3 — Methodology evolution (product decisions required)

11. **REL-014-H4 / C1 (deep)** — Decide whether to keep additive impact model, introduce scenario-based projection, or simulate remediations into DOC-119 pillar scores.
12. **REL-014-M4** — Formal catalog→assessment refresh policy after content publishes.
13. Optional dependency/capacity roadmap engine (out of scope for a small remediation; separate initiative).

### Explicit non-goals for immediate follow-up

- No scoring weight formula changes without DOC-119 revision.
- No silent rewrite of historical assessment scores.
- No production deploy as part of this audit.
- No full dashboard/PDF redesign in Wave 1.

---

## Appendix A — Key code map

| Domain | Paths |
| --- | --- |
| v2 scoring | `src/lib/scoring/v2/*`, DOC-119 |
| Completion | `src/lib/assessments/complete-v2.ts`, `completion-guards.ts` |
| Recommendations | `src/lib/recommendations/v2-engine.ts`, `sync.ts`, `visibility.ts`, `engine.ts` |
| Projection | `calculateProjectionImpacts`, `calculateProjectedScore`, `results-summary.ts` |
| Customer parity | `customer-facing-report.ts` |
| Roadmap | `client-roadmap/materialize.ts`, `effective-score.ts`, TIP `roadmap-engine/*` |
| Profile | `technology-profile/detail.ts`, `overview.ts` |
| Email | `communications/workflows/triggers.ts` |

## Appendix B — Audit method

- Read-only inspection of scoring, recommendation, projection, roadmap, profile, PDF, and email codepaths.
- Cross-check against DOC-119 and SS-REL-012/013 remediation docs.
- Used ABC LLC staging observations (39 / 57 / 100) as regression context only.
- No application code, database, or production changes were made in this audit.
