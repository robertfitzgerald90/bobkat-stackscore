# WEB-OG-002 — Branded Open Graph Metadata Implementation

| Field | Value |
| --- | --- |
| Date | 2026-10-31 |
| Status | **Implemented in development** — production deploy **requires product-owner approval** |
| Repositories | `Bobkat-Stackscore` · `bobkatit-website` |
| Artwork source | `docs/socials/` (StackScore repo; masters unchanged) |

---

## Summary

Replaced washed-out / logo-style social previews with the product owner’s approved Bobkat IT wolf artwork. Assets were fitted to **1200 × 630** without stretching (contain + dark letterbox). Open Graph and Twitter `summary_large_image` cards were wired for the primary marketing routes on both sites.

**Production was not deployed.**

---

## Approved artwork → public files

| Role | Source (unchanged) | Public export (1200×630 PNG) |
| --- | --- | --- |
| Bobkat IT default | `docs/socials/bobkast-social-default.png` | StackScore: `/images/og/bobkat-social-default-og-1200x630-v1.png` · Bobkat site: `/branding/bobkat-social-default-og-1200x630-v1.png` |
| Free Technology Snapshot | `docs/socials/snapshot-social-preview.png` | `/images/og/snapshot-social-preview-og-1200x630-v1.png` |
| StackScore Demo | `docs/socials/stackscore-demo-social-preview.png` | `/images/og/stackscore-demo-social-preview-og-1200x630-v1.png` |

Notes:

- Source masters are **1659 × 948**; exports use high-quality fit into 1200×630 with near-black side letterboxing so the wolf and headlines are not cropped or stretched.
- Cache-busting: filename `-v1` plus query `?v=web-og-002-v1`.
- Legacy washed logo `/images/og/assessment-invitation.png` is no longer referenced by invitation metadata (file left in place; safe to delete later).

---

## Files changed

### StackScore (`Bobkat-Stackscore`)

| Path | Change |
| --- | --- |
| `public/images/og/*-og-1200x630-v1.png` | Added approved OG exports |
| `src/lib/branding/social-og.ts` | Shared OG/Twitter helper + asset map |
| `src/app/layout.tsx` | Default title/description + demo OG fallback |
| `src/app/page.tsx` | Homepage social metadata |
| `src/app/demo/page.tsx` | Demo entry metadata |
| `src/app/demo/(workspace)/overview/page.tsx` | Same demo OG (redirect target); canonical `/demo` |
| `src/app/technology-snapshot/page.tsx` | Snapshot OG |
| `src/app/assessment-offer/page.tsx` | Offer OG (demo artwork until dedicated art exists) |
| `src/app/assessment-invitation/page.tsx` | Invitation OG → snapshot artwork |
| `src/app/vcio-offer/page.tsx` | Offer checkout OG (demo artwork) |
| `tests/marketing/social-og-metadata.test.ts` | Asset + wiring tests |
| `docs/marketing/WEB-OG-002-SOCIAL-METADATA-IMPLEMENTATION.md` | This report |

### Bobkat IT website (`bobkatit-website`)

| Path | Change |
| --- | --- |
| `public/branding/bobkat-social-default-og-1200x630-v1.png` | Approved default OG export |
| `lib/brand.ts` | Point `BOBKAT_SOCIAL_SHARE_*` at new 1200×630 asset; version bump |
| `lib/site.ts` | Default site description |
| `app/layout.tsx` | Default title/OG/Twitter |
| `app/page.tsx` | Homepage title/description/OG |
| `app/contact/page.tsx` | Contact title/description/OG |

Other Bobkat service pages continue to inherit the default share image via `BOBKAT_SOCIAL_SHARE_IMAGES`.

---

## Route-by-route status

### StackScore (`https://stackscore.tech`)

| Route | Title | Description (summary) | Image | Canonical | Status |
| --- | --- | --- | --- | --- | --- |
| `/` | StackScore \| Technology Intelligence for Business | Understand your technology environment… | Demo artwork | `/` | **Ready** |
| `/demo` | StackScore Demo \| See Technology Intelligence in Action | Explore an interactive… | Demo artwork | `/demo` | **Ready** (redirects to overview) |
| `/demo/overview` | Same as `/demo` (crawler final URL) | Same | Demo artwork | `/demo` | **Ready** |
| `/technology-snapshot` | Free Technology Snapshot \| Bobkat IT | Free, 14 questions… | Snapshot artwork | `/technology-snapshot` | **Ready** |
| `/assessment-offer` | Learn About StackScore \| … (existing offer copy) | Existing offer description preserved | Demo artwork (temporary) | `/assessment-offer` | **Ready** |
| `/assessment-invitation` | You've Been Invited \| StackScore | Existing invitation description | Snapshot artwork (temporary until dedicated invite art) | `/assessment-invitation` | **Ready** |
| `/vcio-offer` | Strategic IT Consulting… (existing) | Existing pricing description preserved | Demo artwork | `/vcio-offer` | **Ready** |

