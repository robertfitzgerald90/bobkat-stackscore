# SS-BRAND-001 — Color Inventory

**Branch:** `staging`  
**Date:** 2026-10-30  
**Status:** Audit only — no implementation  
**Revision:** R1 adds brand-vs-semantic migration (§11); factual “current code” sections unchanged  
**Companion:** [Visual System Audit](./SS-BRAND-001-VISUAL-SYSTEM-AUDIT.md) · [Design Spec](./SS-BRAND-001-DESIGN-SPEC.md) · [R1 Alignment](./SS-BRAND-001-R1-BOBKAT-ALIGNMENT.md)

---

## 1. How color is organized today

| Layer | Path | Role |
| --- | --- | --- |
| Global CSS variables + Tailwind bridge | `src/app/globals.css` (`:root`, `.midnight`/`.dark`, `@theme inline`) | Canonical app tokens; light = navy; dark = phosphor |
| Instrument Phase 1 palette | `src/styles/instrument-tokens.css` (`.instrument`) | Obsidian / frost / ash / bone / phosphor / ember |
| Executive OS shell | `src/styles/executive-os-theme.css` (`.executive-os`) | Thin shell polish; explicitly **no** blue glow |
| Customer portal | `src/styles/customer-portal-theme.css` (`.customer-portal`) | Charcoal + phosphor + plotting grid (SS-UX-003) |
| Public marketing | `src/styles/public-marketing-theme.css` (`.public-marketing`) | **Blue-glow** marketing aesthetic |
| Auth overlay | `src/styles/auth-instrument-theme.css` | Phosphor controls on marketing shell |
| Funnel / demo overlay | `src/styles/funnel-instrument-theme.css` | Obsidian + ash grid; kills blue marketing glow |
| Report / TIP / QBR print CSS | `src/styles/report-document-theme.css`, `tip-executive-report.css`, `qbr-executive-report.css` | Document chrome (separate from app UI) |
| TS presentation tokens | `src/lib/executive-os/tokens.ts`, `src/lib/client-ui/tokens.ts`, `src/lib/marketing/tokens.ts`, `src/lib/customer-portal/theme.ts` | Class-name contracts, not hex |

**Critical naming fact:** In `.midnight` / `.dark`, `--accent-blue` is already set to **`#3ecf7a` (phosphor green)**. Classes like `text-accent-blue` are **green at runtime** in the authenticated dark app. In light `:root`, `--accent-blue` remains navy `#082f5b`. The token name is legacy brand debt, not a live blue accent in dark UI.

---

## 2. Current token values (authoritative)

### 2.1 Light `:root` (`globals.css`)

| Token | Value | Notes |
| --- | --- | --- |
| `--surface-app` / `--surface-card` | `#ffffff` | Light SaaS default |
| `--surface-sidebar` | `#082f5b` | Navy sidebar |
| `--accent-blue` | `#082f5b` | True blue/navy |
| `--accent-blue-hover` | `#0a3d75` | |
| `--primary` / `--link` | → `--accent-blue` | |
| `--success` | `#15803d` | Semantic green |
| `--warning` | `#b45309` | |
| `--destructive` | `#dc2626` | |
| `--chart-1` | `#082f5b` | Series navy |
| `--chart-2` | `#7d97ac` | Cool slate |
| `--chart-3` | `#16a34a` | Green |
| `--chart-4` / `--chart-5` | amber / red | |
| `--shadow-glow` | soft slate shadow | Light elevation |

### 2.2 Dark / Instrument (`.midnight`, `.dark`, `.instrument`, `.customer-portal`)

| Named color | Hex | Role |
| --- | --- | --- |
| Obsidian | `#08090c` | App / page background |
| Sidebar deep | `#0a0b10` | Sidebar |
| Frost panel | `#12141a` | Cards / elevated |
| Card hover | `#171a21` | |
| Ash | `#8b92a0` | Muted text / borders |
| Bone | `#f1f2f4` | Primary text |
| Phosphor | `#3ecf7a` | Brand accent / primary / success |
| Phosphor hover | `#56dd8d` | Link hover / chart-3 |
| Ember | `#b23a3a` | Critical / destructive |
| Caution | `#c9a227` | Warning / mid-risk |

Opacity helpers: `--phosphor-opacity-12/20`, `--ash-opacity-10/20/40`, `--ember-opacity-12/20`.

### 2.3 Public marketing (`.public-marketing`) — blue system

