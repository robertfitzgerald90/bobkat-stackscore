# SS-UX-007 — Customer Roadmap Experience

**Branch:** `staging`  
**Date:** 2026-10-29  
**Status:** Implemented (staging only — no production deploy). Readability fix SS-UX-007-FIX appended below.  
**Precedents:** [SS-UX-003](./SS-UX-003-CUSTOMER-PORTAL-VISUAL-FOUNDATION.md), [SS-UX-004](./SS-UX-004-PREMIUM-EXECUTIVE-OVERVIEW.md), [SS-UX-005](./SS-UX-005-INTERACTIVE-PILLAR-EXPLORATION.md), [SS-UX-006](./SS-UX-006-CUSTOMER-IMPROVEMENT-OPPORTUNITIES.md)

**Constraints honored:** No migrations, scoring changes, recommendation catalog modifications, roadmap engine changes, automatic status transitions, PDF redesign, staff dashboard redesign, projected maturity KPI, or production deploy.

---

## 1. Architecture

```
/clients/{id}/roadmap
  → customer ownership check
  → getCustomerRoadmapExperience(clientId, role)
      → getClientRoadmapDashboard (existing scrub + stub filter)
      → list customer-visible projects (existing Project ↔ recommendation)
      → getBookingUrl() (existing support booking)
      → buildCustomerRoadmapExperience (pure)
  → <CustomerRoadmapExperience />
      → executive summary
      → phase grid
      → initiatives → Opportunities deep links
      → projects panel
      → next actions

/clients/{id}/roadmap/phases/{phaseId}
  → PhaseWorkspace (customer: initiative → opportunity links; no projected StackScore meta)
```

Staff path unchanged: `RoadmapDashboard` + TIP planning tools.

| Module | Role |
| --- | --- |
| `src/lib/customer-portal/roadmap-experience.ts` | Assembly |
| `src/lib/customer-portal/roadmap-dto.ts` | Pure DTO / next actions |
| `src/components/customer-portal/roadmap/*` | Customer UI |
| `src/lib/client-roadmap/service.ts` | Additive `categoryCode` on initiative view (select already had category) |

---

## 2. Data sources

| Need | Source |
| --- | --- |
| Official StackScore | `scoreJourney.baselineScore` from scrubbed dashboard |
| Roadmap completion % | `metrics.completionPercent` (`computeRoadmapProgressMetrics`) |
| Current phase | `metrics.currentPhaseName` / first non-terminal phase |
| Initiative totals | `metrics.initiativesTotal|Completed|Remaining` |
| Phases / initiatives | Existing `ClientRoadmapDashboard.phases` (customer-visible only) |
| Initiative status | Linked `AssessmentRecommendation.status` (unchanged) |
| Projects | `Project` rows for client (non-cancelled), deliverable recommendation titles only |
| Booking / support | `getBookingUrl()` or `/support` fallback |
| Footnote | `customerRoadmapProgressFootnote()` |

No new roadmap calculations. No invented phases, dates, dependencies, or initiative↔project mappings.

---

## 3. Executive summary implementation

Industrial summary panel shows:

1. Official StackScore (baseline)  
2. Roadmap Progress % + progress bar  
3. Current implementation phase label  
4. Initiatives completed / total (+ remaining hint)  
5. Explicit footnote distinguishing roadmap progress from official maturity  

Draft badge + draft notice when `status === "draft"`.  
**Does not** show projected StackScore / projected final / domain “+pts” strips on the customer experience.

---

## 4. Phase presentation

Equal-height phase grid (`CLIENT_EQUAL_CARD_GRID`):

- Name, subtitle, purpose (`executiveSummary` when present)  
- Timeline when present  
- Initiative completion counts  
- Status + **Current** indicator  
- Link to existing phase detail route  

Ordering preserved (`sortOrder`). Empty phase set handled with dashed empty copy.

---

## 5. Initiative presentation

Compact list across phases:

- Title, priority, status, phase name  
- Related technology pillar (Explore link when category code resolves)  
- Customer-visible implementation notes (`businessOutcomeDescription`) or business impact excerpt  
- **View opportunity** → `clientRecommendationDetailPath`  

