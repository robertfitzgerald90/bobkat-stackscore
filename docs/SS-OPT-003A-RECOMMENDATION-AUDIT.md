# SS-OPT-003A — Recommendation Catalog Audit & Content Standards

**Document ID:** SS-OPT-003A  
**Status:** Complete (read-only investigation)  
**Date:** October 23, 2026  
**Owner:** Bobkat IT / StackScore engineering  
**Scope:** `data/RecommendationCatalogV2.json`, v2 recommendation engine, delivery surfaces  
**Constraints honored:** No application code, catalog content, schema, or dependency changes

**Related:** DOC-112, DOC-152, DOC-153, SS-OPT-002 (stub client-delivery gate), SS-OPT-003 (content remediation — not started)

---

## 1. Executive summary

The v2 recommendation catalog contains **80 templates** (10 per Technology Pillar), one-to-one with DOC-151 assessment questions. **All 80 are marked `isStub: true`.** Titles, descriptions, and business-impact text were mechanically generated from question text / `whyItMatters` and are **not suitable for paid executive delivery**.

The **engine and data model work**: triggers, dedupe, status workflow, assessment evidence links, Technology Profile risk counts, TIP/roadmap promotion, and PDF rendering are operational. After SS-OPT-002, stub templates are **withheld from client portal and assessment-complete email payloads**; consultants still see full stub content, and consultant-generated PDFs may still include stubs.

**Verdict:** Architecture is ready for professional content. Content is not. Approve the Bobkat content standard in this document, then remediate the catalog in SS-OPT-003 batches — **do not rewrite templates until approval**.

| Area | Status |
| --- | --- |
| Catalog coverage (80 / 8 pillars) | Complete structurally |
| Content quality | Stub / not delivery-ready |
| Engine determinism | Sound |
| Client vs consultant visibility | Intentionally asymmetric (stubs gated) |
| Schema vs DOC-153 ideal | Usable without migration if fields are structured carefully |
| Consolidation / effort / dependencies | Metadata unused or absent |

---

## 2. Recommendation catalog structure

### 2.1 Source file

| Property | Value |
| --- | --- |
| Path | `data/RecommendationCatalogV2.json` |
| `$schema` | `stackscore/recommendation-catalog/v2` |
| `version` | `2.0.0` |
| Template count | **80** |
| Stub count | **80** (`isStub: true`) |

### 2.2 Verified template schema (actual fields only)

Each template object contains **exactly** these keys (verified by enumeration):

| Field | Type / pattern | Role today |
| --- | --- | --- |
| `id` | `REC-{PILLAR}-{nnn}` | Permanent template code (DOC-153 ID scheme) |
| `questionId` | e.g. `IA-001` | Linked assessment question |
| `pillarCode` | Technology Pillar code | Category / pillar key |
| `pillarName` | Display name | Human pillar label |
| `title` | string | Client/staff headline (currently question-echo) |
| `description` | string | Body copy (currently “Address gaps identified…”) |
| `businessImpact` | string | Short impact line (copied from question `whyItMatters`) |
| `suggestedService` | string | Always `"Technology Improvement Services"` |
| `priority` | `critical` \| `high` \| `medium` \| `low` | Default priority |
| `estimatedImpactPoints` | 3 \| 4 \| 6 \| 8 \| 10 | Projection points |
| `triggerAnswers` | `["No","Partially"]` for all 80 | Answer texts that fire |
| `alsoTriggerOnPartial` | `true` for all 80 | Also fire when score ∈ (0,100) |
| `consolidationGroupId` | always `null` | Unused |
| `isStub` | always `true` | Delivery gate metadata (JSON only; **not** on Prisma template) |

**Fields that do NOT exist** in the catalog JSON (despite DOC-153 naming): technical description, technology capability, estimated effort, dependencies, implementation notes, business outcome (separate), suggested project template, deliverables list.

### 2.3 Priority / impact derivation (observed)

Priority and `estimatedImpactPoints` are **deterministic from question weight**, not editorial judgment:

| Question weight | Priority | Impact points | Count |
| --- | --- | --- | --- |
| 5 | critical | 10 | 20 |
| 4 | high | 8 | 23 |
| 3 | medium | 6 | 18 |
| 2 | low | 4 | 14* |
| 1 | low | 3 | 5* |

\*Counts derived from catalog; weight→priority mapping matches **80/80**.

