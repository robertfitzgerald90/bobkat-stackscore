# SS-BRAND-002 — Purple-First Application Reskin

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Type:** Visual system implementation  
**Status:** Implementation complete — staging validation  
**Dependencies:** SS-BRAND-001, SS-BRAND-001-R1  
**Out of scope:** SS-BRAND-003 (public), SS-UX-018 (whole-number scores), production deploy

---

## 1. Executive summary

Authenticated staff (`.executive-os`) and customer (`.customer-portal`) shells now use a **purple-first** Bobkat-aligned brand accent (`#A855F7`), with **restrained electric blue** (`#168BFF`) for secondary technical signals and **phosphor green** (`#3ECF7A`) reserved for semantic success, healthy posture, and positive outcomes.

Primary buttons use a darker fill (`#9333EA`) so white labels meet WCAG AA (~5.38:1). Canonical brand accent for rings, borders, selection chrome, and atmospheric treatments remains `#A855F7`. Text links use `#C084FC` on charcoal for readable contrast.

Public marketing, auth/funnel Instrument themes, PDF generation, scoring, navigation IA, billing, and Communications delivery behavior were not redesigned.

---

## 2. Files changed

### New

| Path | Role |
| --- | --- |
| `src/styles/brand-tokens.css` | Purple brand token family + Level 1 utilities |
| `docs/brand/SS-BRAND-002-APPLICATION-RESKIN.md` | This report |
| `docs/brand/SS-BRAND-001-*.md` / `SS-BRAND-001-R1-*.md` | Prior audit/spec (companion; already authored under BRAND-001) |

### Modified — tokens / shells

| Path | Change |
| --- | --- |
| `src/app/globals.css` | Import `brand-tokens.css` last; expose `--color-brand-*` in `@theme` |
| `src/styles/instrument-tokens.css` | Align comments / defer interactive brand to brand-tokens |
| `src/styles/executive-os-theme.css` | Focus ring + Level 1 main-canvas atmosphere |
| `src/styles/customer-portal-theme.css` | Charcoal surfaces retained; interactive tokens overridden by brand-tokens |

### Modified — shared / interactive

| Path | Change |
| --- | --- |
| `src/components/ui/button.tsx` | Default solid fill → `--brand-primary-fill` (fallback `--primary`) |
| `src/components/design-system/instrument/corner-brackets.tsx` | `measured` tone → brand purple |
| `src/components/command-palette/command-palette-dialog.tsx` | Hardcoded `#3ECF7A` → `primary` |

### Modified — admin benchmarks / communications / catalog

| Path | Change |
| --- | --- |
| `src/components/dashboard/dashboard-view.tsx` | Command Center header Level 1 + brand frame |
| `src/components/communications/communications-shell.tsx` | Info pills → brand-secondary blue |
| `src/components/communications/template-library-view.tsx` | Brand accents (legacy green/blue chrome) |
| `src/app/(dashboard)/clients/[id]/communications/page.tsx` | Accent migration |
| `src/components/technology-catalog/*` | Interactive accents → primary |
| `src/components/client-technology/client-technology-profile.tsx` | Interactive accent |
| `src/components/vcio/vcio-onboarding-test-launcher.tsx` | Interactive accent |

### Modified — customer benchmarks

| Path | Change |
| --- | --- |
| `src/components/customer-portal/overview/overview-maturity-hero.tsx` | Level 1 + brand frame |
| `src/components/customer-portal/explore/customer-explore-experience.tsx` | Level 1 header framing |

**Not modified (intentional):** scoring engines, maturity thresholds, project math, PDF renderers, `public-marketing-theme.css`, `auth-instrument-theme.css`, `funnel-instrument-theme.css`, Prisma schema, Stripe/billing, email delivery.

---

## 3. Token changes

### Brand family (`brand-tokens.css`)

Scoped to `:is(.executive-os, .customer-portal, .instrument)`:

| Token | Value | Role |
| --- | --- | --- |
| `--brand-primary` | `#A855F7` | Canonical accent |
| `--brand-primary-hover` | `#C084FC` | Hover / link text on dark |
| `--brand-primary-fill` | `#9333EA` | Solid primary button fill (AA) |
| `--brand-primary-subtle` | `rgba(168,85,247,0.12)` | Soft fills |
| `--brand-primary-foreground` | `#FFFFFF` | On-fill label |
| `--brand-primary-glow` | `rgba(168,85,247,0.10)` | Level 1 atmosphere |
| `--brand-secondary` | `#168BFF` | Technical secondary |
| `--brand-secondary-subtle` | `rgba(22,139,255,0.12)` | Soft blue fills |

### Required mappings

| Token | Mapping |
| --- | --- |
| `--primary` | → `--brand-primary` |
| `--primary-foreground` | → white |
| `--link` | → `--brand-primary-hover` |
| `--ring` | → `--brand-primary` |
| `--success` | → `--phosphor` (green) |
| `--warning` | → `#C9A227` |
| `--destructive` | → `#B23A3A` |
| `--chart-1` | → phosphor (health series) |
| `--chart-3` | → brand purple (non-health series) |
| `--accent-blue` | → brand-primary **inside authenticated shells only** (deprecated alias) |

