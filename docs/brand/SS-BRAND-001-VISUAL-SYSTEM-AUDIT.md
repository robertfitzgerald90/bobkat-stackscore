# SS-BRAND-001 — Visual System Audit & Brand Architecture

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Type:** Design system discovery / visual architecture  
**Status:** Audit complete; **R1 direction revised** — await approval before SS-BRAND-002  
**Revision:** [SS-BRAND-001-R1-BOBKAT-ALIGNMENT.md](./SS-BRAND-001-R1-BOBKAT-ALIGNMENT.md)

**Deliverables:**

| Doc | Path |
| --- | --- |
| This audit | `docs/brand/SS-BRAND-001-VISUAL-SYSTEM-AUDIT.md` |
| Color inventory | `docs/brand/SS-BRAND-001-COLOR-INVENTORY.md` |
| Design spec | `docs/brand/SS-BRAND-001-DESIGN-SPEC.md` |
| R1 Bobkat alignment | `docs/brand/SS-BRAND-001-R1-BOBKAT-ALIGNMENT.md` |

**Constraints honored:** No CSS/component/layout/nav/scoring/auth/public-route implementation. Staging only. No SS-BRAND-002 started.

---

## 0. R1 revision — green-first → Bobkat purple-first

**What stays valid:** Sections below that describe *current* code (Instrument phosphor OS, blue `.public-marketing` debt, `--accent-blue` naming, shells, component paths) remain factual.

**What changed (proposed target only):**

| Topic | Original SS-BRAND-001 proposal | **R1 approved target** |
| --- | --- | --- |
| Brand primary | Phosphor green | **Electric purple `#A855F7`** (live Bobkat `--primary`) |
| Brand secondary | Purple (Level 2 only) | **Electric blue `#168BFF`** (restrained) |
| Green | Brand + success | **Semantic / healthy / success only** (`#3ECF7A`) |
| Public atmosphere | Charcoal + phosphor | Charcoal + purple/blue Bobkat lighting |
| Principle | Premium instrument | **Interface = personality; data = meaning** |
| Homepage | Gateway concepts | Structure → **SS-WEB-002**; visuals → **SS-BRAND-003** |

**Reference for R1 hexes:** Live `bobkatit.com` CSS capture (2026-10-30) + `public/branding/*` logos. Product-owner screenshot was not in repo/chat; confirm if a locked brand board differs.

**Do not** globally replace green with purple. Classify brand / interactive / semantic / chart / decorative (see Color Inventory §11 and R1 §5).

---

## 1. Executive summary

StackScore already has a coherent **Instrument** dark system (obsidian charcoal, phosphor `#3ecf7a` used today as both brand and success, ash borders, 0–2px radius, Space Grotesk / Source Sans 3 / JetBrains Mono) applied to authenticated midnight UI, customer portal (SS-UX-003), auth overlays, and assessment funnel/demo overlays. Administrative IA from SS-ADMIN-001…007 and customer IA from SS-UX-012…017 are the **layout baseline** and must not be redesigned for aesthetics.

The largest *current* visual inconsistency is the **public marketing shell** (`.public-marketing`), which still uses a **navy + non-Bobkat blue glow** language. Auth/funnel overlays partially escape it. Legacy `--accent-blue` resolves to phosphor in dark mode (ADMIN-006).

**R1 target direction:** Align StackScore with Bobkat IT — **purple-first** interactive chrome, **blue** secondary accents, **charcoal** surfaces, **green reserved for meaning**. Apply texture levels 0/1/2 so dashboards stay clean. Purge legacy marketing blues in favor of Bobkat `#A855F7` / `#168BFF`.

**Recommendation:** Approve R1 + updated Design Spec, then SS-BRAND-002 (app token migration) → SS-BRAND-003 (public, with SS-WEB-002) → SS-BRAND-004 (validation including ADMIN-007 responsive gap).

---

## 2. Existing visual architecture

### 2.1 CSS / theme stack

```
globals.css
  ├─ :root (light navy SaaS)
  ├─ .midnight / .dark (Instrument remap; --accent-blue → phosphor)
  ├─ public-marketing-theme.css   ← blue marketing debt
  ├─ auth-instrument-theme.css    ← phosphor controls
  ├─ funnel-instrument-theme.css  ← obsidian remap for demo/offer
  ├─ executive-os-theme.css       ← thin; no blue glow
  ├─ instrument-tokens.css        ← .instrument Phase 1
  └─ customer-portal-theme.css    ← industrial charcoal + grid
```