### 2.4 Trigger pattern (uniform)

Every template triggers on **No** or **Partially**. `alsoTriggerOnPartial: true` is redundant with `Partially` in `triggerAnswers` for standard Yes/Partially/No scoring, but remains a second path if score values diverge from labels.

---

## 3. Recommendation engine architecture

### 3.1 Lifecycle

```text
Assessment answers (draft)
  → AnswerOption.triggersRecommendation + recommendationTemplate.code
  → collectV2TriggeredResponses
  → evaluateV2Triggers (catalog rules)
  → [preview only until complete]

POST /assessments/{id}/complete
  → syncClientRecommendations (dedupeKey = template:{code})
  → RecommendationAssessmentTrigger (evidence)
  → AssessmentRecommendation (client-level row)
  → Technology Profile riskSummary (by priority)
  → TIP / draft roadmap materialization (best-effort)
  → assessment_complete email queue (manual review; stubs filtered from payload lists)
```

### 3.2 Key modules

| Concern | Path |
| --- | --- |
| V2 evaluate / collect | `src/lib/recommendations/v2-engine.ts` |
| Sync / upsert / retrigger | `src/lib/recommendations/sync.ts` |
| Dedupe / status rules | `src/lib/recommendations/dedupe.ts` |
| Stub detection | `src/lib/recommendations/stubs.ts` |
| Client vs staff presentation | `src/lib/recommendations/visibility.ts` |
| Client list API | `src/lib/recommendations/client-list.ts` |
| Triggered-by-assessment query | `src/lib/recommendations/queries.ts` |
| Complete orchestration | `src/lib/assessments/complete-v2.ts` |
| PDF | `src/lib/pdf/assessment-report.tsx` + results summary |
| Roadmap / TIP | `src/lib/client-roadmap/**`, `src/lib/technology-improvement-plan/**` |
| Email | `src/lib/communications/workflows/triggers.ts` |

### 3.3 Behavioral answers

| Question | Finding |
| --- | --- |
| How do answers trigger recommendations? | Option must have `triggersRecommendation` + template code; catalog `triggerAnswers` / partial-score rule must match |
| Deduplication? | One active client row per `dedupeKey` (`template:{REC-…}`); triggers accumulate per assessment |
| Priority assignment? | Copied from catalog template at sync (weight-derived today) |
| Status management? | `open` → accepted / in_progress / deferred / completed / declined / archived; retrigger preserves or reopens per DOC-152 rules |
| Assessment evidence? | `RecommendationAssessmentTrigger` + `latestTriggerReason` |
| Technology Profile? | Open recommendation counts + priority risk summary; recommendation lists in profile/detail |
| PDF reports? | Title, description, businessImpact, priority; **no stub filter** on consultant PDF path |
| Roadmaps / TIP? | Initiatives reference `AssessmentRecommendation`; copy fields flow through |
| Client communications? | Assessment-complete queue is review-required; stub titles stripped from strengths/priorities lists |
| Consultant vs client? | Staff see stubs + trigger metadata; clients get field stripping **and** stub withholding (fail closed without template code) |

### 3.4 Prisma persistence (runtime rows)

`RecommendationTemplate` / `AssessmentRecommendation` store: `title`, `description`, `businessImpact`, `suggestedService`, `priority`, `estimatedImpactPoints`, `consolidationGroupId`, status/workflow fields. **No** `isStub`, effort, or dependency columns.

---

## 4. Existing content quality assessment

### 4.1 Pattern (all 80)

| Element | Pattern | Quality |
| --- | --- | --- |
| Title | `Improve {Pillar}: {question text without ?}` | Not action-oriented; reads as a question restatement |
| Description | `Address gaps identified during assessment of "{question}" within the {Pillar} Technology Pillar.` | Vague; no remediation steps |
| Business impact | Verbatim question `whyItMatters` (avg ~17 characters for many) | Often a fragment, not executive consequence |
| Suggested service | Always “Technology Improvement Services” | Non-differentiating |
| Priority / points | Mechanical from weight | Internally consistent; not yet risk-edited for SMB context |
| Stub flag | Always true | Correctly marks unapproved copy |

### 4.2 Content completeness (proposed standard lens)

