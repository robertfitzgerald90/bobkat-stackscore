# SS-UX-003 — Customer Portal Visual Foundation

**Branch:** `staging`  
**Date:** 2026-10-29  
**Status:** Implemented (staging only — no production deploy)  
**Precedents:** [SS-UX-001](./SS-UX-001-CUSTOMER-EXPERIENCE-ARCHITECTURE.md), [SS-UX-002](./SS-UX-002-CUSTOMER-NAVIGATION-UNIFIED-LANDING.md)  
**Direction:** StackScore — Industrial Metalcore Meets Technology Intelligence (restrained)

**Constraints honored:** No migrations, scoring changes, recommendation metadata changes, dashboard content redesign, PDF redesign, staff UI redesign, or production deploy.

---

## 1. Brand assets selected

| Asset | Path | Decision |
| --- | --- | --- |
| Authentic Bobkat IT logo (website rebrand) | `public/branding/new-bobkat-it-logo.png` | **Selected** — canonical via `BOBKAT_IT_LOGO` in `src/lib/branding/assets.ts` |
| Runtime URL helper | `bobkatLogoSrc()` | Cache-busted public URL used by sidebar, emails, PDFs, and watermark |

**Ambiguity:** None. Repository branding tests already assert this file is the official logo everywhere (`tests/branding/assets.test.ts`). No generated or approximate artwork was introduced.

---

## 2. Theme architecture

### Scope

Customer-only class on the authenticated dashboard shell:

- Root: `.customer-portal` (`CUSTOMER_PORTAL_THEME_CLASS`)
- Main: `.customer-portal-main` (texture + watermark host)
- Applied when `role === "client"` via `isCustomerPortalThemeEnabled`

Staff shells keep `executive-os` without `.customer-portal`. Auth, marketing, and funnel/demo scopes (`.public-marketing`, `.funnel-instrument`, `.auth-instrument`, `.midnight` on marketing wrappers) are untouched.

### Token strategy

`src/styles/customer-portal-theme.css` remaps semantic CSS variables inside `.customer-portal` to the Instrument palette:

| Token | Value |
| --- | --- |
| Background / obsidian | `#08090c` |
| Panels / frost | `#12141a` |
| Primary accent / phosphor | `#3ecf7a` |
| Muted / ash | `#8b92a0` |
| Text / bone | `#f1f2f4` |
| Critical / ember | `#b23a3a` |
| Warning / caution | `#c9a227` |
| Radius | `0–2px` (industrial, not pill-heavy) |

Typography hooks prefer Instrument faces already loaded on the app (`--font-instrument-display` / body / mono). Metrics continue to use `instrument-mono`.

### Theme preference note

The customer shell **forces the charcoal + phosphor Instrument foundation** inside `.customer-portal` so the approved aesthetic is consistent. Staff retain light/midnight/system. Theme toggle remains available in the header; document as a remaining product decision if customers should be able to force a light customer shell later.

---

## 3. Watermark implementation

| Concern | Detail |
| --- | --- |
| Component | `src/components/customer-portal/customer-portal-watermark.tsx` |
| Asset | Authentic `new-bobkat-it-logo.png` via `bobkatLogoSrc()` |
| Placement | Lower-right of main content (`inset: auto 4% 6% auto`) |
| Opacity | ~4.5% desktop; ~3% mobile (within 3–6% brief) |
| Interaction | `pointer-events: none`; does not cover hit targets |
| A11y | `aria-hidden="true"`, empty `alt` (decorative) |
| Blend | `mix-blend-mode: luminosity` (falls back under reduced motion) |
| Host | Rendered inside customer `main.customer-portal-main` only |

Content children stack above the watermark (`z-index`). Watermark is not placed behind score numerals as an opaque layer.

---

## 4. Industrial visual treatments

| Treatment | Application | Restraint |
| --- | --- | --- |
| Charcoal surfaces | Scoped CSS variables | Customer shell only |
| Subtle grid texture | `.customer-portal-main` background | Disabled under `prefers-reduced-motion`; lighter on mobile |
| Angular corners | `.customer-industrial-panel` + sharper sidebar rail | Opt-in on major panels / empty states / score hero — **not** every card |
| Bold headings | Customer `h1–h4` + `CLIENT_SECTION_TITLE` / section headers | Body/labels remain readable Source Sans weight |
| Phosphor accents | Primary, rings, active nav, links | No competing bright accents |
| Amber / red | Warning / destructive badges only | Unchanged semantics |
| Sidebar | Angular active rail (`customer-nav-active-rail`), sharper nav radius for customers | Staff sidebar geometry unchanged |

Reusable primitives:

- `ClientSurfaceCard` + `clientSurfaceCardClass(variant)`
- `ClientEmptyState` / `ClientScoreHero` industrial defaults
- `ClientMetricCard` optional `variant`
- `ClientStatusBadge` warning tone uses semantic `--warning`

---

## 5. Files changed

