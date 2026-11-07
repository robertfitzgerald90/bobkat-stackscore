# DOC-311 — Google Analytics 4 Setup (StackScore)

This guide covers the StackScore (`stackscore.tech`) GA4 integration using `@next/third-parties/google`.

## Vercel environment variables

1. Open the **StackScore** project in Vercel.
2. Go to **Settings → Environment Variables**.
3. Add the `stackscore.tech` Measurement ID:

   - Name: `NEXT_PUBLIC_GA_MEASUREMENT_ID`
   - Value: your GA4 Measurement ID (format `G-XXXXXXXX`)
   - Environment: **Production**

4. Add:

   - Name: `NEXT_PUBLIC_ENABLE_ANALYTICS`
   - Value: `true`
   - Environment: **Production**

5. Redeploy the Production deployment.

Do **not** commit the production Measurement ID to `.env.example` or source control.

### Load rules

GA4 loads only when all of the following are true:

- `NODE_ENV === "production"`
- `NEXT_PUBLIC_ENABLE_ANALYTICS === "true"` (exact string)
- `NEXT_PUBLIC_GA_MEASUREMENT_ID` begins with `G-`

Local development does not load GA4 under normal settings. The app must continue to work when Analytics is unset.

## Verify in Google Analytics

1. Visit `https://stackscore.tech`.
2. Open the StackScore GA4 property.
3. Confirm traffic under **Reports → Realtime**.
4. Exercise the Technology Snapshot and Assessment Offer funnels.
5. Confirm events in Realtime or DebugView.
6. Mark key events under **Admin → Events** (or Key events):

Recommended key events:

- `complete_technology_snapshot`
- `snapshot_assessment_cta_click`
- `begin_assessment_checkout`
- `purchase`
- `book_consultation`
- `submit_contact_form` *(reserved; no public contact form yet)*

## Cross-domain configuration (Bobkat IT ↔ StackScore)

Preserve natural referrer and UTM attribution from bobkatit.com.

Configure domains in GA4:

**Admin → Data Streams → Web → Configure tag settings → Configure your domains**

Add:

- `bobkatit.com`
- `stackscore.tech`

Linker auto-behavior is **not** injected by this app. Configure cross-domain measurement in the GA4 admin UI for both properties/sites as needed, then validate session continuity manually.

Optional privacy-safe event:

- `bobkat_referral_landing` — fired once per session when a public StackScore page is opened with a Bobkat IT referrer host.

## Architecture

| Piece | Path |
|-------|------|
| Root install | `src/app/layout.tsx` (`GoogleAnalytics` once) |
| Enablement gate | `src/lib/analytics/ga4-config.ts` |
| Client sender + once helpers | `src/lib/analytics/ga4.ts` |
| Typed events | `src/lib/analytics/ga4-events.ts` |
| Purchase transaction ids | `src/lib/analytics/ga4-transaction-id.ts` |
| Purchase verification | `src/lib/analytics/verify-assessment-purchase.ts` |

Existing Vercel Analytics / Speed Insights remain unchanged. Interactive-demo and product-overview Vercel custom events remain separate.

Authenticated client-portal behavior is intentionally **not** sent to marketing GA4.

## Implemented events

| Event | When | Safe parameters |
|-------|------|-----------------|
| *(automatic page_view)* | Official `@next/third-parties` GA config | Managed by gtag |
| `view_technology_snapshot` | Snapshot wizard displayed | `page_path` |
| `start_technology_snapshot` | Visitor begins questionnaire (Start) | `page_path`, `start_method` |
| `complete_technology_snapshot` | Snapshot submit succeeds + results shown | `page_path`, `completion_method` |
| `snapshot_assessment_cta_click` | Results CTA toward paid assessment | `button_location`, `destination_path` |
| `view_assessment_offer` | Offer page displayed | `page_path`, `offer_name` |
| `begin_assessment_checkout` | Stripe checkout session URL received | `button_location`, `offer_name`, `currency` |
| `purchase` | Success page + Stripe `payment_status=paid` | `transaction_id`, `value`, `currency`, `items[]` |
| `book_consultation` | Cal.com consultation CTA click | `button_location`, `destination_type`, `page_path` |
| `login` | Successful credentials sign-in | `method` only |
| `sign_up` | Successful account activation | `method` only |
| `bobkat_referral_landing` | Public page with Bobkat IT referrer | `page_path`, `referrer_host` |

## Deferred / reserved events

| Event | Status |
|-------|--------|
| `snapshot_consultation_click` | Helper exists; no consultation CTA currently on snapshot results |
| `assessment_consultation_click` | Helper exists; assessment-offer page has no consultation CTA today |
| `submit_contact_form` | Helper exists; no public contact form route |

## Purchase verification

`purchase` and `assessment_purchased` fire only when `/assessment-purchased` server-verifies the Stripe Checkout Session:


- Session id present and retrievable
- `payment_status === "paid"`
- Product type is Technology Assessment

`transaction_id` is the internal `AssessmentPurchase.id` when available, otherwise a one-way hash (`tma_…`) of the Stripe session id. Stripe session ids, customer ids, emails, and invitation tokens are never sent to GA4.

Idempotency: sessionStorage key per transaction id + in-memory / `trackGa4Once` guards.

## Privacy rules

Never send to GA4:

- Snapshot/assessment answers or scores
- Recommendations, findings, roadmap/project data
- Names, emails, phones, business identifiers
- Invitation tokens, assessment/client/proposal/invoice ids
- Stripe customer ids or credentials
- Free-text responses or private query strings

## Duplicate prevention

- View/start/complete/offer/referral/purchase use `trackGa4Once` (memory + `sessionStorage`)
- Checkout-start fires once per intentional successful checkout click (not on page load)
- Official GA integration owns page views (no manual `page_view` duplication)

## Local placeholders

`.env.example`:

```
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## Admin analytics read path

`/admin/analytics` is an admin-only Operations page. It reads StackScore records directly and, when server credentials exist, the GA4 Data API and Vercel Web Analytics API. It does not invent traffic, and it does not add Bobkat IT and StackScore into one visitor total.

Anonymous provider totals stay separate from website leads, snapshot submissions, and assessment purchases. Those records are not a measured cross-domain journey.

Server-only variables (Vercel project settings, never committed):

| Variable | Purpose |
| --- | --- |
| `GA4_SERVICE_ACCOUNT_JSON` | Google service account JSON, or its base64 form. Grant the account Viewer on each GA4 property. |
| `GA4_STACKSCORE_PROPERTY_ID` | Numeric GA4 property id for stackscore.tech |
| `GA4_BOBKAT_PROPERTY_ID` | Numeric GA4 property id for bobkatit.com |
| `VERCEL_WEB_ANALYTICS_TOKEN` | Vercel access token that can query Web Analytics |
| `VERCEL_TEAM_ID` | Team id, when the projects belong to a team |
| `VERCEL_STACKSCORE_PROJECT_ID` | StackScore Vercel project id |
| `VERCEL_BOBKAT_PROJECT_ID` | Bobkat IT Vercel project id |

Assessment revenue on that page is the net amount stored on confirmed Technology Assessment checkouts. Full refunds are excluded. Partial refunds are omitted because the retained cents are not stored. It is not accounting revenue.

Google Search Console and multi-touch campaign attribution are follow-ups. They need separate access and are not estimated here.

