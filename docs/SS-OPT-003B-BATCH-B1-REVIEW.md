# SS-OPT-003B — Batch B1 Review (Identity & Access + Security Operations)

**Document ID:** SS-OPT-003B-B1  
**Status:** Draft content ready — awaiting explicit approval to clear stubs  
**Date:** October 23, 2026  
**Standard:** [`SS-OPT-003A-RECOMMENDATION-AUDIT.md`](SS-OPT-003A-RECOMMENDATION-AUDIT.md) §5  
**Catalog:** `data/RecommendationCatalogV2.json`

---

## 1. Executive summary

Batch B1 draft remediations are complete for **20** templates:

- `REC-IA-001` … `REC-IA-010` (Identity & Access)
- `REC-SO-001` … `REC-SO-010` (Security Operations)

Each draft packs **Finding**, **Recommended action**, **Expected outcome**, and **Implementation considerations** into `description`, with executive **Business impact** in `businessImpact` and an action-oriented `title`.

**Controls preserved**

| Control | Status |
| --- | --- |
| Permanent IDs / question / pillar links | Unchanged |
| Trigger answers / `alsoTriggerOnPartial` | Unchanged |
| `estimatedImpactPoints` | Unchanged |
| Priority values in catalog | **Unchanged** (proposals documented only) |
| `isStub` | **Remains `true` for all 20** |
| B2–B5 templates | Untouched (still mechanical stubs) |
| Schema / engine / scoring | No changes |
| Historical DB recommendation rows | Not overwritten (catalog-only this batch) |

**Do not publish.** Clear `isStub` only after checklist approval below.

---

## 2. All 20 recommendations (draft summary)

### Identity & Access

| ID | Question | Title (draft) | Priority (kept) | Pts |
| --- | --- | --- | --- | --- |
| REC-IA-001 | IA-001 Centralized identity platform? | Establish centralized workforce identity and authentication | critical | 10 |
| REC-IA-002 | IA-002 MFA for privileged / critical systems? | Require multi-factor authentication for privileged and business-critical access | critical | 10 |
| REC-IA-003 | IA-003 Individual accounts vs shared credentials? | Eliminate shared credentials in favor of individual user accounts | medium | 6 |
| REC-IA-004 | IA-004 Separate privileged admin accounts? | Separate privileged administrator accounts from everyday user accounts | high | 8 |
| REC-IA-005 | IA-005 Joiner/mover/leaver process? | Document and operate a joiner–mover–leaver access process | high | 8 |
| REC-IA-006 | IA-006 Least privilege? | Apply least-privilege access aligned to job roles | critical | 10 |
| REC-IA-007 | IA-007 Modern password policy centrally enforced? | Enforce modern password and authentication policies centrally | medium | 6 |
| REC-IA-008 | IA-008 Remote access strong auth + encryption? | Secure remote access with strong authentication and encryption | medium | 6 |
| REC-IA-009 | IA-009 Periodic permission reviews? | Review user permissions on a recurring schedule | low | 4 |
| REC-IA-010 | IA-010 IAM ownership assigned? | Assign clear ownership for identity and access management | low | 3 |

### Security Operations

| ID | Question | Title (draft) | Priority (kept) | Pts |
| --- | --- | --- | --- | --- |
| REC-SO-001 | SO-001 Security event monitoring? | Implement monitoring for security-relevant system events | critical | 10 |
| REC-SO-002 | SO-002 Regular vulnerability assessment? | Assess and remediate vulnerabilities on a regular schedule | critical | 10 |
| REC-SO-003 | SO-003 Prompt security updates? | Apply security updates promptly across critical systems | high | 8 |
| REC-SO-004 | SO-004 Security awareness training? | Deliver recurring security awareness training for employees | high | 8 |
| REC-SO-005 | SO-005 Incident response process? | Establish a practical incident response process | critical | 10 |
| REC-SO-006 | SO-006 Security log retention? | Retain security logs long enough to support investigations | high | 8 |
| REC-SO-007 | SO-007 Periodic technology risk review? | Review technology and security risks on a recurring cadence | medium | 6 |
| REC-SO-008 | SO-008 Third-party risk considered? | Include third-party and vendor access in security risk decisions | low | 4 |
| REC-SO-009 | SO-009 Security ownership assigned? | Assign clear ownership for security operations responsibilities | low | 4 |
| REC-SO-010 | SO-010 Continuous security improvement? | Continuously improve security practices based on incidents and reviews | low | 4 |

Full prose is in the catalog JSON (`title`, `businessImpact`, structured `description`).

---

## 3. Proposed priority changes

**No priority values were changed in the catalog.** Weight-aligned defaults remain. Optional elevations for reviewer decision:

| ID | Existing | Proposed | Rationale | Applied? |
| --- | --- | --- | --- | --- |
| REC-IA-003 | medium | **high** | Shared credentials undermine attribution and offboarding; common SMB breach/accountability issue beyond weight-3 default | No — awaiting approval |
| REC-IA-008 | medium | **high** | Weak remote access is a frequent ransomware entry path for hybrid SMBs; urgency often exceeds weight-3 default | No — awaiting approval |
| REC-SO-009 | low | **medium** | Unclear security ownership amplifies every other SO control failure; slightly underweighted as low | No — awaiting approval |

All other B1 priorities judged reasonable relative to question weight and SMB risk — **no change proposed**.

---

## 4. Content quality review table

