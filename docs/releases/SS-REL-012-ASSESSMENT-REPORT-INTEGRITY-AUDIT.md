# SS-REL-012 — Assessment Report Integrity Audit

| Field | Value |
| --- | --- |
| Status | **Investigation complete — no implementation** |
| Date | 2026-10-26 |
| Branch | `staging` @ `e6471a9` |
| Database | Neon Staging (read-only) |
| Primary case | **ABC LLC** completed Technology Assessment (v2) |
| Constraints | No scoring/recommendation/PDF changes; no migrations; no assessment resets; no production changes |

---

## Executive verdict

ABC LLC’s 15-page executive PDF is internally inconsistent because **three different recommendation sets and two different impact aggregations** are mixed in one deliverable:

| Signal | Value (ABC LLC) | How it is computed |
| --- | --- | --- |
| Current StackScore | **39** | Persisted v2 overall (`Assessment.overallScore`) |
| Client PDF projected score | **59** | Category-max impact over **client-deliverable** recs only → `+20` |
| PDF “Potential Points” | **+104** | **Raw sum** of client-deliverable `estimatedImpactPoints` |
| Stored executive narrative | **39 → 100** | Category-max over **all** triggered recs (incl. stubs) at completion → `+78` capped at 100 |
| Draft roadmap projected final | **100** | Materialized with stub-inclusive recommendation set |

**Authoritative projected StackScore (product math):**  
`MIN(100, current + Σ_categories MAX(estimatedImpactPoints))`  
per DOC-111A / `calculateProjectionImpacts` + `calculateProjectedScore`.

**Not authoritative:** PDF “Potential Points” (uncapped raw sum) and any narrative/roadmap projection computed before client stub filtering.

Weak-pillar under-coverage (Documentation 8%, Technology Strategy 24%, Endpoint 28%) is **not** an engine miss. The engine generates those recommendations; they are **stubs** and are **stripped from the client PDF**, leaving only Identity & Access + Security Operations.

---

## 1. Root causes

### RC-1 — Dual impact aggregation (release-blocking UX)

- **Projection** uses per-pillar **max** then sum (`calculateProjectionImpacts`).
- **PDF “Potential Points”** uses a **naive sum** of every listed recommendation’s points.
- ABC LLC client-deliverable set: raw sum **104**, projection impact **20**, projected **59**.
- Readers reasonably infer `39 + 104 ≈ 100`, which collides with the narrative’s “to 100” and the gauge’s **59**.

### RC-2 — Stub-inclusive completion vs stub-filtered client PDF (release-blocking)

At completion (`completeAssessmentV2`), projection and executive summary include **all** triggered templates (including `isStub: true`).

Client PDF export filters stubs via `filterClientDeliverableRecommendations`, then **recomputes** projected score — but **reuses the stored `executiveSummary`** without regeneration.

ABC LLC proof:

| Set | Rec count | Projection impact | Projected |
| --- | --- | --- | --- |
| All active (incl. stubs) | 57 | 78 | **100** |
| Client deliverable only | 13 | 20 | **59** |

Stored narrative literally says: *“improve from 39 to **100**, a gain of 61 points.”*

### RC-3 — Catalog content gate (OPT-003), not missing mappings

`data/RecommendationCatalogV2.json`: **80** templates; **20** approved (Identity & Access, Security Operations); **60** stubs across the other six pillars.

Every v2 question maps 1:1 to a template. Stub titles embed raw question stems (`Improve {Pillar}: {question}`).

### RC-4 — Narrative quality from template assembly + stub titles

Executive summary is **template-assembled** (not AI) in `buildAssessmentExecutiveSummary`. Stub titles flow into prose via `recommendationTopic` (lowercase + strip `?` only).

ABC LLC narrative contains: *“improve productivity & collaboration: is a centralized productivity platform used”* and similar question fragments, while those stub cards are absent from the client PDF detail section.

### RC-5 — Dual maturity vocabularies

Opening paragraph mixes:

- DOC-119 maturity (`Initial` for 0–39)
- Rating labels (`Critical` for low scores via `getRating` / `RATING_LABELS`)

ABC LLC: “initial level… places the environment in the **critical** range.” Profile stores `maturityTier: nascent` (separate enum) — third vocabulary on dashboard/profile surfaces.

