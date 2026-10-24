# SS-SEC-001 — API Route Inventory

| Field | Value |
| --- | --- |
| Companion | [`SS-SEC-001-AUDIT.md`](SS-SEC-001-AUDIT.md) |
| Routes inventoried | **112** `route.ts` files under `src/app/api` |
| Server Actions | **0** |
| Auth enforcement model | Per-route (middleware matcher excludes `api`) |

### Auth legend

| Code | Meaning |
| --- | --- |
| `Public` | No session required (intentional) |
| `Session` | Any authenticated user |
| `ClientOwn` | `client` role + `requireClientWorkspaceAccess` / assessment ownership |
| `Staff` | `admin` \| `technician` (`requireConsultantOrAdmin` or equivalent) |
| `Admin` | `admin` only |
| `Secret` | Shared secret / webhook signature / cron bearer |
| `Mixed` | Method-dependent or optional session |

### Finding cross-refs

Routes tied to open findings are annotated (`C01`, `H01`, …).

---

## 1. Platform / ingress

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/auth/[...nextauth]` | * | Public (Auth.js) | Credentials login — **H01** no throttle |
| `/api/webhooks/stripe` | POST | Secret (Stripe signature) | `constructEvent` |
| `/api/webhooks/resend` | POST | Secret (Svix) | |
| `/api/cron/communications` | GET | Secret (`CRON_SECRET` Bearer) | Queue + QBR reminders |
| `/api/integrations/website-leads` | POST | Secret + in-memory rate limit | **M07** |

---

## 2. Public acquisition & account recovery

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/v1/health` | GET | Public | Config posture — **M01** |
| `/api/v1/public/technology-snapshot` | POST | Public | Returns `lead.id` — **M04**, enables **C01** |
| `/api/v1/public/technology-snapshot/[leadId]/continue-assessment` | POST | Public | Generic `{ ok, message }` only; activation via email — **C01/M08 remediated in SS-SEC-002**; rate limit still **H04** |
| `/api/v1/public/activate-account` | POST | Public (token) | Min password 10; **H04** |
| `/api/v1/public/password-reset` | POST, PUT | Public | Request anti-enum OK; PUT policy — **H02**, **H04** |
| `/api/checkout/create-session` | POST | Public | Assessment Checkout — **M03** |
| `/api/checkout/vcio` | POST | Mixed (optional session) | Subscription Checkout — **M06** |
| `/api/product-overview/pdf` | GET | Public | PDF gen — **M02** |

---

## 3. Session / self

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/v1/auth/me` | GET | Session | id, name, email, role |
| `/api/v1/onboarding` | GET, POST | Session | Client workspace onboarding |
| `/api/v1/search` | GET | Session | Client scoped / staff firm-wide |
| `/api/v1/notifications` | GET | Session | User-scoped |
| `/api/v1/notifications/[id]` | PATCH | Session | `user.id` on read/dismiss |
| `/api/v1/dashboard/summary` | GET | Staff | Firm KPIs |
| `/api/v1/insights` | GET | Staff | |
| `/api/v1/consulting-workspace` | GET | Staff | |
| `/api/v1/portfolio/summary` | GET | Admin | |

---

## 4. Users (admin)

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/v1/users` | GET, POST | Admin | |
| `/api/v1/users/[id]` | GET, PATCH, DELETE | Admin | |
| `/api/v1/users/[id]/deletion-preview` | GET | Admin | |

---

