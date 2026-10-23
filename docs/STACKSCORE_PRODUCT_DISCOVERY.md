# StackScore Product Discovery and Business Audit

**Date:** October 23, 2026  
**Scope:** Read-only review of the repository on branch `main`  
**Audience:** Bobkat IT ownership and delivery leadership  
**Method:** Source, schema, routes, tests, and documentation were inspected. The running production site, Stripe Dashboard, Resend Dashboard, Neon data, and Vercel environment were not exercised.

This report describes what the application can do from repository evidence. A route, table, or document is not treated as a working feature unless the supporting code path exists.

## How to read status labels

| Label | Meaning in this report |
| --- | --- |
| IMPLEMENTED | A user can complete the workflow in code: persistence, service logic, and a page or API are wired together. |
| PARTIALLY IMPLEMENTED | A real path exists, and a material step is stubbed, manual, inconsistent, or unsafe. |
| PLANNED | Specified or represented by a placeholder, without a working product path. |
| DEPRECATED | Superseded by a newer path that new work uses. Older code may still run for old records. |
| UNVERIFIED | Code exists, but this audit did not prove it works in a deployed environment. |
| ABSENT | No product capability was found. |

**Assumption:** Marketing prices of $1,500 and $500 per month are the prices Bobkat intends to charge. The application does not store those checkout amounts. Stripe Price IDs come from environment variables. Whether the live Stripe prices match the pages is **UNVERIFIED**.

**Stale documents:** `README.md`, `docs/50-Development/PROJECT_STATUS.md`, and `docs/50-Development/DEPLOY.md` still describe an earlier internal tool (seven categories, fifty questions, no migrations, no tests). The code has moved past that description. Where they conflict with code, this report follows the code and says so.

**Working tree note:** Uncommitted portfolio case-study files were present during the audit (`docs/PORTFOLIO_CASE_STUDY.md`, `src/app/demo/stackscore-case-study/`, `src/components/portfolio/stackscore/`, `tests/portfolio/stackscore-case-study.test.ts`). They are unpublished local work and are not treated as a shipped customer capability.

---

## 1. Executive Summary

### What StackScore is today

StackScore is Bobkat IT’s consulting operating system for a technology maturity assessment and the work that follows it. A small or mid-sized business can be offered a scored assessment, a written report, a prioritized improvement plan, a roadmap, projects, and an optional monthly virtual CIO (vCIO) relationship. Bobkat staff run the engagement from the same application.

It is a single Bobkat-operated product. Each customer is a `Client` record. It is not a CRM, and it is not a platform other MSPs can license.

The original loop — Assess, Score, Prioritize, Plan, Execute, Measure, Reassess — is present in code. Several of those stages still depend on a consultant reviewing, editing, or sending the result before a customer should see it.

### What it can actually do

- Present a public assessment offer and a vCIO offer, and start Stripe Checkout.
- After a paid assessment webhook, create a client, an inactive portal user, a draft assessment, and an activation email.
- Let that customer set a password, confirm company details, and answer an 80-question assessment.
- Calculate pillar scores and an overall StackScore from those answers.
- Store score history, compare two assessments, and start a reassessment that copies prior answers.
- Generate recommendation rows from a catalog. The current v2 catalog is explicitly stub content.
- Let staff build a Technology Improvement Plan, a living roadmap, phase proposals, projects, and quarterly business reviews.
- Export real PDFs for the assessment, the improvement plan, the quarterly review, a phase proposal, and an invoice.
- Give the customer a portal for scores, recommendations, roadmap, projects, reviews, reports, and billing.
- Run a separate eight-question Technology Snapshot that captures a lead and does not fill in the full assessment.
- Accept website leads from the Bobkat marketing site through a shared-secret API.
- Queue most customer emails for staff review. Password reset, assessment invitation, purchase activation, and vCIO welcome are coded to send without that review queue.

### What makes it valuable

The paid problem is not “software.” The problem is that an owner cannot tell whether the business can recover from ransomware, whether access is controlled, or which technology spend should come first. StackScore turns that uncertainty into a number, eight pillar results, a written report, and a list of next actions a consultant can stand behind.

The commercial value is repeatability. The same question bank, the same math, and the same report shape let Bobkat deliver a $1,500 assessment without rebuilding the deck for every client, then use the score history as the reason to come back in a year or to stay on a monthly advisory retainer.

### What is unfinished

