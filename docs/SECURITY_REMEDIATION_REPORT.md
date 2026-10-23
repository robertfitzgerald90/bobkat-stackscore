# StackScore API Security Remediation

Phase 1 closed the client-isolation gaps named in `docs/STACKSCORE_PRODUCT_DISCOVERY.md` (section 11).

SS-OPT-001 is the second validation and hardening pass: recommendation field filtering, anti-enumeration for resource ids, technician permission documentation, resolution of the previously failing test suite, and a full quality gate.

Authorization remains enforced in route handlers. Middleware still does not protect `/api`.

Roles in the database are `admin`, `technician`, and `client`. Technician remains the combined consulting role used by `requireConsultantOrAdmin` (DOC-122 v1 mapping). This work does not add per-client staff assignment.

---

## Phase 1 summary (initial remediation)

### Vulnerabilities closed

1. Authentication without authorization on client, project, assessment, and dashboard routes.
2. Client enumeration via `GET /api/v1/clients`.
3. Unscoped client create and patch (including consulting notes).
4. Firm-wide dashboard summary for any logged-in user.
5. Unscoped project list, read, and patch.
6. Unscoped assessment list, create, and history.
7. Unscoped technology and business profile reads.
8. Assessment PDF, improvement, and recommendation list by foreign id.
9. Recommendation patch by any logged-in user.
10. Quarterly review GET without workspace ownership.
11. Customer 360 available to portal users.
12. Draft and internal-review phase proposals visible to portal users.
13. Nested `Client.notes` and `Assessment.internalNotes` on portal reads.

### Routes modified in Phase 1

Clients list/create/read/patch, dashboard summary, projects list and by-id, client projects, assessments and history, technology profile, business profile GET, assessment PDF/improvement/recommendations, recommendation PATCH, QBR by id, Customer 360, and phase-proposal visibility.

Helpers used: `requireClientWorkspaceAccess`, `requireAssessmentAccess`, `requireConsultantOrAdmin`, `requireAdmin`.

---

## SS-OPT-001 — Additional findings and remediation

### 2.1 Recommendation visibility

**Finding.** Portal users who could read their own assessments also received consulting fields: `latestTriggerReason` (question/answer engine evidence), `templateCode`, `dedupeKey`, `consolidationGroupId`, and `createdByUserId`. DOC-122 §10 and §12 hide assessor evidence, playbook identifiers, and recommendation engine logic. Suggested service names remain client-visible as business services, not playbook codes.

**Remediation.** Added `src/lib/recommendations/visibility.ts` with `presentRecommendationForRole` / `presentRecommendationsForRole`. Applied on:

- `GET /api/v1/assessments/[id]`
- `GET /api/v1/assessments/[id]/recommendations`
- `getClientRecommendations` (portal page and technology profile detail)

Portal assessment reads also null out assessor email.

### 2.2 Resource enumeration

**Finding.** `requireAssessmentAccess` returned 404 for missing assessments and 403 for foreign ones. `GET /api/v1/projects/[id]` did the same. A portal user who could guess UUIDs could tell those cases apart.

**Remediation.** Unauthorized portal access to assessments and projects now returns the same not-found response as a missing row. Workspace access by client id in the URL still returns 403 without a client lookup, which does not reveal whether that client exists.

### 2.3 Technician authorization model (documented, unchanged)

| Capability | Technician | Admin |
| --- | --- | --- |
| Consulting reads/writes via `requireConsultantOrAdmin` | Yes | Yes |
| Create clients, assessments, projects; patch recommendations | Yes | Yes |
| Firm dashboard summary, insights, consulting workspace | Yes | Yes |
| Delete clients / assessments / projects / recommendations | No | Yes |
| User management | No | Yes |
| Portfolio summary | No | Yes |
| Archive / restore clients | No | Yes |
| Assessment library admin | No | Yes |
| Per-client staff assignment | Not implemented | Not implemented |

Technician continues to act as the DOC-122 Consultant + Technician combined role across all clients. This milestone does not introduce assignment scoping.

### 2.4 Additional review notes

| Area | Result |
| --- | --- |
| Nested proposal / QBR / invoice ids | Parent `clientId` required; proposal draft statuses hidden from clients; invoice fetch scoped by billing helpers |
| PDF generation | Assessment PDF requires `requireAssessmentAccess` before load; QBR and phase-proposal PDFs require workspace access |
| Assessment history | Workspace ownership enforced |
| Cross-client body `clientId` | Onboarding ignores body `clientId`; project create checks recommendation ownership |
| Server pages | Workspace layout redirects remain a second layer; APIs are the control that matters for direct requests |
| Demo managed-endpoint rate | `DEFAULT_DEMO_PRICING` had `$50/device` while its comment and the interactive demo used `$15/device`. Restored `$15` (1500 cents) so demo financials match catalog assumptions |

No additional high-severity cross-client API holes were found beyond the Phase 1 list and the SS-OPT-001 items above.

---

## Files modified (SS-OPT-001)

