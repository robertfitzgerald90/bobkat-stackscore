# SS-BRAND-004 — Defect Register

**Branch:** `staging`  
**Date:** 2026-10-30

| ID | Severity | Area | Finding | Resolution | Status |
| --- | --- | --- | --- | --- | --- |
| BR4-001 | P1 | Public / Auth logo | `new-bobkat-it-logo.png` embeds opaque black rectangular canvas; emblem appears pasted on charcoal. | Switched canonical asset to authentic transparent `bkit-logo.png` via `BOBKAT_IT_LOGO`; bumped `BRAND_ASSET_VERSION`. | Fixed |
| BR4-002 | P1 | Login heading | “Sign In” rendered green (`text-brand` → midnight `--link` phosphor) because `.midnight` same-element rules overrode brand tokens. | Split phosphor interactive defaults to `.midnight:not(.public-marketing)`; login heading uses `text-primary`; `.text-brand` prefers `--brand-primary-hover`. | Fixed |
| BR4-003 | P1 | Login / public CTAs | Primary buttons showed dark label on purple (`--primary-foreground: #08090C` from midnight) and marketing `.bg-primary` selectors missed Button default (no longer uses `bg-primary` class). | Public/auth/funnel target `[data-variant="default"]`; force white label + AA-safe gradient; Button exposes `data-variant`. | Fixed |
| BR4-004 | P1 | Public CTA gradient contrast | `#A855F7`→`#168BFF` with white failed WCAG AA at mid/end stops (~3.96 / ~3.40). | Darkened public CTA gradient to `#7E22CE` → `#6D28D9` → `#1D4ED8` (white ≥ ~6.7:1). Canonical `#A855F7` retained for chrome. | Fixed |
| BR4-005 | P2 | Auth links | Forgot / Activate / Back to Sign In used muted/non-brand link colors. | Applied `text-link` / `hover:text-link-hover` on login, forgot, reset. | Fixed |
| BR4-006 | P2 | Auth logo presence | Auth emblem lacked atmospheric separation on charcoal. | Subtle purple radial behind auth-placement logo only (no blend-mode/bg removal). | Fixed |
| BR4-007 | P2 | Cascade | Brand-token interactive vars lost when `.public-marketing` and `.midnight` shared one node. | See BR4-002 (`:not(.public-marketing)` for phosphor interactive block). | Fixed |
| BR4-008 | P3 | Docs / tests drift | Tests asserted `new-bobkat-it-logo.png`. | Updated branding, email, SS-UX-003 tests. | Fixed |
| BR4-009 | P3 | Browser visual QA | No authenticated staging browser session in this pass. | Documented manual checklist; interactive checks BLOCKED. | Open (process) |
| BR4-010 | P3 | Legacy marketing pages | `/services`, `/solutions` still carry older long-form navy/green-era content. | Out of homepage scope; deep links preserved. Track for later cleanup. | Deferred |
| BR4-011 | P3 | Email CDN | Production email logo URL path changes with asset rename; requires deploy of `bkit-logo.png` on public origin. | Asset exists in repo `public/branding/`; verify production CDN after release. | Noted |