| Dimension | Score | Notes |
| --- | --- | --- |
| Finding clarity | Poor | Does not state the assessed condition as a finding |
| Self-report vs verified | Missing | No disclaimer that answers are assessment-reported |
| Business impact | Poor–fair | Short slogans; little operational/financial framing |
| Recommended action | Absent | No practical steps |
| Expected outcome | Absent / conflated | Not separated from impact |
| Priority seriousness | Fair | Weight-aligned; needs editorial review for SMB urgency |
| Implementation considerations | Absent | No prerequisites / constraints |
| Vendor neutrality | Pass | No vendor lock-in in stubs |
| Executive suitability | Fail | Not report-ready |

### 4.3 DOC-153 gap

DOC-153 expects Business Problem, Business Outcome, Technical Guidance, Estimated Effort, Dependencies, Implementation Notes, Capability, etc. The **implemented** catalog is a minimal stub projection of question metadata, not a DOC-153 library.

---

## 5. Proposed Bobkat IT recommendation standard

Use this standard for all SS-OPT-003 rewrites. Aligns with DOC-006 / DOC-153 principles and paid assessment delivery.

### 5.1 Content blocks

#### A. Finding (maps primarily to `title` + opening of `description`)

- State the **condition indicated by the assessment response** (typically No / Partially).
- Use language such as: “The assessment indicates…” / “Based on responses provided…”
- **Do not** present self-reported answers as independently verified forensic evidence.
- Prefer outcome-oriented titles (e.g. “Establish centralized identity for workforce authentication”) over restated questions.

#### B. Business impact (maps to `businessImpact`)

- Explain operational, financial, security, or strategic consequences for an SMB owner/executive.
- Concrete and proportional; avoid fearmongering and absolute claims (“will be breached”).
- Prefer “increases the likelihood of…” / “can result in…” over guarantees.

#### C. Recommended action (maps to body of `description`)

- Practical, sequenced remediation guidance a Bobkat consultant can discuss or deliver.
- Specific enough to act on; avoid “improve security” / “follow best practices” alone.
- Remain **vendor-agnostic** unless a technology class is inherent to the finding (e.g. MFA).

#### D. Expected outcome (maps to closing of `description` or trailing sentence in `businessImpact`)

- Anticipated improvement in risk posture, reliability, or manageability.
- No unsupported SLAs, ROI percentages, or maturity-point guarantees beyond `estimatedImpactPoints` as an internal planning signal.

#### E. Priority (`priority`)

- Reflect **seriousness / urgency of the finding**, not how hard the project is.
- Keep weight-based defaults as a starting point; adjust only with documented rationale in remediation notes.
- Distinguish urgency from effort (effort lives in playbooks / narrative considerations, not priority).

#### F. Implementation considerations (section within `description`)

- Prerequisites, dependencies, change-management, or operational constraints where relevant.
- Do not invent cost/ROI fields.

### 5.2 Writing quality bar

Recommendations must be:

1. Technically accurate for SMB environments  
2. Business-oriented and executive-readable  
3. Actionable and concise but substantive  
4. Consistent with the trigger condition (No vs Partially may share template; nuance in wording)  
5. Free of unsupported claims and hard sales language  
6. Explicit about assessment-reported vs verified observations  

### 5.3 Suggested field packing (no schema change)

| Standard block | Existing field |
| --- | --- |
| Finding (short) | `title` |
| Finding detail + Recommended action + Expected outcome + Implementation considerations | `description` (structured paragraphs or labeled sections) |
| Business impact | `businessImpact` |
| Service line | `suggestedService` (may specialize later: e.g. “Identity & Access Services”) |
| Priority / maturity signal | `priority`, `estimatedImpactPoints` |
| Approval state | `isStub: false` only when approved |

Optional labeled sections inside `description` (plain text):

```text
Finding: …
Recommended action: …
Expected outcome: …
Implementation considerations: …
```

---

## 6. Catalog classification

### 6.1 By Technology Pillar

