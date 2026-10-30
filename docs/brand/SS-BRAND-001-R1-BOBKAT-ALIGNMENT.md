# SS-BRAND-001-R1 — Bobkat IT Visual Alignment

**Branch:** `staging`  
**Date:** 2026-10-30  
**Type:** Design system revision (specification only)  
**Status:** Revised direction — **await approval before SS-BRAND-002**  
**Supersedes (direction only):** Green-first proposals in the original SS-BRAND-001 Design Spec  
**Does not invalidate:** Factual code inventory in SS-BRAND-001 Color Inventory / Audit § existing architecture

**Companions:**  
[Design Spec (updated)](./SS-BRAND-001-DESIGN-SPEC.md) · [Color Inventory (updated)](./SS-BRAND-001-COLOR-INVENTORY.md) · [Visual System Audit (updated)](./SS-BRAND-001-VISUAL-SYSTEM-AUDIT.md)

---

## 1. Executive summary

Product direction moves StackScore from a **green-first Instrument brand** to a **purple-first, charcoal-based system** aligned with the live Bobkat IT website, with **restrained electric-blue** secondary accents and **phosphor green retained for semantic/operational meaning only**.

**Core principle:** *The interface carries the personality. The data carries the meaning.*

Authenticated surfaces stay premium SaaS: Level 0 ops density, Level 1 subtle purple framing, Level 2 expressive public gateway. Navigation IA from SS-ADMIN / SS-UX is frozen. Homepage structural simplification remains **SS-WEB-002**; visual shell is **SS-BRAND-003**.

**Reference used this revision:** Live capture of `https://bobkatit.com/` (2026-10-30) plus repo logos under `public/branding/`. A dedicated product-owner screenshot was **not** attached in chat/repo; if a different locked brand board exists, re-validate hexes against it before implementation.

---

## 2. Bobkat IT visual reference analysis

### 2.1 Sources

| Source | Finding |
| --- | --- |
| Live homepage CSS | `--primary: #a855f7`; accent blue `#168bff`; backgrounds `#0b0d10` / `#12101a` / `#161222`; foreground `#f1f1f1`; muted `#9a9fa8` |
| Primary CTA | `linear-gradient(135deg, #a855f7 0%, #168bff 100%)` with white label |
| Secondary CTA | Ghost / purple-tinted border, white text |
| Logo PNGs (`new-bobkat-it-logo.png`, etc.) | Angular bobcat geometry; forehead diamond / “IT” wordmark in **electric blue** (~`#4060c0`–`#4a6fe0`) |
| Site accent extras | Lime `#b5ff00` (marketing spark only); teal-green `#3d9b7a`; ember `#b23a3a`; caution `#c4923a` |

### 2.2 Reusable patterns for StackScore

| Bobkat pattern | StackScore translation |
| --- | --- |
| Near-black field + purple/blue atmospheric radials | Level 2 public shells only; Level 1 = very low-opacity purple wash behind section headers |
| Purple→blue gradient CTA | Public primary buttons; app default filled button = solid brand-primary (gradient optional Level 2) |
| Sharp / low-radius controls | Keep Instrument 0–2px radius |
| Condensed uppercase hero + technical labels | Public H1 + eyebrows; never tables/forms |
| Angular geometry / jagged section breaks | CSS polygon or corner brackets — not full homepage zig-zag inside dashboards |
| Large low-opacity brand artwork | Public watermark only; dependency on approved Bobkat assets — do not invent logo art |
| Plotting-grid / wireframe diamond motif | Ash or blue-tinted grid overlays (Level 1–2); reuse customer-portal grid technique |
| “IT” electric blue accent | Brand-secondary for technical labels / sparse detailing |

### 2.3 What not to copy wholesale

- Marketing lime sparks into ops UI.  
- Concert-level distressed full-bleed textures behind KPIs.  
- Multiple competing CTAs on the StackScore gateway.  
- Navy corporate marketing blues from old StackScore `.public-marketing` (still A-class debt).

---

## 3. Revised brand philosophy

| Layer | Role |
| --- | --- |
| Bobkat IT website | Expressive acquisition brand |
| StackScore app | Controlled extension — purple personality, green meaning |
| StackScore public gateway | Level 2 Bobkat-adjacent entry; not a second brochure site |

