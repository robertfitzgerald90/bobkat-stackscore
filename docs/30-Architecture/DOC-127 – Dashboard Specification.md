# DOC-127 – Dashboard Specification

**Document ID:** DOC-127
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# 1. Purpose

DOC-127 defines the dashboard architecture, layouts, widgets, KPIs, quick actions, and user experience standards for StackScore.

The goal is to provide every user with a dashboard tailored to their role, responsibilities, and business objectives.

DOC-127 is a **dashboard architecture specification only**. It does not define UI code, components, or application logic.

Data is supplied by the **Dashboard Service** per [DOC-124 – Service Layer Specification](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md). Visibility is enforced per [DOC-122 – Roles & Permissions Specification](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md). Visual standards align with [DOC-005 – UI & UX Standards](DOC-005%20%E2%80%93%20UI%20&%20UX%20Standards.md).

---

# 2. Dashboard Philosophy

* Every dashboard answers the **most important questions** for that user.
* Dashboards prioritize **actionable information** over raw data.
* **Business outcomes** are emphasized over technical metrics.
* Every dashboard supports **quick navigation** into detailed workflows.
* Widgets **update automatically** as the Technology Profile and related records change.

A dashboard is an **action page**, not a passive reporting page. The **Today's Focus** card (Section 4) is the primary expression of this philosophy.

---

# 3. Dashboard Design Principles

1. **Role-first** — default layout matches DOC-122 role capabilities.
2. **Focus before breadth** — Today's Focus appears above the fold on every dashboard.
3. **Profile-centric** — client and portfolio views anchor on Technology Profile health.
4. **One click to work** — widgets and quick actions deep-link to workflow entry points (DOC-123).
5. **Progressive disclosure** — summary on dashboard; detail in hub pages.
6. **Live data** — widgets refresh on domain events (`TechnologyProfileUpdated`, `ProjectCompleted`, etc.).
7. **No permission leakage** — financial and internal widgets hidden by role without exception.
8. **Consistent components** — shared widget library (Section 11) across roles.
9. **Mobile-capable** — layouts degrade gracefully on small screens (Section 16).

---

# 4. Global Dashboard Components

Components available across one or more role dashboards:

| Component | Description | Typical roles |
| --------- | ----------- | ------------- |
| **Today's Focus** | Prioritized action list for the current user/day — **required on every dashboard** |
| Technology Profile Score | Overall StackScore and maturity for scoped clients |
| StackScore Trend | Sparkline or mini-chart of profile movement |
| Client Count | Active clients in scope |
| Active Projects | In-flight projects count and status breakdown |
| Pending Recommendations | Open high/critical recommendations |
| Upcoming Quarterly Reviews | Reviews due in next 7/30 days |
| Managed Technology Program Status | Enrolled clients and review cadence |
| Technology Journey | Compact journey graphic (current → completed → projected) |
| Recent Activity | Audit-filtered activity feed for scoped work |
| Notifications | Unread notification bell and preview |
| Calendar | Meetings, reviews, project milestones |
| Search | Global client and record search |
| Global Navigation | Primary app navigation shell |

### Today's Focus

The **Today's Focus** card transforms the dashboard from reporting into action. It appears **first** (top-left on desktop, top of stack on mobile) on every role dashboard.

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Surface the highest-priority actions the user should take now |
| **Data source** | Dashboard Service — aggregates tasks, approvals, due dates, and profile events |
| **Max items** | 5–7 items; ordered by priority and due date |
| **Item anatomy** | Action label, client name (if applicable), due indicator, deep-link CTA |
| **Refresh** | On login, on domain events, and at configurable interval (e.g. 5 min) |
| **Empty state** | "You're caught up" with link to browse clients or calendar |

**Today's Focus turns the dashboard into an action page** — users should complete work from this card without hunting through menus.

---

# 5. Super Admin Dashboard

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Platform-wide health, tenant governance, and cross-organization oversight |
| **Target audience** | Super Admin |
| **Default layout** | Today's Focus → platform KPIs (row) → pipeline & growth (row) → audit & config (row) → activity feed |
| **KPIs** | Active tenants, total users, platform uptime, MRR/revenue (if enabled), audit alert count |
| **Widgets** | Platform Health, User Management summary, Revenue Metrics, Proposal Pipeline, Profitability Overview, Client Growth, Audit Alerts, System Configuration shortcuts |
| **Quick actions** | Manage tenants, create organization, view audit log, system settings |
| **Notifications** | Security alerts, failed integrations, license/capacity warnings |
| **Recent activity** | Cross-tenant admin actions (filtered) |
| **Visibility rules** | Unrestricted platform scope; financial widgets platform-aggregated |

