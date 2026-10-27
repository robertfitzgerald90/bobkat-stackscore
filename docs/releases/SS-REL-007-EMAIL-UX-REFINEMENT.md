# SS-REL-007 — Activation Email and Confirmation UX Refinement

| Field | Value |
| --- | --- |
| Status | **Complete (code + investigation; not production-deployed)** |
| Date | 2026-10-26 |
| Branch | `staging` @ `12a7733` (+ local uncommitted refinements) |
| Scope | Email logo URL, confirmation UX, brand triad, deliverability review |
| Constraints | No production deploy, no DNS/env changes, no migrations, no new payments, no real customer sends |

---

## Summary

1. **Broken logo root cause:** Email header used `brand.primaryLogoUrl` built from `EMAIL_ASSET_BASE_URL` → `NEXT_PUBLIC_APP_URL` / app base. On staging that resolves to `https://staging.stackscore.tech/...`, which is behind **Vercel Authentication**. Email clients receive **302/auth**, so the Bobkat IT logo appears broken. Production `https://stackscore.tech/branding/new-bobkat-it-logo.png` returns **HTTP 200** `image/png` without auth.
2. **Fix:** Email assets now default to the **canonical public origin** `https://stackscore.tech`. Relative paths and staging/`*.vercel.app`/localhost logo URLs are rewritten to that public base. Alt text uses **`Bobkat IT logo`**.
3. **Confirmation UX:** `/assessment-purchased` now keys messaging off fulfillment (`emailState`): claims “activation email sent” **only** when `AssessmentPurchase.status === fulfilled`; pending fulfillment and `manual_review` explicitly say an email was **not** (yet) sent; spam/junk + “mark as Not Spam” guidance added for the fulfilled path.
4. **Branding:** Default / legacy footer tagline **`BUILD · ADVISE · STABILIZE`** → **`BUILD | IMPROVE | ADVISE`** (including DB legacy values via normalize).
5. **Deliverability:** Public DNS reviewed for `bobkatit.com` / `send.bobkatit.com` — **no DNS changes made**. Recommendations below for operator approval.

---

## Changes

| Area | Files |
| --- | --- |
| Email asset base + logo rewrite + tagline normalize | `src/emails/assets.ts` |
| Brand defaults / normalize | `src/lib/communications/brand-types.ts` |
| Header `Img` src/alt | `src/emails/components/header.tsx` |
| Confirmation email-state | `src/lib/stripe/verify-assessment-confirmation.ts` |
| Confirmation copy | `src/app/assessment-purchased/page.tsx` |
| Env docs | `.env.example` |
| Tests | `tests/email/assets.test.ts`, `tests/branding/assets.test.ts`, `tests/stripe/confirmation-routes.test.ts` |

### Logo behavior (after change)

| Input | Output |
| --- | --- |
| (default) | `https://stackscore.tech/branding/new-bobkat-it-logo.png?v=…` |
| Staging absolute URL | Rewritten to production host, same path |
| Relative `/branding/...` | Prefixed with public email asset base |
| `EMAIL_ASSET_BASE_URL` set | Honored as base (operator override) |

Render check (local): header `src` = production HTTPS logo; `alt=Bobkat IT logo`; tagline `BUILD | IMPROVE | ADVISE`; no staging host in HTML.

### Confirmation messaging matrix

| `emailState` | Claims email sent? | UX focus |
| --- | --- | --- |
| `activation_email_sent` (`fulfilled`) | **Yes** | Wait minutes; check Spam/Junk; mark Not Spam |
| `fulfillment_pending` (no purchase row yet) | **No** | Setup still running; refresh |
| `manual_review` | **No** | Staff review; no activation email yet |
| Stripe payment still pending | **No** | Existing pending payment copy |

---

## Validation

```text
npm test -- tests/email/assets.test.ts tests/branding/assets.test.ts tests/stripe/confirmation-routes.test.ts
→ 3 files / 10 tests PASSED
```

Additional local render of `Header` + `Footer` with staged/legacy brand overrides confirmed public logo URL + new tagline.

**Not done (by design):** real Resend sends, new Stripe purchases, production deploy, DNS edits, env mutations.

---

## Deliverability investigation (read-only)

Sender default in code: `StackScore <onboarding@bobkatit.com>` (`EMAIL_FROM`).

### Public DNS observations

| Check | Finding |
| --- | --- |
| Apex `bobkatit.com` SPF | `v=spf1 include:spf.protection.outlook.com -all` (Microsoft 365) |
| Apex MX | Outlook protection |
| `send.bobkatit.com` SPF | `v=spf1 include:amazonses.com ~all` (typical Resend/SES return-path) |
| `send.bobkatit.com` MX | `feedback-smtp.us-east-1.amazonses.com` |
| DKIM `resend._domainkey.bobkatit.com` | **TXT present** (public key material observed; not reproduced here) |
| DKIM `resend._domainkey.send.bobkatit.com` | **Not found** via this session’s resolver |
| DMARC `_dmarc.bobkatit.com` | **Present:** `v=DMARC1; p=none;` (monitor-only policy) |
| Resend dashboard “domain verified” | **Not readable** this session (no Resend API/dashboard access) |
| Staging logo URL | **HTTP 302** (auth) — explains broken image in staging-sourced emails |
| Production logo URL | **HTTP 200** `image/png` — suitable for email clients |

### Interpretation

- Broken logo was primarily an **asset host / Deployment Protection** issue, which also hurts spam heuristics (broken images).
- Authentication stack for Resend appears partially present (send subdomain SPF/MX + apex Resend DKIM + DMARC `p=none`). Full pass/fail for a given message should be confirmed from **message headers** (`spf=`, `dkim=`, `dmarc=`) or Resend Deliverability Insights.
- Apex SPF authorizes **Outlook only** (`-all`). That is expected for M365 mailbox hosting; Resend typically relies on **DKIM alignment** (and/or SPF on the bounce/`send.` domain) for DMARC. Operator should confirm From-domain DKIM alignment on a real message.
- DMARC `p=none` does not quarantine failures; tightening later (after monitoring) can improve trust but needs approval.

### Recommendations (approval required — not executed)

1. In Resend: confirm `bobkatit.com` (or the exact From domain) shows **Verified**; align `EMAIL_FROM` with that domain.
2. On a delivered activation email, inspect headers for `dkim=pass` / `dmarc=pass` for `bobkatit.com`.
3. Optionally set Staging `EMAIL_ASSET_BASE_URL=https://stackscore.tech` explicitly (code already defaults here; env makes intent obvious).
4. After logo fix ships to staging, re-send a **test** activation (operator-triggered) and confirm the logo renders in Gmail/Outlook.
5. Consider adding a DMARC aggregate reporting address (`rua=`) and, later, `p=quarantine` once all senders pass — **DNS change; needs approval**.
6. Warm reputation / avoid spam: keep logo/assets loading, avoid link domains that don’t match the brand, prefer authenticated From, ask recipients to mark Not Spam (now on confirmation page).

---

## Remaining items

| Item | Owner |
| --- | --- |
| Deploy these changes to **staging** and smoke-test confirmation + test email logo | Operator |
| Confirm Resend domain verified + header auth on a test send | Operator |
| Any DNS / DMARC policy changes | Operator (explicit approval) |
| Production deploy | Out of scope for this ticket |

---

## Safety compliance

| Constraint | Honored |
| --- | --- |
| Staging-oriented code only; no production deploy | Yes |
| No DNS modifications | Yes |
| No env var modifications in Vercel | Yes |
| No migrations | Yes |
| No new Stripe payments / real customer emails from this task | Yes |