### RC-6 — Roadmap uses the stub-inclusive set

Draft roadmap for ABC LLC: `baselineScore 39`, `projectedFinalScore 100`, all four phases already at projected **100**. That matches stub-inclusive category-max math, **not** the client PDF’s 59.

---

## 2. Exact code locations

| Concern | Path | Symbol |
| --- | --- | --- |
| v2 complete + narrative persist | `src/lib/assessments/complete-v2.ts` | `completeAssessmentV2` |
| Executive narrative builder | `src/lib/assessments/executive-summary.ts` | `buildAssessmentExecutiveSummary`, `buildProjectionParagraph`, `recommendationTopic` |
| Results / PDF projected score | `src/lib/assessments/results-summary.ts` | `buildAssessmentResultsSummary` |
| Category-max impact | `src/lib/recommendations/engine.ts` | `calculateProjectionImpacts` |
| Cap at 100 | `src/lib/scoring/index.ts` | `calculateProjectedScore` |
| v2 pillar / overall score | `src/lib/scoring/v2/pillar-score.ts` | `calculateV2Scores`, `calculateOverallStackScore` |
| DOC-119 maturity bands | `src/lib/scoring/v2/maturity-level.ts` | `getTechnologyMaturityLevel` |
| Client stub filter | `src/lib/recommendations/visibility.ts` | `filterClientDeliverableRecommendations` |
| Stub catalog flag | `src/lib/recommendations/stubs.ts` + `data/RecommendationCatalogV2.json` | `isStubRecommendationTemplate` |
| Client PDF export | `src/app/api/v1/assessments/[id]/export/pdf/route.ts` | `GET` |
| PDF Potential Points (raw sum) | `src/lib/pdf/assessment-report.tsx` | `totalImpact` / “Potential Points” |
| PDF milestone helpers | `src/lib/pdf/report-helpers.ts` | `computeRoadmapScores` |
| Roadmap materialize | `src/lib/client-roadmap/materialize.ts` | `materializeDraftRoadmap` |
| Report DTO | `src/lib/assessments/report-data.ts` | `buildAssessmentReportData` |

---

## 3. Calculation and data lineage

```
Answers (Yes=100 / Partially=50 / No=0)
  → calculateV2Scores → pillar % → overall = mean of complete pillars
  → Assessment.overallScore (ABC: 39)

Triggers (No/Partially → template)
  → evaluateV2Triggers → syncClientRecommendations
  → AssessmentRecommendation rows (ABC: 57)

At completion (includes stubs):
  impact = Σ_cat MAX(points)          // ABC: 78
  projected = MIN(100, 39 + 78)       // ABC: 100
  executiveSummary persisted with projectedScore=100

Client PDF export:
  filterClientDeliverableRecommendations(role=client)  // ABC: 13 (IA+SO only)
  rebuild summary → projected = MIN(100, 39 + 20) = 59
  executiveSummary still says 100
  Potential Points = Σ points of listed recs = 104
```

### Are recommendation impacts additive?

| Use | Additive? |
| --- | --- |
| Authoritative projected StackScore | **No** — max per category, then sum categories |
| PDF Potential Points | **Yes** — raw sum |
| Roadmap domain improvement counters | Yes (completed initiatives by domain) |
| Cap | Overall projected score capped at **100** only |

### Why roadmap stays at 59 after “critical” on the PDF, but narrative says 100

- On the **client PDF**, critical/high cards are only from IA + SO; category-max across those two pillars ≈ **20** → **59**.
- Completing “all critical recommendations” **on that filtered set** cannot reach 100.
- The **roadmap** and **stored narrative** were computed with stubs included and already saturate at **100** after Critical Stabilization — a different recommendation universe.

---

## 4. Recommendation coverage findings

### Staging pillars (ABC LLC)

| Pillar | Score % | Generated recs | Client-deliverable |
| --- | --- | --- | --- |
| Documentation & Knowledge | **8.06** | 10 | **0** (all stubs) |
| Technology Strategy | **24.29** | 10 | **0** |
| Endpoint Management | **27.78** | 8 | **0** |
| Security Operations | 34.72 | 7 | **7** |
| Identity & Access | 51.43 | 6 | **6** |
| (other pillars) | … | stubs only | **0** |