| Token | Value | Purpose |
| --- | --- | --- |
| `--marketing-bg-deep` | `#050914` | Cool navy-black |
| `--marketing-bg-mid` | `#07111f` | |
| `--marketing-bg-elevated` | `#0a1526` | |
| `--marketing-border` | `rgba(70, 120, 255, 0.12)` | Blue hairline |
| `--marketing-glow` | `rgba(50, 120, 255, 0.08)` | Blue ambient |
| Ambient gradients | `rgba(35, 135, 255, …)` | Hero/section glows |
| Plotting grid | `rgba(70, 120, 255, 0.04)` | Blue grid overlay |

Funnel/auth overlays **already remapped** these to obsidian/ash/phosphor for `/demo`, assessment offer/invitation, and auth pages.

---

## 3. Classification legend

| Class | Meaning |
| --- | --- |
| **A — Replace** | Decorative blue that conflicts with Bobkat-informed StackScore identity |
| **B — Evaluate** | Mixed purpose / chart / status / legacy name resolving to green |
| **C — Preserve** | Legitimate semantic differentiation or contrast role (may restyle for dark, keep meaning) |

**Priority:** P0 = blocks cohesion on primary surfaces · P1 = high-visibility shared chrome · P2 = secondary / demo / reports · P3 = naming cleanup / light-mode debt

---

## 4. Decorative blue inventory (A)

| ID | File | Component / route | Current | Purpose | Class | Recommended replacement | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| A-01 | `src/styles/public-marketing-theme.css` | `.public-marketing` root tokens | `--marketing-border/glow` legacy blue RGBA | Ambient brand frame | A | R1: ash borders + Bobkat purple/blue glow (`#A855F7` / `#168BFF` @ low opacity); Level 2 only | P0 |
| A-02 | same | `::before` ambient gradients | `rgba(35,135,255,…)` + navy stops | Page atmosphere | A | Charcoal base + purple/blue radials (Bobkat), not phosphor | P0 |
| A-03 | same | `::after` plotting grid | legacy blue 1px grid | Technical motif | A | Ash or blue-tinted grid `rgba(22,139,255,0.04–0.06)` | P0 |
| A-04 | same | section glow, panels, CTAs, focus | multiple legacy blue blooms | CTA / elevation | A | Hairline ash; **purple** (or purple→blue gradient) CTAs; no constant bloom | P0 |
| A-05 | `src/components/assessment-offer/offer-hero-background.tsx` | Default `tone="blue"` | radial legacy blues | Offer heroes | A | Delete legacy tone; Level 2 Bobkat purple/blue | P0 |
| A-06 | `src/components/marketing-demo/stages/ExecutiveReportDemo.tsx` | Demo executive report stage | `text-sky-200`, `text-sky-100/90` | Decorative labels | A | Brand/muted tokens | P2 |
| A-07 | Light `:root` sidebar / primary | Global light theme | `#082f5b` navy as brand | Light-mode brand | A* | Product decision: deprecate navy or dual-theme strategy | P1 |

\*Authenticated app already prefers dark Instrument; light navy is the largest remaining **true-blue brand** surface if light mode remains user-visible.

---

## 5. Evaluate inventory (B)

| ID | File | Component / route | Current | Purpose | Class | Recommendation | Priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| B-01 | `globals.css` + Tailwind | `--accent-blue` / `accent-blue` utilities | Name = blue; dark value = phosphor | Brand accent alias | B | **Rename** conceptually to `--brand-primary` / keep alias during BRAND-002; stop new `accent-blue` class usage | P1 |
| B-02 | `src/components/communications/communications-shell.tsx` | Shell icons + `StatusPill` `info` | `text-accent-blue`, `bg-accent-blue/10` | Chrome + info tone | B | Use `text-primary` / `bg-primary/10`; define semantic `status-info` (ash or restrained purple) separate from brand | P1 (ADMIN-006 known) |
| B-03 | `src/components/communications/template-library-view.tsx` | Inline links | `text-accent-blue` | Link affordance | B | `text-link` / `text-primary` | P1 |
| B-04 | `src/app/(dashboard)/clients/[id]/communications/page.tsx` | Client communications links | `text-accent-blue` | Link | B | Same as B-03 | P2 |
| B-05 | `src/components/technology-catalog/*` | Feature cards, badges, detail | `accent-blue` classes | Catalog emphasis | B | `primary` tokens; preferred badge = phosphor subtle | P2 |
| B-06 | `src/components/client-technology/client-technology-profile.tsx` | Hover link | `hover:text-accent-blue` | Interaction | B | `hover:text-primary` | P2 |
| B-07 | `src/components/vcio/vcio-onboarding-test-launcher.tsx` | Preview link | `text-accent-blue` | Staff utility | B | `text-link` | P3 |
| B-08 | `src/styles/public-marketing-theme.css` | Rules using `var(--accent-blue)` | Resolves via midnight wrapper | Mixed | B | After marketing remap, point to `--phosphor` / `--primary` explicitly | P1 |
| B-09 | Chart `--chart-2` | Recharts / maturity | Ash / cool slate | Series differentiation | B | Keep non-green secondary series; do **not** force all series phosphor | P2 |
| B-10 | `src/components/analytics/category-trends-chart.tsx` | Series colors | includes `var(--chart-2)` | Multi-series | B | Audit distinguishability after palette lock | P2 |
| B-11 | Communications analytics | `fill="var(--chart-2)"` opens | Metric series | B | Same | P2 |
| B-12 | Report CSS (`tip-` / `qbr-` / `report-document`) | Print themes | May include cool blues | Document identity | B | Align print accents with phosphor only if product wants branded PDFs; else keep document neutrality | P3 |