## 5. Clients & workspace

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/v1/clients` | GET, POST | Session / Staff | GET portal-scoped; POST Staff |
| `/api/v1/clients/[id]` | GET, PATCH, DELETE | ClientOwn / Staff / Admin | DELETE Admin |
| `/api/v1/clients/[id]/archive` | POST | Admin | |
| `/api/v1/clients/[id]/restore` | POST | Admin | |
| `/api/v1/clients/[id]/deletion-preview` | GET | Admin | |
| `/api/v1/clients/[id]/lifecycle` | GET | ClientOwn | |
| `/api/v1/clients/[id]/360` | GET | Staff | Hidden from portal |
| `/api/v1/clients/[id]/business-profile` | GET, PATCH | ClientOwn / Staff | PATCH Staff |
| `/api/v1/clients/[id]/technology-profile` | GET | ClientOwn | |
| `/api/v1/clients/[id]/technologies` | GET, POST | ClientOwn / Staff | |
| `/api/v1/clients/[id]/technologies/[deploymentId]` | PATCH, DELETE | Staff | |
| `/api/v1/clients/[id]/contacts` | GET, POST | Staff | |
| `/api/v1/clients/[id]/assessments` | GET, POST | ClientOwn / Staff | POST Staff |
| `/api/v1/clients/[id]/assessments/history` | GET | ClientOwn | |
| `/api/v1/clients/[id]/assessments/compare` | GET | Staff | |
| `/api/v1/clients/[id]/projects` | GET, POST | ClientOwn / Staff | |
| `/api/v1/clients/[id]/roadmap` | GET | ClientOwn | |
| `/api/v1/clients/[id]/roadmap/phases/[phaseId]` | PATCH, DELETE | ClientOwn / Staff | |
| `/api/v1/clients/[id]/roadmap/initiatives/[initiativeId]` | PATCH | ClientOwn / Staff | |
| `/api/v1/clients/[id]/phase-proposals` | GET, POST | ClientOwn / Staff | Visibility filtered for clients |
| `/api/v1/clients/[id]/phase-proposals/[proposalId]` | GET, PATCH | ClientOwn / Staff | |
| `/api/v1/clients/[id]/phase-proposals/[proposalId]/pdf` | GET | ClientOwn | |
| `/api/v1/clients/[id]/tip` | GET, POST | Staff | |
| `/api/v1/clients/[id]/tip/[tipId]` | GET, PATCH | Staff | Nested id + clientId |
| `/api/v1/clients/[id]/tip/[tipId]/generate` | POST | Staff | |
| `/api/v1/clients/[id]/tip/[tipId]/pdf` | GET | Staff | |
| `/api/v1/clients/[id]/proposals/[tipId]` | GET, PATCH | Staff | |
| `/api/v1/clients/[id]/proposals/[tipId]/publish` | POST | Staff | |
| `/api/v1/clients/[id]/qbr` | GET, POST | Staff | |
| `/api/v1/clients/[id]/qbr/[qbrId]` | GET, PATCH, DELETE | ClientOwn / Staff | Role-aware payload |
| `/api/v1/clients/[id]/qbr/[qbrId]/generate` | POST | Staff | |
| `/api/v1/clients/[id]/qbr/[qbrId]/pdf` | GET | ClientOwn | |
| `/api/v1/clients/[id]/vcio/onboarding` | GET, POST | Staff | |
| `/api/v1/clients/[id]/vcio/onboarding/reset` | POST | Staff | |
| `/api/v1/clients/[id]/vcio/planning-notes` | GET, PATCH | Staff | |
| `/api/v1/clients/[id]/vcio/welcome-email` | POST | Staff | |

---

## 6. Billing (client-scoped)

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/v1/clients/[id]/billing/overview` | GET | ClientOwn (+ billing helper) | `requireBillingClientAccess` |
| `/api/v1/clients/[id]/billing/portal` | POST | Billing management | |
| `/api/v1/clients/[id]/billing/invoices` | GET | ClientOwn | |
| `/api/v1/clients/[id]/billing/invoices/[invoiceId]` | GET | ClientOwn | Parent client scoped |
| `/api/v1/clients/[id]/billing/invoices/[invoiceId]/pdf` | GET | ClientOwn | |
| `/api/v1/clients/[id]/billing/payments` | GET | ClientOwn | |
| `/api/v1/clients/[id]/billing/deposits` | GET | ClientOwn | |
| `/api/v1/clients/[id]/billing/recurring-services` | GET | ClientOwn | |

---

