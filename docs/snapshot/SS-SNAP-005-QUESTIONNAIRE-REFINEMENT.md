# SS-SNAP-005 — Snapshot Questionnaire UX and Content Refinement

**Project:** StackScore  
**Environment:** Staging only  
**Reference:** SS-SNAP-003 / SS-SNAP-004  
**Production:** Not authorized  
**Date:** 2026-10-31  

---

## Summary

Refined the Free Technology Snapshot business-context selector and questionnaire presentation without redesigning the approved results experience. Updated A1 / A3 / D3 wording, fixed IT management enum display labels, polished answer selection UI, and enlarged the radar plot area while preserving SNAP-004 brand-violet contrast and 0–100 scoring domain.

---

## Files changed

| Path | Change |
|------|--------|
| `src/lib/technology-snapshot/display.ts` | Professional IT management labels + `formatItManagementLabel` |
| `src/lib/technology-snapshot/questions.ts` | Matching `IT_MANAGEMENT_OPTIONS` labels |
| `src/lib/technology-snapshot/catalog-v2.ts` | A1 / A3 / D3 copy; optional `helpText` |
| `src/components/technology-snapshot/technology-snapshot-wizard.tsx` | Full-width Select with `items` label map; question UI polish |
| `src/components/technology-snapshot/snapshot-radar.tsx` | Larger chart area (`outerRadius` 78%, taller container) |
| `src/components/admin/snapshot-lead-detail-view.tsx` | Uses `formatItManagementLabel` |
| `tests/technology-snapshot/catalog-v2-copy.test.ts` | New copy / label assertions |
| `tests/layout/technology-snapshot-layout.test.ts` | Wizard / radar assertions |

---

## Before / after question wording

### A1 — MFA (ID preserved)

| | Copy |
|---|------|
| **Before** | Do people use an extra login step (like a code on their phone) when signing into important company systems? |
| **After** | Does your organization use multifactor authentication (MFA) to protect access to business systems and applications? |
| **Help text** | Multifactor authentication requires an additional verification method beyond a password. |

### A3 — Security monitoring (ID preserved)

| | Copy |
|---|------|
| **Before** | Does anyone regularly look at security alerts or “something looks wrong” notices for your systems? |
| **After** | Does your organization regularly monitor security alerts and anomalies across its technology environment? |

### D3 — Change management (ID preserved)

| | Copy |
|---|------|
| **Before** | Do you review technology needs when the business changes (new location, new software, growth)? |
| **After** | Is technology formally considered as part of your organization's business change management process? |
| **Help text** | For example, when introducing new processes, expanding operations, or implementing organizational changes. |

Scoring points, answer enums, critical-risk rules (A1/C1/C2/C3), and classification bands are unchanged.

---

## Remaining questionnaire language (review only — not rewritten)

Proposed future refinements (not applied in this ticket):

| ID | Current tone note | Proposed direction |
|----|-------------------|-------------------|
| A2 | Clear; slightly casual “turned off” | Consider “revoked or disabled promptly” |
| A4 | Clear | Optional: “shared credentials” terminology |
| B2 | Clear | Optional: “remote access” alongside VPN |
| B3 | Slightly informal “where work belongs” | “so teams can locate and collaborate on work reliably” |
| B4 | Clear | — |
| C1 | Clear; parenthetical is helpful | Keep |
| C2 | Long; conversational parenthetical | Shorten parenthetical for scanability |
| C3 | Strong; “ransomware” is appropriate | Keep |
| D1 | Clear | — |
| D2 | Long; “disappeared” is informal | “if your usual IT contact were unavailable” |

Category structure and all 14 IDs remain approved.

---

## Dropdown fixes

**Root causes**

1. Base UI `Select` without `items={…}` shows the raw `value` (`in_house`) in the trigger.
2. Default `SelectTrigger` uses `w-fit` + `whitespace-nowrap`, clipping long option text.

**Fixes**

- Pass `items={IT_MANAGEMENT_LABELS}` so the trigger renders human-readable labels.
- `SelectTrigger` / company-size trigger: `w-full`, taller hit target, allow wrap on IT selector.
- `SelectItem multiline` for long IT labels; content aligned to full anchor width.
- Labels updated to the approved set (enum values unchanged):

  - `in_house` → In-House IT Team  
  - `outsourced` → Outsourced IT Provider  
  - `part_time_internal` → Internal Employee Handling IT  
  - `none` → No Formal IT Management  
  - `unsure` → Unsure  

Admin lead detail uses the same formatter.

---

## Visual changes

### Questionnaire

- Category eyebrow + question counter on one row.
- Stronger selected-answer treatment (inset brand ring + check icon).
- Unselected hollow indicator for clearer affordance.
- Help text under A1 / D3.
- Spacing tightened between heading block and answer list.

### Radar

- Chart container taller (`h-80` → `md:h-[26rem]`) with `max-w-xl` / `md:max-w-2xl` to reduce empty side space.
- `outerRadius` **68% → 78%**; margins reduced.
- SNAP-004 stroke / fill / vertex markers preserved.
- Percent cards retained.

### Preserved results sections

Next Steps, consultation / assessment / demo CTAs, optional contact capture, and critical attention items were not redesigned.

---

## Screenshots

| Asset | Path |
|-------|------|
| Context — IT management open | [`ss-snap-005/context-it-select.png`](./ss-snap-005/context-it-select.png) |
| Question A1 | [`ss-snap-005/question-a1.png`](./ss-snap-005/question-a1.png) |
| Results radar (desktop) | [`ss-snap-005/results-radar-desktop.png`](./ss-snap-005/results-radar-desktop.png) |
| Results radar (mobile) | [`ss-snap-005/results-radar-mobile.png`](./ss-snap-005/results-radar-mobile.png) |

---

## Test results

| Check | Result |
|-------|--------|
| `npm test -- tests/technology-snapshot tests/layout/technology-snapshot-layout.test.ts` | **40/40 passed** |
| `npm run lint` | **0 errors** (warnings only) |
| `npm run build` | **Succeeded** |

---

## Remaining issues

1. Live `staging.stackscore.tech` still behind Vercel Authentication for anonymous browser QA.
2. Proposed copy refinements for A2/A4/B2/B3/C2/D2 are documented above but not applied.
3. Production deployment remains unauthorized.

---

## Staging deployment

Deployed on branch `staging` after validation (see git history / Vercel Preview for this ticket). Production: **not authorized**.
