# SS-REL-008 — Assessment Lifecycle Investigation

| Field | Value |
| --- | --- |
| Status | **Investigation complete — no implementation** |
| Date | 2026-10-26 |
| Branch | `staging` @ `12a7733` |
| Database | Neon Staging (read-only) |
| Constraints | No creates/resets/entitlement or scoring changes; no production changes |

### Exact restriction (staging customer)

The customer **cannot start another assessment** because:

1. **UI** — `Assess Client` is hidden for `role === "client"` (`showAssessClient = role !== "client"`).
2. **Client entry route** — `/assessment/start` only resumes a **draft** v2 assessment; with **zero drafts** after completion it redirects to the technology profile (not a create flow).
3. **Backend authorization** — `POST /api/v1/clients/[id]/assessments` requires **consultant or admin** (`requireConsultantOrAdmin`). Clients are rejected even if they call the API directly.

This is **not** enforced by a database unique “one assessment per client,” and **not** by a purchase-entitlement check on reassessment create. One Stripe purchase provisions **one** linked draft assessment at fulfillment; after that draft is completed, the **client role has no create path**.

---

## Answers to investigation questions

| # | Question | Answer |
| --- | --- | --- |
| 1 | Can a customer create another assessment for the same organization? | **No** (client role). They can only resume an existing **draft**. |
| 2 | Limit to one assessment per purchase? | **Yes, at fulfillment** — purchase creates one `Assessment` and sets `AssessmentPurchase.assessmentId` (`@unique`). That does **not** DB-block later staff reassessments for the same client. |
| 3 | Can administrators initiate reassessments? | **Yes** — staff use **Assess Client** / reassessment forms → `createReassessment` via `POST .../assessments` with `reassessment: true` (consultant/admin). |
| 4 | Are completed assessments immutable? | **Yes (API)** — response PUT and complete routes conflict when `status !== "draft"` (“Cannot modify a completed assessment” / “already completed”). |
| 5 | Preserve assessment history? | **Yes** — prior rows remain; `getClientAssessmentHistory`; `ClientScoreHistory` + `TechnologyProfileSnapshot` on complete; `sourceAssessmentId` links reassessments. |
| 6 | Compare multiple assessments over time? | **Yes for staff** — compare API/UI when ≥2 completed (`buildAssessmentComparison`, improvement summary). **Clients** are redirected away from the assessments hub; compare route is staff-gated. |
| 7 | What prevents the staging customer from starting another? | No draft + no client create UI + staff-only POST (see exact restriction). Staging sample: **ABC LLC** — 1 completed `initial`, 0 drafts, score history/snapshot present. |
| 8 | Enforcement layer? | **Primary: UI + backend RBAC.** Secondary: purchase fulfillment only creates one assessment. **Not** a client-level DB uniqueness constraint; **not** a reassessment entitlement gate. |

---

## Staging evidence (read-only, redacted)

Latest fulfilled purchase path examined:

| Field | Value |
| --- | --- |
| Purchase | `fulfilled`, linked `assessmentId` set |
| Client | ABC LLC |
| User | `client`, active |
| Assessments | **1** — `initial` / `completed` / overall **39** |
| Drafts | **0** |
| Reassessment link | none (`sourceAssessmentId` null) |
| Profile | `currentAssessmentId` → that assessment; `nextRecommendedAssessmentAt` ≈ **+1 year** |
| History artifacts | `ClientScoreHistory` = 1; `TechnologyProfileSnapshot` = 1 |

Implication: `/assessment/start` → no draft → technology profile. Next-action derivation prefers report/priorities, **not** “start reassessment.”

---

## How the system works today

### Purchase → first assessment

`fulfillTechnologyAssessmentPurchase` creates **one** draft `Assessment` (`assessmentType: initial` / name “Technology Assessment”) and links it on `AssessmentPurchase.assessmentId` (schema `@unique`). Completing that draft is the customer’s purchased path via `/assessment/start` → `/assessments/[id]`.

### After completion (client)

| Surface | Behavior |
| --- | --- |
| `/assessment/start` | Latest **draft** only (`getLatestDraftAssessmentForClientUser`); else profile/onboarding redirect |
| Customer next action | Resume draft **or** review report / recommendations — no “create reassessment” |
| Workspace header | `showAssessClient === false` for clients |
| Assessments hub `/clients/[id]/assessments` | Clients redirected to technology profile |

### Staff reassessment (already implemented)