## 7. Assessments & recommendations

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/v1/assessments/[id]` | GET, PATCH, DELETE | Assessment access / Staff / Admin | DELETE Admin; visibility filter on GET |
| `/api/v1/assessments/[id]/questions` | GET | Assessment access | |
| `/api/v1/assessments/[id]/responses/[questionId]` | PUT | Assessment access | |
| `/api/v1/assessments/[id]/complete` | POST | Assessment access | |
| `/api/v1/assessments/[id]/recommendations` | GET | Assessment access | Field filter for clients |
| `/api/v1/assessments/[id]/improvement` | GET | Assessment access | |
| `/api/v1/assessments/[id]/export/pdf` | GET | Assessment access | Deliverable |
| `/api/v1/assessments/[id]/archive` | POST | Admin | |
| `/api/v1/assessments/[id]/deletion-preview` | GET | Admin | |
| `/api/v1/recommendations/[id]` | PATCH, DELETE | Staff / Admin | DELETE Admin |
| `/api/v1/recommendations/[id]/archive` | POST | Admin | |
| `/api/v1/recommendations/[id]/deletion-preview` | GET | Admin | |

---

## 8. Projects

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/v1/projects` | GET | Session | Portal scoped / staff firm |
| `/api/v1/projects/[id]` | GET, PATCH, DELETE | ClientOwn / Staff / Admin | Foreign client → 404 |
| `/api/v1/projects/[id]/cancel` | POST | Admin | |
| `/api/v1/projects/[id]/deletion-preview` | GET | Admin | |

---

## 9. Snapshot leads & website leads (staff/admin)

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/v1/snapshot-leads` | GET | Admin | |
| `/api/v1/snapshot-leads/[id]` | GET, PATCH, DELETE | Admin | |
| `/api/v1/snapshot-leads/[id]/notes` | POST | Admin | |
| `/api/v1/snapshot-leads/[id]/convert` | POST | Admin | |
| `/api/v1/snapshot-leads/[id]/convert-preview` | GET | Admin | |
| `/api/v1/snapshot-leads/[id]/send-invitation` | POST | Admin | |
| `/api/v1/website-leads` | GET | Admin | |
| `/api/v1/website-leads/[id]` | GET, PATCH, DELETE | Admin | |
| `/api/v1/website-leads/[id]/convert` | POST, GET | Admin | |

---

## 10. Admin — communications, campaigns, prospects, library, vCIO test

| Route | Methods | Auth | Notes |
| --- | --- | --- | --- |
| `/api/v1/admin/communications/brand` | GET, PATCH | Staff | |
| `/api/v1/admin/communications/preview` | POST | Staff | Sample URLs only |
| `/api/v1/admin/communications/queue` | GET, POST | Staff | |
| `/api/v1/admin/communications/quick-invite` | POST | Staff | |
| `/api/v1/admin/communications/quick-invite/check` | GET, POST | Staff | |
| `/api/v1/admin/communications/sample-profiles` | GET, POST | Staff | |
| `/api/v1/admin/communications/test-send` | POST | Staff | |
| `/api/v1/admin/communications/templates/[templateKey]/validate` | POST | Staff | |
| `/api/v1/admin/communications/templates/[templateKey]/versions` | GET, POST, DELETE | Staff / Admin* | Destructive drafts Admin-gated via `requireCommunicationsAdmin` where used |
| `/api/v1/admin/campaigns` | GET, POST | Staff | |
| `/api/v1/admin/campaigns/[id]` | GET, PATCH | Staff | |
| `/api/v1/admin/prospects` | GET, POST | Staff | |
| `/api/v1/admin/prospects/[id]` | GET, PATCH | Staff | |
| `/api/v1/admin/prospects/import` | POST | Staff | |
| `/api/v1/admin/assessment-library` | GET, POST | Admin | |
| `/api/v1/admin/assessment-library/categories/[id]` | PATCH, DELETE | Admin | |
| `/api/v1/admin/assessment-library/questions/[id]` | GET, PATCH, DELETE | Admin | |
| `/api/v1/admin/vcio/onboarding-test` | POST | Admin/Staff | Internal test harness — confirm Staff gate in route |

\*Verify communications admin helper on DELETE versions when remediating.

---

## 11. Inventory completeness

| Category | Count (approx) |
| --- | --- |
| Total `route.ts` | 112 |
| Intentionally public / secret ingress | 12 |
| Session / staff / admin / client-scoped | 100 |

UI middleware public path allowlist in `auth.config.ts` is **not** an API allowlist; API public set is the table in §2 plus Auth.js and secret ingress in §1.

---

## 12. Frontend-only restrictions (not sufficient alone)

These UI redirects must not be treated as API security:

- Client blocked from `/admin/*`, `/portfolio`, `/clients/new`, etc. in `auth.config.ts` `authorized`
- Workspace section visibility (`isClientVisibleWorkspaceSection`)

Corresponding APIs reviewed above are expected to enforce server-side. Regression: unauthenticated and wrong-role API calls in test matrix.
