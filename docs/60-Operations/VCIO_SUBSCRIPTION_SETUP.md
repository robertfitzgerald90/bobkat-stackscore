# StackScore vCIO Subscription Setup

This document covers the manual Stripe, Vercel, deployment, and verification steps for StackScore vCIO.

## Environment Variables

Reuse:

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `AUTH_URL` or the configured application URL fallback
- `RESEND_API_KEY`
- Existing communication sender and internal notification settings

Add or verify:

- `STRIPE_VCIO_PRICE_ID`: Stripe recurring monthly Price ID for StackScore vCIO.
- `VCIO_PAYMENT_GRACE_PERIOD_DAYS`: Defaults to `7` when absent.

Do not commit real secret values.

## Stripe Dashboard Tasks

1. Confirm the StackScore vCIO Product exists.
2. Confirm the `$300/month` recurring Price exists.
3. Confirm `STRIPE_VCIO_PRICE_ID` matches the correct monthly Price in each environment.
4. Keep test-mode Price IDs and live-mode Price IDs separate.
5. Confirm the existing Stripe webhook destination points to `/api/webhooks/stripe`.
6. Add the vCIO webhook events listed below.
7. Confirm `STRIPE_WEBHOOK_SECRET` matches the webhook destination signing secret.
8. Enable Stripe Customer Portal.
9. Configure Customer Portal to allow payment method updates, invoice viewing, invoice downloads, billing detail updates, and subscription cancellation.
10. Configure cancellation behavior so access continues through the paid period.
11. Verify Customer Portal branding, business information, Bobkat IT support contact, and return URL behavior.

## Webhook Events Handled

The code handles these Stripe events through the existing verified webhook endpoint:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `customer.subscription.paused`
- `customer.subscription.resumed`
- `invoice.created`
- `invoice.finalized`
- `invoice.paid`
- `invoice.payment_failed`
- `invoice.payment_action_required`
- `invoice.voided`
- `charge.refunded`

Existing assessment and invoice payment events remain supported by the same webhook.

## Deployment Order

1. Deploy the database migration.
2. Deploy application code.
3. Verify webhook health.
4. Add or verify Stripe webhook events.
5. Configure Stripe Customer Portal.
6. Confirm `STRIPE_VCIO_PRICE_ID` is configured in Vercel.
7. Run a test vCIO purchase.
8. Verify local subscription and invoice synchronization.
9. Verify activation or onboarding email delivery.
10. Verify `/portal/vcio`, `/portal/vcio/onboarding`, and `/portal/billing`.
11. Verify Stripe Customer Portal opens from Subscription & Billing.
12. Verify payment failure, cancellation at period end, and reactivation behavior in test mode.

Do not activate production subscription sales until the migration, webhook handlers, entitlement logic, and Customer Portal are deployed and tested.

## Verification Checklist

- New unauthenticated customer can purchase vCIO and receives onboarding/activation email.
- Existing StackScore client can purchase vCIO without losing assessments or reports.
- Existing active, trialing, past-due, or incomplete vCIO subscriber cannot create a duplicate client-scoped checkout session.
- Checkout cancellation returns to `/vcio-offer?checkout=cancelled`.
- Checkout success verifies Stripe server-side and shows pending until webhook processing finishes.
- Existing Technology Assessment checkout still uses one-time payment mode and `STRIPE_ASSESSMENT_PRICE_ID`.
- `invoice.paid` records subscription invoice history and clears payment failure state.
- `invoice.payment_failed` marks the subscription past due and sends client/admin notifications.
- `invoice.voided` records a voided payment activity entry.
- `charge.refunded` records a refunded payment activity entry when linked to a vCIO subscription payment.
- Past-due clients receive grace-period access based on `VCIO_PAYMENT_GRACE_PERIOD_DAYS`.
- Ended clients retain historical records and read-only access behavior.
- Clients cannot access another client's billing or vCIO workspace.
- Client users cannot access `/admin/vcio` or `/admin/billing`.
- Staff/admin views show subscription status, onboarding state, billing warnings, and Stripe identifiers only to authorized staff.