**Today's Focus examples:**

* Review audit alert — failed login spike on tenant X
* Approve new organization provisioning request
* Review platform integration sync failure

---

# 6. Admin Dashboard

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Operational command center for BobKat IT organization — clients, pipeline, revenue, delivery |
| **Target audience** | Admin |
| **Default layout** | Today's Focus → KPI row → TIP/roadmap/projects (2-col) → reviews & revenue → activity |
| **KPIs** | Active clients, open projects, TIPs awaiting approval, QBRs due this week, portfolio StackScore trend, revenue snapshot |
| **Widgets** | Active Clients, Technology Profile Overview (portfolio), Pending TIPs, Roadmap Progress, Open Projects, Completion Reports pending, Upcoming Reviews, Revenue Snapshot, Managed Program Status |
| **Quick actions** | New client, approve TIP, view at-risk clients, export admin operations report, manage catalog |
| **Notifications** | TIP approvals, warranty expirations, overdue reassessments, proposal health warnings |
| **Recent activity** | Client created, assessment completed, project closed, TIP approved |
| **Visibility rules** | Full org client access; all financial widgets; no cross-tenant (single tenant MVP) |

**Today's Focus examples:**

* 2 Technology Improvement Plans awaiting approval
* 3 Quarterly Reviews due this week
* 1 Completion Report pending delivery

---

# 7. Consultant Dashboard

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Daily engagement hub — assessments, planning, client delivery, and follow-ups |
| **Target audience** | Consultant |
| **Default layout** | Today's Focus → assigned clients snapshot → assessments/TIPs (2-col) → recommendations & calendar → activity |
| **KPIs** | Assigned clients, draft assessments, TIPs in progress, open recommendations (high+), meetings this week |
| **Widgets** | Assigned Clients, Pending Assessments, Technology Improvement Plans, Roadmaps, Recommendations, Upcoming Meetings, Recently Completed Projects, Technology Journey (per top client) |
| **Quick actions** | Start assessment, create TIP, open client hub, schedule QBR, present roadmap |
| **Notifications** | Client approval received, reassessment due, meeting reminders, recommendation escalations |
| **Recent activity** | Assessments completed, TIPs presented, projects approved on assigned clients |
| **Visibility rules** | All org clients in MVP; future: assigned portfolio only; pricing widgets only with delegation |

**Today's Focus examples:**

* Complete ABC Manufacturing assessment
* Review XYZ Roadmap
* Present TIP to Client

---

# 8. Technician Dashboard

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Field execution — today's work, tasks, and project context only |
| **Target audience** | Technician |
| **Default layout** | Today's Focus → today's tasks → assigned projects → schedule → notes/attachments → activity |
| **KPIs** | Tasks due today, tasks overdue, assigned projects in progress, completions this week |
| **Widgets** | Assigned Projects, Today's Tasks, Upcoming Schedule, Completion Checklists, Project Notes, Attachments, Photos, Recent Activity (assigned scope) |
| **Quick actions** | Open next task, mark task complete, upload photo, add task note, view site contact |
| **Notifications** | Project approval (work authorized), schedule change, task assignment |
| **Recent activity** | Task completions and uploads on assigned projects |
| **Visibility rules** | **Assigned projects/tasks only**; no portfolio-wide client list in future assignment model |

**Technicians shall not see:**

* Pricing, margins, profitability
* Solution Playbooks
* Internal scoring configuration
* TIP, roadmap, or recommendation engines
* Technology Profile scores (portfolio level)

**Today's Focus examples:**

* Install firewall at Client A
* Validate backup configuration
* Complete project documentation

---

# 9. Client Dashboard

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Client portal home — technology posture, journey, approved plans, and documents |
| **Target audience** | Client User |
| **Default layout** | Today's Focus → Technology Profile hero → journey & roadmap (2-col) → projects & impact → documents |
| **KPIs** | Current StackScore, maturity tier, trend direction, active approved projects, last QBR date |
| **Widgets** | Current Technology Profile, Technology Journey, Active Roadmap, Completed Projects, Technology Improvement Plan (approved), Business Impact Summaries, Quarterly Reviews, Documents, Support Requests (future) |
| **Quick actions** | Review TIP, approve project, download completion report, view roadmap, contact consultant |
| **Notifications** | TIP ready for review, QBR available, project status change, profile updated after reassessment |
| **Recent activity** | Project milestones, delivered reports, profile improvements (client-safe narrative) |
| **Visibility rules** | **Single linked client only**; client-visible fields per DOC-122 and DOC-125 |