Impression targets: **Technical. Industrial. Confident. Distinctive. Premium.**  
Avoid: generic purple SaaS, gaming HUD, nightclub neon, concert poster, cyberpunk clutter.

---

## 4. Proposed primary and secondary palette

### Surfaces (retain / slight purple-friendly tweak)

| Role | Hex | Notes |
| --- | --- | --- |
| Background | `#08090C` | Keep; close to Bobkat `#0b0d10` |
| Elevated | `#12141A` | Keep; Bobkat uses `#12101a` (slightly purple-biased) — optional unify to `#12101A` in BRAND-002 |
| Card hover | `#171A21` | Keep |
| Text | `#F1F2F4` | Keep (Bobkat `#f1f1f1`) |
| Muted | `#8B92A0` | Keep (Bobkat `#9a9fa8`) |
| Avoid | Navy app backgrounds | Authenticated app stays charcoal, not `#050914` marketing navy |

### Brand primary — electric purple

| Token use | Recommended hex | Rationale |
| --- | --- | --- |
| **Canonical primary** | **`#A855F7`** | Exact Bobkat `--primary` |
| Hover / emphasis | `#C084FC` | Lighter violet for hover fills / readable text links |
| Subtle fill | `rgba(168, 85, 247, 0.12)` | Nav active, soft panels |
| Glow (Level 1–2 only) | `rgba(168, 85, 247, 0.10–0.18)` | Atmospheric; never constant pulse |
| On-primary text | `#F1F1F1` / `#FFFFFF` | Matches Bobkat CTA labels |

Candidate `#7C3AED` (ticket starter) is **rejected in favor of `#A855F7`** for live-site parity unless product supplies a different brand board.

### Brand secondary — electric blue

| Token use | Recommended hex | Rationale |
| --- | --- | --- |
| Canonical secondary | **`#168BFF`** | Bobkat CTA gradient end / accent |
| Logo-aligned technical blue | `#4A6FE0` | Closer to logo diamond sampling; optional alias for wireframe motifs |
| Subtle | `rgba(22, 139, 255, 0.12)` | Sparse Level 1–2 only |

Blue must **not** compete with purple for nav/CTA primacy. Do not revive StackScore marketing `rgba(35,135,255,…)` debt — replace with these Bobkat values.

### Operational / semantic green (preserved)

| Role | Hex | Usage |
| --- | --- | --- |
| Success / healthy / positive maturity | `#3ECF7A` (phosphor) | Status, healthy scores, success toasts, positive progress where semantic |
| Success hover | `#56DD8D` | |
| **Not for** | — | Default nav, default CTA, brand links, selected tabs |

### Semantic others

| Role | Hex |
| --- | --- |
| Warning | `#C9A227` (keep) / Bobkat caution `#C4923A` as optional align |
| Danger | `#B23A3A` |
| Info | Soft blue-gray or brand-secondary subtle — **not** success green |

---

## 5. Brand-versus-semantic color separation

### Token families (conceptual → prefer extending existing CSS vars)

**Brand**

- `--brand-primary` → `#A855F7`  
- `--brand-primary-hover` → `#C084FC`  
- `--brand-primary-subtle` → purple @ 12%  
- `--brand-primary-foreground` → `#FFFFFF` / bone  
- `--brand-secondary` → `#168BFF`  
- `--brand-secondary-subtle` → blue @ 12%  

**Map shadcn bridge carefully:**

- `--primary` (buttons, rings, “brand interactive”) → **brand-primary**, not phosphor  
- `--link` / `--ring` → brand-primary (or primary-hover for text AA)  
- `--success` → phosphor (unchanged role)  
- `--accent-blue` → **do not** globally remap; migrate per usage class (see §12)

**Semantic**

- `--status-success` / `--success` → phosphor  
- `--status-warning` / `--warning`  
- `--status-danger` / `--destructive`  
- `--status-info` → secondary-subtle or ash-blue — distinct from success  

**Visualization**

- `--chart-1` / chart-primary → brand series OR neutral measured series (product choice; default: brand-primary for “UI highlight series,” phosphor for “healthy score series”)  
- `--chart-success` → phosphor  
- `--chart-warning` / `--chart-critical` → caution / ember  
- Multi-pillar Explore hues remain differentiated  