Root layout fallback image: StackScore Demo artwork.

### Bobkat IT (`https://www.bobkatit.com`)

| Route | Title | Description | Image | Canonical | Status |
| --- | --- | --- | --- | --- | --- |
| `/` | Bobkat IT \| Build. Improve. Advise. | Technology consulting, custom applications… | Default artwork | `/` | **Ready** |
| `/contact` | Contact Bobkat IT \| Let's Talk Technology | Have a technology challenge… | Default artwork | `/contact` | **Ready** |
| Other pages | Existing page titles/descriptions preserved | Unchanged page copy | Default artwork fallback | Existing | **Ready** |

---

## Metadata shape (per configured route)

Configured via Next.js `Metadata` / `buildSocialPageMetadata`:

- `og:title`, `og:description`, `og:image`, `og:image:width` (1200), `og:image:height` (630), `og:image:alt`, `og:url`, `og:type=website`, `og:site_name`
- `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
- `alternates.canonical` (relative; resolved by `metadataBase`)

`metadataBase`:

- StackScore → `getBaseUrl()` (`NEXT_PUBLIC_APP_URL` / `AUTH_URL`; production must be `https://stackscore.tech`)
- Bobkat IT → `SITE.url` = `https://www.bobkatit.com`

---

## Before / after

| Surface | Before | After |
| --- | --- | --- |
| StackScore invitation OG | Square washed slate wolf logo (`assessment-invitation.png`) | Approved Snapshot wolf + headline art |
| StackScore home / demo | Often inherited generic title; weak/missing branded OG image | Demo artwork + approved titles/descriptions |
| StackScore Snapshot | Title only; no dedicated OG image | Snapshot artwork + updated description |
| Bobkat IT default share | Prior `/branding/bobkat-social-share.png` (legacy dimensions/copy) | Approved Build. Improve. Advise. 1200×630 |

---

## Validation results

| Gate | Result |
| --- | --- |
| `npm test -- tests/marketing/social-og-metadata.test.ts tests/marketing/assessment-funnel.test.ts` | **9/9 pass** |
| StackScore `npm run lint` | **0 errors** |
| StackScore `npm run build` | **PASS** |
| Bobkat IT `npm run lint` | **0 errors** |
| Bobkat IT `npm run build` | **PASS** |
| Local image HTTP | **200** `image/png` for all three StackScore OG files; dimensions **1200×630** (PNG IHDR + filesystem) |
| Server-rendered HTML (local `next start`) | Titles, `og:title`, `og:image` paths, `twitter:card=summary_large_image`, and canonicals match the table above |
| Bobkat static HTML from build | Homepage + contact titles/OG/Twitter/canonical point at `https://www.bobkatit.com/...bobkat-social-default-og-1200x630-v1.png?v=web-og-002-v1` |

### Absolute URL note

StackScore absolute OG origins come from `metadataBase` / `getBaseUrl()`. Production Vercel must keep `NEXT_PUBLIC_APP_URL=https://stackscore.tech` (already the production convention). Preview/staging builds will correctly use their own base URL; ensure preview hosts can serve `/images/og/*-v1.png` (they will, as static public files).

### Social debugger platforms

LinkedIn / Facebook / X debugger checks were **not** run against production (no production deploy). Do not claim live social caches are updated until those tools are re-scraped after deploy.

---

## Missing assets / blockers

| Item | Status |
| --- | --- |
| Dedicated Assessment Offer artwork | **Missing** — using StackScore Demo image temporarily |
| Dedicated Assessment Invitation artwork | **Missing** — using Snapshot image temporarily |
| Source filename typo `bobkast-social-default.png` | Present; export renamed to `bobkat-social-default-…` |
| Production deploy | **Blocked pending approval** |

---

## Deployment recommendations

1. Review this doc + local HTML/image validation with the product owner.
2. Deploy **Bobkat IT website** and **StackScore** independently after approval (do not bundle with unrelated staging work).
3. Confirm production env `NEXT_PUBLIC_APP_URL=https://stackscore.tech` on StackScore.
4. After deploy, re-scrape with:
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
   - [X Card Validator](https://cards-dev.twitter.com/validator) (or equivalent)
5. Optionally remove unused `public/images/og/assessment-invitation.png` and legacy Bobkat `bobkat-social-share.png` in a follow-up cleanup.

**No Snapshot scoring, billing, authentication, or customer data changes were made.**
