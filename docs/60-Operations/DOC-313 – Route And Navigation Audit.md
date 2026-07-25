# DOC-313 — Route and Navigation Audit

## Canonical public funnel routes

| Purpose | Canonical path |
|---------|----------------|
| Home / gateway | `/` |
| Assessment offer | `/assessment-offer` |
| Assessment invitation landing | `/assessment-invitation` |
| Technology Snapshot | `/technology-snapshot` |
| Assessment purchase confirmation | `/assessment-purchased` |
| Subscription activation confirmation | `/subscription-activated` |
| Account activation | `/activate-account` |
| Assessment start | `/assessment/start` |
| Onboarding | `/onboarding` |
| Sign in | `/login` |
| Strategic IT Consulting checkout | `/checkout/strategic-it-consulting` |
| Interactive demo | `/demo` |

## Critical bug fixed

Login `callbackUrl` handling previously included `"/"` in a blocklist checked with `startsWith`. Every relative path matched and was forced to `/dashboard`, breaking:

- Activate → `/onboarding`
- Purchase confirmation → `/assessment/start`
- Protected email deep links via `buildProtectedAppUrl`

**Fix:** allowlist-based `getSafeCallbackUrl` in `src/lib/auth/safe-callback-url.ts`.

## Legacy redirects (`next.config.ts`)

| From | To |
|------|----|
| `/assessment/invitation`, `/assessment/invite`, `/*` variants | `/assessment-invitation` |
| `/activate` | `/activate-account` |
| `/purchase/success` | `/assessment-purchased` |
| `/vcio-offer/success` | `/subscription-activated` |
| `/register`, `/signup`, `/sign-up` | `/login` |
| `/product-overview` | `/demo` |
| `/services`, `/solutions/*` | Bobkat IT marketing site |

Query strings are preserved by Next.js redirects.

## Auth public allowlist

Public (unauthenticated) pages include assessment offer/invitation, confirmation pages, activate-account, checkout, demo, login, and related APIs. See `src/lib/auth/auth.config.ts`.

## 404

`src/app/not-found.tsx` provides branded recovery CTAs (Home, Sign In, Assessment Offer) without masking genuine invalid URLs.

## Manual third-party checks

Confirm these still point at canonical production hosts (`https://stackscore.tech`):

1. Vercel `NEXT_PUBLIC_APP_URL` / `AUTH_URL`
2. Stripe webhook endpoint URL
3. Any Stripe Payment Links (if used outside App Router checkout) — none found in repo for assessment/vCIO
4. Bobkat IT marketing CTAs for assessment offer / invitation
5. Resend / email template absolute URLs (built via `getBaseUrl()` / `buildPublicAppUrl`)
