# SS-UX-015 — Project Updates & Customer Communications

**Branch:** `staging`  
**Date:** 2026-10-30  
**Database:** Staging Neon (`ep-patient-credit-atddo1zm`) — migrate `20261030120000_project_customer_updates` applied; production untouched.  
**Constraints honored:** No production deploy; no new email provider; no duplicate Communications module; no automatic customer emails; no customer write permissions; no assessment scoring or recommendation catalog changes; no unrelated admin/public redesign.

Precedents: [SS-UX-013](./SS-UX-013-PROJECT-TASKS-MILESTONES.md), [SS-UX-014](./SS-UX-014-CUSTOMER-PROJECT-EXPERIENCE.md).

---

## 1. Existing Communications services reused

| Capability | Reused service / artifact |
| --- | --- |
| Template registry | `EMAIL-011` in `src/lib/communications/registry.ts` (`WorkflowNotificationEmail`) |
| Automation catalog | `PROJECT_CUSTOMER_UPDATE` in `automation-registry.ts` — **`manual_only`** |
| Recipient resolution | `resolveRecipients({ audience: "projects" })` — client-owned addresses only |
| Render / brand | Template `render()` + `getCommunicationBrandSettings()` |
| Send + history | `recordAndSendCommunication` → `CommunicationMessage` / queue |
| Activity timeline | `recordOrganizationActivity` (`CLIENT_VISIBLE`) |
| Protected deep link | `buildProtectedAppUrl` → customer project workspace |
| Test send | `sendType: "TEST"` / `isTest: true` skips portal publish |

**Not introduced:** new mail provider, independent template engine, or parallel delivery-history store.

**Unchanged automations (documented; not modified):**

| Event | Template | Behavior |
| --- | --- | --- |
| `PROJECTS_SHARED` | `EMAIL-007` | Existing share workflow — left enabled as previously verified |
| `PROJECT_COMPLETED` | `EMAIL-008` | Existing completion workflow — left enabled as previously verified |

Manual daily project updates **do not** fire these triggers. Task/milestone completion still does **not** send email.

---

## 2. Project activity changes

### Customer-visible event types (portal filter)

- `project_task_completed`
- `project_milestone_completed`
- `project_status_changed` — recorded on staff project status change (`src/lib/projects/service.ts`)
- `project_customer_update_published` — recorded on successful non-test send
- Existing: `project_started`, `project_completed`, `projects_shared`

### Scope rules

- Events scoped by `clientId` + `sourceRecordType: Project` / `sourceRecordId: projectId`
- Staff-only notes / internal ops never use `CLIENT_VISIBLE` for this workflow
- Draft builder reads **task/milestone completion timestamps** and status events **since last published update** — not every field edit

---

## 3. Draft generation and editing workflow

### Staff entry point

`ProjectCustomerUpdatePanel` inside `ProjectDeliveryPanel` — **Prepare Customer Update**.

### Service flow

1. `prepareProjectCustomerUpdate` — builds draft from real tasks/milestones/status events since last `sent` + `publishedAt`
2. Staff edits via PATCH (`staffMessage`, section toggles, include/exclude item ids)
3. Empty completed work → clear empty copy (“No completed work since the last published update”) — **no invented activity**

### Draft sections

| Section | Source |
| --- | --- |
| Project status | Name, status label, task-based progress (`null` when zero tasks) |
| Work completed | Completions + status changes after watermark |
| In progress | `in_progress` tasks |
| Coming next | `not_started` tasks + next open milestone |
| Additional message | Optional staff free text |

Pure builders: `src/lib/projects/customer-update-draft.ts`.

---

## 4. Email preview implementation

- `POST /api/v1/projects/[id]/customer-updates/[updateId]/preview`
- Renders **EMAIL-011** with the same payload used for send
- Returns subject, previewText, html, text, resolved recipients, emptyActivity flag
- Preview UI embeds rendered HTML in the staff panel
- Content excludes internal notes, costs, credentials, assessment answers, unpublished recommendations

CTA: authenticated StackScore project workspace link.

---

