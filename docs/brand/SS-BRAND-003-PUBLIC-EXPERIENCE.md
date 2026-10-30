# SS-BRAND-003 + SS-WEB-002 — Public Experience Transformation

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Type:** Public experience redesign / brand implementation  
**Status:** Implementation complete — staging validation  
**Dependencies:** SS-BRAND-001, SS-BRAND-001-R1, SS-BRAND-002, SS-UX-018  
**Out of scope:** SS-WEB-003 (demo content), SS-SNAP-001, authenticated dashboards, production deploy

---

## 1. Executive summary

StackScore’s public surface is now a **minimal product gateway**: charcoal foundation, purple/blue Level 2 atmosphere, **Sign In** as the primary CTA, and **Explore Demo** as the secondary CTA. Bobkat IT attribution is explicit. Acquisition/checkout/offer workflows remain at their existing deep links and were **not** deleted.

Login, password reset, activation, funnel (invitation/offer/demo/snapshot), and public marketing theme CSS now share the approved purple-first tokens. Authenticated `.executive-os` / `.customer-portal` shells were not redesigned.

---

## 2. Routes reviewed

| Route | Role | Change |
| --- | --- | --- |
| `/` | Product gateway | Rebuilt presentation |
| `/login` | Auth | Visual + brand copy |
| `/forgot-password`, `/reset-password` | Auth | Theme + Level 2 shell |
| `/activate-account` | Activation | Theme + attribution |
| `/demo`, `/product-overview` | Public demo | Shell/theme via funnel tokens |
| `/assessment-invitation` | Invitation | Funnel purple heroes/CTAs |
| `/assessment-offer` | Offer | Funnel theme (route preserved) |
| `/technology-snapshot` | Snapshot entry | Nav + funnel theme |
| `/checkout/strategic-it-consulting`, `/vcio-offer` | Checkout | Routes preserved; nav simplified |
| `/assessment/start`, `/assessment-purchased`, `/subscription-activated` | Fulfillment | Untouched logic |
| `/services`, `/solutions/*` | Legacy marketing | Still reachable; not homepage |

---

## 3. Homepage architecture changes

**Before:** Three sales cards (Sign In, Strategic IT Consulting, Assessment) + demo panel + Bobkat services link row.

**After (near full-viewport hero):**

1. Minimal header (logo + Sign In)
2. Product identity: **STACKSCORE** / **BY BOBKAT IT**
3. Headline: **KNOW YOUR TECHNOLOGY. OWN YOUR NEXT MOVE.**
4. One supporting sentence
5. Primary **SIGN IN** (gradient CTA)
6. Secondary **EXPLORE DEMO** (purple-border ghost)
7. Optional thin intelligence framing card
8. Minimal footer (© + Visit Bobkat IT)

---

## 4. Removed homepage presentation elements

Removed from `/` only:

- Consulting service sales card
- Assessment purchase sales card
- Feature/pricing-style grids
- Multiple competing acquisition CTAs
- “Learn about services/solutions/consulting” promo row

---

## 5. Preserved public workflows

Deep links and handlers remain:

- `/assessment-offer`, `/assessment-invitation`
- `/technology-snapshot` (+ lead capture)
- `/checkout/strategic-it-consulting`, `/vcio-offer`
- `/demo` interactive experience
- Auth: login, forgot/reset password, activate account
- Stripe confirmation / purchased / subscription-activated pages
- Invitation tokens, checkout, assessment access rules (logic untouched)

---

## 6. Brand token changes

| Change | Detail |
| --- | --- |
| `brand-tokens.css` | Scope includes `.public-marketing` |
| Level 2 utilities | `.brand-level-2`, `.brand-cta-gradient`, `.brand-cta-secondary` |
| `public-marketing-theme.css` | Charcoal + purple/blue atmosphere; gradient primary buttons |
| `auth-instrument-theme.css` | Purple→blue primary; purple focus; charcoal cards |
| `funnel-instrument-theme.css` | Same identity for demo/invitation/offer/snapshot |
| Semantic green | Preserved (`--success` / phosphor) |

Public CTAs use gradient `#9333EA → #A855F7 → #168BFF` with white labels (large-text AA; mid-stop `#9333EA` is ~5.38:1 with white). Authenticated apps keep solid `--brand-primary-fill`.

---

## 7. Login / authentication styling

- Charcoal shell + Level 2 atmosphere
- StackScore wordmark + **By Bobkat IT**
- Corner-bracketed form card
- Gradient primary submit (matches gateway)
- Purple focus rings on inputs
- Auth architecture, redirects, errors, sessions **unchanged**

---

## 8. Demo styling

- `/demo` continues under `.funnel-instrument` + updated public tokens
- Header via simplified `PublicMarketingNav` (Explore Demo + Sign In)
- No demo data, scoring, or navigation architecture rebuild (SS-WEB-003)

