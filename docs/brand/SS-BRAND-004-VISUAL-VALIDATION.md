# SS-BRAND-004 — Visual Validation & Brand Refinement

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Type:** Visual QA / accessibility / brand polish  
**Status:** Implementation complete — staging validation  
**Dependencies:** SS-BRAND-001, SS-BRAND-001-R1, SS-BRAND-002, SS-BRAND-003, SS-UX-018  
**Companion:** [Defect register](./SS-BRAND-004-DEFECT-REGISTER.md)

---

## 1. Executive summary

SS-BRAND-004 corrected the remaining public-facing brand defects after the purple-first reskin:

1. **Transparent Bobkat IT emblem** — canonical logo switched from opaque-black `new-bobkat-it-logo.png` to authentic transparent `bkit-logo.png`.
2. **Login green heading / dark CTA label** — root cause was `.midnight` interactive tokens overriding brand tokens on the same `.public-marketing.midnight` node; cascade fixed and login chrome retargeted to purple + white.
3. **Public CTA gradient AA** — darkened gradient stops so white labels meet WCAG AA across the full stop set without relying on large-text exceptions.

Authenticated dashboard architecture, scoring, and navigation were not redesigned. Browser interactive checks remain **BLOCKED** (no staging session this pass).

---

## 2. Logo asset selected

| Candidate | Alpha | Assessment |
| --- | --- | --- |
| `public/branding/new-bobkat-it-logo.png` | Opaque black corners `(0,0,0,255)` | **Rejected** — black rectangle (ticket issue) |
| `public/branding/bkit-logo.png` | Transparent canvas; wolf + blue diamond | **Selected** — authentic emblem |
| `public/branding/bkit-full-logo.png` | Transparent; includes wordmark + design artifacts | Not used for chrome |
| `public/branding/one-color-bkit-logo.png` | Transparent; monochrome black forms | Unsuitable on charcoal |

**Canonical:** `BOBKAT_IT_LOGO` → `/branding/bkit-logo.png` (`src/lib/branding/assets.ts`)  
**Cache bust:** `BRAND_ASSET_VERSION = "2026-10-brand-004"`

No fabricated/redrawn logo. No CSS blend-mode or background-removal filters.

---

## 3. Logo replacement locations

All consumers of `bobkatLogoSrc()` / `BOBKAT_IT_LOGO` inherit the change, including:

- Public homepage header (`BrandLogo`)
- Login / activate / auth placements (subtle purple radial behind auth placement only)
- Public marketing nav
- Customer portal watermark
- Email + PDF path helpers (path now `bkit-logo.png`)
- App sidebar / header logos (same asset; no black-box issue once transparent)

Authenticated sidebar uses the same transparent asset; no separate treatment required beyond the shared source update.

---

## 4. Login refinements

| Item | Before | After |
| --- | --- | --- |
| Sign In heading | Green (`text-brand` → phosphor `--link`) | `text-primary` (brand purple) |
| Sign In button | Purple fill + dark label | White label on AA-safe purple→blue gradient |
| Links | Muted foreground | `text-link` / `hover:text-link-hover` |
| Inputs | Auth Level 0 chrome | Unchanged behavior; purple focus rings |
| Logo | Black rectangle | Transparent emblem + soft purple glow |

Auth architecture, credentials flow, redirects, and rate limiting unchanged.

---

## 5. Public experience findings

- Homepage gateway architecture from SS-BRAND-003 preserved (no sales cards reintroduced).
- Marketing / auth / funnel themes use shared AA-safe CTA gradient.
- Deep links (`/assessment-offer`, checkout, snapshot, demo) preserved.
- Legacy `/services` and `/solutions` remain older long-form surfaces (deferred cosmetic debt).

---

## 6. Administrative findings

- No structural admin changes in this ticket.
- Brand tokens continue to apply under `.executive-os` (child scope vs `.dark` parent — inheritance-safe).
- Semantic green for success/health preserved.
- Level 0 ops density unchanged.

