# SS-REL-006 — Investigate Missing Activation Email

| Field | Value |
| --- | --- |
| Status | **Investigation complete — no code/data changes** |
| Date | 2026-10-26 (evening) / DB evidence `2026-10-27T02:54:11Z` |
| Branch | `staging` @ `bebfb77` |
| Staging app | `https://staging.stackscore.tech` |
| Database | Neon Staging (`ep-patient-credit-…` / `neondb`) — read-only |
| Related | SS-REL-004, SS-REL-005 |
| Constraints | No production changes; no new payment; no resend; no new tokens; no customer mutations; no migrations; no secrets/activation links in this report |

### Verdict (short)

Execution **stopped in fulfillment** with outcome **`manual_review`** because the Checkout purchaser email belongs to an existing **staff (`admin`)** user. The webhook **intentionally skipped** `sendPurchaseFulfillmentEmail()`, created **no** assessment and **no** activation token, recorded the purchase only, and still returned **HTTP 200** to Stripe. Resend was **never called** — consistent with an empty Resend activity feed.

This is **application logic by design** for staff-email collisions, not a Resend outage and not a missing `RESEND_API_KEY` failure for this event (email path never entered).

---

## Scoreboard

| # | Question | Result |
| --- | --- | --- |
| 1 | Purchase recorded | **PASS** — `AssessmentPurchase` with `paymentStatus=paid`, `status=manual_review` |
| 2 | Assessment created | **FAIL** — `assessmentId` null; no draft assessment |
| 3 | Activation invitation / token created | **FAIL** — no `AccountActivationToken` for the purchaser user; no client/user provisioning for this purchase |
| 4 | Email sending attempted | **FAIL** — no `CommunicationMessage`; webhook skips email when `outcome !== "fulfilled"` |
| 5 | Resend accepted the email | **FAIL** / N/A — Resend API not invoked for this purchase (operator: no activity in Resend dashboard) |
| 6 | Root cause | Staff-email collision → `manual_review` → email path skipped; HTTP 200 still returned |
| 7 | Exact recommended fix | Re-test with a **non-staff** sandbox email; optionally improve ops visibility (manual-review alert / confirmation-page copy). Do **not** auto-activate staff emails into client workspaces without product approval |

---

## Execution trace (where it stopped)

Stripe reported `checkout.session.completed` with staging webhook **HTTP 200**. Staging Neon shows matching records at the same timestamp.

```
POST /api/webhooks/stripe
  → constructEvent OK (operator: Stripe got 200)
  → StripeWebhookEvent stored
       eventType=checkout.session.completed
       processedAt≈2026-10-27T02:54:11.585Z
  → handleAssessmentCheckoutCompleted
  → fulfillTechnologyAssessmentPurchase(session)
       F02 payment_status === paid          PASS
       F03 productType technology_assessment PASS
       F04 purchaser email resolved         PASS (matches admin user email)
       F05 no existing AssessmentPurchase   PASS
       F06 User.findUnique(email)           FOUND role=admin
       F07 staff email collision            → recordManualReviewPurchase()
            AssessmentPurchase.status = manual_review
            failureReason = "Purchaser email belongs to an existing staff account"
            NO Client / User create for purchase
            NO Assessment
            NO AccountActivationToken
            return outcome: "manual_review"
  → route W09: outcome !== "fulfilled"
       sendPurchaseFulfillmentEmail()  *** NOT CALLED ***
       return NextResponse.json({ received: true })   ← HTTP 200
```

**Stop point:** `technology-assessment.ts` staff-collision branch (`F07` / `recordManualReviewPurchase`) + webhook early return at `result.outcome !== "fulfilled"`.

Email / Resend stack (`purchase-fulfillment.ts` → `recordAndSendCommunication` → `sendEmail` → `resend.emails.send`) was **never reached**.

---

## Staging database evidence (read-only, redacted)

Queried via local `.env` `DATABASE_URL` → staging Neon host `ep-patient-credit-atddo1zm…` (not production `ep-autumn-wave-…`).

### AssessmentPurchase (latest — only recent row)

| Field | Value |
| --- | --- |
| `status` | **`manual_review`** |
| `paymentStatus` | `paid` |
| `productType` | `technology_assessment` |
| `purchaserEmail` | `bo***@bobkatit.com` (masked) |
| `failureReason` | **Purchaser email belongs to an existing staff account** |
| `clientId` / `userId` / `assessmentId` | **all null** |
| `fulfilledAt` | null |
| `amountTotal` / `currency` | `150000` / `usd` |
| `createdAt` | `2026-10-27T02:54:11.567Z` |
| `stripeSessionId` | `cs_test_…` (sandbox) |

### Assessment

**None** linked to this purchase.

### User matching purchaser email

| Field | Value |
| --- | --- |
| Role | **`admin`** (staff) |
| `isActive` | true |
| Email match to purchase | **yes** |
| `clientId` | null (staff account) |
| Activation tokens for this user | **none** |

### AccountActivationToken

**None** for the purchaser user (and none created by this fulfillment path).

### CommunicationMessage

| Metric | Value |
| --- | --- |
| Related to this purchase / EMAIL-001 / last 7 days | **0 rows** |
| `EMAIL-001` total in DB | **0** |