| ID | Question | Existing pri | Proposed pri | Content review status | Technical concerns | Approval recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| REC-IA-001 | IA-001 | critical | critical | Draft complete — standard sections present; assessment-framed | None for triggers/IDs | Approve content; keep pri |
| REC-IA-002 | IA-002 | critical | critical | Draft complete | None | Approve content; keep pri |
| REC-IA-003 | IA-003 | medium | high (optional) | Draft complete | Priority optional elevate | Approve content; decide pri |
| REC-IA-004 | IA-004 | high | high | Draft complete | None | Approve content; keep pri |
| REC-IA-005 | IA-005 | high | high | Draft complete | None | Approve content; keep pri |
| REC-IA-006 | IA-006 | critical | critical | Draft complete | None | Approve content; keep pri |
| REC-IA-007 | IA-007 | medium | medium | Draft complete | None | Approve content; keep pri |
| REC-IA-008 | IA-008 | medium | high (optional) | Draft complete | Priority optional elevate | Approve content; decide pri |
| REC-IA-009 | IA-009 | low | low | Draft complete | None | Approve content; keep pri |
| REC-IA-010 | IA-010 | low | low | Draft complete | None | Approve content; keep pri |
| REC-SO-001 | SO-001 | critical | critical | Draft complete | None | Approve content; keep pri |
| REC-SO-002 | SO-002 | critical | critical | Draft complete | None | Approve content; keep pri |
| REC-SO-003 | SO-003 | high | high | Draft complete | None | Approve content; keep pri |
| REC-SO-004 | SO-004 | high | high | Draft complete | None | Approve content; keep pri |
| REC-SO-005 | SO-005 | critical | critical | Draft complete | None | Approve content; keep pri |
| REC-SO-006 | SO-006 | high | high | Draft complete | None | Approve content; keep pri |
| REC-SO-007 | SO-007 | medium | medium | Draft complete | None | Approve content; keep pri |
| REC-SO-008 | SO-008 | low | low | Draft complete | None | Approve content; keep pri |
| REC-SO-009 | SO-009 | low | medium (optional) | Draft complete | Priority optional elevate | Approve content; decide pri |
| REC-SO-010 | SO-010 | low | low | Draft complete | None | Approve content; keep pri |

**Review notes**

- Findings explicitly distinguish assessment self-report from verified evidence.
- Actions are provider-agnostic (usable by client’s existing IT).
- `suggestedService` specialized to “Identity & Access Improvement” / “Security Operations Improvement” (not a delivery prerequisite).
- `isStub: true` — client portal / email gates still withhold these rows.

---

## 5. Technical validation results

| Check | Result |
| --- | --- |
| Catalog JSON parse | Pass |
| B1 count / IDs unique | 20 / unique |
| Question associations preserved | Pass |
| Pillars preserved | Pass |
| Triggers unchanged (`No`\|`Partially`, `alsoTriggerOnPartial: true`) | Pass |
| `isStub` still true for B1 | Pass |
| Non-B1 still mechanical stubs | Pass (60 remain `Improve …`) |
| Automated tests | **511 / 511 passed** (includes `tests/recommendations/batch-b1-catalog.test.ts`) |
| Lint | **0 errors** (pre-existing warnings only) |
| Production build | **Success** |

Seeded DB `RecommendationTemplate` / existing `AssessmentRecommendation` rows are **not** rewritten in this batch. After stub clearance, a separate sync/backfill policy should update template rows without clobbering consultant-edited recommendation records (per OPT-003A).

---

## 6. Files modified

| File | Change |
| --- | --- |
| `data/RecommendationCatalogV2.json` | Draft content for REC-IA-001…010 and REC-SO-001…010; `isStub` remains true |
| `docs/SS-OPT-003B-BATCH-B1-REVIEW.md` | This review package |
| `docs/DOC-000 – Documentation Architecture & Index.md` | Index entry |
| `tests/recommendations/batch-b1-catalog.test.ts` | Structural regression checks for B1 drafts |
| `tests/assessment-library/backfill-v2-metadata.test.ts` | Expectation updated for IA-001 `suggestedService` |

---

## 7. Remaining concerns

1. **Stub gate still active** — drafts are invisible to clients until `isStub: false`.
2. **PDF** — consultant PDFs may still list stub recommendations (OPT-003A R-004); decide policy before client-facing PDF.
3. **DB template sync** — runtime DB copies of titles/descriptions may lag JSON until seed/backfill.
4. **Optional priority elevations** — not applied; approve or reject in checklist.
5. **Partially vs No** — shared template wording covers both triggers; future batch may nuance if needed.
6. **Batches B2–B5** — still stub quality; do not clear global stubs.

---

## 8. Explicit approval checklist

Approve **content** (set `isStub: false` only for checked IDs):

- [ ] REC-IA-001
- [ ] REC-IA-002
- [ ] REC-IA-003
- [ ] REC-IA-004
- [ ] REC-IA-005
- [ ] REC-IA-006
- [ ] REC-IA-007
- [ ] REC-IA-008
- [ ] REC-IA-009
- [ ] REC-IA-010
- [ ] REC-SO-001
- [ ] REC-SO-002
- [ ] REC-SO-003
- [ ] REC-SO-004
- [ ] REC-SO-005
- [ ] REC-SO-006
- [ ] REC-SO-007
- [ ] REC-SO-008
- [ ] REC-SO-009
- [ ] REC-SO-010

Priority decisions:

- [ ] Keep all B1 priorities as-is **or**
- [ ] Apply REC-IA-003 → high
- [ ] Apply REC-IA-008 → high
- [ ] Apply REC-SO-009 → medium

Post-approval engineering (separate task — not done here):

- [ ] Flip approved IDs to `isStub: false`
- [ ] Define template DB backfill that skips consultant-edited recommendation rows
- [ ] Confirm client visibility tests for cleared stubs
- [ ] Begin Batch B2 only after B1 approval

**Stop point:** Batch B1 drafts are ready for human review. No automatic publish. No deploy.