| Piece | Location |
| --- | --- |
| Create | `createReassessment` in `src/lib/assessments/reassessment.ts` — new draft, `sourceAssessmentId`, copies prior responses |
| Auto naming/type | `resolveAutoAssessmentParams` (`followup` / `quarterly` / `annual` by elapsed time / overdue window) |
| API | `POST /api/v1/clients/[id]/assessments` — **consultant/admin only** |
| UI | `AssessClientButton`, `ReassessmentForm` |
| History | `GET .../assessments/history` (client-scoped workspace access) |
| Compare | `GET .../assessments/compare` — **consultant/admin**; UI when ≥2 completed |
| Improvement | `buildImprovementSummary` for completed reassessment vs baseline |

### Immutability & history

- Completed assessments are not editable via assessment response/complete APIs.
- Multiple `Assessment` rows per `clientId` are allowed (no “single assessment per client” unique index).
- Recommendations dedupe across reassessments by capability (workflow state preserved) — separate from create entitlement.

### Entitlements / subscription

- **No** runtime check that a reassessment requires a second purchase or active vCIO subscription.
- Marketing/vCIO copy mentions annual reassessment; **not** wired as a gate on `createReassessment`.
- Product goals (subscription-based reassessment entitlements, client self-serve reassessment) are **future work** — not implemented.

---

## Product requirements vs current state

| Desired capability | Current state |
| --- | --- |
| Initial purchased assessments | **Implemented** |
| Reassessments for existing orgs | **Staff-initiated only** |
| Historical scoring / recommendations | **Implemented** (rows + history/snapshots; client UX limited) |
| Maturity comparisons over time | **Staff tools exist**; need ≥2 completed |
| Administrator-initiated reassessments | **Implemented** |
| Subscription-based reassessment entitlements | **Not implemented** |
| Customer self-serve reassessment | **Not implemented** |

---

## Safe approach for testing reassessments (staging)

Do **not** reset or delete the completed purchase assessment. Do **not** modify entitlements or scoring.

### Recommended (staff-driven)

1. Sign in as **admin** or **technician** on staging.
2. Open client **ABC LLC** (or the target client) technology profile / workspace.
3. Click **Assess Client** (creates reassessment draft via auto params; or use Reassessment form with explicit baseline).
4. Complete the draft reassessment in the wizard (pre-filled answers may be present — change as needed for a meaningful delta).
5. Verify:
   - New `Assessment` with `sourceAssessmentId` → baseline
   - Baseline remains `completed` / unchanged scores
   - History lists both; Compare enabled with ≥2 completed
   - Profile `currentAssessmentId` / score history updated per complete flow

### Alternate (second purchase)

A **new** Stripe sandbox purchase with a **new** email creates a **new** client + initial assessment — it does **not** add a reassessment onto ABC LLC. Use only if testing purchase→provision, not same-org lifecycle.

### Avoid for this investigation’s goals

- Client self-serve “start another” (blocked by design today)
- DB edits / status resets of the completed assessment
- Production

---

## Enforcement summary

```
Client wants another assessment
  ├─ UI: Assess Client hidden                          ← blocks
  ├─ /assessment/start: requires draft                 ← blocks when completed
  ├─ POST /clients/:id/assessments: consultant/admin   ← blocks API
  ├─ Purchase entitlement on reassessment              ← not checked
  └─ DB unique(one assessment per client)              ← does not exist
```

**Primary blockers for the staging customer:** UI role gate + draft-only start route + staff-only create API.

---

## Recommendations (do not implement in this ticket)

1. Keep staff reassessment as the supported staging test path (above).
2. Future product: explicit client reassessment entitlement (purchase add-on or vCIO) before exposing a create CTA.
3. Future: surface history/compare appropriately in the customer portal once entitlements exist.
4. Document for ops: one-time purchase ≠ unlimited self-serve reassessments under current RBAC.

---

## Key code references

| Concern | Path |
| --- | --- |
| Client start / draft only | `src/app/assessment/start/page.tsx`, `src/lib/auth/client-access.ts` |
| Hide Assess Client for clients | `src/app/(dashboard)/clients/[id]/layout.tsx` |
| Staff create / reassessment API | `src/app/api/v1/clients/[id]/assessments/route.ts` |
| Reassessment service | `src/lib/assessments/reassessment.ts` |
| Auto initial vs reassess | `src/lib/assessments/auto-assessment.ts` |
| Immutability | `src/app/api/v1/assessments/[id]/responses/[questionId]/route.ts`, `.../complete/route.ts` |
| Compare (staff) | `src/app/api/v1/clients/[id]/assessments/compare/route.ts` |
| Purchase → one assessment | `src/lib/stripe/fulfillment/technology-assessment.ts`, `AssessmentPurchase.assessmentId` |