| Pillar | Code | Templates | Critical | High | Medium | Low | Specialized review |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Identity & Access | `identity_access` | REC-IA-001…010 | 3 | 2 | 3 | 2 | **Yes** — identity / privilege |
| Endpoint Management | `endpoint_management` | REC-EP-001…010 | 3 | 3 | 2 | 2 | Elevated — device security |
| Network & Connectivity | `network_connectivity` | REC-NW-001…010 | 2 | 4 | 2 | 2 | **Yes** — architecture / segmentation |
| Data Protection & Recovery | `data_protection_recovery` | REC-DP-001…010 | 3 | 3 | 2 | 2 | **Yes** — backup / DR / BCP |
| Productivity & Collaboration | `productivity_collaboration` | REC-PC-001…010 | 2 | 3 | 2 | 3 | Standard |
| Security Operations | `security_operations` | REC-SO-001…010 | 3 | 3 | 1 | 3 | **Yes** — cyber ops / detection |
| Documentation & Knowledge | `documentation_knowledge` | REC-DK-001…010 | 1 | 3 | 3 | 3 | Standard (+ compliance-adjacent DK-004/006) |
| Technology Strategy | `technology_strategy` | REC-TS-001…010 | 3 | 2 | 3 | 2 | Elevated — governance / planning |

### 6.2 Per-template classification (all 80)

Legend: **Completeness** = content vs §5 standard (all currently **Stub**). **Effort** = provisional remediation effort class for *writing* the template (not customer project effort): S = straightforward, M = needs SME nuance, L = specialized / high-stakes wording.

