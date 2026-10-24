# SS-OPT-003B — Batch B1 Production Readiness Audit

**Document ID:** SS-OPT-003B-B1-AUDIT  
**Status:** Complete (validation-only; no remediation applied)  
**Date:** October 23, 2026  
**Scope:** Batch B1 publication readiness prior to production DB sync and Batch B2  
**Related:** [`SS-OPT-003B-B1-FINALIZATION-REPORT.md`](SS-OPT-003B-B1-FINALIZATION-REPORT.md), [`SS-OPT-003B-B1-CONTENT-APPROVAL.md`](SS-OPT-003B-B1-CONTENT-APPROVAL.md), [`SS-OPT-003B-BATCH-B1-REVIEW.md`](SS-OPT-003B-BATCH-B1-REVIEW.md), [`SS-OPT-003A-RECOMMENDATION-AUDIT.md`](SS-OPT-003A-RECOMMENDATION-AUDIT.md)

**Constraints honored:** No production deploy, no production DB sync, no Batch B2, no scoring/weight changes, no approved-content rewrites, no automatic defect remediation. Isolated audit tests only (`tests/recommendations/b1-production-readiness-audit.test.ts`).

---

## 1. Executive summary

Batch B1 catalog content, publication flags, engine trigger behavior, assessment-sync preservation rules, and primary client portal/API/PDF gates validate successfully under automated tests (**543/543 passed**).

However, production readiness is blocked by a **Critical** compile failure in the client-roadmap stub-title filter, and two **High** delivery-gap findings remain on secondary client-facing paths (published TIP/proposal assembly and assessment-complete email missing-code handling).

**Readiness recommendation: NOT READY**

Do not begin Batch B2. Do not run production database synchronization until Critical/High items are remediated and re-audited.

---

## 2. Test coverage matrix

| Area | Automated | Manual browser | Notes |
| --- | --- | --- | --- |
| Catalog integrity (80/20/60, IDs, fields, editorial, priorities) | Yes | N/A | Audit + batch-b1 tests |
| Engine triggers (Yes/No/Partial), dedupe, status preservation | Yes | N/A | Unit + audit lifecycle |
| Assessment sync content/priority preservation | Contract/source | N/A | No live DB integration harness |
| Template sync + Improve-title refresh | Mocked | N/A | Isolated Prisma mocks |
| Client portal / assessment APIs / assessment PDF | Unit + source contract | Not executed | Role filters verified in code/tests |
| Email / roadmap / TIP proposal paths | Source contract + unit | Not executed | Gaps documented |
| Maturity scenarios A–D | Engine-level automated | Full UI/PDF not executed | Generation + visibility only |
| Lint / tsc / build | Yes | N/A | Build currently fails |

---

## 3. Tests executed and results

| Suite / check | Result |
| --- | --- |
| Full Vitest suite | **119 files / 543 tests passed** (0 failed) |
| New audit tests | **24 passed** (`b1-production-readiness-audit.test.ts`) |
| Recommendation domain tests | All passed |
| ESLint | **0 errors**, 32 pre-existing warnings |
| `tsc --noEmit` | Failures present (see §10) |
| `npm run build` | **Failed** (Critical — see DEF-001) |

Automated test pass rate does **not** imply deploy readiness while the production build fails.

---

## 4. Catalog integrity findings

| Check | Result |
| --- | --- |
| Exactly 80 templates | Pass |
| Exactly 20 B1 published (`isStub: false`) | Pass |
| Exactly 60 unpublished stubs | Pass |
| Unique template IDs | Pass |
| Valid pillar + question references (`REC-{questionId}`) | Pass |
| Published templates have required fields | Pass |
| No published placeholder language (`Improve …`, TODO/TBD/lorem, mechanical “Address gaps…”) | Pass |
| Priorities: IA-003/IA-008 high; SO-009 medium | Pass |
| Editorial titles + SO-002 BI opener preserved | Pass |
| Catalog ↔ question library resolution | Pass |

**Discrepancies:** None requiring catalog modification. Catalog description metadata still says stub-oriented wording at file header level (informational only; not customer-facing).

---

## 5. Recommendation engine findings

| Lifecycle concern | Result |
| --- | --- |
| New generation from No answers | Pass — B1 (and stubs) generate from catalog |
| Fully implemented (Yes) | Pass — no triggers |
| Partially implemented | Pass — `alsoTriggerOnPartial` fires |
| Malformed/missing template codes | Pass — ignored by evaluator |
| Deduplication key stability | Pass — `template:{code}` |
| Retrigger status preservation | Pass — accepted/in_progress/deferred preserved |
| Declined reopen policy | Pass — critical/high only |
| Content/priority preservation on assessment sync | Pass (contract) — active/declined/completed updates omit content fields |
| Scoring formulas / question weights | Unchanged (not modified; out of scope) |

Engine behavior remains consistent with existing trigger specifications. Generated priorities for new rows follow current catalog defaults (including approved B1 priority elevations).

