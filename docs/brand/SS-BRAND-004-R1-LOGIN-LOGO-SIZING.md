# SS-BRAND-004-R1 — Login Logo Sizing

**Branch:** `staging`  
**Date:** 2026-10-30  
**Scope:** Login page only (`src/app/login/page.tsx`)

## Change

- Emblem asset: existing transparent `/branding/bkit-logo.png` (`bobkatLogoSrc()`).
- Display width: **80px** mobile (`w-20`), **100px** desktop (`sm:w-[100px]`).
- Aspect ratio preserved via `BOBKAT_IT_LOGO.aspectRatio` (intrinsic height ≈ 69px at 100px width).
- Purple atmospheric glow padding scaled to `p-2.5` / `sm:p-3.5`.
- Wordmark spacing: `mt-7` / `sm:mt-8` under the emblem; logo remains centered.
- Small-screen vertical room: auth shell padding `py-12 sm:py-16 md:py-24`.

## Not changed

- Shared `BrandLogo` placement sizes (sidebar, header, email, report, activate, not-found).
- Authentication behavior, brand palette, other layouts.

## Browser validation

| Check | Status |
| --- | --- |
| Desktop ~100px emblem | **BLOCKED** — no staging browser session in this pass |
| Mobile ~80px emblem | **BLOCKED** |
| No vertical overflow (320/390) | **BLOCKED** — mitigated in CSS; confirm manually |

### Manual QA

1. `/login` desktop — wolf ≈ 100px wide, glow proportional, STACKSCORE spacing comfortable.  
2. `/login` at 390px / 320px — emblem ≈ 80px; no page scroll from logo alone.  
3. Sidebar / activate / emails unchanged.