| ID | Question | Pillar | Trigger | Priority | Pts | Completeness | Business relevance | Tech complexity | Writing effort | Spec. review |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| REC-IA-001 | IA-001 | identity_access | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-IA-002 | IA-002 | identity_access | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-IA-003 | IA-003 | identity_access | No\|Partially | medium | 6 | Stub | High | Medium | M | Yes |
| REC-IA-004 | IA-004 | identity_access | No\|Partially | high | 8 | Stub | High | High | L | Yes |
| REC-IA-005 | IA-005 | identity_access | No\|Partially | high | 8 | Stub | High | Medium | M | Yes |
| REC-IA-006 | IA-006 | identity_access | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-IA-007 | IA-007 | identity_access | No\|Partially | medium | 6 | Stub | Medium | Medium | M | Yes |
| REC-IA-008 | IA-008 | identity_access | No\|Partially | medium | 6 | Stub | Medium | Medium | M | Yes |
| REC-IA-009 | IA-009 | identity_access | No\|Partially | low | 4 | Stub | Medium | Low | S | Yes |
| REC-IA-010 | IA-010 | identity_access | No\|Partially | low | 3 | Stub | Medium | Low | S | Yes |
| REC-EP-001 | EP-001 | endpoint_management | No\|Partially | medium | 6 | Stub | Medium | Medium | M | Elevated |
| REC-EP-002 | EP-002 | endpoint_management | No\|Partially | medium | 6 | Stub | Medium | Medium | M | Elevated |
| REC-EP-003 | EP-003 | endpoint_management | No\|Partially | critical | 10 | Stub | High | High | L | Elevated |
| REC-EP-004 | EP-004 | endpoint_management | No\|Partially | critical | 10 | Stub | High | High | L | Elevated |
| REC-EP-005 | EP-005 | endpoint_management | No\|Partially | high | 8 | Stub | High | Medium | M | Elevated |
| REC-EP-006 | EP-006 | endpoint_management | No\|Partially | high | 8 | Stub | High | Medium | M | Elevated |
| REC-EP-007 | EP-007 | endpoint_management | No\|Partially | high | 8 | Stub | High | Medium | M | Elevated |
| REC-EP-008 | EP-008 | endpoint_management | No\|Partially | low | 4 | Stub | Medium | Low | S | Elevated |
| REC-EP-009 | EP-009 | endpoint_management | No\|Partially | critical | 10 | Stub | High | High | L | Elevated |
| REC-EP-010 | EP-010 | endpoint_management | No\|Partially | low | 3 | Stub | Low | Low | S | Elevated |
| REC-NW-001 | NW-001 | network_connectivity | No\|Partially | medium | 6 | Stub | Medium | Medium | M | Yes |
| REC-NW-002 | NW-002 | network_connectivity | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-NW-003 | NW-003 | network_connectivity | No\|Partially | high | 8 | Stub | High | High | L | Yes |
| REC-NW-004 | NW-004 | network_connectivity | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-NW-005 | NW-005 | network_connectivity | No\|Partially | high | 8 | Stub | High | Medium | M | Yes |
| REC-NW-006 | NW-006 | network_connectivity | No\|Partially | medium | 6 | Stub | High | High | L | Yes |
| REC-NW-007 | NW-007 | network_connectivity | No\|Partially | high | 8 | Stub | High | Medium | M | Yes |
| REC-NW-008 | NW-008 | network_connectivity | No\|Partially | high | 8 | Stub | Medium | Medium | M | Yes |
| REC-NW-009 | NW-009 | network_connectivity | No\|Partially | low | 4 | Stub | Medium | Low | S | Yes |
| REC-NW-010 | NW-010 | network_connectivity | No\|Partially | low | 4 | Stub | Low | Low | S | Yes |
| REC-DP-001 | DP-001 | data_protection_recovery | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-DP-002 | DP-002 | data_protection_recovery | No\|Partially | medium | 6 | Stub | High | Medium | M | Yes |
| REC-DP-003 | DP-003 | data_protection_recovery | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-DP-004 | DP-004 | data_protection_recovery | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-DP-005 | DP-005 | data_protection_recovery | No\|Partially | high | 8 | Stub | High | High | L | Yes |
| REC-DP-006 | DP-006 | data_protection_recovery | No\|Partially | high | 8 | Stub | High | Medium | M | Yes |
| REC-DP-007 | DP-007 | data_protection_recovery | No\|Partially | high | 8 | Stub | High | Medium | M | Yes |
| REC-DP-008 | DP-008 | data_protection_recovery | No\|Partially | medium | 6 | Stub | Medium | Medium | M | Yes |
| REC-DP-009 | DP-009 | data_protection_recovery | No\|Partially | low | 4 | Stub | Medium | Low | S | Yes |
| REC-DP-010 | DP-010 | data_protection_recovery | No\|Partially | low | 3 | Stub | Medium | Low | S | Yes |
| REC-PC-001 | PC-001 | productivity_collaboration | No\|Partially | critical | 10 | Stub | High | Medium | M | No |
| REC-PC-002 | PC-002 | productivity_collaboration | No\|Partially | critical | 10 | Stub | High | Medium | M | No |
| REC-PC-003 | PC-003 | productivity_collaboration | No\|Partially | medium | 6 | Stub | Medium | Low | S | No |
| REC-PC-004 | PC-004 | productivity_collaboration | No\|Partially | high | 8 | Stub | Medium | Medium | M | No |
| REC-PC-005 | PC-005 | productivity_collaboration | No\|Partially | medium | 6 | Stub | Medium | Low | S | No |
| REC-PC-006 | PC-006 | productivity_collaboration | No\|Partially | high | 8 | Stub | Medium | Medium | M | No |
| REC-PC-007 | PC-007 | productivity_collaboration | No\|Partially | low | 4 | Stub | Low | Low | S | No |
| REC-PC-008 | PC-008 | productivity_collaboration | No\|Partially | high | 8 | Stub | Medium | Medium | M | No |
| REC-PC-009 | PC-009 | productivity_collaboration | No\|Partially | low | 4 | Stub | Low | Low | S | No |
| REC-PC-010 | PC-010 | productivity_collaboration | No\|Partially | low | 3 | Stub | Low | Low | S | No |
| REC-SO-001 | SO-001 | security_operations | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-SO-002 | SO-002 | security_operations | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-SO-003 | SO-003 | security_operations | No\|Partially | high | 8 | Stub | High | High | L | Yes |
| REC-SO-004 | SO-004 | security_operations | No\|Partially | high | 8 | Stub | High | Medium | M | Yes |
| REC-SO-005 | SO-005 | security_operations | No\|Partially | critical | 10 | Stub | High | High | L | Yes |
| REC-SO-006 | SO-006 | security_operations | No\|Partially | high | 8 | Stub | High | Medium | M | Yes |
| REC-SO-007 | SO-007 | security_operations | No\|Partially | medium | 6 | Stub | Medium | Medium | M | Yes |
| REC-SO-008 | SO-008 | security_operations | No\|Partially | low | 4 | Stub | Medium | Low | S | Yes |
| REC-SO-009 | SO-009 | security_operations | No\|Partially | low | 4 | Stub | Medium | Low | S | Yes |
| REC-SO-010 | SO-010 | security_operations | No\|Partially | low | 4 | Stub | Low | Low | S | Yes |
| REC-DK-001 | DK-001 | documentation_knowledge | No\|Partially | high | 8 | Stub | Medium | Low | S | No |
| REC-DK-002 | DK-002 | documentation_knowledge | No\|Partially | medium | 6 | Stub | Medium | Low | S | No |
| REC-DK-003 | DK-003 | documentation_knowledge | No\|Partially | critical | 10 | Stub | High | Medium | M | Elevated |
| REC-DK-004 | DK-004 | documentation_knowledge | No\|Partially | low | 4 | Stub | Medium | Low | S | Elevated |
| REC-DK-005 | DK-005 | documentation_knowledge | No\|Partially | high | 8 | Stub | Medium | Low | S | No |
| REC-DK-006 | DK-006 | documentation_knowledge | No\|Partially | high | 8 | Stub | Medium | Medium | M | Elevated |
| REC-DK-007 | DK-007 | documentation_knowledge | No\|Partially | low | 4 | Stub | Low | Low | S | No |
| REC-DK-008 | DK-008 | documentation_knowledge | No\|Partially | medium | 6 | Stub | Medium | Low | S | No |
| REC-DK-009 | DK-009 | documentation_knowledge | No\|Partially | medium | 6 | Stub | Medium | Low | S | No |
| REC-DK-010 | DK-010 | documentation_knowledge | No\|Partially | low | 3 | Stub | Low | Low | S | No |
| REC-TS-001 | TS-001 | technology_strategy | No\|Partially | critical | 10 | Stub | High | Medium | M | Elevated |
| REC-TS-002 | TS-002 | technology_strategy | No\|Partially | critical | 10 | Stub | High | Medium | M | Elevated |
| REC-TS-003 | TS-003 | technology_strategy | No\|Partially | high | 8 | Stub | High | Medium | M | Elevated |
| REC-TS-004 | TS-004 | technology_strategy | No\|Partially | medium | 6 | Stub | Medium | Low | S | Elevated |
| REC-TS-005 | TS-005 | technology_strategy | No\|Partially | medium | 6 | Stub | Medium | Low | S | Elevated |
| REC-TS-006 | TS-006 | technology_strategy | No\|Partially | high | 8 | Stub | Medium | Medium | M | Elevated |
| REC-TS-007 | TS-007 | technology_strategy | No\|Partially | critical | 10 | Stub | High | Medium | M | Elevated |
| REC-TS-008 | TS-008 | technology_strategy | No\|Partially | low | 4 | Stub | Low | Low | S | Elevated |
| REC-TS-009 | TS-009 | technology_strategy | No\|Partially | medium | 6 | Stub | Medium | Low | S | Elevated |
| REC-TS-010 | TS-010 | technology_strategy | No\|Partially | low | 3 | Stub | Low | Low | S | Elevated |

