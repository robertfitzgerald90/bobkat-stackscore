# DOC-312 — Post-Purchase Confirmation Pages

## Routes

| Route | Product | Stripe mode |
|-------|---------|-------------|
| `/assessment-purchased` | Technology Maturity Assessment | `payment` |
| `/subscription-activated` | Strategic IT Consulting (vCIO) | `subscription` |

Legacy redirects (query string preserved):

- `/purchase/success` → `/assessment-purchased`
- `/vcio-offer/success` → `/subscription-activated`

Both pages set `robots: { index: false, follow: false }`.

## Stripe success URLs

Configured in application code (not the Stripe Dashboard):

| Checkout API | success_url |
|--------------|-------------|
| `POST /api/checkout/create-session` | `{APP_URL}/assessment-purchased?session_id={CHECKOUT_SESSION_ID}` |
| `POST /api/checkout/vcio` | `{APP_URL}/subscription-activated?session_id={CHECKOUT_SESSION_ID}` |

`{CHECKOUT_SESSION_ID}` is required for server-side verification. The browser URL alone is never trusted.

## Verification

### Assessment (`verifyAssessmentConfirmation`)

1. Session id must start with `cs_`
2. Retrieve Checkout Session from Stripe
3. Require `mode === payment`, technology assessment product metadata
4. `payment_status === paid` → verified success
5. Other non-unpaid statuses → pending
6. Look up `AssessmentPurchase` for CTA decisions (no PII rendered)
7. Primary CTA:
   - Active owner with assessment → **Open My Assessment** (`/assessment/start` or login callback)
   - Otherwise → **Return to StackScore** / **Sign In**

### Subscription (`verifySubscriptionConfirmation`)

1. Session id must start with `cs_`
2. Retrieve session with expanded subscription
3. Require `mode === subscription` and `stackscore_vcio` product
4. Reject session when logged-in user id does not match checkout metadata user
5. Prefer local `Subscription` row (webhook sync) for active/trialing
6. Primary CTA:
   - Authenticated matching client → **Open My Dashboard** (`/dashboard`)
   - Otherwise → **Sign In to StackScore**

Invalid/mismatched sessions show a generic failure message with no internal details.

## Fulfillment (unchanged)

Confirmation pages do **not** create accounts, invitations, or subscriptions.

| Flow | Webhook / fulfillment |
|------|------------------------|
| Assessment | `checkout.session.completed` → `fulfillTechnologyAssessmentPurchase` → activation or assessment-ready email |
| Subscription | Billing webhook → `fulfillVcioCheckoutSession` / subscription sync → welcome + onboarding emails |

Do not duplicate invitation emails from the confirmation pages.

## Analytics

| Event | When | Safe params |
|-------|------|-------------|
| `purchase` | Assessment verified paid | `transaction_id`, `value`, `currency`, `items` |
| `assessment_purchased` | Assessment verified paid | `currency`, `value`, `transaction_id`, `purchase_type`, `payment_provider` |
| `subscription_activated` | Subscription verified active/trialing | `currency`, `value`, `transaction_id`, `subscription_type`, `payment_provider`, `billing_interval` |

`transaction_id` is the verified Stripe Checkout Session id (`cs_…`) for GA ecommerce dedupe only. It is never rendered in the confirmation UI. Customer ids, emails, and card data are never sent.

### Idempotency

- Browser `sessionStorage` keyed by Checkout Session id
- `trackGa4Once` memory + sessionStorage
- Conversion events fire only after verified success (not processing / invalid)

**Limitation:** There is no database `analyticsReportedAt` flag and no Measurement Protocol send. Duplicate prevention is reliable within a browser session / device, not globally across devices.

## Webhook idempotency

- `StripeWebhookEvent.eventId` unique table
- Billing/vCIO path marks events after handling
- Assessment path marks events after successful (HTTP &lt; 400) fulfillment
- Assessment fulfillment also skips duplicates via `AssessmentPurchase.stripeSessionId`

## Privacy

Pages never display:

- Stripe Checkout Session IDs
- Customer / subscription / invoice ids
- Invitation tokens
- Checkout emails or company names
- Assessment ids

## Test plan (Stripe test mode)

### Assessment

1. Create checkout from `/assessment-offer`
2. Pay with test card
3. Confirm redirect to `/assessment-purchased?session_id=cs_…`
4. Confirm verified success UI (no session id shown)
5. Confirm activation email from webhook
6. Refresh — conversion events should not re-fire in the same browser
7. Open `/assessment-purchased` with no/malformed/wrong-product session → invalid state

### Subscription

1. Create checkout from Strategic IT Consulting flow
2. Complete subscription Checkout
3. Confirm redirect to `/subscription-activated`
4. Wait for webhook sync if pending, then verified UI
5. Authenticated owner sees **Open My Dashboard**
6. Refresh — `subscription_activated` should not duplicate

Also exercise: canceled checkout, direct navigation, mobile layout.

## Production checklist

- [ ] Redeploy after success URL code changes (no Stripe Dashboard success URL required for these App Router checkouts)
- [ ] Confirm Production `NEXT_PUBLIC_APP_URL` / app URL used by `getAppUrl()`
- [ ] GA4: mark `assessment_purchase_confirmed`, `purchase`, `subscription_activated` as key events if desired
- [ ] Walk both test-mode flows end-to-end after deploy