Tailwind v4 CSS-first (`@theme inline` in `globals.css`); **no** `tailwind.config.*`. shadcn `base-nova` primitives under `src/components/ui/*`.

### 2.2 Application shells

| Experience | Shell | Entry |
| --- | --- | --- |
| Staff | `dashboard-shell.tsx` + `.executive-os` | `(dashboard)/*` |
| Customer | same shell + `.customer-portal` / `.customer-portal-main` | role `client` |
| Public | `PublicPageShell` + `.public-marketing` ± `.midnight` | `/`, marketing |
| Auth | `variant="auth"` → `.auth-instrument` | `/login`, reset, activate |
| Funnel / demo | `.funnel-instrument` | `/demo`, assessment offer/invitation |

### 2.3 What is already on-brand

- Dark charcoal surfaces and phosphor primary in authenticated dark UI.  
- Customer plotting-grid + industrial corner panels (SS-UX-003).  
- Instrument corner brackets, mono KPIs, flattened cards.  
- Executive OS KPI hover = border-primary (no glow).  
- Funnel/auth overlays as proof that marketing blue can be neutralized without layout rewrites.

### 2.4 What conflicts

- `.public-marketing` blue ambient system (dominant).  
- `OfferHeroBackground` default `tone="blue"`.  
- Light `:root` navy brand if light mode remains exposed.  
- Legacy `accent-blue` naming + Communications/catalog class usage.  
- Demo `sky-*` text in `ExecutiveReportDemo`.  
- Light-mode Tailwind status badges (`roadmap-status-badge`) vs dark Instrument.

---

## 3. Current color system

See **[SS-BRAND-001-COLOR-INVENTORY.md](./SS-BRAND-001-COLOR-INVENTORY.md)** for full token tables.

**Headline:** One product, three color stories today — (1) Instrument phosphor OS, (2) blue marketing shell, (3) light navy `:root`. BRAND work should collapse (2) into (1) and decide fate of (3).

---

## 4. Decorative blue inventory

Full classified table (A/B/C) lives in the Color Inventory. Highest-impact **A — Replace** items:

| ID | Location | Action |
| --- | --- | --- |
| A-01…A-04 | `src/styles/public-marketing-theme.css` | Remap to Bobkat purple/blue charcoal (`#A855F7` / `#168BFF`) — not phosphor |
| A-05 | `offer-hero-background.tsx` blue tone | Delete legacy marketing blue; Level 2 Bobkat purple/blue |
| A-06 | `ExecutiveReportDemo.tsx` sky classes | Neutral / brand tokens |

**B — Evaluate:** all `accent-blue` class usages (runtime green in dark → classify brand vs info); chart series; communications info pills.  
**C — Preserve:** roadmap phase status hues; semantic success (**phosphor**) / warning / danger; focus visibility (retarget ring to purple).

---

## 5. Proposed token architecture (R1)

Lock surfaces: obsidian / frost / ash / bone / ember.  
**Brand primary:** `#A855F7`. **Brand secondary:** `#168BFF`.  
**Semantic success:** phosphor `#3ECF7A` (not brand).

Introduce `--brand-*`; retarget `--primary` / `--link` / `--ring` to purple; keep `--success` green. Migrate `--accent-blue` **by intent** only.

Full detail: Design Spec + R1 Alignment.

---

## 6. Surface and texture recommendations

| Level | Use |
| --- | --- |
| 0 Functional | Tables, forms, Communications history, Users, Billing, assessment answering |
| 1 Branded | Command Center, Customer Overview/Explore — **subtle purple** framing/grids |
| 2 Expressive | `/`, login, demo — **purple/blue** Bobkat atmosphere |

Reuse customer-portal grid + instrument brackets (bracket default → brand-primary). Prefer CSS; honor `prefers-reduced-motion`.

---

## 7. Typography recommendations

Keep Space Grotesk / Source Sans 3 / JetBrains Mono.

- **Ops UI:** body + mono for data.  
- **Public heroes:** condensed/bold; Bobkat kit font only after license review.  
- **Do not** use distressed faces on tables, forms, nav, status, or assessment questions.

---

## 8. Shared component audit