### Engine vs presentation

| Layer | Finding |
| --- | --- |
| V2 engine | Generates weak-pillar stubs correctly |
| Question → template mapping | Complete (no missing mappings found in catalog seed path) |
| Client PDF / client APIs | Intentionally omit stubs (SS-OPT-003) |
| Priority sort | After filter, remaining IA/SO critical/high dominate |
| Detailed PDF list | No hard count cap; appears IA/SO-heavy because others were filtered |

**Origin of the problem:** content/presentation gate (stub approval), **not** recommendation trigger logic.

---

## 5. Narrative generation findings

| Question | Answer |
| --- | --- |
| Source | Template assembly from scores, pillar names, recommendation titles, projected score |
| AI? | **No** |
| Persist timing | On assessment complete; PDF does not rewrite |
| Grammar / style | Awkward “{Company}'s organization”; lowercased imperative titles in lists |
| Raw question text | Yes, via stub titles in stored summary |
| Repetition | Maturity description + rating label; PDF dumps full summary as bullets after already showing gauges/priorities |
| Conflicting projections | Stored text **100** vs live PDF gauges **59** vs Potential Points implying ~100 |
| Unsupported claims | “Sequenced to deliver the strongest maturity gains first” (sort is priority/impact only); always references **80+** threshold even when projected is already 100 |

### ABC LLC executive summary (excerpt, staging)

> …improve from **39** to **100**, a gain of **61** points. That trajectory moves the organization meaningfully toward the **80+** maturity threshold…

> Near-term priorities should focus on … **improve productivity & collaboration: is a centralized productivity platform used**, **improve technology strategy: is continuous improvement practiced**, **improve documentation & knowledge: are credentials securely managed**…

Those stub priorities are **not** present as cards in the client PDF recommendation list.

---

## 6. Cross-surface inconsistencies

| Surface | Current | Projected / outcome | Recs visible |
| --- | --- | --- | --- |
| Assessment record | 39 | (none stored as field; narrative embeds 100) | N/A |
| Technology Profile | 39; tier `nascent` | No projected field on profile model | open count **57** |
| Customer PDF (client role) | 39 | **59** + Potential **+104** | **13** deliverable |
| Staff PDF (internal) | 39 | ~**100** (stubs kept) | **57** |
| On-screen report page | 39 | Uses unfiltered set unless separately filtered | May show stubs |
| Draft Client Roadmap | baseline 39 | **100** (phases already at 100) | Initiatives from stub-inclusive materialize |
| Recommendations UI (client) | — | — | Stub-filtered via visibility helpers |

Pillar scores themselves are consistent (same `AssessmentCategoryScore` rows). Divergence is in **recommendation audience**, **impact aggregation**, and **stale narrative**.

---

## 7. Report structure evaluation (~15 pages)

Current PDF order (`AssessmentReportDocument`):

1. Cover  
2. Recommendation Summary (gauges + Potential Points + full index) — **before** executive narrative  
3. Technology Maturity Roadmap (sparse)  
4. Executive Summary (gauges again; narrative split into bullets)  
5. Technology Pillars  
6+. Detailed recommendation cards (`wrap={false}` → primary page bloat)  
7. Closing titled “Technology Improvement Plan” (CTA, not a real TIP)

**Issues:** redundant gauges; priorities repeated 3×; narrative buried; weak pillar explanation; closing mislabeled vs DOC-126 journey pattern.

### Proposed premium structure (recommendation only — do not implement yet)

Aim **6–8** executive pages; optional appendix:

1. **Cover**  
2. **Executive Brief (1–2p)** — reconciled projected score; business-language priorities; no question stems  
3. **Maturity snapshot** — overall + pillars with one sentence of meaning each  
4. **Priority actions** — Critical/High compact rows only  
5. **Improvement path** — Current → Critical → Critical+High → Target (**one** projection model)  
6. **Next step / Journey closing** — Strategy Session CTA (`PdfJourneyClosingHero`), not a fake TIP  

**Content rules for a future fix:** regenerate client-safe narrative at export; one maturity vocabulary; label Potential Points clearly or replace with projection impact; never show stub/question titles to customers.

