# SS-BRAND-001 — Design Specification

**Branch:** `staging`  
**Date:** 2026-10-30  
**Status:** Proposed architecture — **not implemented**  
**Revision:** **R1 — Bobkat purple-first alignment** (see [SS-BRAND-001-R1-BOBKAT-ALIGNMENT.md](./SS-BRAND-001-R1-BOBKAT-ALIGNMENT.md))  
**Philosophy:** Bobkat IT = expressive brand. StackScore = premium enterprise application that inherits Bobkat’s purple/charcoal language while keeping **data meaning** in semantic colors.

**Companions:** [Color Inventory](./SS-BRAND-001-COLOR-INVENTORY.md) · [Visual System Audit](./SS-BRAND-001-VISUAL-SYSTEM-AUDIT.md) · [R1 Alignment](./SS-BRAND-001-R1-BOBKAT-ALIGNMENT.md)

---

## 0. R1 direction change (read first)

| Topic | SS-BRAND-001 original proposal | **R1 approved direction** |
| --- | --- | --- |
| Brand accent | Phosphor green `#3ECF7A` | **Electric purple `#A855F7`** (Bobkat `--primary`) |
| Secondary | Purple as Level-2-only flourish | **Electric blue `#168BFF`** (restrained) |
| Green role | Brand + success | **Success / healthy / positive ops only** |
| Principle | Instrument green OS | **Interface = personality; data = meaning** |

Factual inventory of *current* code (green Instrument in dark UI; blue marketing shell) remains in the Color Inventory — that describes **today**, not the target.

---

## 1. Product visual identity

StackScore should feel like a **technology intelligence platform** that is recognizably Bobkat: charcoal depth, electric-purple interactive chrome, sparse electric-blue technical accents, angular industrial geometry, selective atmospheric lighting on public surfaces.

It must **not** feel like:

- A concert flyer or gaming HUD.
- A generic purple SaaS template.
- A neon cyberpunk dashboard.
- A navy “corporate blue” marketing site (legacy `.public-marketing` debt).
- A green-first product (legacy Instrument brand role).

**Relationship:** Bobkat IT website carries full expressive brand. StackScore authenticated UI uses the same purple/blue/charcoal DNA at controlled intensity so operational data stays clear.

---

## 2. Proposed color palette

### 2.1 Surfaces

| Role | Hex | Notes |
| --- | --- | --- |
| Background | `#08090C` | Charcoal foundation (retain) |
| Elevated / card | `#12141A` | Optional align to Bobkat `#12101A` |
| Card hover | `#171A21` | Retain |
| Sidebar | `#0A0B10` | Retain / slight purple bias OK |
| Text primary | `#F1F2F4` | Retain |
| Text muted | `#8B92A0` | Retain |

Do **not** introduce navy backgrounds throughout the authenticated app.

### 2.2 Brand accents (R1)

| Role | Hex | Usage |
| --- | --- | --- |
| Brand primary | **`#A855F7`** | Active nav, selected tabs, links, primary CTA fill, framing, Level 1 highlights |
| Brand primary hover | `#C084FC` | Hover; preferred for small purple **text** on charcoal (AA) |
| Brand primary subtle | `rgba(168, 85, 247, 0.12)` | Active backgrounds |
| Brand primary foreground | `#FFFFFF` / bone | Text on filled purple |
| Brand primary glow | `rgba(168, 85, 247, 0.10–0.18)` | Level 1–2 atmosphere only |
| Brand secondary | **`#168BFF`** | Sparse technical accents, Level 2 gradients, labels |
| Brand secondary subtle | `rgba(22, 139, 255, 0.12)` | |
| Public CTA gradient | `linear-gradient(135deg, #A855F7 0%, #168BFF 100%)` | Level 2 primary buttons (Bobkat parity) |

Logo diamond blue (~`#4A6FE0`) may alias for wireframe motifs; do not use as app primary.

### 2.3 Operational / semantic (preserve green)

| Role | Hex | Usage |
| --- | --- | --- |
| Success / healthy | `#3ECF7A` | Positive results, healthy posture, success states |
| Success hover | `#56DD8D` | |
| Warning | `#C9A227` | |
| Danger | `#B23A3A` | |
| Info | Secondary-subtle or ash — **not** success green | |

**Green is not** default navigation, default CTA, or brand link color.

### 2.4 Charts

| Series intent | Guidance |
| --- | --- |
| Healthy / success band | Phosphor (`chart-success`) |
| Brand highlight series | Purple (`chart-brand` / chart-primary) — product confirms |
| Neutral compare | Ash |
| Caution / critical | Amber / ember |
| Multi-pillar Explore | Keep distinguishable hues; do not monochrome |

---

## 3. Token definitions

Extend existing CSS variables; separate brand from semantic.

### Surfaces

```
--surface-app
--surface-sidebar
--surface-elevated
--surface-card
--surface-card-hover
```

### Brand (new conceptual set)

```
--brand-primary              /* #A855F7 */
--brand-primary-hover        /* #C084FC */
--brand-primary-subtle
--brand-primary-foreground
--brand-primary-glow         /* default none in Level 0 */
--brand-secondary            /* #168BFF */
--brand-secondary-subtle
```

### Bridge to shadcn / Tailwind (target after migration)

```
--primary            → brand-primary
--primary-foreground  → brand-primary-foreground
--link / --ring      → brand-primary (text links may use hover for AA)
--success            → phosphor (UNCHANGED role)
--warning / --destructive → unchanged
```

### Semantic / charts