---

## 6. Database synchronization findings

| Requirement | Result |
| --- | --- |
| `syncRecommendationTemplatesFromCatalog` idempotent upsert | Pass (contract + mock) |
| Does not modify `AssessmentRecommendation` on template sync | Pass |
| Missing categories reported via `skippedMissingCategory` | Pass |
| `refreshUneditedStubRecommendationsFromCatalog` only updates `Improve …` titles | Pass (mock) |
| Edited/non-Improve titles skipped | Pass |
| Assessment sync preserves consultant content + client priorities | Pass (contract) |
| No unintended recommendation deletions in assessment sync | Pass — sync marks `triggeredInLatestAssessment` false; does not delete |
| Failed sync partial-change reporting | **Gap** — loops are not wrapped in `$transaction` (DEF-004) |
| Production sync executed | **Not executed** (by design) |

Safe ops posture remains: manual invocation only; review Improve-title candidates before refresh.

---

## 7. Client delivery findings

### Channels verified as gated (client audience)

| Channel | Gate | Status |
| --- | --- | --- |
| Client recommendations portal / `getClientRecommendations` | `presentRecommendationsForRole` | Pass |
| Assessment APIs | `presentRecommendationsForRole` | Pass |
| Technology profile detail recommendations | Uses `getClientRecommendations(role)` | Pass |
| Assessment PDF export | `filterClientDeliverableRecommendations` + staff `-internal` filename | Pass |
| Client roadmap initiatives | Stub code + Improve-title intent | **Compile broken** (DEF-001) |
| Assessment-complete email | Stub code + Improve-title | Partial — missing codes not fail-closed (DEF-003) |
| TIP wizard UI | Clients redirected away | Pass (route guard) |
| TIP PDF export API | Consultant/admin only | Pass |
| Published proposal / TIP assembly for clients | `assembleTipPlanDetail` / `loadAssessmentRecommendations` | **Not gated** (DEF-002) |

### Negative cases (client filter)

| Case | Expected | Observed |
| --- | --- | --- |
| Stub template code | Hidden | Pass |
| `Improve …` title on published code | Hidden | Pass (visibility helper) |
| Missing template code | Hidden | Pass (portal/PDF filter); **Fail on email** |
| Malformed unknown code | Treated non-stub | Pass for portal (unknown ≠ stub); acceptable for custom codes |
| Staff/admin audience | Retain stubs | Pass |

---

## 8. End-to-end assessment results

Automated engine + visibility scenarios (not full browser sessions):

| Scenario | Generation | Client-visible | Notes |
| --- | --- | --- | --- |
| A — Low maturity (all No) | 80 recommendations | 20 (B1 only) | Pass |
| B — Moderate (all Partial) | 80 | 20 (B1 only) | Pass |
| C — High (all Yes) | 0 | 0 | Pass |
| D — Mixed (weak IA/SO, strong infra) | >20 | 20 B1 IA/SO | Pass |

**Manual browser verification required before production** (not performed in this audit):

- Client login → recommendations list / technology profile
- Client assessment PDF download (no stubs; no `-internal`)
- Staff assessment PDF download (`*-internal.pdf`, stubs allowed)
- Client roadmap after DEF-001 fix
- Client published proposal review after DEF-002 fix
- Assessment-complete email preview after DEF-003 fix

---

## 9. Regression test results

| Check | Result | Classification |
| --- | --- | --- |
| Vitest full suite | 543 passed / 0 failed | Healthy |
| ESLint | 0 errors / 32 warnings | Pre-existing warnings |
| `tsc --noEmit` | Multiple errors | Mix of pre-existing test typing debt + **new** DEF-001 |
| Production build | Failed on DEF-001 | **New / blocking** |

Pre-existing `tsc` errors in unrelated tests (`next-action`, `env`, TIP fixtures, etc.) existed before this audit and are **not** treated as B1 blockers except where they overlap the build path. Next.js build type-checks application source and **fails on DEF-001**.

---

## 10. Identified defects

### DEF-001 — Client roadmap Improve-title filter breaks production build  
**Severity: Critical**  
**Location:** `src/lib/client-roadmap/service.ts` (`hasUnpublishedStubTitle(recommendation.title)`)  
**Evidence:** `npm run build` and `tsc` report `Property 'title' does not exist` on the recommendation include type used by `toPhaseView`. Initiative title lives on `initiative.title`; recommendation select does not include `title`.  
**Impact:** Application cannot be built/deployed.  
**Remediation (proposed, not applied):** Filter using `initiative.title` and/or select `title` on recommendation; re-run build.

