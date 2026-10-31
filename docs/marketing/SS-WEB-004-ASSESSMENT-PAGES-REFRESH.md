# SS-WEB-004 — Assessment Marketing Pages Refresh

**Status:** Implemented on `staging` — **awaiting product-owner visual approval** before production promotion.  
**Date:** 2026-10-30  
**Routes:** `/assessment-offer`, `/assessment-invitation`  
**Environment:** Staging first (no production deploy for this ticket)

---

## 1. Files modified

### Added

| Path | Purpose |
|------|---------|
| `src/lib/marketing/app-showcase.ts` | Shared showcase section copy + screenshot asset paths |
| `src/components/marketing/app-showcase-frame.tsx` | Framed landscape screenshot (CornerBrackets + Next Image) |
| `src/components/marketing/stackscore-app-showcase.tsx` | Three-section single-column application showcase |
| `public/images/marketing/ss-web-004/overview.webp` (+ `.png`) | Overview demo screenshot |
| `public/images/marketing/ss-web-004/explore.webp` (+ `.png`) | Explore demo screenshot |
| `public/images/marketing/ss-web-004/roadmap.webp` (+ `.png`) | Roadmap demo screenshot |
| `docs/marketing/ss-web-004/*` | Page review screenshots for PO |

### Updated

| Path | Change |
|------|--------|
| `src/components/learn-about-stackscore/learn-about-stackscore-landing.tsx` | Replaced maturity/improvement sections with `StackScoreAppShowcase` |
| `src/components/learn-about-stackscore/learn-hero.tsx` | Hero preview → live Overview screenshot via `AppShowcaseFrame` |
| `src/components/assessment-invitation/assessment-invitation-landing.tsx` | Inserted shared `StackScoreAppShowcase` |
| `src/components/assessment-invitation/invitation-hero.tsx` | Hero preview → Overview screenshot; scoring disclaimer |
| `src/components/assessment-invitation/invitation-discover-section.tsx` | Official StackScore / reassessment wording |
| `src/lib/assessment-invitation/content.ts` | Removed “Technology Health”; roadmap ≠ official score |
| `tests/layout/assessment-offer-layout.test.ts` | SS-WEB-004 composition + asset + legacy-guard assertions |
| `tests/layout/assessment-invitation-layout.test.ts` | Shared showcase + obsolete-claim guards |

### Removed

| Path | Reason |
|------|--------|
| `src/components/learn-about-stackscore/learn-maturity.tsx` | Legacy maturity / dashboard-style marketing section |
| `src/components/learn-about-stackscore/learn-improvement-planning.tsx` | Legacy improvement-planning marketing section |

---

## 2. Legacy components removed

On the live assessment marketing pages (via Learn About StackScore + invitation landing):

- **AssessmentExecutiveOverviewPreview** (fabricated executive dashboard) — removed from offer hero
- **ClientDashboardPreview** / stacked product screenshot hero patterns on invitation
- **LearnMaturity** / **LearnImprovementPlanning** sections (legacy maturity cards and planning mock presentation)
- Obsolete claims / labels scrubbed from invitation content:
  - “Technology Health” → “Technology Maturity”
  - Roadmap progress automatically changing Official StackScore — explicitly denied in copy

Unused legacy files such as `offer-hero.tsx` (still references `AssessmentExecutiveOverviewPreview`) are **not** wired to `/assessment-offer` (`AssessmentOfferLanding` → `LearnAboutStackScoreLanding`). No authenticated customer/admin routes were changed.

---

## 3. Screenshot capture source and date

| Item | Value |
|------|--------|
| **Preferred staging** | `staging.stackscore.tech/demo/*` — **blocked by Vercel Authentication** |
| **Approved equivalent** | Production public demo: `https://stackscore.tech/demo/{overview,explore,roadmap}` |
| **Data** | Fictional Northstar Manufacturing demo workspace |
| **Capture method** | Playwright headless Chromium, 1440×900 CSS viewport @ 2× DPR, no browser chrome |
| **Capture date** | **2026-10-30** (asset timestamps ~23:12 local) |
| **Optimization** | Sharp → WebP (primary) + PNG masters retained |

All three marketing screenshots come from the **same** current StackScore 2.0 demo build.

---

## 4. Screenshot assets created

| Asset | Role |
|-------|------|
| `public/images/marketing/ss-web-004/overview.webp` | Section 1 + hero Overview |
| `public/images/marketing/ss-web-004/explore.webp` | Section 2 Explore |
| `public/images/marketing/ss-web-004/roadmap.webp` | Section 3 Roadmap |
| Matching `.png` masters | Archive / re-encode source |

