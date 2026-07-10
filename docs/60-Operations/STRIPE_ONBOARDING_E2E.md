# Stripe Purchase → Assessment E2E Checklist

Use this checklist after deploying schema migration and configuring Stripe + Resend.

## Environment

- [ ] `DATABASE_URL` points to target database
- [ ] Run `npm run db:migrate:deploy`
- [ ] `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_ASSESSMENT_PRICE_ID` set
- [ ] `RESEND_API_KEY` and `EMAIL_FROM` set (or verify console email fallback in dev)
- [ ] `AUTH_SECRET`, `AUTH_URL`, `NEXT_PUBLIC_APP_URL` set

## Stripe

- [ ] Checkout creates session with `metadata.productType = technology_assessment`
- [ ] Webhook endpoint registered for `checkout.session.completed`
- [ ] Stripe CLI or dashboard test event verifies signature locally/production

## New customer purchase

- [ ] Complete checkout with a **new** email (not staff)
- [ ] Webhook logs `outcome: fulfilled`
- [ ] `AssessmentPurchase` row created with `status = fulfilled` and unique `stripeSessionId`
- [ ] `Client`, `User` (`role=client`, `isActive=false`), `Assessment` (`scoringEngineVersion=v2`, `status=draft`) created
- [ ] Activation email received (or logged to console in dev)
- [ ] `/purchase/success` shows email instructions (does **not** create records)
- [ ] Activation link opens `/activate-account`
- [ ] Password setup activates account and redirects to `/onboarding`
- [ ] Onboarding saves company info and redirects to `/assessment/start`
- [ ] Wizard loads **80 active** pillar questions
- [ ] Responses save and persist

## Repeat purchase (same email)

- [ ] Second checkout with same client email
- [ ] **No duplicate user** created
- [ ] New `AssessmentPurchase` + new draft `Assessment` on existing client
- [ ] Active user receives assessment-ready email (not activation)

## Idempotency

- [ ] Replay same `checkout.session.completed` event
- [ ] No duplicate users, clients, or assessments
- [ ] Webhook returns 200

## Staff email collision

- [ ] Purchase with admin/technician email
- [ ] `AssessmentPurchase.status = manual_review`
- [ ] No client/user/assessment created automatically

## Access control

- [ ] Client cannot access another client's workspace URL
- [ ] Client cannot access staff-only PATCH on assessments
- [ ] Unauthenticated user cannot access `/assessment/start`

## Regression guards

- [ ] Assessment library unchanged (80 active pillar questions)
- [ ] Scoring completion still works for client-completed assessment
- [ ] v1 archived library not reactivated