Phase workspace (customer): same opportunity link; hides consultant “estimated priority impact pts” and “Expected StackScore Improvement” meta (shows initiative completion count instead).

---

## 6. Recommendation / project integration

| Integration | Behavior |
| --- | --- |
| Opportunities | Deep links from each initiative; “All opportunities” header action |
| Projects | Panel lists existing projects only; “Open projects” → `/clients/{id}/projects`; register deep links preserved |
| Next actions | Review current phase · Explore recommendations · View projects · Schedule consultation (booking URL) or Support |

No automatic project creation. No financial fields on project tiles.

---

## 7. Authorization validation

| Layer | Enforcement |
| --- | --- |
| Page | Customer `clientId` must match route id |
| Dashboard | Role-aware stub filter + financial scrub |
| Projects | Same deliverable recommendation title gate as Projects page |
| Mutations | None introduced; phase approve / initiative status remain existing permission helpers |
| Staff | Unchanged dashboard + TIP tools |

---

## 8. Automated tests

```
npm test -- tests/ux/ss-ux-007-customer-roadmap-experience.test.ts
npm test -- tests/client-roadmap/
```

**Coverage:** summary metrics from dashboard, phase/initiative links, draft handling, page wiring, no materialize/promote coupling, related client-roadmap suites.

Result (this pass): SS-UX-007 **5** + client-roadmap **10** = **15** tests passed.

---

## 9. ABC LLC staging regression

| Check | Expected / documented |
| --- | --- |
| Official StackScore | **39** |
| DOC-119 maturity | **Initial** (Overview; unchanged) |
| Roadmap initiatives | **13** customer-visible when present |
| Roadmap completion | **0%** when none completed |
| Customer-visible recommendations | **57** remain accessible via Opportunities |
| Projected maturity KPI | **None** on customer Roadmap |
| Roadmap mutations | **None** from this ticket |

Live ABC verification remains a staging preview checklist item.

---

## 10. Manual visual checklist

- [ ] Summary shows Official StackScore vs Roadmap Progress with footnote  
- [ ] Phase grid equal heights; Current phase marked; open phase works  
- [ ] Initiatives link to Opportunities; pillar links to Explore when available  
- [ ] Projects panel only shows real projects; empty state when none  
- [ ] Next actions use existing routes / booking  
- [ ] Draft banner when draft; empty state when no roadmap  
- [ ] No projected StackScore / investment $ on customer surfaces  
- [ ] Phase detail customer view: opportunity links; no impact-guarantee pts  
- [ ] Mobile: readable density; no horizontal overflow  
- [ ] Staff roadmap + TIP tools unchanged  
- [ ] Cross-tenant customer URL → not found  

---

## 11. Remaining issues

1. Long initiative lists (e.g. 13) are compact but not paginated — may need phase filtering later.  
2. Project panel caps at 8 most recent non-cancelled projects; full list remains on Projects page.  
3. Official StackScore on Roadmap uses roadmap baseline journey score (aligned with assessment baseline); Overview continues to use profile overall score — should match for ABC.  
4. Manual ABC checklist still required on staging preview.  
5. No production deployment from this ticket.

---

## Acceptance summary

| Requirement | Status |
| --- | --- |
| Executive summary (score / progress / phase / initiative counts) | Done |
| Phase grid with current indicator + detail links | Done |
| Initiatives with pillar + opportunity links | Done |
| Projects navigation (existing routes only) | Done |
| Contextual next actions (existing booking/support) | Done |
| Empty / draft states | Done |
| No engine / scoring / catalog / mutation changes | Honored |
| Staging-only deliverable | Honored |

---

## 12. SS-UX-007-FIX — Phase workspace readability

**Date:** 2026-10-29  
**Branch:** `staging`  
**Scope:** Customer phase workspace initiative cards. No migrations, catalog edits, scoring changes, roadmap status values, content generation, or production deploy.

### Status badges

Customer initiative chips were a `bg-white` span with no text color. Inside `.customer-portal`, inherited text is bone (`#f1f2f4`), so Planned rendered as light text on a light fill.