| File | Change |
| --- | --- |
| `src/lib/recommendations/visibility.ts` | New client-facing recommendation field filter |
| `src/lib/recommendations/index.ts` | Export visibility helpers |
| `src/lib/recommendations/client-list.ts` | Role-aware presentation |
| `src/lib/api/access.ts` | Assessment foreign access → not found |
| `src/app/api/v1/projects/[id]/route.ts` | Foreign project → not found for portal |
| `src/app/api/v1/assessments/[id]/route.ts` | Filter recommendations; hide assessor email |
| `src/app/api/v1/assessments/[id]/recommendations/route.ts` | Filter recommendations |
| `src/app/(dashboard)/clients/[id]/recommendations/page.tsx` | Pass role into list |
| `src/lib/technology-profile/detail.ts` | Pass role into recommendation list |
| `src/lib/demo-data/demo-financial-profile.ts` | Restore $15/device managed-endpoint rate |
| `src/lib/technology-improvement-plan/tip-preview-controls.ts` | Duck-typed editable target check (testable without DOM) |
| `tests/auth/api-client-isolation.test.ts` | Enumeration + recommendation field assertions |
| `tests/recommendations/visibility.test.ts` | New unit tests |
| Previously failing product tests | Updated to current intended behavior (see below) |

---

## Tests added or updated

### Security

- `tests/recommendations/visibility.test.ts` — staff keep engine fields; clients lose trigger/template/dedupe/creator fields; service names remain.
- `tests/auth/api-client-isolation.test.ts` — foreign assessment/project ids return 404; own assessment strips consulting recommendation fields and assessor email.

### Previously failing suite (classification)

| Test | Classification | Action |
| --- | --- | --- |
| `command-center` Assessment Dashboard | Outdated expectation | Assert `Resume Assessment` |
| `demo-financial-profile` (3) | Application defect (pricing cents) | Restored $15/device; tests pass |
| `responsive-layout` overflow | Outdated expectation | Match Tailwind `overflow-x-clip` |
| `page-titles` technology-profile | Intentional product title | Expect `Executive Briefing` |
| `assessment-funnel` next.config | Outdated expectation | Allow legacy redirects *to* invitation |
| `interactive-demo-journey` (3) | Outdated expectations | Align phase rate, Living Execution Plan title, $500 vCIO |
| `tip-preview-controls` (3) | Outdated / Node DOM | Match fit-width math; DOM-free fakes |

None of those failures were caused by weakening authorization.

---

## Validation results

| Command | Result |
| --- | --- |
| `npx vitest run tests/auth/api-client-isolation.test.ts` | 14 passed |
| `npx vitest run tests/recommendations/visibility.test.ts` | 3 passed |
| `npm test` | **114 files, 488 passed, 0 failed** |
| `npm run lint` | Exit 0 — 0 errors, 32 pre-existing warnings |
| `npm run build` | Exit 0 (retry after a transient Turbopack Google Fonts lookup failure unrelated to authorization) |

Type checking is covered by the production build (`prisma generate && next build`).

### Browser / session verification

Not run in this pass. Handler tests use a mocked session user. Cookie/session hardening, real login as admin/technician/client, and browser-level cross-client attempts remain manual (see below).

---

## Remaining security risks

1. **Technician is firm-wide.** DOC-122’s future Technician row limits work to assigned records. The running model still allows technician consulting access to every client. Acceptable for current Bobkat operations; not multi-tenant staff isolation.
2. **Suggested service names.** Clients still see `suggestedService`. That matches DOC-122’s allowance for client-facing services. Playbook codes stay hidden.
3. **Server component data paths.** Some dashboard pages load Prisma directly. Portal layout redirects reduce accidental UI access; APIs remain the authoritative control for direct requests.
4. **One portal user per client.** `User.clientId` is unique.
5. **Public checkout metadata.** Optional ids may still be copied into Stripe metadata; fulfillment is signature-based.
6. **No browser session proof.** Production cookie flags and live multi-role login were not exercised here.

No known high-severity cross-client API isolation holes remain in the reviewed surface.

---

## Manual verification requirements

1. Sign in as a **client**. Confirm `GET /api/v1/clients` returns only that company; foreign client, assessment, and project ids return forbidden or not-found without leaking consulting fields.
2. As that client, open own assessment JSON / recommendations and confirm trigger reasons, template codes, and assessor email are absent; title, impact, and suggested service remain.
3. Attempt `PATCH` on clients, recommendations, and projects as a client — expect 403 and no DB change.
4. Sign in as a **technician**. Confirm consulting create/update works; client delete and portfolio summary return 403.
5. Sign in as an **admin**. Confirm delete and portfolio summary still work.
6. Optional browser pass: log in as each role and attempt the same URLs from the network panel.

---

## Production-readiness assessment

| Criterion | Status |
| --- | --- |
| High-severity client isolation on reviewed APIs | Met |
| Client responses exclude consulting-only recommendation fields | Met |
| Authorization before protected mutations | Met |
| Security regression tests | Met (isolation + visibility) |
| Full automated suite | Met (488/488) |
| Production build | Met |
| Manual browser/session verification | Outstanding — document before issuing customer passwords in a multi-client environment |

**Judgment.** The API authorization and isolation work is ready for a multi-client staff-operated deployment. Issuing customer portal passwords is reasonable after the manual checklist above is completed once against a staging (or carefully controlled production) environment with at least two client records.
