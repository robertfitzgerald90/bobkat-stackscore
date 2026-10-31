# SS-BRAND-004-R2 — Public Logo Visibility Correction

**Project:** StackScore  
**Branch:** `staging`  
**Date:** 2026-10-30  
**Scope:** Landing page hero + sign-in branding  
**Status:** Implementation complete — browser visual QA blocked

---

## 1. Asset inspection

### Master: `public/branding/bkit-logo.png`

| Property | Value |
| --- | --- |
| Canvas | 4800 × 3300 RGBA |
| Alpha bbox | `(1155, 86) → (3644, 3214)` |
| Visible artwork | 2489 × 3128 |
| Horizontal padding | ~1155px per side (~24% each) |
| Visible width fraction | **0.519** |
| Transparent corners | Yes |

**Implication:** CSS width on the master asset was roughly **half** the visible wolf width. A 100px container showed ~52px of artwork.

### Derivative: `public/branding/bkit-logo-tight.png`

| Property | Value |
| --- | --- |
| Source | Crop of master alpha bbox + ~2% padding |
| Size | 2615 × 3254 |
| Aspect | ≈ 0.8036 |
| Corners | Transparent `(255,255,255,0)` |
| Artwork | Unchanged (no redraw) |

Master asset **preserved**. Emails/PDF/sidebar continue to use `bkit-logo.png` via `bobkatLogoSrc()` default.

Cache bust: `BRAND_ASSET_VERSION = "2026-10-brand-004-r2"`.

---

## 2. Component architecture

`BrandLogo` gained an independent `presentation` prop:

| Presentation | Asset | Width (mobile / desktop) | Glow |
| --- | --- | --- | --- |
| `navigation` | full master | compact (`size` / header placement) | No |
| `hero` | tight crop | **88 / 112** px | Yes (restrained) |
| `authentication` | tight crop | **90 / 116** px | Yes (restrained) |

Layout `variant` (`sidebar` / `stacked`) unchanged. No global CSS that resizes sidebar/header logos.

Config: `BOBKAT_LOGO_PRESENTATION` in `src/lib/branding/assets.ts`.

---

## 3. Landing page

`stackscore-gateway-home.tsx`:

- Header: `presentation="navigation"` (compact).
- Hero: centered `presentation="hero"` **above** STACKSCORE / BY BOBKAT IT.
- Headline unchanged: **Know your technology. Own your next move.**
- No homepage content redesign.

---

## 4. Sign-in page

`src/app/login/page.tsx`:

- Uses `presentation="authentication"` (tight crop, 90→116px).
- Form / auth behavior / buttons untouched.
- Vertical padding slightly reduced (`py-10 sm:py-14 md:py-20`) for taller emblem.

---

## 5. Validation

### Automated

| Check | Result |
| --- | --- |
| `tests/brand/ss-brand-004-r2-logo-visibility.test.ts` | Pass |
| Master + tight files present | Pass |
| Presentation width targets in range | Pass |
| Hero + login wiring | Pass |

### Browser (1440 / 768 / 390 / 320)

| Check | Status |
| --- | --- |
| Landing hero prominent wolf | **BLOCKED** — no staging browser session |
| Sign-in larger wolf | **BLOCKED** |
| Transparent background | Code/asset verified; visual **BLOCKED** |
| Glow restrained | Code-level; visual **BLOCKED** |
| No clip/distortion | Expected via `object-contain`; visual **BLOCKED** |
| Header/sidebar unchanged | Code-scoped; visual **BLOCKED** |
| Screenshots | **Not captured** |

### Manual QA checklist

1. `/` desktop — wolf ≈ 112px above STACKSCORE; headline unchanged.  
2. `/` at 390/320 — wolf ≈ 88px; no overflow.  
3. `/login` — wolf ≈ 116px desktop / 90px mobile.  
4. Header logo remains compact; app sidebar unchanged.  
5. Confirm `bkit-logo-tight.png` serves with transparency.

---

## 6. Files changed

| Path | Change |
| --- | --- |
| `public/branding/bkit-logo-tight.png` | New tight crop (original preserved) |
| `src/lib/branding/assets.ts` | Tight asset + presentation config |
| `src/components/brand/brand-logo.tsx` | `presentation` variants |
| `src/components/public/stackscore-gateway-home.tsx` | Hero emblem + nav presentation |
| `src/app/login/page.tsx` | Authentication presentation |
| `tests/brand/ss-brand-004-r2-logo-visibility.test.ts` | Regression coverage |
| `docs/brand/SS-BRAND-004-R2-LOGO-VISIBILITY.md` | This report |

---

## 7. Production readiness

| Criterion | Status |
| --- | --- |
| Visible artwork sized for hero/auth | Met (code) |
| Master asset preserved | Met |
| Header/sidebar not enlarged | Met |
| Auth/nav/scoring/demo untouched | Met |
| Browser visual QA | **Blocked** |
| Production deploy | **Do not deploy** |

**Verdict:** SS-BRAND-004-R2 implemented on `staging`. Complete manual browser checklist before promotion.