### DEF-002 — Published TIP / proposal assembly omits publication filters  
**Severity: High**  
**Location:** `src/lib/technology-improvement-plan/service.ts` (`loadAssessmentRecommendations` → `assembleTipPlanDetail` → `getPublishedProposalDetail`)  
**Evidence:** Audit source contract — no `isStubRecommendationTemplate` / `filterClientDeliverableRecommendations` / `hasUnpublishedStubTitle`. Clients can access `/clients/[id]/proposals/[tipId]` (workspace section resolves to client-visible). Improvement-plan wizard redirects clients, but published proposals do not inherit the portal recommendation gate.  
**Impact:** Stub or stale Improve-title recommendations can appear in client-facing proposal/TIP detail payloads.  
**Remediation (proposed):** Apply the same fail-closed filter when `role === "client"` (and any other client-facing TIP serializers).

### DEF-003 — Assessment-complete email does not fail-closed on missing template codes  
**Severity: High**  
**Location:** `src/lib/communications/workflows/triggers.ts`  
**Evidence:** Filter removes stubs and Improve titles only; `!isStubRecommendationTemplate(undefined)` evaluates true, so template-less rows remain eligible for email snippets. Portal/PDF filters hide missing codes.  
**Impact:** Inconsistent delivery policy; unlinked custom/orphan rows could leak into automated email copy.  
**Remediation (proposed):** Require resolvable template code for client email inclusion (align with `isClientDeliverableRecommendation`).

### DEF-004 — Template/refresh sync loops lack transactional boundaries  
**Severity: Medium**  
**Location:** `src/lib/recommendations/sync-catalog-templates.ts`  
**Evidence:** No `$transaction`; mid-run failure can leave partial template upserts or partial Improve-title refreshes without an atomic rollback.  
**Impact:** Ops risk during manual sync; not a silent client-delivery leak by itself.  
**Remediation (proposed):** Wrap sync/refresh in a transaction; emit structured success/failure summary before commit where practical.

### DEF-005 — Staff PDF can still contain unpublished stubs  
**Severity: Low** (accepted design risk from finalization)  
**Location:** Assessment PDF route allows stubs for non-client roles; `-internal` suffix only.  
**Impact:** Accidental client handoff of internal PDF remains possible.  
**Remediation (proposed):** Process/training; optional stronger watermark later (out of scope).

### DEF-006 — No edit-origin flag for consultant overrides  
**Severity: Medium** (known limitation)  
**Location:** `AssessmentRecommendation` model / refresh heuristic  
**Impact:** Optional Improve-title refresh may overwrite rare consultant edits that still start with `Improve `.  
**Remediation (proposed):** Dry-run review before refresh; longer-term explicit `contentSource` / edited-at flag.

---

## 11. Severity classifications

| ID | Severity | Blocks deploy? |
| --- | --- | --- |
| DEF-001 | Critical | Yes |
| DEF-002 | High | Yes (safe client delivery) |
| DEF-003 | High | Conditional (email path) |
| DEF-004 | Medium | No (ops hardening) |
| DEF-005 | Low | No |
| DEF-006 | Medium | No (process control) |

---

## 12. Recommended remediation

Order of work (awaiting approval; **not started**):

1. **Fix DEF-001** and confirm `npm run build` passes.
2. **Close DEF-002** by filtering TIP/proposal recommendation lists for client audiences.
3. **Close DEF-003** by aligning email filtering with `isClientDeliverableRecommendation` (or equivalent fail-closed helper).
4. Add/adjust focused tests for TIP proposal + email missing-code cases.
5. Re-run full suite + build.
6. Optionally harden DEF-004 before first production template sync.
7. Only then: deploy app+catalog → manual `syncRecommendationTemplatesFromCatalog` → reviewed Improve-title refresh → browser smoke.

Do **not** start Batch B2 until this audit is cleared to READY or READY WITH CONDITIONS with explicit acceptance of residual risks.

---

## 13. Remaining risks

1. Existing production `AssessmentRecommendation` rows may still carry Improve titles for B1 codes (hidden from portal once filters work; consultants still see them until refresh).
2. `RecommendationTemplate` DB rows lag catalog until manual sync.
3. Browser/PDF/email smoke in a real environment was not executed in this audit.
4. Pre-existing `tsc` debt in unrelated tests remains noise for local typechecks.
5. Sixty unpublished stubs remain intentionally incomplete.

---

## 14. Production deployment readiness assessment

| Criterion | Status |
| --- | --- |
| Catalog B1 content approved & published in JSON | Met |
| Engine/trigger consistency | Met |
| Assessment sync preserves history/edits/priorities | Met |
| Primary portal/API/PDF fail-closed gates | Met (unit) |
| Production build | **Not met (DEF-001)** |
| All client delivery channels fail-closed | **Not met (DEF-002, DEF-003)** |
| Production DB sync executed | Not applicable / deferred |
| Batch B2 | Not started (correct) |

### Explicit recommendation

# NOT READY

**Rationale:** Critical build failure (DEF-001) prevents deployment. High-severity client-delivery gaps on published proposals/TIP assembly (DEF-002) and email missing-code handling (DEF-003) violate the fail-closed publication policy required by Batch B1 finalization.

Await approval to remediate DEF-001–DEF-003 before any production synchronization or Batch B2 work.