### Classification rule (every green/purple/blue touch)

| Class | Migrates to purple? | Example |
| --- | --- | --- |
| 1 Brand identity | Yes | Logo-adjacent chrome, marketing atmosphere |
| 2 Interactive state | Yes | Active nav, tabs, links, primary CTA, focus ring |
| 3 Semantic status | **No** (keep green/amber/red) | Success badge, healthy maturity, completed |
| 4 Data visualization | **Case-by-case** | Score “good” band stays green; decorative series may use purple |
| 5 Decorative treatment | Purple/blue per level | Grids, glows, brackets |

---

## 6. Updated texture levels

| Level | Surfaces | Allow | Forbid |
| --- | --- | --- | --- |
| **0 Functional** | Tables, forms, assessment Qs, billing, comms history, dense cards | Charcoal, ash borders, semantic colors, clean type | Atmosphere, grids behind text, glows |
| **1 Branded** | Command Center, Customer Overview, Explore, project headers, major admin section headers | Low-opacity purple framing, ash/purple grids ≤3.5%, corner brackets, sparse blue technical lines, very restrained purple wash | Glowing every card, purple table backgrounds, KPI-competing gradients |
| **2 Expressive** | `/`, login, demo entry, assessment invitation/offer heroes | Purple/blue radials, angular geometry, large low-opacity artwork, bold condensed headlines, gradient CTAs | Cluttered multi-CTA, unreadable overlays |

Principle unchanged: personality in chrome; meaning in data.

---

## 7. Administrative styling direction

Preserve SS-ADMIN architecture (7 primaries, 5 workspace groups, 5 Communications groups, routes, RBAC).

| Area | Visual |
| --- | --- |
| Command Center | Purple active nav; Level 1 section framing; clean KPI cards; semantic metric colors |
| Clients / workspace | Purple selected nav/interactions; Level 0 lists |
| Projects | Interaction purple; progress/status semantics unchanged |
| Leads / Recurring / Ops | Level 0; purple only for selection/links |
| Communications | Replace legacy `accent-blue` brand usages with brand-primary; keep delivery behavior |

---

## 8. Customer styling direction

Preserve Overview / Explore / Roadmap / Projects / Reports.

| Surface | Visual |
| --- | --- |
| Overview hero | Level 1 purple technical framing; **Official StackScore** stays prominent; maturity meaning via semantic greens/ambers/reds |
| Explore | Purple for selected pillar, tabs, framing; pillar score hues stay meaningful |
| Roadmap / Projects | Purple interactions; status/progress semantics preserved |
| Reports | On-screen chrome may adopt brand tokens; **no PDF/scoring content changes** in brand tickets |

---

## 9. Public gateway direction

| Concern | Owner |
| --- | --- |
| Structural simplification (Sign In + Explore Demo; remove sales card sprawl) | **SS-WEB-002** |
| Visual Bobkat-aligned shell | **SS-BRAND-003** |

Preserve all dedicated routes (purchase, invitation, snapshot, consulting, checkout, activation, auth).  
Do not implement homepage changes in this ticket.

Desired impression: StackScore product entrance with subtle Bobkat attribution — not a second marketing site.

---

## 10. Typography recommendations

| Face | Keep? | Role after R1 |
| --- | --- | --- |
| Space Grotesk | Yes | App display / section titles |
| Source Sans 3 | Yes | Body, nav, forms |
| JetBrains Mono | Yes | Scores, IDs, technical labels |

**Public condensed display:** Bobkat homepage uses a heavy condensed sans for heroes. StackScore should evaluate:

1. Whether Space Grotesk bold + tracking is sufficient (preferred — zero new deps).  
2. If product requires closer match, identify licensed condensed face from Bobkat brand kit (name/file TBD — **dependency**).  
3. Performance + license review before install.  

**Do not** install fonts in R1. **Do not** use distressed faces in nav/forms/tables/questions/KPIs.

---

## 11. Accessibility considerations