### Level 1 utilities

- `.brand-level-1` — low-opacity purple radial + sparse purple/blue plotting grid  
- `.brand-frame` — thin purple-mixed border + faint blue inset line  

Public `.midnight` / marketing continue to resolve `--accent-blue` to phosphor/navy as before (BRAND-003).

---

## 4. Brand-versus-semantic migration decisions

| Usage | Class | Decision |
| --- | --- | --- |
| Primary buttons, tabs, active nav, links, focus rings | 2 Interactive | → Purple |
| Command Center / Overview / Explore section framing | 1 / 5 Brand + decorative | → Purple Level 1 |
| Corner brackets `measured` | 5 Decorative | → Purple |
| Command palette focus + icons | 2 Interactive | → Purple |
| Communications “info” pills | 5 / secondary | → Brand secondary blue (not green, not CTA purple) |
| Catalog / VCIO / template library chrome accents | 1–2 | → `primary` |
| Score bands (`score-display`, maturity healthy) | 3 Semantic | **Preserved green** |
| Success badges, completed counts, positive deltas | 3 Semantic | **Preserved green** |
| Assessment / pillar health chart series (`chart-1`) | 4 Data viz | **Preserved green** |
| Critical brackets / destructive | 3 Semantic | **Preserved ember/red** |
| Warning / caution | 3 Semantic | **Preserved gold** |
| Public marketing / auth / funnel CTAs | Out of scope | **Unchanged** (still green/navy Instrument) |

### Ambiguous cases (documented)

1. **`--accent-blue` name** — Historically green in dark mode. Inside authenticated shells it now aliases brand purple so residual utilities do not stay green-as-brand. New code should use `--brand-primary` / `text-primary` or `--success` explicitly.  
2. **Customer project task “completed” icon using `text-primary`** — Pre-existing pattern; now purple. Task **status badges** still use semantic success where badge variants apply. Not changed further (workflow preservation).  
3. **Instrument maturity radar stroke** — Still phosphor (Class 4 health visualization).

---

## 5. Shared component updates

| Component | Update |
| --- | --- |
| Button (default) | Accessible purple fill via `--brand-primary-fill` |
| Corner brackets | Measured → brand purple |
| Command palette | Focus ring + row icons → primary |
| Status pills (comms) | Info → brand-secondary |
| Cards / tables / forms | No purple border flood; Level 0 retained |
| Badge success variant | Unchanged (semantic green) |

---

## 6. Administrative changes

| Area | Visual | Preserved |
| --- | --- | --- |
| Command Center | Level 1 header, purple focus, canvas atmosphere | KPI math, layout, destinations |
| Clients / workspace | Token-driven primary accents | Five-group nav |
| Projects | Token-driven accents | Progress/milestones/calcs |
| Leads | Shared shell tokens | Three lead models |
| Recurring Services | Shared shell tokens | Subscription / RecurringService separation |
| Communications | Shell + templates + info blue | Delivery / automation |
| Operations | Level 0 token inheritance | Tool behavior |

Seven primary admin destinations unchanged.

---

## 7. Customer changes

| Area | Visual | Preserved |
| --- | --- | --- |
| Overview | Level 1 maturity hero | Official score, maturity, pillars, dates |
| Explore | Level 1 header; selected pillars via primary | Eight pillars, findings, relationships |
| Roadmap / Projects / Reports chrome | Token-driven accents | Statuses, calcs, PDF content |

Score formatting (whole numbers) deferred to **SS-UX-018**.

---

## 8. Accessibility findings

| Pair | Ratio | Verdict |
| --- | --- | --- |
| `#FFFFFF` on `#A855F7` | ~3.96:1 | Fails AA normal text — **not used as solid button fill** |
| `#FFFFFF` on `#9333EA` (`--brand-primary-fill`) | ~5.38:1 | **Passes AA** for primary buttons |
| `#C084FC` on `#08090C` / `#12141A` | ~7.54 / ~6.97 | **Passes AA** for links |
| `#A855F7` on `#08090C` | ~5.03:1 | Passes for large text / chrome; OK for icons/borders |
| Focus | Purple outline via `--ring` / executive-os `:focus-visible` | Visible on charcoal |

Keyboard navigation patterns were not rearchitected; focus styling inherits updated ring tokens.

---

## 9. Responsive findings

No layout redesign. Token/atmosphere classes do not alter grid breakpoints. Representative widths (1440 / 1024 / 768 / 390 / 320) were **not** browser-verified in this pass (no authenticated session available). Preexisting responsive defects, if any, should be logged separately — none newly introduced by CSS token changes are known.

---

## 10. Automated test results