Full question text lives in `data/v2-question-library.json` (authoritative wording for Finding drafts).

---

## 7. Identified technical and content risks

| ID | Type | Risk | Severity |
| --- | --- | --- | --- |
| R-001 | Content | All stubs — paid reports/emails unsafe if gate bypassed | Critical |
| R-002 | Content | Mechanical titles/descriptions undermine Bobkat credibility | High |
| R-003 | Content | Ultra-short businessImpact fragments fail executive scrutiny | High |
| R-004 | Delivery | Consultant PDF still renders stub recommendations | High |
| R-005 | Process | Clearing `isStub` without content rewrite would publish garbage | Critical |
| R-006 | Model | DOC-153 effort/dependencies not stored — risk of inventing columns | Medium |
| R-007 | Engine | `consolidationGroupId` unused — related findings may overwhelm clients | Medium |
| R-008 | Engine | Uniform No/Partially triggers may over-recommend on “Partially” | Medium |
| R-009 | Data | `isStub` only in JSON — DB templates lack approval flag | Low–Medium |
| R-010 | Consistency | Priority is weight-cloned; may not match real SMB urgency after rewrite | Medium |
| R-011 | Comms | Fail-closed client filter hides non-stub rows missing template codes | Low (safety) |

---

## 8. Data model assessment

### 8.1 Prefer existing fields — **sufficient for SS-OPT-003 content**

No migration is required to meet the Bobkat standard if content is packed as in §5.3.

| Need | Supported by | Gap |
| --- | --- | --- |
| Finding / action / outcome narrative | `title` + `description` | Structure by convention |
| Business impact | `businessImpact` | Length/quality only |
| Priority / points | existing | Editorial review |
| Service suggestion | `suggestedService` | Specialize copy later |
| Stub approval | catalog `isStub` | Not on Prisma; runtime reads JSON |
| Effort | — | Use Solution Playbook / narrative; **do not** add recommendation `effort` column in OPT-003A/B unless later approved |
| Dependencies | `consolidationGroupId` (future) or narrative | Optional later |