**Clients shall not see:**

* Internal pricing calculations, margins, labor rates
* Solution Playbooks
* Internal notes and assessor evidence
* Administrative settings and catalog administration

**Today's Focus examples:**

* Review newly generated Technology Improvement Plan
* Quarterly Business Review available
* Technology Profile increased by 7 points

---

# 10. Read Only Dashboard

| Attribute | Specification |
| --------- | ------------- |
| **Purpose** | Executive visibility without mutation — trends, QBRs, and portfolio health |
| **Target audience** | Read Only User |
| **Default layout** | Today's Focus (informational) → portfolio KPIs → trends → QBR/completion highlights → activity |
| **KPIs** | Portfolio StackScore trend, clients improving vs declining, open critical risks (count), completions this quarter |
| **Widgets** | Technology Profile Overview (read), StackScore Trend, Historical Trend, Completion Reports, QBR summaries, Technology Journey (aggregate), Activity Feed (read-only) |
| **Quick actions** | Export trend report, open QBR PDF, drill to client profile (view only) — **no create/edit** |
| **Notifications** | Informational only — QBR published, major profile change (optional subscription) |
| **Recent activity** | Completed assessments, delivered reports, profile snapshots |
| **Visibility rules** | Read per DOC-122 matrix; no financial internals unless explicitly granted; scope may be client subset |

**Today's Focus examples:**

* QBR report ready for Executive Staff meeting
* Portfolio StackScore improved 4 points this quarter
* 3 clients due for reassessment (informational)

---

# 11. Widget Library

Reusable widgets consumed by role dashboards. Each widget: **data source**, **refresh trigger**, **deep link**, **role availability**.

| Widget | Description | Data source | Roles |
| ------ | ----------- | ----------- | ----- |
| **Today's Focus** | Prioritized action list | Dashboard Service (aggregated tasks) | All |
| **Technology Profile Gauge** | StackScore dial + maturity tier | Technology Profile Service | Admin, Consultant, Client, Read Only |
| **StackScore Trend** | Line/sparkline over snapshots | Technology Profile Service | Admin, Consultant, Client, Read Only |
| **Technology Journey Progress** | Compact journey stages | Profile + Roadmap + Projects | Admin, Consultant, Client, Read Only |
| **Active Projects** | Status chips and counts | Project Service | Admin, Consultant, Technician, Client (approved) |
| **Recommendations** | Priority-sorted open items | Recommendation Service | Admin, Consultant — not Technician/Client |
| **Upcoming Reviews** | QBR and managed program due dates | Managed Technology Program Service | Admin, Consultant, Client |
| **Business Impact Cards** | Score delta, risks reduced | Snapshots + Projects | Admin, Consultant, Client, Read Only |
| **Roadmap Timeline** | Phase bar with initiatives | Roadmap Service | Admin, Consultant, Client, Read Only |
| **KPI Cards** | Single metric + trend arrow | Dashboard Service | All (metric varies by role) |
| **Charts** | Category radar, portfolio distribution | Technology Profile Service | Admin, Consultant, Read Only |
| **Activity Feed** | Recent scoped events | Audit Service (filtered) | All (scope varies) |
| **Calendar** | Reviews, meetings, milestones | Notification + Project Services | Admin, Consultant, Technician |
| **Tasks** | Task list with status | Project Task Service | Technician, Consultant |
| **Notifications** | Bell + preview list | Notification Service | All |

Widgets **must not** render fields the role cannot access — redaction at service layer, not UI-only hiding.

---

# 12. KPI Standards

| Rule | Specification |
| ---- | ------------- |
| **Business framing** | KPI labels use business language ("Clients Improving", not "avg_score_delta") |
| **Trend context** | Show direction (↑↓→) and comparison period (30d, quarter) |
| **Thresholds** | Critical/warning/info bands for at-risk clients and overdue items |
| **No false precision** | StackScore integers or one decimal; currency rounded |
| **Click-through** | Every KPI card links to filtered list or hub view |
| **Refresh** | KPIs update on `TechnologyProfileUpdated`, `ProjectCompleted`, `TIPApproved` |

**Standard KPI catalog:**