| Check | Result |
| --- | --- |
| Targeted Vitest (admin nav, Command Center, customer nav, Explore, auth isolation, leads/comms) | **101 passed** (10 files) |
| `npm run lint` | **Exit 0** — 22 preexisting warnings (TIP/QBR unused vars, etc.); **0 errors** |
| `npm run build` | **Exit 0** |
| `npx tsc --noEmit` | **Exit 2** — **baseline fixture debt only** (TIP/QBR/content tests); no new brand-reskin errors observed |

Known baseline `tsc` failures (unchanged attribution):

- `tests/qbr/pdf-export.test.ts`
- `tests/recommendations/ss-content-002-batch1-publication.test.ts`
- `tests/technology-improvement-plan/tip-*.test.ts`
- `tests/technology-profile/overview.test.ts`

---

## 11. Browser validation results

**Blocked.** No authenticated admin/technician/customer browser session was available in this environment. Screenshots were **not** fabricated.

### Manual QA checklist (staging)

1. Staff login → Command Center: purple nav/focus, charcoal KPIs, no green CTAs, green only on positive deltas.  
2. Clients → workspace groups still five; interactive accents purple.  
3. Projects / Leads / Recurring Services / Operations: Level 0 readability.  
4. Communications: info pills blue; success pills green; links purple.  
5. Customer Overview: Level 1 hero; score/maturity colors semantic; pillars unchanged.  
6. Explore: selected pillar purple chrome; healthy scores still green.  
7. Roadmap / Projects / Reports chrome only; open a PDF and confirm unchanged.  
8. Keyboard tab through primary nav + a dialog; purple focus visible.  
9. Primary button: white label on darker purple; hover brightens.  
10. Spot-check public homepage / login still green-first (BRAND-003 not started).  
11. Widths 1440 → 320 on Command Center + Overview + Explore.

---

## 12. Known limitations

- Public marketing, auth, and funnel surfaces remain green/navy Instrument until **SS-BRAND-003**.  
- Shared `Button` default uses `--brand-primary-fill` when defined; outside brand scopes falls back to `--primary` (public/auth unchanged).  
- Residual hardcoded phosphor in demos / design-system phase pages / marketing-demo is intentional inventory leftovers.  
- Browser visual benchmarks not captured this pass.  
- `--accent-blue` remains a confusing alias name (compat only).

---

## 13. Remaining visual inconsistencies

| Item | Notes |
| --- | --- |
| Auth + funnel CTAs still green | Scoped out |
| Public marketing navy/`accent-blue` | Scoped out (BRAND-003) |
| Demo design-system pages still document phosphor as “single accent” | Docs/demo drift |
| Dense tables may still show occasional `text-primary` where semantic green might be clearer | Low priority audit |
| Light-mode staff (rare) inherits purple accents on light surfaces | Charcoal dark is the intended authenticated look |

---

## 14. Recommended follow-up work

1. **Manual staging QA** using the checklist in §11; capture Command Center + Overview before/after.  
2. **SS-BRAND-003** — public gateway Level 2 (gradients allowed).  
3. Rename or fully retire `--accent-blue` in authenticated code.  
4. Optional: light-mode executive-os charcoal enforcement if staff ever leave `.dark`.  
5. **SS-UX-018** — whole-number score presentation (separate).  
6. Clear baseline TIP/QBR TypeScript fixture debt (unrelated).

---

## 15. Production readiness assessment

| Criterion | Status |
| --- | --- |
| Purple primary authenticated brand | Met (tokens + shells) |
| Blue secondary restrained | Met (comms info + Level 1 grid tint) |
| Green semantic preserved | Met |
| Layouts / workflows / scoring unchanged | Met |
| Admin + customer coherent | Met at token + benchmark framing level |
| Command Center + Overview Level 1 | Met in code |
| Dense ops remain Level 0 | Met |
| Accessibility button AA | Addressed via fill token |
| Automated tests | Targeted suite green; tsc baseline debt documented |
| Browser validation | **Not done** — required before calling staging “visually signed off” |
| Production deploy | **Do not deploy** — staging only |

**Verdict:** Implementation and automated validation for SS-BRAND-002 are complete on `staging`. Treat **browser/manual visual sign-off** as the remaining gate before promoting the branch further. Do not begin SS-BRAND-003 without explicit approval.

---

## Appendix — Concise color-migration table

| Before (auth dark) | After | Preserved? |
| --- | --- | --- |
| `--primary` = phosphor green | `--primary` = `#A855F7` | — |
| Solid CTA green | Solid CTA `#9333EA` fill | — |
| Links green | Links `#C084FC` | — |
| Focus ring green | Focus ring purple | — |
| Sidebar active green | Sidebar active purple | — |
| `--accent-blue` → green (dark) | → purple **in auth shells** | Public unchanged |
| Success / healthy / positive | phosphor / `text-success` | **Yes** |
| Warning / destructive | gold / ember | **Yes** |
| Chart health series | phosphor `chart-1` | **Yes** |
| Score band coloring | success/warning/destructive | **Yes** |