| File | Role |
| --- | --- |
| `src/styles/customer-portal-theme.css` | **New** scoped theme + watermark + industrial CSS |
| `src/app/globals.css` | Import customer portal theme |
| `src/lib/customer-portal/theme.ts` | **New** theme class helpers |
| `src/components/customer-portal/customer-portal-watermark.tsx` | **New** decorative logo watermark |
| `src/components/layout/dashboard-shell.tsx` | Apply theme class, main texture, watermark |
| `src/components/layout/app-sidebar.tsx` | Customer angular nav treatments |
| `src/components/layout/app-header.tsx` | `data-customer-header` marker |
| `src/lib/client-ui/tokens.ts` | Industrial variants + bolder titles |
| `src/components/client-ui/client-surface-card.tsx` | **New** surface primitive |
| `src/components/client-ui/index.ts` | Export surface card |
| `src/components/client-ui/client-empty-state.tsx` | Industrial variant |
| `src/components/client-ui/client-metric-card.tsx` | Optional industrial variant |
| `src/components/client-ui/client-score-hero.tsx` | Industrial default |
| `src/components/client-ui/client-section-header.tsx` | Bolder section titles |
| `src/components/client-ui/client-status-badge.tsx` | Semantic warning token |
| `src/components/customer-portal/customer-executive-dashboard.tsx` | Industrial on major “Next Focus” panel |
| `tests/ux/ss-ux-003-customer-portal-visual.test.ts` | **New** automated coverage |
| `docs/ux/SS-UX-003-CUSTOMER-PORTAL-VISUAL-FOUNDATION.md` | This deliverable |

---

## 6. Accessibility checks

| Check | Result / approach |
| --- | --- |
| WCAG AA contrast | Phosphor `#3ecf7a` on obsidian for accents; body text bone `#f1f2f4` on `#08090c`; muted ash on charcoal for secondary copy |
| Keyboard focus | `.customer-portal :focus-visible` phosphor outline, 2px offset |
| Reduced motion | Grid texture disabled; watermark blend simplified |
| Decorative imagery | Watermark `aria-hidden` + empty alt; `pointer-events: none` |
| Mobile / tablet / desktop | Responsive watermark size/opacity; main padding preserved; nav sheet unchanged structurally |
| Zoom | Layout uses relative units / flex; watermark scales with `vw` caps |

Manual contrast spot-check recommended on staging preview for KPI cards and dashed empty states.

---

## 7. Automated tests

```
vitest run
  tests/ux/ss-ux-003-customer-portal-visual.test.ts
  tests/ux/ss-ux-002-customer-navigation.test.ts
  tests/branding/assets.test.ts
  tests/navigation/page-titles.test.ts

Result: 4 files, 24 tests passed
```

SS-UX-003 coverage asserts:

- Authentic logo path exists and is selected
- Theme gated to `client` role
- Industrial panel opt-in
- Four-item nav preserved
- Theme CSS + shell watermark wiring
- Staff path does not force customer theme class without gate

---

## 8. ABC LLC regression (read-only)

Observed via app services (no writes):

| Check | Result |
| --- | --- |
| Client | ABC LLC |
| StackScore | **39** |
| DOC-119 maturity label | **Initial** |
| Customer-visible recommendations | **57** |
| Customer projected maturity KPI | **null** (still suppressed) |

Values are observations — not hardcoded into UI.

---

## 9. Manual visual validation checklist

- [ ] Customer portal renders charcoal + phosphor Instrument look
- [ ] Bobkat IT watermark visible but subtle (desktop ~4–5%, mobile lower)
- [ ] Watermark does not block clicks or obscure score numbers
- [ ] Phosphor remains dominant accent; amber/red only for warn/critical
- [ ] Staff workspace (admin/technician) visual system unchanged
- [ ] Overview / Explore / Roadmap / Reports still work
- [ ] Empty states / cards / headings feel industrial but readable
- [ ] Focus rings visible via keyboard
- [ ] `prefers-reduced-motion`: no distracting texture
- [ ] Mobile / tablet / desktop usable; zoom ~200% readable
- [ ] ABC LLC still shows 39 / Initial / 57 opportunities; no projected maturity KPI

---

## 10. Remaining issues

1. **Customer light theme:** Shell currently remaps to Instrument charcoal even if the global theme toggle is “light.” Product may later allow a true light customer variant.
2. **Overview content redesign** still deferred (SS-UX-001 Phase B) — this ticket is visual foundation only.
3. **Explore pillar interactivity** still foundation-only (SS-UX-002).
4. **Staff shared components** (`ExecutiveKpiCard`, briefing) receive customer look only when rendered inside `.customer-portal`; staff routes without that class stay prior styling.
5. **Manual browser checklist** on staging preview still required before promotion.
6. No production deployment from this ticket.

---

## Acceptance summary

| Requirement | Status |
| --- | --- |
| Authentic Bobkat IT watermark | Done |
| Customer-only theme scope | Done |
| Phosphor accent retained | Done |
| Industrial treatments (restrained) | Done |
| Four-item nav preserved | Done |
| Staff / auth / marketing unchanged | Done |
| Reusable primitives with optional industrial | Done |
| A11y / reduced-motion considerations | Done |
| ABC regression observations | 39 / Initial / 57 / projected null |
| Staging only | Honored |