| KPI | Admin | Consultant | Technician | Client | Read Only |
| --- | ----- | ---------- | ---------- | ------ | --------- |
| Active clients | ✅ | ✅ | ❌ | ❌ | ✅ |
| Portfolio StackScore trend | ✅ | ✅ | ❌ | ❌ | ✅ |
| Open critical recommendations | ✅ | ✅ | ❌ | ❌ | ◐ |
| Projects in progress | ✅ | ✅ | 🔒 | ◐ | ✅ |
| TIPs pending approval | ✅ | ◐ | ❌ | ❌ | ◐ |
| QBRs due (7d) | ✅ | ✅ | ❌ | ◐ | ✅ |
| Revenue / profitability | ✅ | Ⓢ | ❌ | ❌ | ❌ |

🔒 assigned · ◐ scoped · Ⓢ delegated

---

# 13. Notification Center

| Attribute | Specification |
| --------- | ------------- |
| **Placement** | Global header — bell icon on all dashboards |
| **Content** | Title, timestamp, client name, deep link, read/unread state |
| **Sources** | DOC-123 notification events — QBR, reassessment, warranty, approval, completion, profile update, roadmap milestone |
| **Role filtering** | Technician: execution notifications only; Client: client-safe only |
| **Persistence** | In-app history 90 days; mark read on navigate |
| **Dashboard integration** | Unread count badge; top 3 preview in sidebar optional |

Notifications are **informational** — they do not auto-approve or mutate state.

---

# 14. Quick Actions

Quick actions appear in a **persistent action bar** or **Today's Focus** adjacent strip.

| Role | Primary quick actions |
| ---- | --------------------- |
| Super Admin | Tenants, users, audit log, system config |
| Admin | New client, approve TIP, at-risk list, catalog admin |
| Consultant | New assessment, new TIP, open client, schedule QBR |
| Technician | My tasks, upload attachment, complete task |
| Client | Review TIP, view roadmap, download report, contact support |
| Read Only | Export trend report, open QBR |

Quick actions invoke DOC-123 workflows — they never bypass authorization.

---

# 15. Dashboard Personalization

Supported personalization (per user, per role):

| Feature | Specification |
| ------- | ------------- |
| Widget rearrangement | Drag-and-drop grid; save layout preference |
| Favorite widgets | Pin widgets to top row |
| Saved dashboard layouts | Named layouts (e.g. "Monday QBR prep") |
| Light / Dark mode | Per DOC-005 theme tokens |
| Hidden widgets | Collapse non-essential widgets (restore defaults available) |
| **Future:** custom dashboards | User-built layouts from widget library |

**Today's Focus** cannot be hidden or deprioritized below the fold — it is mandatory.

Personalization preferences stored per `userId` + `organizationId`; do not affect role permission boundaries.

---

# 16. Mobile Dashboard Considerations

| Rule | Specification |
| ---- | ------------- |
| **Stack order** | Today's Focus → primary KPI → next critical widget → remainder collapsed |
| **Touch targets** | Minimum 44px; quick actions as full-width buttons |
| **Navigation** | Hamburger / drawer for global nav; bottom bar for Technician tasks (future) |
| **Charts** | Simplified sparklines; tap to expand full chart |
| **Tables** | Card layout per row on narrow viewports |
| **Offline** | Technician: read-only cached tasks (future); no offline financial data |

Aligns with responsive patterns in DOC-005 and implemented mobile layout conventions.

---

# 17. Future Dashboard Enhancements

* **AI Insights** — narrative summaries of portfolio risk with consultant approval
* **Predictive Recommendations** — suggested next actions on Today's Focus
* **Live Monitoring** — RMM integration widgets (device health, alerts)
* **Integration Widgets** — PSA, billing, calendar sync tiles
* **Executive Scorecards** — board-ready single-page portfolio view
* **White-label Dashboards** — tenant branding overrides
* **Mobile App Dashboard** — native shell with push notifications
* **Team dashboards** — squad view for consultants sharing clients
* **Focus snooze / defer** — reschedule Today's Focus items with audit trail

---

# 18. Related Documents

* [DOC-005 – UI & UX Standards](DOC-005%20%E2%80%93%20UI%20&%20UX%20Standards.md)
* [DOC-113 – Technology Profile Specification](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-122 – Roles & Permissions Specification](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md)
* [DOC-123 – Application Workflow Specification](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md)
* [DOC-124 – Service Layer Specification](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md)
* [DOC-125 – Reporting Engine Specification](DOC-125%20%E2%80%93%20Reporting%20Engine%20Specification.md)
* [DOC-004 – Design Principles](DOC-004%20%E2%80%93%20Design%20Principles.md)

---

# 19. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Initial dashboard architecture — six role dashboards, widget library, Today's Focus action card, and personalization standards |