- Several APIs that hold client data only check that a user is logged in. A customer portal account can request another client’s record if the identifier is known. The on-screen workspace blocks that. The API does not, on the routes listed in [Launch Readiness](#11-launch-readiness).
- All 80 v2 recommendation templates are marked stubs in `data/RecommendationCatalogV2.json`.
- Completing an assessment does not require every pillar. The overall score averages only the finished pillars, so a partial assessment can look like a company-wide score.
- v2 profile risk counts record critical flags and store high, medium, and low as zero (`src/lib/assessments/complete-v2.ts`).
- There is no peer benchmark, no risk-register product, no task system, and no MSP licensing product.
- The risk page is a placeholder. The playbook library page says the library is planned. Solution playbook data is used inside the improvement plan.
- Assessment-complete, roadmap, proposal, and quarterly-review emails wait for staff approval.
- Live Stripe, Resend, cron, and production database configuration were not verified from this repository.

### What Bobkat can confidently sell today

Bobkat can sell a **consultant-delivered Technology Maturity Assessment** once two conditions are true:

1. Customer portal logins are not issued until the client APIs refuse cross-client reads and writes. Staff-only delivery can proceed before that fix only if customers are not given passwords.
2. A consultant reviews scores, replaces stub recommendations, and sends the assessment PDF as the deliverable. The application will not produce a client-ready recommendation narrative on its own.

The monthly vCIO offer is coded (checkout, subscription sync, entitlements, onboarding, portal). Selling it confidently still depends on the same data-isolation fix and on confirming the live Stripe price.

### What prevents the first paying customer

If the database already contains any other client — a demo company, a converted lead, or a test purchase — issuing a portal login before the API fix can expose that other company’s name, contacts, scores, assessments, and projects.

Even with an empty customer list, three delivery gaps remain:

- Automatic recommendations are placeholders, so the “executive deliverable” is not finished when the customer clicks Complete.
- A customer can complete the assessment before all eight pillars are answered, and the headline score will omit the unfinished ones.
- This audit cannot confirm that production Stripe will charge $1,500, that the webhook will run, or that the activation email will arrive.

### Five highest-priority next actions

1. Apply client ownership checks to every client data API before any customer password is issued. Staff-only routes should reject the `client` role.
2. Confirm, outside this repository, that the Stripe Price IDs, webhook endpoint, Resend domain, and daily communications cron are configured for production. Do not treat the marketing price as proof of the charged price.
3. Treat the v2 recommendation catalog as draft consultant language. Review or replace it before a customer sees recommendations. Keep the assessment-complete email on manual review until that language is ready.
4. Require all eight pillars before a customer-facing overall score is published, or label a partial result as incomplete everywhere it appears, including the PDF.
5. Write a one-page delivery checklist for the $1,500 engagement: purchase, activation, full assessment, consultant review, PDF, review meeting, optional improvement plan. Use the product that already exists.

### What should not be developed right now

- A StackScore license for other MSPs.
- Peer or industry benchmarking.
- A CRM, a task manager, or a risk-register module.
- A second marketing website inside this app. Service pages already send visitors to bobkatit.com.
- Automatic email of assessment results before a consultant has read them.
- New scoring models. The v2 math is implemented. The delivery and isolation work matters more than another formula.

---

## 2. Architecture Overview

### Technology stack

| Layer | What the repository uses | Evidence |
| --- | --- | --- |
| Application | Next.js 15.5 App Router, React 19, TypeScript | `package.json` |
| Runtime | Node.js 24.x | `package.json` `engines` |
| UI | Tailwind CSS 4, shadcn `base-nova`, Base UI, Recharts | `package.json`, `src/components/ui/` |
| API | Route Handlers under `src/app/api`. Server Actions are not the mutation pattern | `src/app/api/**/route.ts` |
| Data | Prisma 7, PostgreSQL, driver adapter `pg` | `prisma/schema.prisma`, `package.json` |
| Auth | NextAuth v5, JWT sessions, email and password | `src/lib/auth/config.ts`, `src/lib/auth/auth.config.ts` |
| Payments | Stripe Checkout, signed webhooks | `src/lib/stripe/`, `src/app/api/webhooks/stripe/route.ts` |
| Email | Resend and React Email | `src/lib/email/send.ts`, `src/emails/` |
| PDF | `@react-pdf/renderer` | `src/lib/pdf/generate.tsx` |
| Analytics | Vercel Analytics, Speed Insights, optional Google Analytics 4 | `package.json`, `src/lib/analytics/` |
| Tests | Vitest, 100+ test files under `tests/` | `package.json`, `tests/` |
| Jobs | One Vercel Cron, daily at 12:00 UTC | `vercel.json` |

### Frontend architecture

Authenticated screens live in `src/app/(dashboard)/`. Public acquisition screens live beside them: home, assessment offer, vCIO offer, checkout, technology snapshot, demo, login, activation, and password reset.

Staff and customers share one shell. `getSidebarNavForRole` in `src/lib/navigation/sidebar-nav.ts` switches the menu. Customer pages for a company sit under `/clients/[id]/...` and are wrapped by `src/app/(dashboard)/clients/[id]/layout.tsx`.

Interactive work (answering questions, saving invoices, publishing plans) calls `/api/v1/...` from the browser. Pages load data on the server where that pattern already exists.

`/services` and `/solutions` permanently redirect to the Bobkat IT marketing site (`src/lib/marketing/bobkat-website.ts`). `/product-overview` redirects to `/demo`.

### Backend architecture

Business rules live in `src/lib/<domain>/`. Route handlers authenticate, validate, and call those services. The flow is:

```text
Browser or public page
  → Route Handler (src/app/api/**/route.ts)
    → src/lib service
      → Prisma (src/lib/db)
        → PostgreSQL
```

Webhooks and the cron job are separate ingress paths. They do not use the user session. Stripe verifies a signature. The communications cron expects a bearer secret. The website-lead integration expects a shared secret.

### Database architecture

PostgreSQL is the system of record. Prisma migrations exist from the initial schema through commercial, billing, vCIO, communications, catalog, roadmap, and lifecycle changes (`prisma/migrations/`, 30 migration folders). `PROJECT_STATUS.md` is wrong when it says migrations were never committed.

The tenant boundary is `Client`. There is no Organization or Workspace table. `OrganizationActivityEvent` is an activity log attached to a client. The name is historical.

Major record groups:

- People and access: `User`, `AccountActivationToken`
- Customer: `Client`, `TechnologyProfile`, `TechnologyProfileSnapshot`, business-profile fields, `ClientContact`
- Assessment: `AssessmentCategory`, `AssessmentQuestion`, `AnswerOption`, `Assessment`, `AssessmentResponse`, `AssessmentCategoryScore`, `ClientScoreHistory`
- Advice and work: `RecommendationTemplate`, `AssessmentRecommendation`, `Project`, `TechnologyImprovementPlan`, `ClientRoadmap`, phases, initiatives, `PhaseProposal`
- Reviews and files: `QuarterlyBusinessReview`, `Document`, `Note`
- Commerce: `AssessmentPurchase`, `Subscription`, invoices, payments, deposits, recurring services, `StripeWebhookEvent`
- Acquisition: `WebsiteLead`, `TechnologySnapshotLead`, `Prospect`, campaigns
- Catalog: `Technology`, `ClientTechnology`, lifecycle opportunities
- Communications: messages, events, queue, template versions

`User.clientId` is optional and unique. One portal user maps to one client. Staff users have no `clientId`.

### Authentication and authorization

Login is email and password through NextAuth Credentials. Passwords are checked with bcrypt. The session is a JWT lasting 24 hours (`src/lib/auth/auth.config.ts`). The token stores id, role, and email. It does not store `clientId`. Role and active status are refreshed from the database on use (`src/lib/auth/config.ts`).

`src/middleware.ts` protects pages and excludes `/api`. Every API route is responsible for its own authorization. That split is implemented. It is also where isolation fails: some APIs stop after “is this person logged in?”

Page rules for a `client` user allow dashboard, account, support, onboarding, assessment start, assessment report routes, and selected client-workspace sections (`src/lib/auth/auth.config.ts`). The workspace layout then sends a client who opens another company’s URL back to their own company (`src/app/(dashboard)/clients/[id]/layout.tsx`).

Correct API guards exist and are used on many newer routes:

- `requireClientWorkspaceAccess` and `requireAssessmentAccess` in `src/lib/api/access.ts`
- `requireAdmin` and `requireConsultantOrAdmin` in `src/lib/api/helpers.ts`
- Billing, communications, roadmap, and vCIO write gates in their own modules

### User roles and permissions

The database role enum is `admin`, `technician`, and `client` (`prisma/schema.prisma`). Product language “consultant” maps to `technician`. There is no separate consultant, client-admin, or client-staff role.

| Role | Landing | Typical authority |
| --- | --- | --- |
| `admin` | `/portfolio` | Full staff tools, user administration, billing admin page, assessment library, lead inboxes, archive and permanent delete |
| `technician` | `/dashboard` | Clients, assessments, projects, communications, vCIO operations. Portfolio, user admin, billing admin page, assessment library, and lead inboxes are omitted from the menu |
| `client` | `/dashboard`, then onboarding, vCIO home, or technology profile | Own workspace sections only, when the page and API both enforce it |

vCIO access is a subscription state, not a fourth role (`src/lib/vcio/entitlements.ts`).

### External integrations

| Integration | Role | Code status | Production status |
| --- | --- | --- | --- |
| Stripe Checkout and Billing Portal | Assessment payment, vCIO subscription, invoice payment | IMPLEMENTED | UNVERIFIED |
| Stripe webhooks | Fulfillment and subscription sync | IMPLEMENTED, signature check in code | UNVERIFIED |
| Resend | Transactional email and delivery webhooks | IMPLEMENTED | UNVERIFIED |
| Bobkat website lead API | Contact-form intake | IMPLEMENTED | UNVERIFIED |
| Google Analytics 4 | Public conversion events | IMPLEMENTED, off unless configured | UNVERIFIED |
| Vercel Analytics and Speed Insights | App telemetry | IMPLEMENTED | UNVERIFIED |
| External booking URL | Support page “schedule a review” | IMPLEMENTED if a URL is configured; otherwise the page tells the user to email | UNVERIFIED |
| Cal.com | Older booking variable | DEPRECATED in `.env.example` comments | ABSENT from current email path |

No file-storage vendor (S3 or blob uploads) is used. Documents point at `Document.fileUrl` or are generated as PDFs on request.

### Background jobs and automation

`vercel.json` schedules `GET /api/cron/communications` once a day. The handler is expected to scan quarterly-review reminders and send approved queued email. It requires `CRON_SECRET`. Whether Vercel is invoking it in production is **UNVERIFIED**.

Other automation is request-driven:

- Stripe webhook fulfillment
- Resend webhook delivery tracking
- Assessment completion queues an email and does not send it
- Password reset and assessment invitation are allowed to send immediately

### API surface

About 112 route handlers exist. Groups:

- `/api/auth/*` — NextAuth
- `/api/v1/*` — session JSON API for the product
- `/api/v1/public/*` — activation, password reset, technology snapshot
- `/api/checkout/*` — Stripe session creation
- `/api/webhooks/stripe` and `/api/webhooks/resend`
- `/api/integrations/website-leads`
- `/api/cron/communications`
- `/api/product-overview/pdf` — demo PDF, not a live client

A representative session API covers clients, assessments, responses, completion, PDF export, recommendations, projects, roadmap, TIP, QBR, billing, vCIO, communications admin, users, portfolio, insights, and search.

### Deployment architecture

Intended production shape, from `docs/50-Development/DEPLOY.md`, `.env.example`, and `vercel.json`:

- Application on Vercel
- PostgreSQL on Neon
- Public site name `stackscore.tech`
- Secrets only in the host environment

`docs/60-Operations/DOC-021 – Environment & Deployment Strategy.md` is still marked **Planned** and describes a future preview environment. The application code and deploy guide are ahead of that document. This audit did not confirm that a production deployment is live.

There is no `.github/workflows` CI configuration in the repository. Quality checks are local scripts: `npm run lint`, `npm test`, `npm run build`.

### Major modules and how they interact

```text
Public offer or snapshot or website form
        ↓
Stripe Checkout  or  WebsiteLead / TechnologySnapshotLead
        ↓
Webhook or staff convert
        ↓
Client + User + TechnologyProfile + draft Assessment
        ↓
Customer answers questions
        ↓
completeAssessment → v2 scores, history, profile snapshot, recommendation sync
        ↓
Consultant reviews recommendations
        ↓
Technology Improvement Plan → Roadmap phases → Projects
        ↓
PDFs, portal, quarterly review, next assessment
```

Supporting modules sit beside that spine: communications queue, internal invoices, technology catalog and deployments, lifecycle opportunities, portfolio and commercial insights, and the command palette.

---

## 3. Feature Inventory

Statuses below are for the code path, not for a production smoke test. Anything that depends on Stripe, Resend, or cron is also **UNVERIFIED** in production.

### Acquisition and marketing

| Feature | Purpose | User | Business value | Workflow | Status | Primary files | Dependencies | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home gateway | Send visitors to sign in, buy, or view a demo | Prospect, staff | Short path to purchase | Open `/` | IMPLEMENTED | `src/app/page.tsx` | Auth landing helper | Signed-in users leave the marketing page |
| Assessment offer | Explain and sell the one-time assessment | Prospect | $1,500 offer | Page CTAs call checkout | IMPLEMENTED | `src/components/assessment-offer/`, `src/app/assessment-offer/` | Stripe price ID | Showcase sections use demo data. Dollar amount is hardcoded, not read from Stripe |
| vCIO offer and checkout page | Sell monthly advisory | Prospect or client | Recurring revenue | `/vcio-offer` or `/checkout/strategic-it-consulting` | IMPLEMENTED | `src/lib/vcio/offer-content.ts`, `src/app/api/checkout/vcio/route.ts` | `STRIPE_VCIO_PRICE_ID` | UI says $500/month. Charged amount is the Stripe Price |
| Technology Snapshot | Eight-question public score and lead | Prospect | Low-friction entry | Wizard posts answers, shows a band, staff can invite | IMPLEMENTED | `src/lib/technology-snapshot/`, `src/app/technology-snapshot/` | Database | Does not copy answers into the 80-question assessment |
| Product demo | Show the product without an account | Prospect | Sales conversation | `/demo` | IMPLEMENTED | `src/app/demo/`, `src/lib/product-overview/` | None | Static scenarios, not customer data |
| Service and solution pages | Would describe Bobkat services on this domain | Prospect | — | Redirect to bobkatit.com | ABSENT on this app | `src/app/services/page.tsx`, `src/app/solutions/` | External site | Local solution components exist and are not what those routes render |
| Website lead intake | Capture Bobkat website contact forms | Prospect, then staff | Pipeline | Shared-secret POST, staff inbox, manual convert | IMPLEMENTED | `src/app/api/integrations/website-leads/route.ts`, `src/lib/website-leads/` | `WEBSITE_LEADS_API_SECRET`, Resend | Convert to a client is a staff action. Live intake UNVERIFIED |
| Snapshot lead inbox | Work snapshot submissions | Admin | Follow-up | List, note, convert, send invitation | IMPLEMENTED | `src/app/(dashboard)/snapshot-leads/` | Admin role | Technician menu hides this inbox |
| Prospect outreach | Import and invite prospects | Staff | Campaigns | CSV import, campaign, invitation email | IMPLEMENTED | `src/app/(dashboard)/admin/communications/prospects/` | Communications | Not a public signup form |
| Interactive demo PDF | Sample overview PDF | Sales | Leave-behind | Query params select a demo company | IMPLEMENTED (demo) | `src/app/api/product-overview/pdf/route.ts` | PDF renderer | Not generated from a live client |

### Identity, access, and onboarding

| Feature | Purpose | User | Business value | Workflow | Status | Primary files | Dependencies | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Staff and customer login | Open the app | All roles | Access control | `/login` credentials | IMPLEMENTED | `src/lib/auth/config.ts`, `src/components/auth/login-form.tsx` | `AUTH_SECRET`, seeded or created users | No social login |
| Account activation | Turn a purchase into a password | New client | Self-serve start | Email link, set password, sign in | IMPLEMENTED | `src/lib/auth/activation.ts`, `src/app/activate-account/` | Resend | Delivery UNVERIFIED. Client role only |
| Password reset | Recover access | Any user | Support load | Request link, confirm new password | IMPLEMENTED | `src/lib/auth/password-reset.ts` | Queue with auto-send | Delivery UNVERIFIED |
| Customer onboarding | Confirm company and contact | Client | Clean client record | `/onboarding` then assessment start | IMPLEMENTED | `src/app/onboarding/`, `src/app/api/v1/onboarding/route.ts` | Active client user | Lightweight form, not a guided tour |
| Staff user administration | Create and disable Bobkat users | Admin | Operations | `/admin/users` | IMPLEMENTED | `src/app/api/v1/users/` | Admin role | `PROJECT_STATUS.md` still says this is list-only; the API now supports administration |
| Portal navigation | Show customers their work | Client | Clarity | Sidebar from role | IMPLEMENTED | `src/lib/navigation/sidebar-nav.ts`, `src/lib/client-workspace/nav.ts` | `User.clientId` | Middleware allows a client workspace path before the layout checks ownership |
| Client data isolation | Keep companies apart | All | Trust | Layout plus `requireClientWorkspaceAccess` | PARTIALLY IMPLEMENTED | `src/lib/api/access.ts`, `clients/[id]/layout.tsx` | Consistent use on every API | See critical API list in section 11 |

### Client operations

| Feature | Purpose | User | Business value | Workflow | Status | Primary files | Dependencies | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Client list and create | Open an engagement | Staff | Delivery capacity | `/clients`, `/clients/new` | IMPLEMENTED | `src/app/api/v1/clients/route.ts` | Session | API does not require staff role |
| Client update | Keep company facts current | Staff | Accurate reports | PATCH client | IMPLEMENTED | `src/app/api/v1/clients/[id]/route.ts` | Session | Same isolation gap; any logged-in user can patch |
| Archive, restore, delete | Retire a client | Admin | Data hygiene | Archive routes; delete requires confirmation | IMPLEMENTED | `src/lib/records/` | Admin on delete | Soft lifecycle uses status and archive, not a universal `deletedAt` |
| Business profile | Industry, goals, support model, compliance | Staff edit; client may read | Context for advice | Contacts page hosts the form | IMPLEMENTED | `src/lib/business-profile/` | Staff for writes | Intentionally lightweight. Not a CRM |
| Contacts page | People at the client | Staff | Email recipients | UI is the business profile | PARTIALLY IMPLEMENTED | `src/app/(dashboard)/clients/[id]/contacts/page.tsx`, `src/lib/communications/contacts/` | `ClientContact` API is staff-only | UI comment treats full contacts as later work |
| Client activity timeline | See what happened | Staff | Accountability | Activity page | PARTIALLY IMPLEMENTED | `src/lib/records/activity.ts` | Stub loader plus real timeline query | Clients are redirected away |
| Internal notes | Consultant scratchpad | Staff | Continuity | vCIO planning notes | PARTIALLY IMPLEMENTED | `src/app/api/v1/clients/[id]/vcio/planning-notes/route.ts` | Note model | Creates `visibility: internal` only. No general notes inbox. `client_visible` is unused in writes |
| Customer 360 | One staff view of the account | Staff | Account management | `/clients/[id]/360` | IMPLEMENTED | `src/lib/commercial-intelligence/client-360.ts` | Prisma aggregates | Clients are sent to lifecycle instead |

### Assessment, scoring, and recommendations

| Feature | Purpose | User | Business value | Workflow | Status | Primary files | Dependencies | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| v2 question library | 80 questions, 10 per pillar | Admin maintains; customers answer | Consistent assessment | Seeded from JSON into the database | IMPLEMENTED | `data/v2-question-library.json`, `prisma/seed-v2.ts` | Seed or migration data on the database | Counts are enforced by `EXPECTED_V2_QUESTION_COUNT` |
| Assessment library admin | Edit categories and questions | Admin | Keep the bank current | `/admin/assessment-library` | IMPLEMENTED | `src/app/api/v1/admin/assessment-library/` | Admin | Technician cannot open it |
| Take assessment | Capture answers with live preview | Client or staff | The core service | Wizard saves each answer | IMPLEMENTED | `src/app/(dashboard)/assessments/[id]/`, responses API | Active questions | v2 completion allows fewer than eight pillars |
| Complete assessment | Freeze scores and profile | Client or staff | Deliverable moment | POST complete | IMPLEMENTED | `src/lib/assessments/index.ts`, `complete-v2.ts` | Responses | Email is queued for review |
| v1 scoring | Older seven-category math | Legacy records | History | Used only when `scoringEngineVersion` is `v1` | DEPRECATED | `src/lib/scoring/index.ts` | Old assessments | New assessments are created as v2 |
| v2 scoring | Eight-pillar StackScore | All | The number customers buy | Calculated at preview and completion | IMPLEMENTED | `src/lib/scoring/v2/pillar-score.ts` | Answer text Yes / Partially / No / N/A | Partial pillars change the average. See section 4 |
| Score history and compare | Show movement | Staff and client | Reassessment value | History and compare routes | IMPLEMENTED | `src/lib/assessments/comparison.ts`, `ClientScoreHistory` | Two completed assessments | Comparison is internal, not a peer benchmark |
| Reassessment | Start the next cycle with prior answers | Staff or API caller | Recurring work | Copies responses, forces v2 | IMPLEMENTED | `src/lib/assessments/reassessment.ts` | Source assessment | Not created automatically by the daily cron |
| Recommendation sync | Attach advice to weak answers | Staff, then client | Prioritization | Triggers on completion, deduped per client | PARTIALLY IMPLEMENTED | `src/lib/recommendations/`, `data/RecommendationCatalogV2.json` | Catalog | Every v2 template has `"isStub": true` (80 matches) |
| Recommendation status | Accept, defer, decline, complete | Staff | Pipeline control | PATCH recommendation | IMPLEMENTED | `src/app/api/v1/recommendations/[id]/route.ts` | Status enum | Client-facing edits depend on the page, not a separate role |
| Critical exposure flag | Highlight dangerous answers | Staff and client | Risk conversation | Option flag stored on the assessment | IMPLEMENTED | Answer option `triggersCriticalFlag` | Question content | Does not change the numeric score |
| Technology profile | Current score, trend, next review date | Staff and client | System of record after scoring | Updated on completion | IMPLEMENTED | `src/lib/technology-profile/` | Completed assessment | v2 risk summary zeroes non-critical counts |
| Peer benchmarking | Compare to other companies | — | — | — | ABSENT | — | — | No benchmark, percentile, or industry-norm code |

### Plans, execution, and reviews

| Feature | Purpose | User | Business value | Workflow | Status | Primary files | Dependencies | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Technology Improvement Plan | Turn recommendations into an investment narrative | Staff author; client may view published output | The upsell after the score | Wizard steps: profile, recommendations, playbooks, investment, roadmap, preview | IMPLEMENTED | `src/lib/technology-improvement-plan/` | Completed assessment, recommendations | PDF route is staff-only. Prices inside the plan come from an internal catalog, not from a signed quote |
| Solution playbooks inside TIP | Standard language for common fixes | Staff | Faster writing | Catalog JSON applied during plan build | IMPLEMENTED inside TIP | `data/SolutionPlaybookCatalog.json`, `playbooks.ts` | TIP | Standalone `/playbooks` page is a planned library, not this catalog browser |
| Living roadmap | Phases and initiatives over time | Staff and client | Execution visibility | Materialized from the plan; statuses move planned → approved → in progress → completed | IMPLEMENTED | `src/lib/client-roadmap/` | TIP or manual phase edits | No roadmap PDF |
| Phase proposals | Ask the client to approve a phase | Staff and client | Commercial close | Draft, send, view, approve or reject, PDF | IMPLEMENTED | `src/lib/phase-proposals/` | Roadmap phase | Client access uses workspace guard |
| Projects | Track approved work | Staff and client | Delivery | Statuses from proposed through completed or cancelled | IMPLEMENTED | `src/lib/projects/service.ts` | Often linked to one recommendation | No separate task checklist under a project |
| Project completion report | Close-out narrative | Staff | Proof of work | On-screen report | PARTIALLY IMPLEMENTED | `src/lib/reports/completion/` | Project | Browser print only |
| Quarterly business review | Recurring executive meeting pack | Staff generate; client can export when allowed | Retainer value | Create, generate, PDF | IMPLEMENTED | `src/lib/qbr/`, `src/lib/pdf/qbr-report.tsx` | Client data already in the app | Generation is a staff action. Reminder email is review-gated |
| Quarterly reminders | Nudge staff or clients that a review is due | Staff | Retention | Daily cron creates reminder rows | PARTIALLY IMPLEMENTED | `src/lib/communications/quarterly-review/reminders.ts` | Cron secret | Does not create the next assessment by itself |
| vCIO onboarding and home | Start a subscription relationship | Client and staff | Monthly service | Entitlement, onboarding record, portal | IMPLEMENTED | `src/lib/vcio/` | Subscription | Feature writes lock when entitlement is inactive |
| Technology lifecycle | Renewals, health, replacement opportunities | Staff and client | Budget timing | Deployments feed opportunities | IMPLEMENTED | `src/lib/technology-lifecycle/` | `ClientTechnology` | Empty until technologies are entered |
| Technology catalog | Bobkat standard products | Staff | Consistent recommendations | Browse catalog, assign to a client | IMPLEMENTED | `src/app/(dashboard)/technology-catalog/`, catalog models | Seeded technologies | Assignment UI is staff-oriented |
| Consulting workspace | Cross-client work list | Staff | Daily operations | `/consulting` | IMPLEMENTED | `src/lib/technology-lifecycle/consulting-workspace.ts` | Prisma | — |
| Portfolio | Firm-wide client cards | Admin | Management view | `/portfolio` | IMPLEMENTED | `src/lib/portfolio/` | Admin role | Technicians do not get this menu |
| Business insights | Pipeline and commercial totals | Staff | Management | `/insights` | IMPLEMENTED | `src/lib/commercial-intelligence/insights.ts` | Live aggregates | Not a demo dashboard |
| Command palette | Jump and search | Staff; limited for clients | Speed | Command center modules | IMPLEMENTED | `src/lib/command-center/` | Session | Client search is scoped more tightly than some list APIs |
| Risk register page | Would list risks | Staff | — | Placeholder | PLANNED | `src/app/(dashboard)/clients/[id]/risks/page.tsx` | `loadWorkspaceStubPage` | No Risk model |
| Gap analysis | Would show control gaps | — | — | Mentioned in demo copy | ABSENT | `src/lib/product-overview/demo-dashboard.ts` | — | Not a product screen |
| Task manager | Would assign to-dos | — | — | — | ABSENT | — | — | Work is tracked as projects and recommendations |

### Communications, billing, and support

| Feature | Purpose | User | Business value | Workflow | Status | Primary files | Dependencies | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Email templates and brand | Consistent Bobkat mail | Staff | Trust | Admin template editor, versions, preview | IMPLEMENTED | `src/emails/`, `src/app/(dashboard)/admin/communications/` | Resend for real sends | Preview does not prove delivery |
| Communications queue | Hold sensitive mail for review | Staff | Quality control | Pending review → approved → cron or manual send | IMPLEMENTED | `src/lib/communications/queue/service.ts`, `workflows/registry.ts` | Cron for scheduled send | Assessment complete, roadmap, proposal, project batch, and QBR require review |
| Client communication history | See what was sent | Staff | Audit | Client communications page | IMPLEMENTED | `src/lib/communications/tracking/` | Message records | — |
| Purchase fulfillment email | Activation or “assessment ready” | New or returning buyer | Start the engagement | Sent from the webhook path | IMPLEMENTED | `src/lib/email/purchase-fulfillment.ts` | Resend | UNVERIFIED live |
| vCIO welcome email | Open the subscription | New subscriber | Onboarding | Sent when subscription becomes active | IMPLEMENTED | vCIO fulfillment | Resend | Staff-email collisions skip welcome and flag manual review |
| Support page | Book a review or email Bobkat | Logged-in user | Human follow-up | Booking button or mailto | IMPLEMENTED | `src/app/(dashboard)/support/page.tsx` | Optional booking URL | No in-app scheduling calendar |
| Assessment purchase record | Know who paid | Staff | Revenue trace | Created by fulfillment | IMPLEMENTED | `AssessmentPurchase`, `src/lib/stripe/fulfillment/technology-assessment.ts` | Webhook | Manual-review purchases do not auto-email |
| vCIO subscription | Monthly entitlement | Client | Recurring access | Checkout, webhook, portal | IMPLEMENTED | `src/lib/vcio/entitlements.ts` | Stripe customer | Live lifecycle UNVERIFIED |
| Billing portal | Customer manages the card | Client | Self-serve billing | Stripe Billing Portal session | IMPLEMENTED | `src/app/api/v1/clients/[id]/billing/portal/route.ts` | Stripe customer id | — |
| Internal invoices | Bill work that is not the two Stripe products | Staff | Project billing | Create invoice, PDF, optional Stripe pay link, manual payments | IMPLEMENTED | `src/lib/billing/` | Staff billing rights | Default labor rate is $150/hour in `src/lib/billing/labor-rate.ts` (`DEFAULT_LABOR_RATE_CENTS = 15000`) |
| Recurring services | Track retainers on the ledger | Staff | Besides Stripe vCIO | Recurring service records | IMPLEMENTED | `src/lib/billing/recurring-service.ts` | Billing module | A ledger record is not itself a Stripe subscription |
| Admin billing page | Firm-wide billing view | Admin UI | Finance | `/admin/billing` | IMPLEMENTED | `src/app/(dashboard)/admin/billing/page.tsx` | Admin for the page | `canManageBilling` in code allows technician as well as admin, which is wider than the menu |

---

## 4. Assessment Methodology

### What the customer is measured on

The current assessment uses eight pillars, ten questions each, defined in `data/v2-question-library.json` and `src/lib/technology-maturity/pillars.ts`.

| Pillar | Business question the pillar is trying to answer |
| --- | --- |
| Identity & Access | Can we trust that only the right people have access to systems and data? |
| Endpoint Management | Are company devices secure, standardized, and consistently managed? |
| Network & Connectivity | Is the network secure, reliable, and able to support operations? |
| Data Protection & Recovery | Could the business recover from data loss, ransomware, or a major outage? |
| Productivity & Collaboration | Does technology let people work efficiently and securely? |
| Security Operations | Can the business detect, respond to, and reduce security events? |
| Documentation & Knowledge | Could another trusted technician support this environment tomorrow? |
| Technology Strategy | Is technology helping the business grow while reducing long-term risk? |

An older seven-category model still exists for historical rows: security, backup, infrastructure, endpoint, documentation, business continuity, and strategic. Weights were 20, 20, 15, 15, 10, 10, and 10 (`src/lib/scoring/index.ts`). New assessments set `scoringEngineVersion` to `v2`. v1 remains runnable only for rows still marked v1. Treat v1 as **DEPRECATED**.

### How a question is answered

Each v2 question is stored as response type `maturity` with four choices seeded in `prisma/seed-v2.ts`:

| Answer | Points used by the v2 formula |
| --- | --- |
| Yes | 100 |
| Partially | 50 |
| No | 0 |
| Not Applicable | Excluded from that question’s weight |

The formula reads the answer text in `normalizeAnswerScore` (`src/lib/scoring/v2/types.ts`). It does not use the numeric `scoreEarned` stored on the option. That stored number still matters for the older engine.

Questions carry integer weights, generally used so a more important question moves the pillar more than a minor one. The library is database content after seed, so an admin edit can change later assessments. Completed assessments keep their saved responses and scores.

### How the score is calculated

In plain language:

1. A pillar counts only when every question in that pillar has an answer.
2. Inside a finished pillar, each scored answer is 0, 50, or 100. Not Applicable is left out of both the points and the weight.
3. The pillar percent is the weighted average of those answers.
4. The headline StackScore is the **average of the finished pillars only**, rounded to a whole number (`calculateOverallStackScore` in `src/lib/scoring/v2/pillar-score.ts`).
5. If no pillar is complete, there is no overall score.
6. v2 completion itself requires at least one answer, not all 80 (`src/lib/assessments/complete-v2.ts`).

That last rule is the main scoring caveat. A customer who finishes two strong pillars and stops can receive an overall score that ignores the six untouched areas. The data model knows those pillars are incomplete. The headline average does not punish them.

### Maturity labels

v2 pillar and overall labels use these bands (`src/lib/scoring/v2/maturity-level.ts`):

| Score | Label |
| --- | --- |
| 95–100 | Optimized |
| 85–94 | Mature |
| 70–84 | Managed |
| 55–69 | Developing |
| 40–54 | Basic |
| Below 40 | Initial |

The technology profile maps the same score onto a second, older tier set when it stores `maturityTier`. v1 also had rating words (Exceptional, Strong, Stable, At Risk, Critical) at 90, 80, 70, and 60. Reports can therefore show more than one labeling scheme. The numeric score is the stable fact. The label depends on which helper rendered it.

There is a separate display mapping from legacy categories into a documentation taxonomy (`src/lib/assessment-library/category-mapping.ts`). That mapping does not calculate the v2 StackScore.

### Risk

Some answers are flagged `triggersCriticalFlag`. Completion stores that as critical exposure on the assessment. The flag does not subtract points.

When v2 writes the profile risk summary, it counts those critical flags and sets high, medium, and low to zero (`syncProfileFromAssessmentV2`). A fuller counter exists in `buildRiskSummary` inside `src/lib/technology-profile/index.ts` and is not what the v2 completion path saves. The profile’s risk totals are therefore **PARTIALLY IMPLEMENTED**. The customer-facing risk register page is a stub.

### Recommendations

Recommendations are not inferred by a model at read time. Completion evaluates answer options that point at templates.

- v1 uses `data/RecommendationRuleCatalog.json` and can consolidate overlapping rules.
- v2 uses `data/RecommendationCatalogV2.json`. The file describes itself as stub entries. A search shows 80 `"isStub": true` markers, one per template. Titles are derived from questions. Impact text and `estimatedImpactPoints` are catalog constants, not a calculation from the client’s environment.
- The same template is deduplicated per client (`src/lib/recommendations/dedupe.ts`).
- Projected score improvement adds those catalog point values. It is an illustration, not a measured forecast.

So scores are dynamic. Recommendation wording is static catalog content, and the current v2 catalog is placeholder wording.

### Versioning, history, and reassessment

- Each assessment row stores `v1` or `v2`.
- Completion writes `ClientScoreHistory`, including pillar JSON for v2.
- A later score is marked improving or declining when it moves at least 3 points from the prior snapshot.
- Compare loads two assessments for one client.
- Reassessment copies prior responses onto a new v2 draft so the client edits what changed.
- The profile stores `nextRecommendedAssessmentAt` about twelve months after completion. Nothing in the cron creates that assessment automatically.

### Technology Snapshot versus the paid assessment

The snapshot is a separate product: eight static questions, one per pillar, scored into a 0–24 band and saved on `TechnologySnapshotLead` (`src/lib/technology-snapshot/scoring.ts`). Staff can convert the lead and send an invitation. Continuing into the full assessment creates a draft. It does not translate snapshot answers into the 80 responses.

### What is not in the engine

- No scoring from the technology inventory. Entering “we use Microsoft 365” does not answer assessment questions.
- No industry benchmark.
- No automatic maturity model beyond the bands above.
- Demo financial and dashboard fixtures under `src/lib/demo-data/` and `src/lib/product-overview/` are for marketing screens. The scoring engine does not import them.

---

## 5. User Roles

Three database roles exist. Several commercial names people use in conversation do not.

| Spoken role | Actual role | Exists? |
| --- | --- | --- |
| Bobkat administrator | `admin` | Yes |
| Consultant | `technician` | Yes. Same data access as admin on most delivery APIs, fewer menus |
| Client administrator | — | No. One `client` user per company (`User.clientId` is unique) |
| Client employee | — | No separate role |
| Prospective customer | No login until purchase, invite, or staff conversion | Yes, as a public visitor plus lead records |

### Administrator

**Access.** Email and password at `/login`. Default landing is `/portfolio` (`src/lib/navigation/default-landing.ts`).

**Can see.** Portfolio, dashboard, insights, consulting workspace, all clients, assessments, projects, catalog, settings, vCIO admin, billing admin, users, assessment library, snapshot leads, website leads, and communications.

**Can do.** Create and edit clients, run or complete assessments, build plans and reviews, manage users, archive and permanently delete clients, operate billing, and send communications.

**Restrictions.** Still a Bobkat user. There is no second firm inside the app. Permanent delete is admin-only.

**Primary workflow.** Watch the portfolio, open a client, review a completed assessment, edit recommendations, publish a plan or review, and send the queued email.

### Technician (consultant)

**Access.** Same login. Landing is `/dashboard`.

**Can see.** Dashboard, insights, consulting workspace, clients, assessments, projects, catalog, playbooks, settings, vCIO admin, and communications. The menu hides portfolio, billing admin, users, assessment library, and both lead inboxes.

**Can do.** Most delivery work: clients, assessments, TIP, roadmap, projects, QBR generation, and communications. Billing service checks allow a technician to manage billing even though the billing admin page is admin-only. That is an inconsistency, not a second product.

**Restrictions.** Cannot administer users or open the lead inboxes from the menu. API coverage for every hidden page was not re-tested one by one; hidden navigation is not a security boundary.

**Primary workflow.** Deliver the assessment, write the plan, move projects, and prepare the quarterly conversation.

### Client (customer portal)

**Access.** Created by purchase fulfillment, staff invite, or snapshot conversion. New buyers start inactive, set a password on `/activate-account`, finish `/onboarding`, and land on the draft assessment.

**Can see,** when `clientId` is set and the page allows the section: executive briefing, recommendations, technology lifecycle, vCIO (when entitled), roadmap, business reviews, projects, reports, billing, account, and support. Staff-only sections such as risks, journey, communications history, and customer 360 redirect away.

**Can do.** Answer and complete the assessment, read published recommendations and roadmap state, open allowed PDFs (assessment, QBR, phase proposal, invoice when billing access allows), update account password, and open Stripe’s billing portal when a Stripe customer exists.

**Restrictions.** The page shell sends them back to their own company if they open another client’s workspace URL. Many APIs do not. One portal user represents the whole company. There is no way to invite a second employee with narrower rights.

**Primary workflow.** Buy or accept an invite, activate, confirm the company, answer the assessment, read the report, meet Bobkat, then watch roadmap and reviews.

### Prospective customer

**Access.** No account required for `/`, `/assessment-offer`, `/vcio-offer`, `/checkout/strategic-it-consulting`, `/technology-snapshot`, `/demo`, and `/assessment-invitation`.

**Can do.** Read the offer, start checkout, or submit a snapshot. Website contact forms are on bobkatit.com and arrive as website leads if the integration secret is configured.

**Cannot do.** See another customer’s data. They also cannot finish onboarding until a user row exists.

### Broken or confusing journeys

1. **Portal versus API.** The screen protects company boundaries. Several APIs do not. A customer who only clicks the menu may never notice. The data is still requestable. Details are in section 11.
2. **Partial score looks finished.** The wizard can complete before every pillar is done. The overall number averages whatever finished.
3. **Recommendations sound automatic and are drafts.** The customer can see catalog stubs if those rows are left in a client-visible state.
4. **Two homes.** After login, a client may land on onboarding, the vCIO page, or the technology profile, depending on entitlement and onboarding flags (`src/app/(dashboard)/dashboard/page.tsx`). That is coherent for Bobkat and easy to misread during a sales demo.
5. **“Consultant” is not on the user form.** Staff must know to choose technician.
6. **Services inside this domain leave the app.** A visitor who expects `/solutions` to sell StackScore is sent to the marketing site.
7. **Booking may be unconfigured.** Support explains that online booking is missing and falls back to email (`src/app/(dashboard)/support/page.tsx`).
8. **One login per company.** The buyer’s email becomes the only portal user. A second owner cannot be added as a peer client user because `clientId` is unique.

---

## 6. Customer Journey

| Stage | Workflow in the product? | End to end? | Manual Bobkat work | What the customer experiences | What is missing |
| --- | --- | --- | --- | --- | --- |
| 1. Discover StackScore or Bobkat | Partial | No | Marketing site and conversations live outside this repo | Home, offer, demo, or a redirect to bobkatit.com | This app is not the full Bobkat website |
| 2. Learn about the assessment | Yes | Yes, as a sales page | Keep the page copy aligned with the Stripe price | Assessment offer with a $1,500 label and demo previews | Charged price is **UNVERIFIED** against the label |
| 3. Purchase or request | Yes, two paths | Purchase is coded; request is a lead | Leads need a human. Checkout needs Stripe | Stripe Checkout, or a snapshot / website lead | Snapshot does not take payment |
| 4. Create an account | Yes, after payment or invite | Yes, in code | Manual-review cases when the email belongs to staff or an unsupported account | Activation email, set password | Email delivery **UNVERIFIED** |
| 5. Onboarding | Yes | Yes, short form | None if activation worked | Confirm company and contact | No asset import, no kickoff agenda |
| 6. Provide technology information | Partial | No | Staff enter catalog deployments and business profile depth | Business profile and, later, a technology list if staff filled it | The assessment does not read the inventory. Customers are not guided through a full asset survey |
| 7. Complete the assessment | Yes | Yes | None for a motivated buyer | 80 questions, save as they go | Can be completed with unfinished pillars |
| 8. Calculate scores | Yes | Yes | None | Score and pillar labels after completion; live preview while drafting | Partial average can overstate the company |
| 9. Review risks | Partial | No | Consultant must interpret flags | Critical-exposure indicator. Risk page is not a register | High/medium/low counts are not populated on the v2 profile write |
| 10. Recommendations | Partial | No | Rewrite stubs before the customer relies on them | A list appears from the catalog | v2 catalog is stub language and stub point values |
| 11. Roadmap | Yes, after staff build it | No | Staff generate the improvement plan and phases | Living roadmap once published | Not created as a finished plan at the moment of purchase |
| 12. Executive report | Yes | Yes, after completion | Staff should read it first; the complete email waits for approval | On-screen report and PDF download | PDF quality depends on stub recommendations if those are included |
| 13. Review with a consultant | Partial | No | Schedule and run the meeting | Support page offers a booking link if configured, otherwise email | No in-app meeting, recording, or shared notes marked client-visible |
| 14. Track improvements | Yes | Partial | Staff must update project and recommendation status | Portal shows roadmap, projects, and later score compare | Progress report is on-screen print, not a PDF. Status updates are manual |
| 15. Reassess or continue consulting | Partial | No | Staff start the next assessment or sell vCIO | Next-review date is stored. vCIO checkout exists | Cron does not open the next assessment or charge a reassessment |

### Where the journey breaks

The happy path in code is: offer → Stripe → webhook → client, user, draft assessment → activation → onboarding → answer → complete → PDF. That path is **IMPLEMENTED** and **UNVERIFIED** in production.

It breaks as a customer experience in four places:

- **Before trust:** portal APIs can cross client boundaries.
- **At the deliverable:** recommendations and risk totals are not client-ready without a consultant.
- **After the score:** roadmap, proposal, and review emails wait for a person, which is appropriate, and no meeting is scheduled inside the product.
- **A year later:** the date is stored and the reassessment tool exists, and nobody is automatically enrolled.

Staff-led delivery can bridge the last three. It cannot safely bridge the first if more than one customer exists in the database.

---

## 7. Deliverables Inventory

| Deliverable | Audience | Information | Data source | How it is produced | Export | Status | Primary files | Limitations |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Technology maturity scorecard | Client and consultant | Overall score, pillar scores, maturity label | Assessment responses through the v2 engine | Calculated, then shown on results and profile | Included in the assessment PDF | IMPLEMENTED | `src/lib/scoring/v2/`, results pages | Partial pillars distort the headline |
| Assessment executive report | Client and consultant | Scores, category or pillar breakdown, recommendations, narrative summary | `buildAssessmentReportData` | On-screen plus `@react-pdf` | PDF download from the assessment | IMPLEMENTED | `src/lib/pdf/assessment-report.tsx`, `src/app/api/v1/assessments/[id]/export/pdf/route.ts` | Inherits stub recommendations |
| Technology Improvement Plan | Consultant; client sees published views | Selected recommendations, playbooks, investment, roadmap story | TIP record and recommendation selection | Staff wizard, then PDF | PDF, staff-only route | IMPLEMENTED | `src/lib/pdf/tip-report.tsx`, `src/lib/technology-improvement-plan/` | Not automatic at checkout |
| Phase proposal | Client decision-maker | Scope and commercial ask for one phase | Phase proposal snapshot | Staff prepares; client can open PDF | PDF | IMPLEMENTED | `src/lib/pdf/phase-proposal-report.tsx` | Requires a roadmap phase |
| Quarterly business review | Client executives | Period results, score movement, work done, next focus | QBR record assembled from client data | Staff generate, then PDF | PDF including an executive dashboard layout | IMPLEMENTED | `src/lib/qbr/`, `src/lib/pdf/qbr-report.tsx`, `qbr-executive-dashboard.tsx` | Empty of meaning until an assessment and some history exist |
| Roadmap | Client and consultant | Phases, initiatives, statuses | `ClientRoadmap` | On-screen living plan | No PDF | IMPLEMENTED as a screen | `src/lib/client-roadmap/service.ts` | Export gap |
| Progress report | Staff | Score trend, projects, recommendations | `loadProgressReport` | On-screen | Browser print | PARTIALLY IMPLEMENTED | `src/lib/reports/progress/` | No PDF route |
| Project completion report | Staff | What a project finished | `loadCompletionReport` | On-screen | Browser print | PARTIALLY IMPLEMENTED | `src/lib/reports/completion/` | No PDF route |
| Executive reports hub | Client and staff | Links into the reports above | Current assessment and nav | Page of links | Depends on the child report | IMPLEMENTED as a hub | `src/app/(dashboard)/clients/[id]/executive-reports/page.tsx` | Not a separate document |
| Invoice | Client billing contact | Line items, totals, status | Invoice tables | Staff-built, Stripe optional | PDF | IMPLEMENTED | `src/lib/pdf/invoice-document.tsx` | Not the assessment receipt. Assessment payment is Stripe Checkout |
| Client executive briefing | Client | Current posture and next action | Technology profile and related records | Server-rendered dashboard | Screen | IMPLEMENTED | Customer dashboard components on the technology profile | Quality follows the underlying data |
| Portfolio dashboard | Admin | All clients, scores, attention | Prisma aggregates | Screen | Screen | IMPLEMENTED | `src/lib/portfolio/` | Admin only |
| Customer 360 | Staff | Commercial and delivery snapshot | Aggregates | Screen | Screen | IMPLEMENTED | `src/lib/commercial-intelligence/client-360.ts` | Not a customer deliverable |
| Risk register | Would be executives | — | — | Placeholder page | None | PLANNED | `clients/[id]/risks/page.tsx` | Do not sell this as a register |
| Gap analysis | — | Demo copy only | Demo dashboard | — | None | ABSENT | `src/lib/product-overview/demo-dashboard.ts` | — |
| Product overview sample | Prospects | Fictional company | Demo profile builder | PDF | PDF | IMPLEMENTED as a sample | `src/app/api/product-overview/pdf/route.ts` | Must not be handed over as that prospect’s assessment |
| Technology lifecycle and budget views | Client and staff | Renewals, health, opportunities | `ClientTechnology` and lifecycle service | Screen | Screen | IMPLEMENTED | `src/lib/technology-lifecycle/` | Blank until assets are entered |
| Documents list | Client and staff | Links already stored on the profile | `Document` | List | Depends on `fileUrl` or a PDF route | IMPLEMENTED | `clients/[id]/documents/page.tsx` | No upload warehouse |

---

## 8. Consultant Operations

Bobkat’s daily use of StackScore is a staff workflow. The customer portal is the publishing surface.

### Client management

Staff create a client, which also creates an empty technology profile (`POST /api/v1/clients`). Purchase fulfillment creates the client without that manual step. Staff edit company fields, business profile, archive, and restore. Admins can permanently delete after a confirmation preview.

**Manual:** website leads and snapshot leads become clients only when staff convert them. A purchase with an email collision is flagged `manual_review` and does not send the normal activation email (`src/lib/stripe/fulfillment/technology-assessment.ts`).

### Assessment assignment

There is no marketplace of consultants. `assessorUserId` is the logged-in user who creates or completes the assessment. A purchased assessment is already a draft on the new client. Staff can also create a draft or a reassessment from the client.

The helper `resolveAutoAssessmentParams` (`src/lib/assessments/auto-assessment.ts`) only chooses a name and a type (initial, quarterly, annual, follow-up) from elapsed time. It does not score anything by itself.

### Consultant workflow for a $1,500 engagement

1. Confirm the purchase fulfilled, or create the client by hand.
2. Confirm the customer activated and finished onboarding.
3. Let the customer answer, or sit with them and enter answers.
4. Complete the assessment only after every pillar is actually finished. The software will not enforce that.
5. Read the score, critical flags, and every recommendation. Rewrite stub text before it is treated as advice.
6. Export the assessment PDF.
7. Approve the queued completion email, or send the PDF out of band.
8. Hold the review meeting through the support booking link or by email and phone.
9. If the client wants a plan, build the Technology Improvement Plan, publish the roadmap, and optionally issue a phase proposal.
10. Open projects for approved work and update statuses as work finishes.
11. Schedule the next assessment manually when the stored review date arrives.

### Internal notes

`Note` supports types (general, assessment, recommendation, project, executive, strategy session, system) and visibility (`internal` or `client_visible`). The vCIO planning-notes API writes internal notes only. A general notes module that clients can read was not found. Snapshot-lead notes are a separate staff scratchpad.

### Recommendations, projects, and tasks

Recommendations have a real lifecycle: open, accepted, in progress, completed, deferred, declined, archived.

Projects follow proposed, approved, scheduled, in progress, completed, cancelled, and can sync the linked recommendation when the project completes (`src/lib/projects/service.ts`). Deposit fields can gate progress.

There is no task object. Action items inside a note JSON are not a task system.

### Communications

The communications module is a real staff product: templates, versions, brand settings, campaigns, prospect import, a review queue, delivery events, and a client history page. Daily processing depends on the cron route and `CRON_SECRET`.

**Manual by design:** assessment complete, roadmap published, proposal published, project batch created, and quarterly review (`src/lib/communications/workflows/registry.ts`).

**Coded to send without that review:** project completed, password reset, assessment invitation. Purchase activation and vCIO welcome use their own senders rather than this review registry.

### Follow-up, reviews, and billing

- Quarterly reminder rows are created by the cron scan. Staff still generate the QBR.
- Reassessment is a button or API call, not a subscription renewal of the $1,500 product.
- vCIO entitlements gate writes such as technology changes and plan features (`src/lib/vcio/feature-unlocks.ts`).
- Staff can issue invoices at a default labor rate of $150 per hour, record manual payments, take deposits, and send a Stripe payment link for an invoice.
- Subscription card updates go through Stripe’s portal.

### What stays manual even when the code is finished

Lead conversion, recommendation editing, email approval for the main deliverables, roadmap authorship, meeting scheduling, project status, the next assessment, and any work the technology catalog does not already describe.

---

## 9. Commercial Capabilities

| Capability | Status | Evidence | Operational note |
| --- | --- | --- | --- |
| Public marketing pages for the assessment and vCIO | IMPLEMENTED | `/`, `/assessment-offer`, `/vcio-offer`, `/demo` | Demo sections are illustrative |
| Full Bobkat service catalog on this domain | ABSENT | `/services` and `/solutions` redirect away | Sell those services on bobkatit.com or in a proposal |
| Pricing displayed | IMPLEMENTED as copy | $1,500 on the offer components; $500/month and `VCIO_MONTHLY_AMOUNT_CENTS = 50000` | Checkout amount is the Stripe Price ID |
| Lead capture | IMPLEMENTED | Website-lead API and technology snapshot | Website form itself is not in this app |
| Contact form hosted on StackScore | ABSENT | No public contact POST besides snapshot and the integration | — |
| Assessment purchase | IMPLEMENTED in code, UNVERIFIED live | `src/app/api/checkout/create-session/route.ts`, webhook, `fulfillTechnologyAssessmentPurchase` | Idempotent on Stripe session id |
| Payment processing | IMPLEMENTED in code, UNVERIFIED live | Stripe signature verification via `constructEvent` | Tests under `tests/stripe/` are largely contract tests, not live charges |
| Customer onboarding | IMPLEMENTED | Activation plus `/onboarding` | — |
| Email notifications | PARTIALLY IMPLEMENTED, delivery UNVERIFIED | Purchase and reset can send; major deliverable emails wait | Needs Resend domain and API key |
| Subscription management | IMPLEMENTED in code, UNVERIFIED live | vCIO checkout, subscription sync, billing portal, grace period `VCIO_PAYMENT_GRACE_PERIOD_DAYS` | Failed-payment customer templates are not fully wired as automatic mail |
| Client portal | IMPLEMENTED | Customer sidebar and workspace sections | Isolation gap on some APIs |
| Consultant or MSP licensing | ABSENT | No tenant-of-tenants, no license key, no white-label firm | “License” in the catalog means a client’s software license count |
| Internal invoicing | IMPLEMENTED | Billing module | Separate from the $1,500 Checkout product |
| Analytics on the public funnel | IMPLEMENTED if enabled | `src/lib/analytics/ga4-events.ts` records price 1500 for the assessment event | Measurement ID is optional and was not confirmed live |

Fulfillment behavior that is in code, and still **UNVERIFIED** against a live Stripe account:

- Paid assessment creates a client, an inactive client user, a v2 draft assessment, a purchase row, and an activation token.
- If that email already belongs to an active client user, a new assessment is attached and a “ready” email is used instead of activation.
- If the email belongs to staff, the purchase is stored for manual review and the automatic customer email is skipped.
- vCIO checkout creates or reuses a Stripe customer, syncs the subscription, initializes onboarding, and can send a welcome email unless manual review applies.

---

## 10. Business Value Analysis

### Technology maturity assessment

**Problem.** Owners approve IT spend without a shared picture of backup, access, endpoints, and recovery.

**Who benefits.** The owner gets a baseline. Bobkat gets a repeatable first engagement.

**Why a customer would care.** The score is tied to eighty explicit questions they can defend to a partner or insurer, not to a slide that changes shape every time.

**Measurable value.** A 0–100 score per pillar, a list of critical-answer flags, and a stored baseline for the next year. Point values on recommendations are catalog estimates, so they should not be quoted as guaranteed risk reduction.

**Paid engagement.** This is the $1,500 product, if a consultant reviews the output before it is called final.

### Recommendation list and improvement plan

**Problem.** A score without a sequence becomes a document nobody executes.

**Who benefits.** The owner sees order of operations. Bobkat sees the next project.

**Why a customer would care.** They can accept, defer, or decline items and later see which choices were implemented.

**Measurable value.** Count of open versus completed recommendations, and projects tied to those items. The v2 wording is not yet specific enough to sell as tailored engineering advice without editing.

**Paid engagement.** Natural follow-on after the assessment: plan development and implementation oversight.

### Roadmap, phase proposals, and projects

**Problem.** Advisory work dies in email after the workshop.

**Who benefits.** Both sides can see what was approved and what is in progress.

**Why a customer would care.** A phase proposal PDF is a decision artifact. Project status is the accountability artifact.

**Measurable value.** Phase status, project status, and a later score delta of at least 3 points classified as improving or declining.

**Paid engagement.** Supports project-based work and a reason to stay engaged between assessments.

### Quarterly business review

**Problem.** Retainers feel like “hours” unless the executive conversation has a packet.

**Who benefits.** The owner gets a cadence. Bobkat gets a renewal moment.

**Why a customer would care.** The review is generated from their actual scores, projects, and prior period, not from a blank template.

**Measurable value.** Period-over-period score, completed work, and the next focus list inside the QBR PDF.

**Paid engagement.** This is the delivery vehicle for virtual CIO or a quarterly advisory retainer. It is weak for a brand-new client with one assessment and no completed projects.

### Technology lifecycle

**Problem.** Renewals, warranties, and aging systems surprise the budget.

**Who benefits.** The owner sees dates. Bobkat sees commercial opportunities that are tied to an asset, not a cold pitch.

**Why a customer would care.** Only after someone has entered the stack. An empty lifecycle page does not help.

**Measurable value.** Renewal dates, health, and lifecycle opportunities stored on `ClientTechnology` and `LifecycleOpportunity`.

**Paid engagement.** Fits vCIO and project oversight. It is extra data entry during a one-time assessment unless scoped.

### Portal, billing, and email

**Problem.** Clients lose the report, and Bobkat loses the thread of what was sent.

**Who benefits.** The client has one login. Bobkat has a send history and an invoice PDF.

**Why a customer would care.** They can return without asking for the PDF again, and they can pay an invoice online when staff send a Checkout link.

**Measurable value.** Communication events, invoice balances, subscription status.

**Paid engagement.** Makes the relationship feel like a service. The isolation gap has to be closed before that login is a selling point.

### What not to claim

Do not claim industry benchmarks, automatic dollar ROI, a complete risk register, gap analysis, multi-user client teams, or that another MSP can run StackScore for its own brand. Those are not in the product.

---

## 11. Launch Readiness

Question: could Bobkat sell and deliver a $1,500 technology assessment on this platform?

**Answer:** the delivery spine is built. It is not ready for a customer login while other client records exist, and it is not ready to send unedited v2 recommendations as the finished opinion of Bobkat IT. A staff-delivered assessment, with the customer completing questions and receiving a consultant-approved PDF, is realistic after the isolation fix and a production payment check.

| Area | Judgment | Basis |
| --- | --- | --- |
| Customer onboarding | Ready in code, email UNVERIFIED | Activation, onboarding, draft assessment |
| Assessment completion | Ready with a process rule | 80 questions save and complete; software allows a partial overall score |
| Scoring reliability | Ready for full pillars | Formula is deterministic and tested (`tests/scoring/v2.test.ts`). Partial completion is the reliability risk |
| Reporting | Ready for the assessment PDF | Real PDF path. Recommendation text quality is not |
| Security and access control | Not ready for multiple customers | Page controls exist. Listed APIs do not scope by client |
| Client data isolation | Not ready | Same finding |
| Payment workflow | Code-ready, production UNVERIFIED | Checkout, signature check, idempotent fulfillment |
| Consultant delivery | Ready if review is mandatory | Queue, PDF, plans, projects |
| Customer experience | Usable and easy to misread | Partial scores, stub advice, single login, booking may be email-only |
| Operations | Depends on host configuration | Stripe, Resend, cron, Neon, `AUTH_SECRET`. No CI workflow in the repo |

### Critical blockers

1. **Cross-client API access for any logged-in user, including a customer.** These handlers authenticate and then read or write by id without `requireClientWorkspaceAccess` or a staff check. Confirmed by reading the handlers:
   - `GET` and `POST` `src/app/api/v1/clients/route.ts` — list every client (company, contact, latest score) and create a client.
   - `GET` and `PATCH` `src/app/api/v1/clients/[id]/route.ts` — read a client with assessments, score history, and projects; update company fields and notes. `DELETE` is admin-only.
   - `GET` `src/app/api/v1/clients/[id]/technology-profile/route.ts`
   - `GET` and `POST` `src/app/api/v1/clients/[id]/assessments/route.ts` — list or create assessments, including reassessment copy.
   - `GET` `src/app/api/v1/clients/[id]/assessments/history/route.ts`
   - `GET` `src/app/api/v1/clients/[id]/business-profile/route.ts` — read; patch is staff-only.
   - `GET` `src/app/api/v1/projects/route.ts` — list projects, optional client filter.
   - `GET` `src/app/api/v1/dashboard/summary/route.ts` — firm-wide counts and recent assessments.

   The workspace layout and many newer routes (roadmap, lifecycle, phase proposals, QBR PDF, assessment-by-id access) do enforce ownership. The holes above are enough to expose another customer. This is a delivery and security defect, not a feature request.

2. **Do not issue customer passwords until blocker 1 is fixed** if any other client row exists. Staff can still run assessments under admin and technician accounts.

### Important improvements

- Publish an overall score only when all eight pillars are complete, or label partial results as incomplete on the screen and in the PDF.
- Replace or human-edit v2 recommendation stubs before they are client-visible. Keep completion email on review.
- Populate high, medium, and low risk counts from `buildRiskSummary`, or stop showing those zeroes as if they were measured.
- Confirm Stripe Price IDs equal the advertised $1,500 and $500/month, and run one real webhook in the Stripe test environment before the first charge. This audit did not.
- Confirm Resend can send from the configured from-address, and that the daily cron is installed with `CRON_SECRET`.
- Align technician billing rights with the admin-only billing screen so a consultant is not surprised by an API they cannot see in the menu.
- Add a regression test that a `client` user receives forbidden on the routes in blocker 1. Current auth tests cover activation more than tenant isolation.
- Treat `README.md` and `PROJECT_STATUS.md` as historical so operators do not seed or deploy from the old seven-category description alone.

### Optional enhancements

These are not required to deliver the first consultant-led assessment:

- Roadmap PDF and progress-report PDF, if clients ask for a file the print stylesheet does not satisfy.
- A second portal user per company, if two owners must log in separately.
- In-app scheduling, if the external booking link stays unset.
- Turning the risk page into a view of critical flags that already exist, after the counts are honest.
- CI running `npm test` on push. Absence of GitHub Actions is an engineering gap, not a customer-facing feature.

### Operational dependencies (UNVERIFIED)

Production readiness also depends on facts this repository cannot prove: Vercel environment variables, Neon migrated to the latest migration, Stripe webhook endpoint pointing at `/api/webhooks/stripe`, Resend domain authentication, cron invocation, and a changed seed password if any seed user exists in production. `DEPLOY.md` tells operators to change the seed password before the first production seed. This report does not repeat that password.

---

## 12. Revenue Opportunities

Prices below are the amounts written in the application. They are not evidence of market demand or of closed sales. Delivery complexity assumes the isolation fix is already done.

### A. One-time technology assessment

| | |
| --- | --- |
| Customer problem | No shared baseline of technology risk and maturity |
| Proposed service | Facilitated 80-question assessment, consultant review, PDF, review meeting |
| Platform support | Offer, checkout, onboarding, questionnaire, scoring, PDF, queued completion email |
| Manual work | Price confirmation in Stripe, full-pillar completion, recommendation edit, meeting, email approval |
| Missing capabilities | Enforced complete-pillar score; client-ready recommendation copy; proven live payment |
| Delivery complexity | Low to moderate once isolation and copy review are in place. This is the service the product actually centers on |

### B. Technology roadmap development

| | |
| --- | --- |
| Customer problem | The score does not say what to fund this year |
| Proposed service | Technology Improvement Plan plus a living roadmap and an optional phase proposal |
| Platform support | TIP wizard, playbook catalog, roadmap, proposal PDF |
| Manual work | Select recommendations, write investment narrative, publish, walk the client through it |
| Missing capabilities | Roadmap PDF; stub recommendation text has to be replaced first |
| Delivery complexity | Moderate. The tooling is real and the judgment is still Bobkat’s |

### C. Virtual CIO advisory

| | |
| --- | --- |
| Customer problem | The business has no ongoing technology leadership between projects |
| Proposed service | Monthly StackScore vCIO at the advertised $500 per month, with portal, onboarding, and reviews |
| Platform support | Checkout, subscription entitlement, onboarding, vCIO home, quarterly review, billing portal |
| Manual work | The advisory itself, QBR generation, lifecycle data entry, welcome-email exceptions |
| Missing capabilities | Some subscription dunning emails are not fully automatic; isolation must be fixed before portal access |
| Delivery complexity | Moderate to high. The software supports the relationship. The value is still consultant time |

### D. Quarterly technology reviews

| | |
| --- | --- |
| Customer problem | Leadership does not revisit technology until something fails |
| Proposed service | Quarterly business review using the QBR PDF |
| Platform support | QBR generate and PDF, reminder scan, score history |
| Manual work | Generate the review, approve the email, hold the meeting |
| Missing capabilities | Thin content when there is only one assessment and no finished projects |
| Delivery complexity | Low as an add-on to vCIO or an annual plan. Weak as a standalone sale to a brand-new client |

### E. Project planning and implementation oversight

| | |
| --- | --- |
| Customer problem | Approved work has no owner, status, or close-out |
| Proposed service | Projects linked to recommendations, status updates, completion narrative, invoices |
| Platform support | Project lifecycle, completion screen, invoice PDF, Stripe pay link, $150/hour default labor rate |
| Manual work | Creating projects, updating status, writing the completion story, issuing invoices |
| Missing capabilities | Task checklists; completion output is print, not PDF |
| Delivery complexity | Moderate. Fits Bobkat implementation work. It is oversight tracking, not a project-management suite |

### F. Recurring maturity assessments

| | |
| --- | --- |
| Customer problem | The baseline goes stale |
| Proposed service | Annual or quarterly reassessment with side-by-side comparison |
| Platform support | Reassessment copy, history, compare, trend threshold of 3 points, next-review date |
| Manual work | Start the assessment, facilitate answers, review again. No automatic charge for a second $1,500 assessment was found |
| Missing capabilities | Peer benchmark; automatic enrollment |
| Delivery complexity | Low technically, because the engine is the same. Commercially it is a second sale |

### G. Licensing StackScore to other providers

| | |
| --- | --- |
| Customer problem | Another firm might want this workflow |
| Proposed service | Not supported |
| Platform support | ABSENT. One operator, three roles, Client as the only tenant |
| Manual work | Would be a different product |
| Missing capabilities | Firm tenancy, white label, per-firm billing, per-firm question banks, isolation model redesigned |
| Delivery complexity | High, and it conflicts with the current architecture. Do not offer this |

---

## 13. Critical Gaps

| Gap | Why it matters | Status |
| --- | --- | --- |
| Client APIs listed in section 11 lack ownership checks | A paying customer’s login can read and, on some routes, modify another company’s data | PARTIALLY IMPLEMENTED security control |
| v2 recommendations are stubs | The automatic advice in a $1,500 deliverable is placeholder language | PARTIALLY IMPLEMENTED |
| Overall score averages only complete pillars | A partial submission can be presented as the company score | IMPLEMENTED behavior with a delivery risk |
| v2 risk summary stores only critical flags | High, medium, and low look measured and are written as zero | PARTIALLY IMPLEMENTED |
| Risk register, gap analysis, task system, MSP licensing | Easy to assume from the consulting story; not in the product | PLANNED or ABSENT |
| Production Stripe, email, and cron | The code path is not proof of the live service | UNVERIFIED |
| Single portal user per client | Two leaders cannot both have logins | IMPLEMENTED constraint |
| Stale README and project status | An operator can believe the product is still the 50-question internal tool, or the reverse, miss the isolation bug because a status doc says MVP | Documentation drift |
| No CI workflow | Regressions depend on someone running tests locally | ABSENT |
| Meeting notes are internal-only | The review meeting is not captured for the client inside the app | PARTIALLY IMPLEMENTED |

---

## 14. Recommended Next Actions

These actions address delivery and security. They are not a roadmap of new products.

1. **Close the tenant gap before any customer password is issued.** Every handler that accepts a `clientId` or returns client data should use `requireClientWorkspaceAccess` or an explicit staff-only guard. Add a test that a `client` session is forbidden on the routes named in section 11.
2. **Verify the money path outside the editor.** In Stripe test mode, confirm the assessment price is $1,500, the webhook creates one client and one draft assessment, and the activation email arrives. Repeat once for the vCIO price. Record the result in an operations note. Do not change product code to “fix” a price that lives in Stripe unless the Price ID itself is wrong.
3. **Make the assessment deliverable honest.** Block or clearly label partial overall scores. Review `data/RecommendationCatalogV2.json` and either replace stub copy or hide stub rows from the client until a consultant edits them. Keep `assessment_complete` on manual send until that review is done.
4. **Run the first engagement on a written checklist** using section 8. The checklist is the productized service. New screens are optional.
5. **Leave the following unbuilt until a paying engagement has been delivered twice:** MSP licensing, benchmarking, CRM, task manager, risk-register module, gap analysis, a second marketing site, and automatic result emails.

After those five, the optional PDF and second-user items in section 11 are reasonable. They are not what stands between Bobkat and a first, consultant-led assessment.

---

## 15. Appendix: Source File References

### Product definition and drift

- `docs/00-Governance/DOC-006 – StackScore Product Constitution.md` — product intent. Behavior in this report was checked against code when documents disagree.
- `docs/50-Development/PROJECT_STATUS.md` — June 2026 status. Stale relative to migrations, v2 scoring, Stripe, and communications.
- `README.md` — still describes seven categories and fifty questions as the current seed story.
- `docs/50-Development/DEPLOY.md` — pilot deploy steps for Vercel and Postgres.
- `docs/60-Operations/DOC-021 – Environment & Deployment Strategy.md` — marked planned; preview environment is not what the app currently automates.
- `vercel.json` — daily communications cron.
- `package.json` — stack and scripts.
- `.env.example` — variable names only. Values in that file are placeholders and must not be copied into production notes from this audit.

### Tenancy, auth, and navigation

- `prisma/schema.prisma` — `UserRole`, `Client`, commercial and assessment models.
- `src/middleware.ts` — page middleware; `/api` excluded.
- `src/lib/auth/auth.config.ts` — public pages and client path allowlist.
- `src/lib/auth/config.ts` — credentials and JWT callbacks.
- `src/lib/auth/activation.ts`, `src/lib/auth/password-reset.ts`
- `src/lib/api/helpers.ts`, `src/lib/api/access.ts`
- `src/lib/navigation/sidebar-nav.ts`, `src/lib/navigation/portal-mode.ts`, `src/lib/client-workspace/nav.ts`
- `src/app/(dashboard)/clients/[id]/layout.tsx` — page-level client redirect.

### Assessment and advice

- `data/v2-question-library.json` — eight pillars, ten questions each.
- `data/RecommendationCatalogV2.json` — stub v2 templates.
- `data/RecommendationRuleCatalog.json` — v1 rules.
- `prisma/seed-v2.ts` — library load and standard answers.
- `src/lib/scoring/v2/pillar-score.ts`, `src/lib/scoring/v2/types.ts`, `src/lib/scoring/v2/maturity-level.ts`
- `src/lib/scoring/index.ts` — v1 weights and ratings.
- `src/lib/assessments/index.ts`, `src/lib/assessments/complete-v2.ts`, `src/lib/assessments/reassessment.ts`, `src/lib/assessments/comparison.ts`, `src/lib/assessments/auto-assessment.ts`
- `src/lib/recommendations/` — trigger, sync, and dedupe.
- `src/lib/technology-profile/index.ts` — profile read and `buildRiskSummary`.
- `src/lib/technology-snapshot/` — separate eight-question lead funnel.
- `tests/scoring/v2.test.ts`, `tests/scoring/index.test.ts`

### Commerce and communications

- `src/lib/stripe/products.ts` — product type strings, not dollar amounts.
- `src/lib/stripe/fulfillment/technology-assessment.ts`
- `src/app/api/checkout/create-session/route.ts`, `src/app/api/checkout/vcio/route.ts`
- `src/app/api/webhooks/stripe/route.ts`
- `src/lib/vcio/constants.ts`, `src/lib/vcio/entitlements.ts`, `src/lib/vcio/feature-unlocks.ts`
- `src/lib/email/purchase-fulfillment.ts`, `src/lib/email/send.ts`, `src/emails/`
- `src/lib/communications/workflows/registry.ts`
- `src/app/api/cron/communications/route.ts`
- `src/app/api/integrations/website-leads/route.ts`
- `src/lib/billing/labor-rate.ts`, `src/lib/billing/invoice-service.ts`
- `tests/stripe/` — route and fulfillment contract tests.

### Deliverables and delivery workspace

- `src/lib/pdf/generate.tsx` — assessment, TIP, QBR, phase proposal, product-overview PDF entry points.
- `src/lib/pdf/invoice-document.tsx`
- `src/lib/technology-improvement-plan/`
- `src/lib/client-roadmap/service.ts`, `src/lib/client-roadmap/permissions.ts`
- `src/lib/phase-proposals/service.ts`
- `src/lib/qbr/service.ts`
- `src/lib/projects/service.ts`
- `src/lib/reports/progress/`, `src/lib/reports/completion/`
- `src/lib/technology-lifecycle/service.ts`
- `src/lib/portfolio/`, `src/lib/commercial-intelligence/insights.ts`
- `src/lib/client-workspace/stub-page.ts` — risks page and similar placeholders.
- `src/app/(dashboard)/support/page.tsx`

### API isolation examples (positive and negative)

Enforced examples: `src/app/api/v1/clients/[id]/roadmap/route.ts`, `src/app/api/v1/clients/[id]/lifecycle/route.ts`, `src/app/api/v1/clients/[id]/qbr/[qbrId]/pdf/route.ts`, `requireAssessmentAccess` used by assessment item routes.

Unscoped examples: `src/app/api/v1/clients/route.ts`, `src/app/api/v1/clients/[id]/route.ts`, `src/app/api/v1/clients/[id]/technology-profile/route.ts`, `src/app/api/v1/clients/[id]/assessments/route.ts`, `src/app/api/v1/clients/[id]/assessments/history/route.ts`, `src/app/api/v1/clients/[id]/business-profile/route.ts` (GET), `src/app/api/v1/projects/route.ts`, `src/app/api/v1/dashboard/summary/route.ts`.

---

*End of audit. No application code, configuration, dependency, or database file was changed to produce this document.*