Chips now use theme tokens with an explicit background and foreground. Planned (`open`) is `bg-secondary text-foreground` (charcoal secondary with bone text for customers; light secondary with slate text for staff). Approved keeps phosphor/navy `text-primary` because that pair clears 4.5:1. In Progress, Deferred, Completed, and Rejected use a semantic border and wash with `text-foreground`, because warning, success, and ember text on a 10% wash falls under 4.5:1 on at least one theme. Labels are unchanged (`RECOMMENDATION_LIFECYCLE_LABELS`). Staff still change status with the existing select.

| Status | Label | Treatment |
| --- | --- | --- |
| `open` | Planned | Secondary fill, foreground text |
| `accepted` | Approved | Primary wash, primary text |
| `in_progress` | In Progress | Warning wash, foreground text |
| `completed` | Completed | Success wash, foreground text |
| `deferred` | Deferred | Warning wash, foreground text |
| `archived` | Not Applicable | Muted fill, foreground text |
| `declined` | Rejected | Destructive wash, foreground text |

### Recommendation sections

Phase workspace no longer prints `description` as one paragraph. It calls `presentRecommendationDescription` in `src/lib/customer-portal/recommendation-content.ts` (SS-UX-006 parser, extended).

Recognized labels, unchanged:

- Finding
- Recommended action
- Expected outcome
- Implementation considerations

Each non-empty section is a heading plus the stored body. Line breaks inside a section stay. Text before the first label is shown above the sections and is not given an invented heading. If no label has a body, the original description is shown as paragraphs split on blank lines, with single newlines kept. Empty input renders nothing. Copy is not rewritten.

`businessImpact` is a separate Business benefit panel only when the stored value is non-empty. It is not derived from the description.

### Files

| File | Change |
| --- | --- |
| `src/lib/customer-portal/recommendation-content.ts` | Preserve bodies, leading text, and unstructured paragraphs |
| `src/lib/client-roadmap/initiative-status-style.ts` | Status chip classes |
| `src/components/client-roadmap/initiative-status-badge.tsx` | Customer chip |
| `src/components/client-roadmap/initiative-recommendation-content.tsx` | Sections, legacy paragraphs, business benefit |
| `src/components/client-roadmap/phase-workspace.tsx` | Initiative card layout |
| `tests/ux/ss-ux-007-phase-workspace-readability.test.ts` | Structured, unstructured, and contrast checks |

Staff proposal, approval, and impact-point controls stay in place. Opportunity detail (SS-UX-006) still uses `parseRecommendationDescription` and does not invent sections.

### Tests

```
npm test -- tests/ux/ss-ux-007-phase-workspace-readability.test.ts tests/ux/ss-ux-006-customer-improvement-opportunities.test.ts tests/ux/ss-ux-007-customer-roadmap-experience.test.ts tests/client-roadmap/
npx eslint src/lib/customer-portal/recommendation-content.ts src/lib/client-roadmap/initiative-status-style.ts src/components/client-roadmap/initiative-status-badge.tsx src/components/client-roadmap/initiative-recommendation-content.tsx src/components/client-roadmap/phase-workspace.tsx tests/ux/ss-ux-007-phase-workspace-readability.test.ts
```

Result: **29** tests passed (readability **6**, SS-UX-006 **8**, SS-UX-007 experience **5**, client-roadmap **10**). ESLint reported no issues on the touched files.

Contrast check: every supported status, on both the customer charcoal tokens and the staff light tokens, measures at least **4.5:1** for the chip text against its fill.

### Fix checklist

- [x] Planned chip uses an explicit foreground on a theme surface (not light-on-white)
- [x] All seven initiative statuses meet 4.5:1 in the token contrast test
- [x] Finding, Recommended action, Expected outcome, and Implementation considerations render as separate blocks when those labels are stored
- [x] Business benefit is a separate panel only when `businessImpact` is stored
- [x] Unstructured descriptions keep paragraphs and line breaks
- [x] Section bodies remain substrings of the stored description
- [x] No new statuses, catalog edits, scoring changes, or migrations
- [x] Live browser pass deferred — review on staging after push (desktop and mobile)