| Use | Pairing | Note |
| --- | --- | --- |
| Filled primary button | White/bone on `#A855F7` or on purple→blue gradient | Matches Bobkat; verify AA for small text |
| Purple as text link on charcoal | Prefer `#C084FC` or underline + weight; raw `#A855F7` may fail small-text AA — **measure before ship** |
| Purple border only | OK for secondary buttons with bone label |
| Purple glow | Decorative only; never sole focus indicator |
| Focus ring | Brand-primary or primary-hover; 2–3px visible |
| Status | Never color-only; keep labels |
| Charts | Preserve multi-hue; test phosphor vs purple series confusion |
| Reduced motion | Disable atmospheric animation; static grids OK |

**Separate purple tokens by role** (fill vs text vs border vs glow) — one hex is not universal.

---

## 12. Token migration strategy

### 12.1 Inventory buckets (green today)

| Bucket | Typical signals | R1 action |
| --- | --- | --- |
| Brand-green | `--primary` in dark = phosphor; `bg-primary` CTAs; sidebar active; `text-primary` eyebrows; instrument brackets default | → brand-primary purple |
| Interactive-green | focus rings, link color, tab active, hover borders | → brand-primary / hover |
| Semantic-green | `--success`, success badges, healthy maturity, completed | **Keep phosphor** |
| Chart-green | `--chart-1`/`3` when meaning “good/measured health” | Keep or split: chart-success vs chart-brand |
| Decorative-green | phosphor glows, offer hero phosphor tone | → purple/blue per level |

### 12.2 `--accent-blue` special case

Dark mode value is already phosphor. **Forbidden:** `accent-blue { #A855F7 }` global find-replace.

Per usage:

- Brand/interactive → `text-primary` / `brand-primary`  
- Info pills → `status-info`  
- Leave unused alias deprecated  

### 12.3 Compatibility

1. Introduce `--brand-*` alongside existing vars.  
2. Retarget `--primary` / `--link` / `--ring` to purple in `.midnight`, `.customer-portal`, `.instrument`.  
3. Keep `--success` phosphor.  
4. Temporary aliases if needed; grep gate for `accent-blue` / raw `#3ecf7a` in brand contexts.  
5. Shared components (`Button` default) inherit `--primary` — highest blast radius; QA all shells.

### 12.4 Safeguards

- No scoring/chart formula changes.  
- Screenshot baselines: Overview score hero, Explore, Command Center, login.  
- Technician/admin/customer role chrome checks.

---

## 13. Updated SS-BRAND-002 plan (application reskin)

1. Add brand tokens; retarget `--primary` to `#A855F7`; preserve `--success` phosphor.  
2. Classify & migrate green usages (brand vs semantic).  
3. Migrate `accent-blue` call sites by intent (Communications first — ADMIN-006).  
4. Level 0 audit — no purple washes on tables.  
5. Level 1 — Command Center / Overview / Explore framing + grids.  
6. Nav active states → purple.  
7. Corner brackets default color → brand-primary (ember remains critical).  
8. Chart pass — separate success series from brand series.  
9. Automated nav/UX suites + visual QA — **no IA changes**.

Out of scope: public marketing CSS (003), fonts install, PDF content, workflows.

---

## 14. Updated SS-BRAND-003 plan (public experience)

1. Replace `.public-marketing` blue debt with Bobkat purple/blue atmosphere (not old `#2387FF` stack).  
2. Gateway visuals Level 2; coordinate structure with **SS-WEB-002** (Sign In + Explore Demo).  
3. Auth/funnel overlays: purple CTAs; gradient allowed on public primary buttons.  
4. Assessment heroes: drop legacy blue tone; Bobkat-aligned radials.  
5. Preserve all functional routes.  
6. Optional brand watermark asset dependency from Bobkat kit.

---

## 15. Remaining decisions requiring approval

1. Confirm **`#A855F7` / `#168BFF`** as locked brand primary/secondary (vs alternate brand board / attached screenshot).  
2. Elevate surface unify to Bobkat `#12101A` vs keep `#12141A`.  
3. App filled buttons: solid purple vs purple→blue gradient (recommend solid in app, gradient Level 2).  
4. Chart policy: is “primary series” brand purple or success green?  
5. Condensed display font: Space Grotesk sufficient vs Bobkat kit face.  
6. Homepage structure timing: SS-WEB-002 before/with BRAND-003.  
7. PDF/report chrome brand adoption — yes/no.  
8. Proceed to **SS-BRAND-002**?

---

## Stop

R1 specification complete. **Do not implement the reskin until explicit approval.**