Intrinsic size: **2880×1800** (1440×900 @ 2×).

---

## 5. Shared components introduced

- **`STACKSCORE_APP_SHOWCASE_SECTIONS`** — single source of truth for headings, descriptions, and image paths
- **`AppShowcaseFrame`** — purple-first framed screenshot with width/height for CLS control
- **`StackScoreAppShowcase`** — three centered text + large landscape screenshot sections; used on both pages

Hero on both pages reuses the Overview asset via `AppShowcaseFrame` (no duplicate layout logic for framing).

---

## 6. CTA verification results

Verified locally against `http://localhost:3015` (production build via `next start`).

### `/assessment-offer`

| CTA | Destination | Result |
|-----|-------------|--------|
| Purchase Technology Maturity Assessment — $1,500 | `POST /api/checkout/create-session` → Stripe (unchanged) | **Pass** — button present; pricing/label unchanged |
| Start My Free Technology Snapshot | `/technology-snapshot` | **Pass** |
| Book a Consultation | `https://cal.com/bobkat-it/bobkat-it-free-consult` | **Pass** |
| See how StackScore works | `#how-stackscore-works` (showcase anchor) | **Pass** |

### `/assessment-invitation`

| CTA | Destination | Result |
|-----|-------------|--------|
| Start My Free Technology Snapshot | `/technology-snapshot` | **Pass** |
| Learn About StackScore / Purchase the full assessment | `/assessment-offer` | **Pass** |
| Secondary Bobkat IT assessment link | bobkatit.com assessment anchor | **Pass** (unchanged) |

No pricing or payment logic changes.

---

## 7. Test results

| Check | Result |
|-------|--------|
| `npm test -- tests/layout/assessment-offer-layout.test.ts tests/layout/assessment-invitation-layout.test.ts` | **10/10 passed** |
| `npm run lint` | **0 errors** (preexisting warnings only) |
| `npm run build` | **Succeeded** (exit 0) |

---

## 8. Desktop and mobile validation

| Surface | Validation |
|---------|------------|
| Offer desktop | Hero + three showcase sections render; large landscape shots; purple/charcoal marketing chrome |
| Invitation desktop | Shared showcase after discover section; same assets |
| Offer mobile (~390×844) | CTA stack usable; hamburger nav; screenshots full-width |
| Invitation mobile | Snapshot CTA + showcase readable; no horizontal breakage observed |
| Layout shift | Next/Image width/height + webp sizes attribute set |
| Legacy dashboard UI | Not present on either live page |

### PO review screenshots

| File | Description |
|------|-------------|
| [`ss-web-004/assessment-offer-desktop.png`](./ss-web-004/assessment-offer-desktop.png) | Offer page (desktop) |
| [`ss-web-004/assessment-offer-showcase.png`](./ss-web-004/assessment-offer-showcase.png) | Offer — Understand Your Technology section |
| [`ss-web-004/assessment-offer-mobile.png`](./ss-web-004/assessment-offer-mobile.png) | Offer hero CTAs (mobile) |
| [`ss-web-004/assessment-invitation-desktop.png`](./ss-web-004/assessment-invitation-desktop.png) | Invitation showcase (desktop) |
| [`ss-web-004/assessment-invitation-showcase.png`](./ss-web-004/assessment-invitation-showcase.png) | Invitation — Understand Your Technology |
| [`ss-web-004/assessment-invitation-mobile.png`](./ss-web-004/assessment-invitation-mobile.png) | Invitation mid-page (mobile) |

Local preview used during validation: `http://localhost:3015/assessment-offer` and `…/assessment-invitation`.

---

## 9. Unresolved issues / follow-ups

1. **Staging Vercel Auth** blocked automated capture from `staging.stackscore.tech`; screenshots taken from production public demo (same app + fictional data). Re-capture from staging after auth access if PO requires staging-exact URLs in the asset trail.
2. **`offer-hero.tsx`** still contains the old executive preview import but is unused by the live offer route — optional cleanup outside this ticket.
3. **Portfolio export / unused marketing previews** under `marketing/portfolio-export-stackscore` still mention projected scores; not wired to these two pages.
4. **Production promotion** intentionally **not** performed — stop for visual approval.

---

## Showcase copy (shipped)

1. **Understand Your Technology** — Overview screenshot  
2. **Explore Your Technology Landscape** — Explore screenshot  
3. **Turn Insights Into Action** — Roadmap screenshot  

Caption on both pages: Official StackScore updates only after reassessment; roadmap progress does not automatically change the official score.