### 8.2 Smallest viable adjustment (only if later needed)

**Not recommended for first content pass.** If product later requires queryable effort/approval:

1. Add optional `isStub Boolean @default(true)` on `RecommendationTemplate` (sync from catalog), **or**  
2. Keep approval solely in catalog JSON (current approach — already works with SS-OPT-002 gates).

Prefer (2) until a reporting requirement forces (1).

---

## 9. Proposed remediation strategy (SS-OPT-003 — pending approval)

1. **Approve** this content standard (§5) and batch plan (§10).  
2. Rewrite catalog copy in batches; set `isStub: false` only after review sign-off.  
3. Reseed / backfill `RecommendationTemplate` + update open `AssessmentRecommendation` content on next sync rules (define in OPT-003 implementation brief — no silent overwrite of consultant-edited rows without policy).  
4. Extend stub filter to **PDF client exports** if a client-facing PDF path exists; keep consultant PDF optional flag.  
5. Optionally refine `suggestedService` per pillar and introduce consolidation groups for clustered findings.  
6. Do **not** change scoring, triggers, or schema in the first content pass unless a blocker appears.

---

## 10. Recommended implementation batches

| Batch | Scope | Count | Rationale |
| --- | --- | --- | --- |
| **B1** | Identity & Access + Security Operations | 20 | Highest cyber / identity stakes; specialized review |
| **B2** | Data Protection & Recovery | 10 | Backup / DR / continuity; specialized review |
| **B3** | Network & Connectivity + Endpoint Management | 20 | Architecture / device security |
| **B4** | Productivity & Collaboration + Documentation & Knowledge | 20 | Lower systemic risk; faster editorial throughput |
| **B5** | Technology Strategy | 10 | Governance tone; executive voice |
| **B6** | Delivery hardening | — | PDF stub policy, service labels, optional consolidation, seed/sync policy |

Within each batch: draft → technical review → business-language review → set `isStub: false` → regenerate fixtures/tests as needed.

---

## 11. Acceptance criteria

SS-OPT-003A is complete when:

- [x] Catalog schema documented from actual JSON (no assumed fields)  
- [x] Engine and delivery paths mapped  
- [x] Content quality assessed against paid-delivery needs  
- [x] Bobkat content standard proposed  
- [x] All 80 templates classified  
- [x] Schema sufficiency assessed; smallest change identified  
- [x] Remediation batches and risks documented  
- [ ] **Content standard approved by Bobkat** (gate for SS-OPT-003)  
- [ ] No catalog/application modifications until approval  

SS-OPT-003 content work is complete later when:

- [ ] Each approved template meets §5 blocks  
- [ ] `isStub: false` only for approved templates  
- [ ] Client portal / email / (agreed) PDF paths never auto-publish remaining stubs  
- [ ] Priorities reviewed for SMB seriousness where weight default is wrong  
- [ ] Tests cover stub gating + sample rewritten templates  

---

## 12. Final recommendation

**Approve §5 (Bobkat IT Recommendation Standard) and §10 (batches B1→B6).**  

Then authorize **SS-OPT-003** to rewrite catalog content starting with Batch B1. Keep the SS-OPT-002 client stub gate until each template is approved. Do not clear `isStub` globally.

**Awaiting approval before any catalog or application modifications.**

---

## Appendix A — DOC-153 vs implemented catalog

| DOC-153 element | Implemented? |
| --- | --- |
| Recommendation ID | Yes (`id`) |
| Title | Yes (stub quality) |
| Business description | Partial (`description` / `businessImpact`) |
| Technical description | No dedicated field |
| Technology pillar | Yes |
| Technology capability | In question library, not catalog |
| Default priority | Yes |
| Estimated effort | No (playbooks elsewhere) |
| Estimated business impact | Partial (`businessImpact` text) |
| Maturity improvement points | Yes (`estimatedImpactPoints`) |
| Related questions | Yes (`questionId`) |
| Dependencies / implementation notes | No (use narrative) |
| Suggested project template | No |
| `isStub` approval | Catalog only |

## Appendix B — Sample stub (illustrative of current quality)

`REC-IA-002` title echoes the MFA question; description is the generic “Address gaps…” sentence; businessImpact is “MFA greatly reduces account compromise.” Under §5 this becomes an action title, assessment-framed finding, executive impact paragraph, and concrete remediation steps — without claiming independent verification.