---

## 8. Proposed remediation (next releases — not in SS-REL-012)

| Priority | Change | Notes |
| --- | --- | --- |
| P0 | Regenerate executive summary at **client PDF export** from the same filtered recommendation set used for gauges | Fixes 100 vs 59 |
| P0 | Align PDF “Potential Points” with projection impact **or** rename/explain as uncapped sum | Fixes +104 misread |
| P0 | Keep roadmap projected final in sync with customer-visible recommendation set (or dual staff/customer projections) | Fixes roadmap 100 vs PDF 59 |
| P1 | Approve / rewrite stub catalog copy for Documentation, Technology Strategy, Endpoint (and remaining pillars) | Fixes weak-pillar coverage |
| P1 | Stop embedding question stems in titles; regenerate stale summaries after catalog publish | Narrative quality |
| P2 | Single maturity vocabulary in customer copy; map profile `MaturityTier` ↔ DOC-119 labels | Cross-surface language |
| P2 | Restructure PDF per premium outline above | Readability / page count |

**Do not** change scoring weights or v2 answer formulas as part of this remediation track.

---

## 9. Required regression tests

1. **Projection math** — fixture where raw sum ≫ category-max; assert `projectedScore = min(100, current + categoryMaxSum)` and Potential Points (if retained) is explicitly distinct.  
2. **Client vs staff PDF** — assessment with stubs: client projected/narrative match filtered set; staff may include stubs; filenames retain `-internal` suffix.  
3. **Narrative regeneration** — export must not claim projected 100 when filtered projection is 59.  
4. **No stub titles in client narrative/PDF** — assert absence of `Improve {Pillar}:` / question-stem patterns for `role=client`.  
5. **Weak-pillar coverage after catalog approval** — once stubs cleared, Documentation/Strategy/Endpoint appear when those scores are low.  
6. **Roadmap vs assessment projected** — same recommendation audience → same final projected score (or documented dual-mode).  
7. **ABC LLC golden fixture** (anonymized snapshot) — overall 39; client projected 59; client deliverable count 13; narrative must not say 100 after fix.

---

## 10. Release-blocking issues

| ID | Issue | Severity |
| --- | --- | --- |
| RB-1 | Executive narrative claims **39 → 100** while client PDF projected gauge is **59** | **Block customer PDF trust** |
| RB-2 | “Potential Points” **+104** contradicts authoritative projection (+20 → 59) | **Block** (misleading) |
| RB-3 | Client PDF omits recommendations for weakest pillars (all stubs) without explaining the gap | **Block** for executive usefulness |
| RB-4 | Narrative contains raw assessment question text from stubs | **Block** quality |
| RB-5 | Draft roadmap projected **100** while customer PDF shows **59** | **High** — cross-surface |

Non-blocking but important: dual maturity/rating language; PDF section order/redundancy; closing page labeled as TIP.

---

## Staging evidence summary (ABC LLC, read-only)

| Field | Value |
| --- | --- |
| Client | ABC LLC |
| Assessment | Technology Assessment / `initial` / `v2` / completed |
| Overall | **39** (`hasCriticalExposure: true`) |
| Weakest pillars | Documentation **8%**, Technology Strategy **24%**, Endpoint **28%** |
| Recommendations | **57** total; **13** client-deliverable; **44** stub-gated |
| Client raw impact sum | **104** |
| Client projection impact | **20** → projected **59** |
| All-rec projection impact | **78** → projected **100** (narrative + roadmap) |
| Profile | overall **39**, `maturityTier: nascent`, open recs **57** |

No database writes, scoring changes, or PDF redesigns were performed in this audit.

---

## Appendix — Authoritative formulas (unchanged)

```
pillarScore = weightedAvg(answered question scores)   // Yes=100, Partial=50, No=0; N/A excluded
overallScore = mean(complete pillar scores)           // DOC-119 v2

projectionImpact = Σ over categories of MAX(estimatedImpactPoints in that category)
projectedScore = MIN(100, overallScore + projectionImpact)
```

PDF Potential Points (current, **not** authoritative for maturity projection):

```
potentialPoints = Σ estimatedImpactPoints(recommendations shown)
```