| Family | Path | Variants / notes | Hardcoded / inconsistency | Tokenize? | Risk | Level |
| --- | --- | --- | --- | --- | --- | --- |
| Button | `components/ui/button.tsx` | default/outline/… use CSS vars | Marketing adds `.marketing-btn-*` glow | Yes — keep CVA; strip marketing glow from shared | High (all shells) | 0 / 2 marketing only |
| Card | `ui/card.tsx` | shadcn slot | Soft shadow utilities in globals `.stat-card` light path | Prefer hairline in dark | Medium | 0–1 |
| Badge | `ui/badge.tsx` + domain badges | Catalog uses `accent-blue` | Rename to primary | Low–med | 0 |
| StatusPill | `communications-shell.tsx` | success/warning/neutral/**info→accent-blue** | ADMIN-006 | Define status-info | Med | 0 |
| Tabs | `ui/tabs.tsx` | Base UI | Generally token-clean | Low | 0 |
| Sidebar | `layout/app-sidebar.tsx` | Executive OS link tokens | Already phosphor in dark | Low if tokens only | 1 shell |
| Dialog/Sheet | `ui/dialog`, `ui/sheet` | | Token-driven | Medium (focus) | 0 |
| Table | `ui/table` + admin tables | | Keep Level 0 | High if textured | 0 |
| Input | `ui/input` | | Auth overlay already phosphor focus | Med | 0 |
| Charts | `analytics/*`, Explore | `--chart-*` | Multi-series B-class | High if monochrome | 0–1 |
| Progress | client-ui tokens | phosphor fill | Good | Low | 0 |
| Empty/loading | `client-ui/*` | | Preserve patterns | Low | 0 |
| Corner brackets | `design-system/instrument/*` | phosphor/ember | Canonical Level 1 | Low | 1 |
| Marketing panels | `lib/marketing/tokens.ts` | class map to CSS | Blue CSS underneath | High for public | 2 |

**Principle:** Refine tokens and a few class aliases — **not** a component-library rewrite.

---

## 9. Administrative experience audit

### Scope

Command Center, Clients, client workspace (5 groups), Projects, Leads, Recurring Services (`/admin/vcio`), Communications (5 groups), Operations.

### Findings

| Issue | Where | Severity | Preserve? |
| --- | --- | --- | --- |
| Legacy `accent-blue` chrome | `communications-shell.tsx`, template links | Medium visual debt (name); color often already green in dark | Soften in BRAND-002 (ADMIN-006) |
| Light status badge palette | Roadmap badges if shown in mixed themes | Medium | Keep status meaning (C) |
| Dashboard KPI cards | Some flat divs vs `ExecutiveKpiCard` | Low polish | Prefer executive-os cards over time; not IA change |
| Catalog accent-blue | Technology catalog ops | Low | Map to primary |
| Blue marketing not in admin shell | — | N/A | Staff shell already Instrument-aligned |

### Preserve (hard)

Seven staff primaries; five client workspace groups; five Communications groups; role-aware visibility; all route paths from SS-ADMIN-002…006.

### Texture

Admin dense pages → **Level 0**. Command Center overview → **Level 1** optional grid/brackets on section heroes only.

---

## 10. Customer experience audit

### Scope

Overview, Explore, Roadmap, Projects, Reports (SS-UX-012…017 baseline).

### Findings

| Issue | Notes |
| --- | --- |
| Already closest to target | `.customer-portal` charcoal/phosphor/grid/brackets |
| Pillar / chart colors | Must remain distinguishable; audit in BRAND-002 without changing scoring |
| Project status colors | Domain-specific; keep labels + hues |
| Nav accents | Phosphor active — good |
| Blue leakage | Minimal vs marketing; watch shared `accent-blue` links |

### Preserve (hard)

Official StackScore presentation; eight pillars; Explore Intelligence Center; strengths/attention; `computeProjectProgress`; roadmap relationships; reports functionality; customer five-primary nav.

---

## 11. Public experience audit

### Routes inspected (actual paths)

| Route | Role |
| --- | --- |
| `/` | `StackScoreGatewayHome` — product gateway |
| `/login`, `/forgot-password`, `/reset-password`, activate | Auth |
| `/demo`, `/demo/*`, `/product-overview` | Interactive demo / overview |
| `/assessment-offer`, `/assessment-invitation`, `/assessment/start`, `/assessment-purchased` | Assessment entry |
| `/technology-snapshot` | Snapshot landing |
| `/solutions/*`, `/services`, `/vcio-offer`, checkout paths | Marketing / commercial (Bobkat acquisition-adjacent) |

Route constants: `src/lib/marketing/stackscore-routes.ts`.

### Current gateway

`/` already centers Sign In + consulting + assessment cards + demo — closer to a product gateway than a full brochure. Visual language still rides **blue marketing CSS**.

### Desired direction (R1)

- Level 2 Bobkat purple/blue charcoal gateway.  
- Strong StackScore identity; subtle Bobkat attribution.  
- Primary **Sign In**; secondary **Explore Demo** (structure: **SS-WEB-002**; visuals: **SS-BRAND-003**).  
- Do **not** remove purchase/invitation/snapshot/consulting workflows.

### Auth

Today: phosphor controls on marketing shell. Target: purple CTAs; parent `.public-marketing` remapped to Bobkat atmosphere in BRAND-003.

---

## 12. Accessibility and performance considerations

| Topic | Spec (R1) |
| --- | --- |
| Contrast | White on `#A855F7` fills; purple **text** may need `#C084FC`; measure AA |
| Focus | Brand-primary ring after migration; never glow-only |
| Status | Color + label; success stays phosphor |
| Reduced motion | No pulsing atmosphere |
| Glow/GPU | Legacy marketing blooms out; Level 2 radials CSS-only |
| Mobile | Close DEF-007-004 in BRAND-004 |

---

## 13. Implementation risks

| Risk | Safeguard |
| --- | --- |
| Global green→purple | Classify brand vs semantic vs chart (R1 §5 / Color Inventory §11) |
| `--primary` retarget | Highest blast radius — shell QA matrix |
| Chart misread | Freeze formulas; screenshot Explore/Overview; keep multi-hue |
| `--accent-blue` blind remap | Forbidden; migrate by intent |
| Purple overuse | Level caps; no Level 0 atmosphere |
| Homepage dual ownership | SS-WEB-002 structure + BRAND-003 visuals |
| Light `:root` navy | Product decision |

---

## 14. SS-BRAND-002 — Application Reskin (plan, R1)

**Goal:** Purple brand chrome; green semantic meaning. No IA/scoring/workflow changes.

1. Add `--brand-*`; set `--primary` → `#A855F7`; keep `--success` phosphor.  
2. Inventory & migrate green usages by class (brand/interactive/semantic/chart/decorative).  
3. Migrate `accent-blue` call sites by intent (Communications first).  
4. Level 0 enforcement; Level 1 purple framing on Command Center / Overview / Explore.  
5. Nav/tabs/links → purple; brackets default → brand-primary.  
6. Chart pass — separate success vs brand series.  
7. Vitest + visual QA.

---

## 15. SS-BRAND-003 — Public Experience Reskin (plan, R1)

**Goal:** Bobkat-aligned public/auth/demo shell; Bobkat.com remains acquisition site.

1. Remap `public-marketing-theme.css` to `#A855F7` / `#168BFF` charcoal (purge legacy `#2387FF` stack).  
2. Coordinate gateway structure with **SS-WEB-002**.  
3. Auth/funnel: purple CTAs; optional purple→blue gradient on Level 2 buttons.  
4. Remove `OfferHeroBackground` legacy blue; Bobkat radials.  
5. Preserve all functional routes.

---

## 16. SS-BRAND-004 — Visual Validation (plan)

| Gate | Detail |
| --- | --- |
| Responsive | 1440 / 1024 / 768 / 390 / 320 — staff **and** customer (closes **DEF-007-004**) |
| A11y | Contrast AA, focus order, keyboard nav, status not color-only |
| Visual regression | Command Center, client workspace, Explore, Projects, Communications shell, `/`, `/login`, `/demo` |
| Role checks | Admin / technician / customer chrome accents |
| Charts | Explore + Overview screenshots vs baseline |
| Performance | No large new assets; no continuous glow animation |
| Build | Clean `npm run build` without concurrent dev |

Automated: existing ADMIN/UX suites must remain green; add brand token unit tests only if aliases introduced.

---

## 17. Decisions requiring product approval

1. Lock **`#A855F7` / `#168BFF`** (or supply alternate brand board / screenshot).  
2. Light `:root` navy — retire, dark-only, or dual?  
3. App buttons: solid purple vs purple→blue gradient.  
4. Chart primary series: brand purple vs success green?  
5. Condensed display font: Space Grotesk vs Bobkat kit face.  
6. SS-WEB-002 timing vs BRAND-003.  
7. PDF chrome brand adoption — yes/no.  
8. Confirm live-site reference if a different PO screenshot is authoritative.  
9. Proceed to **SS-BRAND-002**?

---

## Stop

SS-BRAND-001 + **R1** documentation complete. **Do not begin SS-BRAND-002 without explicit product approval.**
