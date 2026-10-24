# SS-MKT-001 — Learn About StackScore Page Redesign

| Field | Value |
| --- | --- |
| Status | Implemented on `staging` (not production-deployed) |
| Date | 2026-04-24 |
| Primary route | `/assessment-offer` |
| Related entry points | Invitation CTA “Learn About StackScore” → `/assessment-offer` |

---

## Existing page findings

### What “Learn About StackScore” was

- Exact CTA label lived on `/assessment-invitation` and scrolled to `#why-stackscore`.
- That section featured a full-bleed **Technology Journey** PNG (`/images/technology-journey.png`, ~1971×1127) that was oversized and hard to read on mobile.
- The main product marketing surface was `/assessment-offer`, which mixed:
  - Purchase funnel CTAs
  - Large showcase blocks (`AssessmentOfferShowcase`) with heavy vertical padding (`py-[120px]`–`160px`)
  - Demo interactive promo panels
  - Older workflow messaging that blurred assessment deliverables vs advisory services
- `/product-overview` permanently redirects to `/demo` (interactive demo — kept separate).

### Outdated / replaced

| Asset / pattern | Disposition |
| --- | --- |
| Giant journey screenshot on invitation why section | **Removed** from page |
| Assessment offer showcase mega-sections | **No longer composed** on landing (components retained unused for now) |
| Hero positioning “Know Exactly Where Your Technology Stands” | **Replaced** with “Understand your technology. Know what to improve.” |
| Implied “everything in the demo is included with purchase” | **Clarified** via deliverables + planning copy |

### Retained

- Route `/assessment-offer` and canonical SEO URL
- Dark / green marketing identity (`PublicPageShell`, funnel instrument theme)
- Purchase button, Technology Snapshot link, Stripe checkout path
- Safe React previews: `AssessmentExecutiveOverviewPreview`, `TechnologyMaturityProfilePreview`
- Analytics view tracker on the offer page
- Offer nav / footer chrome

---

## Current product capabilities used (operational)

| Capability | Marketing claim level |
| --- | --- |
| Technology Snapshot (free) | Available — CTA `/technology-snapshot` |
| Full Technology Maturity Assessment purchase | Available — Stripe checkout |
| Maturity scoring / pillars / StackScore | Available — shown via demo profile preview |
| Recommendations (priority, business impact, actions) | Available — illustrative samples only (no engine fields) |
| Client portal results / technology profile | Available — framed as included access |
| Improvement planning / roadmap views | Available as platform capability — not sold as automatic consulting |
| Assessment PDF / executive report | Available as assessment deliverable |
| Reassessment / history | Available — continued improvement section |
| Strategy review / Strategic IT Consulting / implementation | **Optional** advisory — explicitly separated |
| Quarterly business reviews as assessment entitlement | **Not** claimed as included with one-time purchase |

Sources: assessment offer content, DOC-123 workflows, STACKSCORE_PRODUCT_DISCOVERY, portal recommendation visibility rules, Stripe assessment checkout.

---

## New page structure

1. **Hero** — Value proposition + purchase / snapshot / consultation CTAs + compact executive preview  
2. **How StackScore Works** — Four steps aligned to real customer flow  
3. **Technology Maturity** — Live maturity profile preview (demo data)  
4. **Recommendations** — Three public-safe sample cards (impact / action / outcome)  
5. **Improvement Planning** — Three-phase planning illustration + non-inclusion disclaimer  
6. **Deliverables** — Included vs platform vs optional advisory  
7. **Continued Improvement** — Reassessment / progress narrative  
8. **Conversion** — Snapshot, purchase, consultation, demo link  

---

## Components created or modified

### Created

- `src/lib/learn-about-stackscore/content.ts`
- `src/components/learn-about-stackscore/learn-about-stackscore-landing.tsx`
- `learn-hero.tsx`, `learn-how-it-works.tsx`, `learn-maturity.tsx`, `learn-recommendations.tsx`
- `learn-improvement-planning.tsx`, `learn-deliverables.tsx`, `learn-continued-improvement.tsx`
- `learn-conversion.tsx`, `learn-section-shell.tsx`

### Modified

- `src/components/assessment-offer/assessment-offer-landing.tsx` → delegates to learn landing
- `src/app/assessment-offer/page.tsx` → metadata refreshed for Learn About StackScore
- `src/components/assessment-invitation/invitation-hero.tsx` → CTA → `/assessment-offer`
- `src/components/assessment-invitation/invitation-why-section.tsx` → removed journey PNG; link to learn page
- `tests/layout/assessment-offer-layout.test.ts` → asserts new structure

### Not deleted (dormant)

Legacy showcase components under `src/components/assessment-offer/` and `content.ts` showcase constants remain for possible reuse; they are no longer mounted on the landing.

---

## CTA destinations

| CTA | Destination | Status |
| --- | --- | --- |
| Purchase Technology Maturity Assessment | Stripe via `AssessmentPurchaseButton` | Operational |
| Free Technology Snapshot | `/technology-snapshot` | Operational |
| Book / Schedule Consultation | Cal.com Bobkat free consult | Operational |
| Interactive Demo | `/demo` | Operational |
| Invitation “Learn About StackScore” | `/assessment-offer` | Operational |

---

## Validation results

| Check | Result |
| --- | --- |
| `tests/layout/assessment-offer-layout.test.ts` | Pass (5) |
| Production build | Pass (`Compiled successfully`) |
| Manual responsive review | Required on staging (desktop / tablet / mobile) |

---

## Remaining issues / follow-ups

- Legacy showcase components and `/images/technology-journey.png` are unused on this page — candidate cleanup in a later hygiene PR.
- Interactive Demo remains a separate deep experience; this page intentionally stays conversion-focused rather than embedding the full demo shell.
- Stripe dollar amount remains marketing copy ($1,500) — still env-price verified operationally as before.
- Visual QA on staging widths for maturity preview overflow and recommendation card stacking.

---

## Staging review checklist

1. Open `/assessment-offer` — confirm new hero copy and no giant journey screenshot.  
2. Scroll all eight sections; check mobile for overflow.  
3. Click Snapshot, Purchase, Consultation, Demo.  
4. From `/assessment-invitation`, click **Learn About StackScore** → lands on `/assessment-offer`.  
5. Confirm sample previews show “demonstration / sample” disclaimers.  
