# DOC-122 – Roles & Permissions Specification

**Document ID:** DOC-122
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# 1. Purpose

DOC-122 defines user roles, permission boundaries, access rules, and security expectations for StackScore.

This document governs who can **view**, **create**, **edit**, **approve**, **delete/archive**, **price**, **generate**, and **export** records across the platform.

DOC-122 is a **roles and permissions specification only**. It does not define application code, API implementations, or database migrations.

**Relationship to DOC-303:** [DOC-303 – RBAC & Security Specification](DOC-303%20RBAC%20&%20Security%20Specification.md) covers **v1 MVP authentication and enforcement mechanics**. DOC-122 defines the **v2 target permission model**. Until migration completes, DOC-303 governs running application behavior where roles differ.

**v1 mapping note:** MVP implements `admin` and `technician` only. `admin` ≈ **Admin**; `technician` ≈ combined **Consultant** + **Technician** capabilities until role split ships.

---

# 2. Security Philosophy

Access control protects **client trust**, **financial sensitivity**, and **consulting methodology**.

* **Least privilege** — users receive the minimum permissions required for their job function.
* **Separation of duties** — pricing, catalog administration, and client approval are distinct capabilities.
* **Internal vs client-facing** — playbooks, margins, and engine configuration remain internal.
* **Evidence preservation** — destructive operations are archival; hard delete is exceptional.
* **Accountability** — permission-sensitive actions produce audit records.
* **Human gates** — automation never bypasses approval for billable work.

---

# 3. Role Hierarchy

```text
Super Admin
    └── Admin
            ├── Consultant
            ├── Technician
            ├── Read Only
            └── Client (portal)
```

Higher roles inherit capabilities of lower staff roles **unless explicitly restricted** (e.g. Technician does not inherit pricing even from Consultant).

| Role | Scope | Primary function |
| ---- | ----- | ---------------- |
| **Super Admin** | Platform / all tenants | Platform owner; tenant and system governance |
| **Admin** | Organization (tenant) | Full BobKat IT operations within tenant |
| **Consultant** | Organization | Assess, plan, price (if delegated), approve client scope |
| **Technician** | Assigned work | Execute projects and tasks |
| **Client** | Own client record | View approved deliverables; approve initiatives |
| **Read Only** | Organization (scoped) | View authorized records without modification |

---

# 4. Role Definitions

## Super Admin

Platform-level operator with unrestricted access across tenants. Manages organizations, global settings, and emergency recovery. Reserved for BobKat IT platform ownership.

## Admin

Full organizational authority: users, roles, catalogs, pricing configuration, playbooks, scoring rules, audits, and all client data. Default owner of admin-only areas.

## Consultant

Leads client engagements: clients, assessments, recommendations, TIP/roadmap authoring, project creation, and client presentations. May receive delegated pricing/TIP generation rights. Cannot administer platform catalogs unless granted **Administer** on specific modules.

## Technician

Executes assigned projects and tasks. Views limited client context for delivery. No access to pricing, margins, playbooks, scoring configuration, or planning documents except task-level instructions.

## Client

Portal user linked to exactly one Client. Views client-safe Technology Profile summaries, approved TIP content, project status, and completion reports. May approve proposed initiatives. Cannot view internal notes, playbooks, or financial internals.

## Read Only

Internal or executive viewer. May view authorized modules (profiles, reports, trends) without create, edit, approve, archive, or export of sensitive financial detail unless explicitly granted.

---

# 5. Permission Categories

Permissions are evaluated per **module** (resource domain):

| Category | Description |
| -------- | ----------- |
| Clients | Client records and status |
| Contacts | Client contacts |
| Technology Profiles | Active profile and trends |
| Assessments | Assessment instances and responses |
| Assessment Questions | Question library (catalog) |
| Scoring Rules | Weights, engines, methodology config |
| Recommendations | Improvement opportunities |
| Solution Playbooks | Internal playbook catalog |
| Service Catalog | DOC-100 services |
| Approved Technology Catalog | DOC-101 products |
| Pricing Engine | Rates, formulas, margins |
| Technology Improvement Plans | TIP documents |
| Technology Roadmaps | Roadmap documents |
| Projects | Project records |
| Project Tasks | Task execution |
| Completion Reports | DOC-107 deliverables |
| Managed Technology Program | Managed service enrollment |
| Users | User accounts |
| Roles | Role and permission assignment |
| Reports | Dashboards and analytics |
| Documents | File artifacts |
| Notes | Annotations |
| Settings | Tenant and application configuration |