---

## 7. Customer findings

- Watermark comment/asset path aligned to transparent emblem.
- Portal theme tokens unchanged from SS-BRAND-002.
- Whole-number score formatter still in place (SS-UX-018).

---

## 8. Responsive validation

| Width | Status |
| --- | --- |
| 1440 / 1024 / 768 / 390 / 320 | **BLOCKED** — no browser session; layout code uses stacking CTAs and `max-w-*` constraints from prior tickets |

Manual checklist in §12.

---

## 9. Accessibility validation

| Pair | Ratio | Verdict |
| --- | --- | --- |
| White on `#7E22CE` | ~6.98:1 | Pass AA |
| White on `#6D28D9` | ~7.10:1 | Pass AA |
| White on `#1D4ED8` | ~6.70:1 | Pass AA |
| White on `#A855F7` (chrome accent, not CTA fill) | ~3.96:1 | Not used as solid button fill |
| White on `#168BFF` (legacy end stop) | ~3.40:1 | Removed from CTA gradient |
| `#C084FC` links on charcoal | ≥6.9:1 | Pass AA |

Focus rings remain purple under brand tokens. Reduced-motion Level 2 behavior retained from prior tickets.

---

## 10. Whole-number score verification

- `formatMaturityScore` still exported from `src/lib/scoring/score-display.ts`.
- Unit tests in `tests/scoring/format-maturity-score.test.ts` pass.
- No scoring algorithm changes in this ticket.

---

## 11. Automated test results

| Check | Result |
| --- | --- |
| Branding + email assets + SS-UX-003 logo tests | Pass |
| Auth + layout + admin/customer nav + formatter suite | **132 passed** (targeted run) |
| `npm run lint` | Exit 0 (preexisting warnings) |
| `npm run build` | Exit 0 |
| `npx tsc --noEmit` | Exit 2 — **baseline TIP/QBR/content fixture debt only** |

---

## 12. Browser validation results

**BLOCKED** — no authenticated staging browser session available. Screenshots not captured (not fabricated).

### Manual QA checklist

1. `/login` — transparent wolf floats on charcoal; Sign In heading purple; button white-on-gradient.  
2. `/` — same emblem; Sign In / Explore Demo CTAs AA-readable.  
3. Forgot / reset / activate — purple links; transparent logo where shown.  
4. Customer Overview / Explore — whole-number scores; purple chrome; green semantic only.  
5. Command Center — purple nav; charcoal KPIs; no black logo box in sidebar.  
6. Widths 1440→320 on homepage + login.  
7. Keyboard tab through login fields; purple focus visible.  
8. Confirm production email logo URL serves `bkit-logo.png` after deploy.

---

## 13–14. Defects found / corrected

See [SS-BRAND-004-DEFECT-REGISTER.md](./SS-BRAND-004-DEFECT-REGISTER.md).

Primary fixes: BR4-001 through BR4-008.

---

## 15. Remaining limitations

- Browser/responsive interactive QA blocked this pass.
- Legacy marketing pages (`/services`, `/solutions`) not fully reskinned.
- Email clients depend on public origin hosting the new path after release.
- SS-WEB-003 (demo content) and SS-SNAP-001 not started.

---

## 16. Production readiness assessment

| Criterion | Status |
| --- | --- |
| Transparent Bobkat emblem | Met |
| Login green heading corrected | Met |
| Login / public CTA contrast corrected | Met |
| Public CTA gradient AA verified | Met |
| Cohesive purple/charcoal system | Met (code) |
| Whole-number scores intact | Met |
| Responsive checks | Blocked — checklist provided |
| Accessibility issues addressed | Met for logged CTA/heading defects |
| Functional regressions | None observed in automated suites |
| Production deploy | **Do not deploy** — staging only |

**Verdict:** SS-BRAND-004 implementation and automated validation are complete on `staging`. Complete the manual browser checklist before promoting further. Do not begin SS-WEB-003 without approval.