```
--status-success | --success
--status-warning | --warning
--status-danger  | --destructive
--status-info
--chart-1 … --chart-5  /* split brand vs success meaning — see R1 §5 */
```

**Legacy `--accent-blue`:** Deprecated name. Dark value today is green. Migrate **by intent**; never globally assign purple to this alias without an audit.

---

## 4. Surface & texture levels

| Level | Name | Allow | Surfaces |
| --- | --- | --- | --- |
| **0** | Functional | Charcoal, ash borders, semantic colors, no atmosphere | Tables, forms, assessment questions, billing, communications history, dense cards |
| **1** | Branded | Subtle purple framing, low-opacity grids, corner accents, very restrained purple wash, sparse blue lines | Command Center, Customer Overview, Explore, project overview headers, major section headers |
| **2** | Expressive | Purple/blue radials, angular geometry, large low-opacity artwork, condensed headlines, gradient CTAs | Homepage, login, demo entry, assessment invitation/offer heroes |

**Forbid at Level 0–1:** glowing every card, purple table backgrounds, decorative text competing with KPIs.

Prefer CSS geometry over large dashboard images. Honor `prefers-reduced-motion`.

---

## 5. Typography hierarchy

| Face | Role |
| --- | --- |
| Space Grotesk | Display / section titles in app |
| Source Sans 3 | Body, nav, forms, buttons |
| JetBrains Mono | Scores, KPIs, timestamps, technical labels |

Public heroes may use bold condensed presentation (Space Grotesk tightened, or a Bobkat-kit condensed face after license review — **no install in discovery**).

**Forbidden for metalcore/display faces:** navigation, forms, tables, assessment questions, status messages, numeric metrics (except mono numerals).

---

## 6. Glow & shadow guidelines

| Context | Rule |
| --- | --- |
| Level 0 | No colored glow; hairline borders only |
| Level 1 | Optional soft purple wash ≤10% behind section chrome — not per-KPI bloom |
| Level 2 | Purple/blue atmospheric radials OK; no pulsing |
| Focus | Visible brand-primary ring; glow never replaces focus |
| Hover | Border-color ≤150ms; no bounce |

---

## 7. Border treatments

- Default: ash @ ~20%  
- Accent interactive: purple @ 20–40%  
- Secondary technical: blue @ low opacity  
- Radius: 0–2px Instrument (Bobkat sharp controls)  
- Industrial: corner brackets; optional Level 2 distressed frame metaphor without illegible grit on text  

---

## 8. Navigation styling

**Preserve IA:** staff 7 primaries; client workspace 5 groups; Communications 5 groups; customer 5 primaries.

| Element | Spec |
| --- | --- |
| Active | Purple subtle fill + purple indicator |
| Idle | Bone/ash |
| Focus | Brand ring |
| Dense ops children | Level 0 |

---

## 9. Chart color guidelines

1. Do not globally recolor “good” scores purple.  
2. Success/healthy bands stay phosphor.  
3. Brand-highlight series may use purple when not encoding health.  
4. Keep labels; test phosphor vs purple confusion.  
5. No formula/scoring changes in brand tickets.

---

## 10. Shared component treatment

| Family | Level | R1 note |
| --- | --- | --- |
| Button default | 0 / 2 | App: solid brand-primary; Public Level 2: optional purple→blue gradient |
| Links | 0 | Brand primary/hover (AA) |
| Badge success | 0 | Phosphor semantic |
| StatusPill info | 0 | status-info — not brand dump |
| Tabs / sidebar active | 0–1 | Purple |
| Tables / inputs | 0 | Neutral |
| Corner brackets | 1 | Default brand-primary; ember for critical |
| Marketing panels | 2 | Bobkat atmosphere; purge legacy marketing blue |

---

## 11. Accessibility requirements

- WCAG AA for text and essential controls.  
- Separate purple tokens for **fill / text / border / glow**.  
- White/bone on `#A855F7` for filled buttons.  
- Prefer `#C084FC` for small purple text on charcoal if `#A855F7` fails AA.  
- Status not color-only.  
- Reduced-motion respected.  
- Charts remain distinguishable.

---

## 12. Responsive principles

- Tokens first; no IA/layout changes for brand.  
- Grids reduce opacity on small viewports.  
- Level 2 gateway: brand, headline, short support, **Sign In** + **Explore Demo** (structure via SS-WEB-002).  
- BRAND-004 closes staff viewport gap (ADMIN-007 DEF-007-004).

---

## 13. Shell strategy

| Shell | Target |
| --- | --- |
| Staff `.executive-os` + dark | Purple brand primary; Level 0–1 |
| Customer `.customer-portal` | Same; keep industrial grid as Level 1 ash/purple |
| Public `.public-marketing` | Remap to Bobkat purple/blue charcoal (BRAND-003) |
| Auth / funnel overlays | Purple CTAs; Level 2 atmosphere OK |

---

## 14. Public gateway copy concepts (not final)

Owned structurally by SS-WEB-002; styled by SS-BRAND-003.

- Strong StackScore identity; subtle Bobkat attribution  
- Primary: **SIGN IN**  
- Secondary: **EXPLORE DEMO**  
- Preserve all purchase/invitation/snapshot/consulting/checkout/auth routes  

---

## 15. Explicit non-goals

- No nav IA, scoring, chart math, Communications behavior, Stripe, auth logic, or font installs in discovery.  
- No global green→purple replacement.  
- No implementation until explicit approval of R1 + BRAND-002 kickoff.