---

# 6. Global Permission Rules

1. **Authentication required** for all actions except login and health check.
2. **Tenant isolation** — users may not access another organization's data (except Super Admin).
3. **Client portal isolation** — Client role limited to linked `clientId`.
4. **Technician assignment** — Technician views Projects/Tasks assigned to them or their team (when assignment model enabled).
5. **Financial fields** — `unitCost`, `margin`, `internalLaborCost`, pricing formulas hidden unless role has Pricing Engine **View** with financial detail flag (Admin by default).
6. **Playbook names** — never exposed to Client or Technician roles.
7. **Completed assessments** — **Edit** denied for all roles; archive requires Admin.
8. **Approval** — TIP and project billable execution require **Approve** on respective modules.
9. **Archive over delete** — **Archive/Delete** performs soft archive; hard delete Super Admin only in compliance scenarios.
10. **Audit** — actions in [Section 15](#15-audit-logging-requirements) must log actor, target, and timestamp.

### Matrix legend

| Symbol | Meaning |
| ------ | ------- |
| ✅ | Allowed |
| ❌ | Denied |
| 🔒 | Scoped (own client, assigned records, or client-visible fields only) |
| ◐ | Partial (subset of fields or draft-only) |
| Ⓢ | Scoped + requires Admin delegation flag |

---

# 7. Module Permission Matrix

## Super Admin

| Module | View | Create | Edit | Approve | Archive/Delete | Export | Administer |
| ------ | ---- | ------ | ---- | ------- | -------------- | ------ | ---------- |
| Clients | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contacts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Technology Profiles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assessments | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Assessment Questions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scoring Rules | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recommendations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Solution Playbooks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service Catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approved Technology Catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pricing Engine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Technology Improvement Plans | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Technology Roadmaps | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projects | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Project Tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Completion Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Managed Technology Program | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Roles | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notes | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

## Admin

| Module | View | Create | Edit | Approve | Archive/Delete | Export | Administer |
| ------ | ---- | ------ | ---- | ------- | -------------- | ------ | ---------- |
| Clients | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Contacts | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Technology Profiles | ✅ | ✅ | ◐ | ✅ | ✅ | ✅ | ✅ |
| Assessments | ✅ | ✅ | ◐ | ✅ | ✅ | ✅ | ✅ |
| Assessment Questions | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Scoring Rules | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Recommendations | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Solution Playbooks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service Catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Approved Technology Catalog | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Pricing Engine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Technology Improvement Plans | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Technology Roadmaps | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Projects | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Project Tasks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Completion Reports | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Managed Technology Program | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Users | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Roles | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ |
| Reports | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ |
| Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notes | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

◐ **Technology Profiles** — Edit applies to narrative fields only; scores are system-calculated. ◐ **Assessments** — Edit draft only; completed assessments immutable.

## Consultant

| Module | View | Create | Edit | Approve | Archive/Delete | Export | Administer |
| ------ | ---- | ------ | ---- | ------- | -------------- | ------ | ---------- |
| Clients | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Contacts | ✅ | ✅ | ✅ | ❌ | ❌ | ◐ | ❌ |
| Technology Profiles | ✅ | ❌ | ◐ | ❌ | ❌ | ✅ | ❌ |
| Assessments | ✅ | ✅ | ◐ | ✅ | ❌ | ✅ | ❌ |
| Assessment Questions | ◐ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Scoring Rules | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Recommendations | ✅ | ✅ | ✅ | ◐ | ❌ | ✅ | ❌ |
| Solution Playbooks | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Service Catalog | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approved Technology Catalog | ◐ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pricing Engine | Ⓢ | Ⓢ | Ⓢ | ❌ | ❌ | Ⓢ | ❌ |
| Technology Improvement Plans | ✅ | Ⓢ | Ⓢ | Ⓢ | ❌ | Ⓢ | ❌ |
| Technology Roadmaps | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Projects | ✅ | ✅ | ✅ | ◐ | ❌ | ✅ | ❌ |
| Project Tasks | ✅ | ✅ | ✅ | ◐ | ❌ | ◐ | ❌ |
| Completion Reports | ✅ | ◐ | ◐ | ◐ | ❌ | ✅ | ❌ |
| Managed Technology Program | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Roles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reports | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Documents | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Notes | ✅ | ✅ | ✅ | ❌ | ❌ | ◐ | ❌ |
| Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

Ⓢ **Requires delegation** — Admin must grant `pricing_delegate` or `tip_generate` flag for Pricing Engine and TIP create/edit/approve/export with financial detail. Without delegation, Consultant may view client-visible investment totals only.

## Technician

| Module | View | Create | Edit | Approve | Archive/Delete | Export | Administer |
| ------ | ---- | ------ | ---- | ------- | -------------- | ------ | ---------- |
| Clients | 🔒 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Contacts | 🔒 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Technology Profiles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assessments | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Assessment Questions | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Scoring Rules | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Recommendations | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Solution Playbooks | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Service Catalog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approved Technology Catalog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pricing Engine | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Technology Improvement Plans | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Technology Roadmaps | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Projects | 🔒 | ❌ | 🔒 | ❌ | ❌ | ❌ | ❌ |
| Project Tasks | 🔒 | ❌ | 🔒 | ❌ | ❌ | ◐ | ❌ |
| Completion Reports | ❌ | ◐ | ◐ | ❌ | ❌ | ❌ | ❌ |
| Managed Technology Program | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Users | 🔒 | ❌ | 🔒 | ❌ | ❌ | ❌ | ❌ |
| Roles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reports | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Documents | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ |
| Notes | 🔒 | 🔒 | 🔒 | ❌ | ❌ | ❌ | ❌ |
| Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

🔒 **Projects/Tasks** — assigned records only. ◐ **Completion Reports** — contribute field data to draft; cannot deliver. 🔒 **Users** — own profile and password only.

## Client

| Module | View | Create | Edit | Approve | Archive/Delete | Export | Administer |
| ------ | ---- | ------ | ---- | ------- | -------------- | ------ | ---------- |
| Clients | 🔒 | ❌ | ◐ | ❌ | ❌ | ◐ | ❌ |
| Contacts | 🔒 | ❌ | ◐ | ❌ | ❌ | ❌ | ❌ |
| Technology Profiles | 🔒 | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Assessments | 🔒 | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Assessment Questions | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Scoring Rules | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Recommendations | 🔒 | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Solution Playbooks | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Service Catalog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approved Technology Catalog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pricing Engine | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Technology Improvement Plans | 🔒 | ❌ | ❌ | ✅ | ❌ | ◐ | ❌ |
| Technology Roadmaps | 🔒 | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Projects | 🔒 | ❌ | ❌ | ✅ | ❌ | ◐ | ❌ |
| Project Tasks | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Completion Reports | 🔒 | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Managed Technology Program | 🔒 | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Users | 🔒 | ❌ | 🔒 | ❌ | ❌ | ❌ | ❌ |
| Roles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reports | 🔒 | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Documents | 🔒 | ◐ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Notes | ❌ | ◐ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

🔒 Client-visible fields only — no internal notes, playbook names, or margins. ◐ **Edit** on Contacts — own contact card only.

## Read Only

| Module | View | Create | Edit | Approve | Archive/Delete | Export | Administer |
| ------ | ---- | ------ | ---- | ------- | -------------- | ------ | ---------- |
| Clients | ✅ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Contacts | ✅ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Technology Profiles | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Assessments | ✅ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Assessment Questions | ◐ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Scoring Rules | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Recommendations | ✅ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Solution Playbooks | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Service Catalog | ◐ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approved Technology Catalog | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pricing Engine | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Technology Improvement Plans | ✅ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Technology Roadmaps | ✅ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Projects | ✅ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Project Tasks | ◐ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Completion Reports | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Managed Technology Program | ✅ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Users | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Roles | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Reports | ✅ | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ |
| Documents | ◐ | ❌ | ❌ | ❌ | ❌ | ◐ | ❌ |
| Notes | ◐ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Settings | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

◐ Export excludes financial internal fields. Read Only scope may be limited per user by Admin assignment (client subset or module subset).

---

# 8. Admin-Only Areas

The following require **Admin** or **Super Admin** **Administer** permission by default:

| Area | Rationale |
| ---- | --------- |
| User and role management | Security boundary |
| Scoring rules and engine weights | Integrity of assessments |
| Assessment question library publish/retire | Canonical methodology |
| Service Catalog and Approved Technology administration | Commercial standards |
| Pricing Engine configuration | Financial sensitivity |
| Solution Playbook create/edit | Internal methodology |
| Audit log access | Compliance |
| Tenant settings | Organization governance |
| Hard delete / compliance purge | Data protection |
| Delegation flags (`pricing_delegate`, `tip_generate`) | Separation of duties |

Consultants may receive **delegated** subsets via per-user permission flags without full Admin role.

---

# 9. Technician Access Rules

Technicians operate in an **execution-only** context:

* **May** view and update assigned Project Tasks, attach photos/documents, and add task-level notes.
* **May** view limited Client/Contact context required for on-site work (address, primary contact).
* **May** update own User profile and password.
* **May** contribute to Completion Report drafts (installation notes, validation results) when assigned.
* **May not** view Technology Profile scores, Recommendations, TIP, Roadmap, or Pricing.
* **May not** access Solution Playbooks, Scoring Rules, or Recommendation Engine configuration.
* **May not** create clients, assessments, or projects unless explicitly granted Consultant role.
* **May not** approve client spend or mark TIP approved.

---

# 10. Client Portal Access Rules

When the Client role is enabled:

* User account links to exactly one `clientId` and optional `contactId`.
* All queries filter by linked client — cross-client access is forbidden.
* **Visible:** executive summaries, client-visible TIP investment totals, roadmap phases, project status, delivered completion reports, client-visible documents.
* **Hidden:** internal notes, assessor evidence, playbook identifiers, recommendation engine logic, labor rates, margins, cost, pre-approval drafts.
* **Approve:** TIP initiatives and project scope presented for client signature.
* **Upload:** client-visible documents (e.g. signed approval) when enabled.
* Portal sessions use same authentication standards as DOC-303 with shorter optional session duration.

---

# 11. Pricing & Profitability Access

| Data element | Super Admin | Admin | Consultant | Technician | Client | Read Only |
| ------------ | ----------- | ----- | ---------- | ---------- | ------ | --------- |
| Client-visible investment total | ✅ | ✅ | ✅ | ❌ | ✅ | ◐ |
| Labor rates | ✅ | ✅ | Ⓢ | ❌ | ❌ | ❌ |
| Product unit cost | ✅ | ✅ | Ⓢ | ❌ | ❌ | ❌ |
| Margin / profitability | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pricing formulas | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| TIP generation (with costs) | ✅ | ✅ | Ⓢ | ❌ | ❌ | ❌ |
| Export pricing workbook | ✅ | ✅ | Ⓢ | ❌ | ❌ | ❌ |

**Default rule:** Pricing, margin, cost, profitability, and TIP generation with internal financial detail are **Admin-only** unless Admin assigns delegation to a Consultant.

---

# 12. Playbook Access

| Action | Super Admin | Admin | Consultant | Technician | Client | Read Only |
| ------ | ----------- | ----- | ---------- | ---------- | ------ | --------- |
| View playbook catalog | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Select playbook for recommendation/project | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create / edit playbooks | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| View playbook name in client UI | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

Solution Playbooks are **internal-only**. Client-facing outputs describe business outcomes and services, not playbook codes or names.

---

# 13. Reporting & PDF Export Access

| Report / export | Super Admin | Admin | Consultant | Technician | Client | Read Only |
| --------------- | ----------- | ----- | ---------- | ---------- | ------ | --------- |
| Technology Profile executive summary PDF | ✅ | ✅ | ✅ | ❌ | ◐ | ✅ |
| Assessment executive report PDF | ✅ | ✅ | ✅ | ❌ | ◐ | ◐ |
| TIP / proposal PDF | ✅ | ✅ | Ⓢ | ❌ | ◐ | ◐ |
| Technology Roadmap PDF | ✅ | ✅ | ✅ | ❌ | ◐ | ◐ |
| Completion Report PDF | ✅ | ✅ | ✅ | ◐ | ✅ | ✅ |
| QBR / trend analytics | ✅ | ✅ | ✅ | ❌ | ◐ | ✅ |
| Audit log export | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Pricing / margin reports | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |

Exports respect field-level redaction — financial internals stripped for non-Admin roles.

---

# 14. Delete / Archive Permissions

| Entity | Consultant | Technician | Client | Archive authority |
| ------ | ---------- | ---------- | ------ | ----------------- |
| Draft assessment | ◐ own | ◐ own | ❌ | Admin |
| Completed assessment | ❌ | ❌ | ❌ | Admin archive only |
| Client | ❌ | ❌ | ❌ | Admin |
| Project (completed) | ❌ | ❌ | ❌ | ❌ never |
| Recommendation | ❌ | ❌ | ❌ | Admin dismiss archive |
| TIP / Roadmap supersede | ✅ via new version | ❌ | ❌ | Auto-archive prior version |
| Catalog entities | ❌ | ❌ | ❌ | Admin deprecate |
| User | ❌ | ❌ | ❌ | Admin deactivate |

**No role** may hard-delete completed assessments, closed projects, delivered completion reports, or audit log entries. Super Admin hard-delete reserved for legal/compliance procedures only.

---

# 15. Audit Logging Requirements

The following actions **must** produce an Audit Log record per [DOC-121 – Database Schema Specification](DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md):

| Event | Minimum fields |
| ----- | -------------- |
| Login success / failure | actor, IP, timestamp |
| User create / role change / deactivate | actor, target user, before/after role |
| Permission delegation grant / revoke | actor, target user, flags |
| Assessment completed | actor, assessmentId, clientId, score |
| Recommendation status change | actor, recommendationId, old/new status |
| TIP presented / approved / superseded | actor, tipId, clientId, version |
| Project created / approved / completed | actor, projectId, clientId |
| Client approval captured | actor, contactId, entity reference |
| Completion report delivered | actor, reportId, clientId |
| Profile updated via reassessment | actor, clientId, snapshotId |
| Catalog publish / deprecate | actor, entity type, version |
| Archive / soft delete | actor, entity type, entityId, reason |
| Export of sensitive financial report | actor, report type, clientId |

Audit logs are **View** and **Export** for Admin and Super Admin only.

---

# 16. Future Permission Expansion

| Capability | Description |
| ---------- | ----------- |
| Per-client assignment | Consultant/technician scoped to client portfolio |
| Custom roles | Tenant-defined roles from permission templates |
| Field-level ACL | Granular flags beyond module matrix |
| Time-bound delegation | Temporary pricing approval for cover scenarios |
| API keys / service accounts | Machine roles with restricted scopes |
| Multi-factor authentication | Required for Admin and Super Admin |
| Client sub-users | Multiple portal users per client with varied approve rights |
| Regional data residency | Permission-aware data region constraints |

Future expansion must preserve core principles in Section 6.

---

# 17. Related Documents

* [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-121 – Database Schema Specification](DOC-121%20%E2%80%93%20Database%20Schema%20Specification.md)
* [DOC-123 – Application Workflow Specification](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md)
* [DOC-303 – RBAC & Security Specification](DOC-303%20RBAC%20&%20Security%20Specification.md) — v1 enforcement
* [DOC-105 – Project Generation Specification](../10-Product/DOC-105%20%E2%80%93%20Project%20Generation%20Specification.md)
* [DOC-106 – Solution Playbook Specification](../10-Product/DOC-106%20%E2%80%93%20Solution%20Playbook%20Specification.md)
* [DOC-102 – Pricing Engine Specification](../10-Product/DOC-102%20%E2%80%93%20Pricing%20Engine%20Specific.md)
* [DOC-103 – Technology Improvement Plan Specification](../10-Product/DOC-103%20%E2%80%93%20Technology%20Improvement%20Plan%20Specification.md)
* [DOC-118 – v1 to v2 Compatibility Reference](../20-Business-Logic/DOC-118%20%E2%80%93%20v1%20to%20v2%20Compatibility%20Reference.md)

---

# 18. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Initial specification — six roles, module permission matrices, pricing/playbook rules, and audit requirements |