---

## 6. Preserve inventory (C)

| ID | File | Current | Purpose | Class | Guidance |
| --- | --- | --- | --- | --- | --- |
| C-01 | `roadmap-status-badge.tsx` | `sky` / `blue` Tailwind for `approved` / `in_progress` | Status differentiation among 7 phases | C | Keep **distinct hues**; restyle for dark Instrument (replace light `*-50` fills with dark translucent variants) so badges remain color-independent with labels |
| C-02 | Status success / warning / destructive tokens | phosphor / caution / ember | Semantic states | C | Do not collapse success into a different brand green |
| C-03 | Focus rings `--ring` | Phosphor in dark | Accessibility | C | Preserve high-contrast focus; never remove for aesthetics |
| C-04 | Chart series beyond primary | chart-2…5 | Data legibility | C | Preserve multi-hue series; phosphor only for “primary measured” series |
| C-05 | Ember for critical | `#b23a3a` | Risk / at-risk | C | Instrument rule: ember not decorative |
| C-06 | Customer industrial brackets | phosphor/ember borders | Measured reading signal | C | Keep Level 1 treatment |

---

## 7. Hardcoded non-token blues (summary)

| Pattern | Locations | Class |
| --- | --- | --- |
| `rgba(35, 135, 255, …)` / `rgba(70, 120, 255, …)` / `rgba(50, 120, 255, …)` | `public-marketing-theme.css`, `offer-hero-background.tsx` (blue tone) | A |
| `#082f5b` / `#0a3d75` / `#050914`–`#0d1b31` cool navy stack | `:root`, marketing backgrounds | A / B |
| Tailwind `sky-*` / `blue-*` | `roadmap-status-badge.tsx`, `ExecutiveReportDemo.tsx` | C / A respectively |
| Class name `accent-blue` | Communications, catalog, links | B (runtime green in dark) |

**Purple:** No StackScore CSS token for Bobkat electric purple today. Introduction = product decision (see Design Spec § brand-secondary).

---

## 8. Proposed token mapping (conceptual → existing)

Prefer **extend / rename**, not a parallel system.

| Conceptual | Prefer existing / proposed (R1) | Notes |
| --- | --- | --- |
| `surface-base` | `--surface-app` / `--obsidian` | |
| `surface-raised` | `--surface-elevated` / `--frost-panel` | Optional Bobkat `#12101A` |
| `brand-primary` | **`#A855F7`** → new `--brand-primary`; retarget `--primary` | Not phosphor |
| `brand-primary-hover` | `#C084FC` | Text-link AA candidate |
| `brand-primary-subtle` | purple @ 12% | |
| `brand-primary-glow` | purple @ 10–18%; Level 1–2 only | None at Level 0 |
| `brand-secondary` | **`#168BFF`** | Restrained; not nav primary |
| `status-success` | `--success` / phosphor `#3ECF7A` | **Keep green** |
| `status-warning` / `status-danger` | existing | |
| `status-info` | secondary-subtle or ash-blue | Not success |
| `chart-success` | phosphor | Healthy bands |
| `chart-brand` / primary series | purple — product confirms | Do not confuse with health |
| `border-focus` | `--ring` → brand-primary | |
| `text-accent` (interactive) | brand-primary / hover | |
| Legacy `accent-blue` | Migrate by intent; deprecate | Never blind purple map |