---

## 9. Invitation & assessment-entry styling

- Funnel pages inherit purple Level 2 backdrop and gradient CTAs
- `OfferHeroBackground` remapped from green/navy radials to purple/blue
- Forms remain Level 0 (flat charcoal panels, hairline borders)
- Invitation tokens / purchase / snapshot URL builders unchanged

---

## 10. Accessibility findings

| Item | Finding |
| --- | --- |
| Solid fill `#9333EA` + white | ~5.38:1 — AA for button text |
| Gradient end `#168BFF` + white | Weaker; primary CTA relies on darker purple start/mid for readable label (large uppercase CTAs) |
| Links on charcoal | `#C084FC` via brand link tokens |
| Focus | Purple rings on auth/funnel inputs |
| Reduced motion | Level 2 radial wash simplifies under `prefers-reduced-motion` |

Recommend staging contrast spot-check on gradient CTAs at 390px.

---

## 11. Responsive findings

Layouts use flex/stack CTAs (`flex-col` → `sm:flex-row`), `max-w-*`, and full-width mobile buttons. Automated browser width sweep **not** run this pass. Manual checklist below.

---

## 12. Functional regression results

| Check | Result |
| --- | --- |
| Auth suite + layout + demo journey + Stripe confirmation tests | **100+ passed** (targeted runs) |
| Layout invitation/offer/snapshot/demo tests | Pass |
| Auth logic | Untouched; rate-limit / isolation / password tests pass |
| Real payments / customer emails | Not initiated |
| Authenticated dashboards | Not modified in this ticket |

---

## 13. Files changed (primary)

| Path | Role |
| --- | --- |
| `src/components/public/stackscore-gateway-home.tsx` | Gateway rebuild |
| `src/components/public/public-marketing-nav.tsx` | Minimal public nav |
| `src/app/page.tsx` | Metadata |
| `src/app/login/page.tsx` | Auth brand presentation |
| `src/app/forgot-password/page.tsx`, `activate-account/page.tsx` | Level 2 shell |
| `src/styles/brand-tokens.css` | Public scope + Level 2 utilities |
| `src/styles/public-marketing-theme.css` | Purple Level 2 theme |
| `src/styles/auth-instrument-theme.css` | Auth purple CTAs |
| `src/styles/funnel-instrument-theme.css` | Funnel/demo purple shell |
| `src/components/assessment-offer/offer-hero-background.tsx` | Purple hero wash |
| `src/app/globals.css` | Midnight comment alignment |
| `docs/brand/SS-BRAND-003-PUBLIC-EXPERIENCE.md` | This report |

---

## 14. Known limitations

- Browser screenshots blocked (no live authenticated/public session automation this pass).
- Legacy `/services` and `/solutions` pages still exist with older long-form content; not deleted; not homepage.
- InvitationNav still lists assessment deep links (context-aware) — intentional for invitation journeys.
- Full demo content/dashboard parity deferred to **SS-WEB-003**.
- Snapshot funnel product work remains **SS-SNAP-001**.

---

## 15. SS-WEB-003 dependencies

SS-WEB-003 should:

- Align demo content with purple-first customer UX
- Refresh demo dashboard chrome beyond shell tokens
- Avoid reintroducing green-as-brand CTAs
- Keep scoring/demo data contracts unless separately approved

---

## 16. Production readiness assessment

| Criterion | Status |
| --- | --- |
| Streamlined gateway homepage | Met |
| Sign In primary / Explore Demo secondary | Met |
| Bobkat purple/blue/charcoal identity | Met |
| Login visually connected to app brand | Met |
| Public entry surfaces on design system | Met |
| Workflows preserved (deep links) | Met |
| Authenticated dashboards unchanged | Met |
| Lint / build | Pass |
| `tsc` | Baseline TIP/QBR fixture debt only |
| Browser visual QA | **Blocked** — checklist below |
| Production deploy | **Do not deploy** |

### Manual QA checklist (staging)

1. `/` — hero, Sign In, Explore Demo; no sales cards.  
2. 390px / 320px — no horizontal scroll; CTAs stack.  
3. `/login` — purple CTA; form works; wrong password error.  
4. Forgot/reset password flows.  
5. `/demo` — loads; Sign In in header.  
6. `/assessment-invitation?...` — tokens still personalize.  
7. `/technology-snapshot` — wizard loads.  
8. Direct `/assessment-offer` and `/checkout/strategic-it-consulting` still work.  
9. Staff/customer login still land on correct dashboards (visual purple unchanged from BRAND-002).  
10. Capture desktop + mobile homepage and login screenshots.

**Verdict:** Implementation and automated validation complete on `staging`. Treat browser visual sign-off as the remaining gate before promotion. Do not begin SS-WEB-003 without approval.
