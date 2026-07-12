# Billing Module — Infrastructure Audit & Reuse Map

**Date:** July 2026  
**Scope:** Pre-implementation audit for StackScore Billing module

## Reusable Infrastructure

| Area | Existing asset | Billing reuse |
|------|----------------|---------------|
| Payments | `AssessmentPurchase` + Stripe Checkout | Link via `Invoice.assessmentPurchaseId`; extend webhook for invoice metadata |
| Stripe | `src/lib/stripe/*`, checkout session, webhook verify | Invoice Checkout Sessions with `metadata.invoiceId` |
| Pricing | TIP `wizardState.investment`, `computeInvestmentView()` | Invoice line items from labor/hardware/services (client-facing only) |
| Proposals | `TechnologyImprovementPlan` approved status | `Invoice.tipId`, source `technology_improvement_plan` |
| Projects | `Project.estimatedCost` | `Invoice.projectId`, line items from project |
| Email | Resend + `recordAndSendCommunication()` | Invoice delivery + reminders |
| PDF | `@react-pdf/renderer`, shared colors/layout | Invoice PDF document |
| Contacts | `ClientContact.rolesJson` includes `billing` | `Invoice.billingContactId` |
| Permissions | `requireClientWorkspaceAccess`, `isStaffRole` | `src/lib/billing/access.ts` |
| Audit | `BillingAuditEvent` (new), `OrganizationActivityCategory.BILLING` | Financial action trail |

## Avoid Duplicating

- Do **not** duplicate TIP investment JSON — generate line items at invoice creation
- Do **not** create separate proposal model — TIP is the proposal
- Do **not** trust client-side payment success — Stripe webhooks + manual record only
- Do **not** expose `internalCostCents`, margin, or `internalNotes` to client APIs/views

## Schema Added

See `prisma/schema.prisma` billing section: `Invoice`, `InvoiceLineItem`, `BillingPayment`, `PaymentApplication`, `BillingDeposit`, `RecurringService`, `InvoiceDelivery`, `ClientBillingProfile`, `BillingAuditEvent`, `StripeWebhookEvent`.

## Migration

Run: `npx prisma migrate dev --name billing_module`