---

## 9. Implementation priority queue (R1)

1. **P0** — Introduce `--brand-*`; retarget dark `--primary`/`--link`/`--ring` to `#A855F7`; keep `--success` phosphor.  
2. **P0** — Remap `.public-marketing` to Bobkat purple/blue (purge legacy `#2387FF` stack).  
3. **P0** — Retire `OfferHeroBackground` legacy blue tone.  
4. **P1** — Classify & migrate green brand/interactive usages; leave semantic green.  
5. **P1** — `accent-blue` call sites by intent (Communications ADMIN-006).  
6. **P1** — Light `:root` navy strategy.  
7. **P2** — Catalog, charts, demo sky text, brackets default color.  
8. **P3** — Report CSS, alias removal.

---

## 10. What not to “fix”

- Do not globally replace green with purple.  
- Do not remove roadmap status hue differentiation.  
- Do not add purple atmosphere behind tables/forms.  
- Do not change scoring formulas or maturity band meaning without contrast audit.  
- Do not invent a second “brand green.”  
- Do not map `--accent-blue` → purple in one shot.

---

## 11. R1 — Brand-versus-semantic migration classifications

### 11.1 Target Bobkat reference (live site + logos)

| Role | Hex | Source |
| --- | --- | --- |
| Brand primary | `#A855F7` | bobkatit.com `--primary` |
| Brand secondary | `#168BFF` | CTA gradient end / accent |
| Logo technical blue | `#4A6FE0` / `#4060C0` | PNG sampling |
| Surfaces | `#0B0D10`, `#12101A`, `#161222` | Site CSS (StackScore may keep `#08090C` / `#12141A`) |
| CTA gradient | `#A855F7` → `#168BFF` | Computed `linear-gradient(135deg, …)` |

### 11.2 How to classify each touch (required before editing)

| Class | Definition | R1 action |
| --- | --- | --- |
| **1 Brand identity** | Product personality chrome | → purple / blue |
| **2 Interactive state** | Nav active, tabs, links, CTA, focus | → purple (secondary blue only if decorative) |
| **3 Semantic status** | Success, warning, danger, healthy | **Keep** phosphor / amber / ember |
| **4 Data visualization** | Chart series encoding meaning | Case-by-case; healthy ≠ purple by default |
| **5 Decorative** | Grids, glows, heroes | Purple/blue per texture level |

### 11.3 Current green → target mapping (representative)

| Current signal | Likely class | Target |
| --- | --- | --- |
| `.midnight --primary` / `--accent-blue` = `#3ECF7A` | 1+2 (today conflated) | Split: brand → `#A855F7`; keep success token phosphor |
| `bg-primary` buttons (app) | 2 | Brand purple fill + white label |
| Sidebar active / `text-primary` eyebrows | 2 | Purple |
| `--ring` / focus | 2 | Purple |
| `--success`, success badges, healthy maturity copy | 3 | Phosphor unchanged |
| `--chart-1` phosphor when “official/good” | 4 | Prefer `chart-success`; optional separate brand series |
| Instrument brackets default phosphor | 1/5 | Brand purple; ember stays critical |
| Auth/funnel phosphor buttons | 2 | Purple (+ Level 2 gradient OK) |
| Customer portal `--primary` phosphor | 1+2 | Purple; grid may tint purple/ash |
| Offer hero `tone="phosphor"` | 5 | Level 2 purple/blue atmosphere |
| Communications `accent-blue` classes | 2 or info | Brand primary **or** `status-info` — not one global map |
| Marketing `rgba(35,135,255,…)` | 5 (wrong blue) | Replace with `#168BFF` / `#A855F7` atmosphere |

### 11.4 Compatibility aliases (BRAND-002)

1. Add `--brand-primary` / `--brand-secondary` (+ hover/subtle/foreground/glow).  
2. Point `--primary` at brand-primary in dark/customer/instrument scopes.  
3. Leave `--success` → phosphor.  
4. Keep `--accent-blue` as deprecated alias **only** if needed for compile; prefer deleting call sites.  
5. Grep gates: `accent-blue`, raw `#3ecf7a` in brand contexts, legacy marketing blues.

### 11.5 Explicit non-migrations

| Keep | Why |
| --- | --- |
| Phosphor success / healthy scores | Data meaning |
| Ember critical | Semantic |
| Caution amber | Semantic |
| Roadmap status multi-hue | Differentiation (restyle for dark) |
| Chart multi-series non-green hues | Legibility |