## 5. Manual send implementation

| Control | Detail |
| --- | --- |
| Auth | Consultant/Admin only (`requireConsultantOrAdmin`) |
| Confirm | Body requires `confirm: true` |
| Recipients | Resolved server-side from client ownership; no arbitrary addresses |
| Idempotency | `project-customer-update:{updateId}` (skipped for test sends) |
| Duplicate guard | Already-`sent` updates rejected |
| Failure | Status → `failed` + `failureReason`; no automatic retry |
| Test send | `isTest: true` — TEST send type; **does not** set `publishedAt` or publish activity |

Routes under `src/app/api/v1/projects/[id]/customer-updates/`.

---

## 6. Delivery history integration

### Model `ProjectCustomerUpdate`

Statuses: `draft` → `sending` → `sent` | `failed` | `cancelled`

Immutable snapshot on send: `snapshotJson` holds customerFacing sections, rendered subject/html/text, recipients, and approved draft.

Linked to `CommunicationMessage` for centralized history (recipient, subject, sent/delivered/failed timestamps). Staff panel lists project-scoped updates with delivery status. Provider acceptance ≠ confirmed inbox delivery (`deliveredConfirmed: false` unless provider events set `deliveredAt`).

---

## 7. Customer update visibility

- `listPublishedCustomerProjectUpdates` — `status: sent` + `publishedAt` only
- Assembled in `getCustomerProjectDetail` → `publishedUpdates` on DTO
- Customer UI: **Updates** section (`PublishedUpdatesFeed`) — date, status/progress, work completed, in progress, coming next / next milestone, staff message
- Customers remain read-only; drafts/failed/recipient metadata/errors never exposed

---

## 8. Security controls

- Tenant scope on all queries (`projectId` + `clientId`)
- Staff mutations only via consultant/admin session
- Recipients from `resolveRecipients` only
- Internal notes never selected into draft context
- Test sends cannot publish portal content
- Staging-only migrate; production not deployed

---

## 9. Automated test results

```
npm test -- tests/ux/ss-ux-015-project-communications.test.ts \
  tests/ux/ss-ux-014-customer-project-experience.test.ts \
  tests/ux/ss-ux-013-project-tasks-milestones.test.ts
```

**Result (2026-10-30):** 3 files, **38 passed** (15 new SS-UX-015 cases).

Coverage includes: activity allow-list / internal exclusion, since-watermark selection, empty activity, draft edits, customer published DTO, EMAIL-011 manual_only, PROJECTS_SHARED / PROJECT_COMPLETED preservation, Communications reuse, staff + customer UI wiring.

---

## 10. Browser validation results

Staging localhost (`npm run dev` against staging Neon), staff session as BobKat Admin.

| Step | Result |
| --- | --- |
| Staging migrate applied | Pass — `20261030120000_project_customer_updates` |
| Customer project detail loads after Prisma regenerate/restart | Pass |
| Staff **Prepare Customer Update** on Project Register sheet | Pass — draft from real completions (2 tasks + 1 milestone) + upcoming items |
| Internal notes excluded from draft | Pass — staff-only note visible only in delivery checklist, not draft items/preview |
| **Preview Email** | Pass — EMAIL-011 subject/body; recipient `pinnacle.engineering.demo@bobkatit.com` |
| **Send Test** (`isTest`) | Pass — history shows `provider SENT · TEST`; no customer portal publish |
| Customer **Updates** section after test send | Pass — section absent (test does not set `publishedAt`) |
| Live **Send Customer Update** to real customer | Not executed (staging policy — test path only) |
| Existing Communications module | Unchanged; send reused `recordAndSendCommunication` |

---

## 11. Known limitations

- No scheduled / automatic daily digest (by design)
- No automatic retry of failed sends
- Provider “accepted” is not treated as inbox delivered
- `PROJECTS_SHARED` / `PROJECT_COMPLETED` left as-is; any enable/disable still needs explicit approval
- Multi-recipient projects: primary resolved recipient is used for send (same pattern as other project workflows)
- Schema change is staging-only until production migrate is separately approved