Confirms email send was not attempted / not recorded.

### StripeWebhookEvent

| Field | Value |
| --- | --- |
| Latest | `checkout.session.completed` |
| `processedAt` | `2026-10-27T02:54:11.585Z` (~18ms after purchase row) |

Idempotency mark is present; consistent with a successful webhook ACK after fulfillment returned `manual_review`.

---

## Code behavior that explains HTTP 200 without email

From `src/app/api/webhooks/stripe/route.ts`:

1. If `fulfillTechnologyAssessmentPurchase` returns anything other than `outcome === "fulfilled"` (including **`manual_review`**, `already_fulfilled`, `ignored`), the handler logs a stop and returns **`{ received: true }`** — **email not sent**.
2. Even when `fulfilled`, email errors are **caught** and the handler still returns **`{ received: true }`** (so Resend failures would also yield Stripe 200). That second path was **not** hit here.

From `src/lib/stripe/fulfillment/technology-assessment.ts`:

- Staff roles (`admin` / `technician`) colliding with purchaser email → `recordManualReviewPurchase` → **`manual_review`**, no workspace/assessment/token.
- Documented in product discovery / Stripe onboarding E2E as expected for email collisions.

Confirmation page success only proves Stripe session paid / verify path — it does **not** require `AssessmentPurchase.status === fulfilled` or an outbound email.

---

## What this is / is not

| Hypothesis | Verdict |
| --- | --- |
| Resend rejected / domain issue | **Not for this event** — API never called; dashboard empty is expected |
| Missing Staging `RESEND_API_KEY` | **Not the stop cause** — would only matter after `fulfilled`; console fallback would still not appear in Resend |
| Webhook never ran | **False** — `StripeWebhookEvent` + purchase row |
| `already_fulfilled` skip | **False** — first purchase for session; status is `manual_review` |
| Email address mismatch vs purchase | **False** — purchase email matches existing admin user |
| Application bug (unexpected throw before email) | **False** — deliberate staff collision path |
| Application logic (staff collision) | **True — root cause** |

---

## Root cause

The sandbox Checkout used a **staff (`admin`) email** (`bo***@bobkatit.com`). StackScore treats that as an unsafe auto-provisioning collision, records **`AssessmentPurchase.status = manual_review`**, and **does not** send the activation email. Stripe still receives **200** because the webhook acknowledges the event after recording manual review.

---

## Exact recommended fix

### Immediate (validation / ops — preferred for SS-REL)

1. Re-run sandbox purchase using a **new disposable customer email** that does **not** exist as `admin` / `technician` / existing client user in staging Neon (e.g. a unique `+tag` inbox or dedicated test mailbox).
2. Expect after webhook: `AssessmentPurchase.status=fulfilled`, draft `Assessment`, `AccountActivationToken` (hashed), `CommunicationMessage` with `templateKey=EMAIL-001`, and a Resend activity row (requires Staging `RESEND_API_KEY` + valid `EMAIL_FROM`).
3. Leave the current `manual_review` purchase as-is for audit; staff can fulfill manually later if product requires — **do not** auto-resend or mint tokens in this investigation follow-up unless separately authorized.

### Product / engineering (optional, needs approval — do not implement in this ticket)

1. **Confirmation UX:** If purchase is `manual_review`, show “payment received — account requires staff review” instead of implying an activation email was sent.
2. **Ops alert:** Notify staff when `manual_review` purchases are created (email/Slack), since customers will not get EMAIL-001.
3. **Staging seed hygiene:** Document that `admin@…` / staff emails must not be used as Checkout customer emails for activation E2E.
4. Only if product explicitly wants staff-email purchases to create client workspaces: change fulfillment policy (high risk; conflicts with current security design).

### Config still worth confirming before next E2E (not root cause here)

| Env on Vercel Staging | Why |
| --- | --- |
| `RESEND_API_KEY` | Required for real Resend delivery once `fulfilled` |
| `EMAIL_FROM` | Must be an allowed Resend from-address |
| `RESEND_WEBHOOK_SECRET` | Delivery tracking only |

Local workstation has `RESEND_*` / `EMAIL_FROM` **ABSENT**; Staging values were not readable this session (Vercel CLI logged out).

---

## Safety compliance

| Constraint | Honored |
| --- | --- |
| Staging DB only | Yes |
| No production modification | Yes |
| No new Stripe payment | Yes |
| No automatic email resend | Yes |
| No new activation tokens | Yes |
| No customer record mutations | Yes |
| No migrations | Yes |
| No secrets / activation links exposed | Yes (emails masked; token hashes not printed as secrets; raw tokens never loaded) |

Temporary read-only script used for queries should be removed after investigation; no application code changed.

---

## Final answers (deliverable checklist)

1. **Purchase recorded:** **PASS** (`manual_review`, paid).  
2. **Assessment created:** **FAIL**.  
3. **Activation invitation created:** **FAIL**.  
4. **Email sending attempted:** **FAIL** (skipped by design).  
5. **Resend accepted the email:** **FAIL** (never sent).  
6. **Root cause:** Staff-email → `manual_review` → webhook returns 200 without calling email.  
7. **Exact recommended fix:** Re-test with a non-staff customer email; optionally improve manual-review UX/alerts; do not treat this as a Resend outage.
