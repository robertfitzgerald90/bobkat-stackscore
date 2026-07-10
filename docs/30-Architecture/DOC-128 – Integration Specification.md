# DOC-128 – Integration Specification

**Document ID:** DOC-128
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# 1. Purpose

DOC-128 defines StackScore's external integration architecture.

The objective is to standardize how StackScore communicates with third-party platforms while remaining **vendor-neutral** and maintaining a consistent business workflow per [DOC-123 – Application Workflow Specification](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md).

DOC-128 is an **integration architecture specification only**. It does not define code, API clients, connectors, or application logic.

Implementation is owned by the **Integration Service** per [DOC-124 – Service Layer Specification](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md).

---

# 2. Integration Philosophy

* StackScore **integrates with** platforms but is **not dependent** on any single vendor.
* Integrations should **enhance the Technology Profile** rather than replace it.
* External systems should enrich **assessments**, **reporting**, **automation**, and **managed services**.
* Every integration is **optional**.
* Business workflows must **continue to function** without any individual integration.

---

# 3. Integration Principles

1. **Profile authority** — StackScore remains the system of record for Technology Profiles and StackScore.
2. **No scoring bypass** — external data never writes scores directly; it informs assessments and recommendations.
3. **Least privilege** — connectors request minimum OAuth scopes and API permissions.
4. **Idempotent sync** — retries must not duplicate or corrupt records.
5. **Auditable** — every sync run logged with status, record counts, and errors.
6. **Graceful degradation** — UI and workflows operate when integrations are disabled or failing.
7. **Tenant-scoped** — credentials and sync state isolated per `organizationId`.
8. **Human oversight** — automated imports may suggest assessment evidence; consultants approve material changes.

**Business rules (governing):**

1. StackScore remains the **authoritative source** for Technology Profiles.
2. External systems **never directly modify** StackScore scoring.
3. Imported data may **influence recommendations** but shall not bypass the Recommendation Engine.
4. Integrations shall support **auditing and synchronization history**.
5. Failed synchronizations shall **never corrupt** StackScore data.
6. Every integration is **disconnectable** without data loss to core client records.
7. Client-facing views never expose raw vendor API payloads or credentials.

---

# 4. Integration Architecture

```text
External Platform
        │
        ▼
Integration Connector (adapter per vendor)
        │
        ▼
Integration Service (DOC-124)
        ├── Authentication / token vault
        ├── Sync scheduler & webhooks
        ├── Normalization layer (canonical import model)
        ├── Validation & deduplication
        └── Audit log + sync history
        │
        ▼
Domain Services (read/write per rules)
        ├── Technology Profile Service (enrichment only)
        ├── Assessment Service (evidence attachments)
        ├── Recommendation Service (signal input)
        ├── Project / Task Service (status sync optional)
        ├── Document Service (file import)
        ├── Notification Service (alerts)
        └── Dashboard Service (live widgets)
```

**Connector pattern:** Each vendor implements a connector with `authenticate`, `pull`, `push` (if write-enabled), `webhook` (if supported), and `healthCheck`. Connectors map vendor payloads to StackScore **canonical integration objects** — not directly to Prisma entities.

---

# 5. Authentication Standards

| Method | Use case | Requirements |
| ------ | -------- | ------------ |
| **OAuth 2.0** | Microsoft Graph, Google, HubSpot, Salesforce, QuickBooks, Xero | Authorization code + refresh tokens; encrypted vault storage |
| **Microsoft Entra ID** | SSO and Graph ecosystem | Entra app registration; admin consent for org scopes |
| **API keys** | RMM, monitoring, backup APIs where OAuth unavailable | Keys in secrets vault; never logged or client-exposed |
| **Service accounts** | Scheduled server-to-server sync | Dedicated integration user; rotate credentials |
| **Future SAML** | Enterprise SSO for StackScore login | Phase 2 — distinct from data integration OAuth |

Token refresh failures disable sync for that connector and surface admin alert — they do not block StackScore login unless SSO-only tenant policy.

---

# 6. Integration Categories

| Category | Primary business value |
| -------- | ---------------------- |
| Identity Providers | SSO and directory-enriched client contacts |
| Microsoft Ecosystem | M365 posture, collaboration, files |
| Remote Monitoring & Management | Device inventory, alerts, patch status |
| Network Infrastructure | Network health evidence for assessments |
| Backup & Disaster Recovery | Backup coverage and job status |
| Security Platforms | Endpoint and threat posture |
| Ticketing / PSA | Project and ticket alignment |
| Documentation Platforms | Client documentation completeness |
| Accounting | Invoice and revenue alignment (admin) |
| CRM | Client and opportunity sync |
| Communications | Notifications and meeting context |
| Storage | Document import to client record |
| Monitoring | Uptime and infrastructure alerts |
| Asset Discovery | Device inventory and software evidence |

---

# 7. Supported Integrations

Each integration defines: **Purpose**, **Authentication**, **Direction**, **Data imported**, **Data exported**, **Related modules**, **Failure handling**, **Business value**.

Legend — **Direction:** `In` import only · `Out` export only · `Bi` bidirectional · `RO` read-only · `RW` read-write

---

## 7.1 Identity Providers

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **Microsoft Entra ID** | SSO and user/group directory | OAuth 2.0 / Entra | In | Users, groups, sign-in risk (summary) | — | Auth, User, Contact | Disable SSO sync; local auth fallback | Secure access; contact enrichment |
| **Active Directory** | On-prem directory sync (hybrid) | Service account / LDAP gateway | In | Users, computers (summary) | — | User, Assessment evidence | Queue retry; manual directory | Hybrid client identity context |
| **Google Workspace** | SSO and directory | OAuth 2.0 | In | Users, org units, device metadata | — | Auth, Contact | Token refresh alert | Google-centric client onboarding |

---

## 7.2 Microsoft Ecosystem

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **Microsoft Graph** | Unified M365 API layer | OAuth 2.0 Entra | In | Users, licenses, security scores (aggregated) | — | Profile, Assessment | Partial sync; per-service errors | Single pipe for M365 evidence |
| **Microsoft 365** | Tenant posture summary | Graph OAuth | In | License counts, MFA registration %, secure score | — | Assessment, Profile | Skip stale tenant | Productivity & security assessment evidence |
| **SharePoint** | Document libraries | Graph OAuth | In / Out | Files, site metadata | TIP/report PDFs (optional) | Document | File-level retry | Centralized client documents |
| **Exchange Online** | Mailbox / transport signals | Graph OAuth | In | Mail flow rules summary, mailbox counts | — | Assessment | Read-only degrade | Email security assessment input |
| **Teams** | Collaboration posture | Graph OAuth | In | Team counts, guest access summary | Meeting links (Out) | Assessment, Calendar | Notification only | Productivity category evidence |
| **OneDrive** | User storage posture | Graph OAuth | In | Sharing link risk summary | — | Assessment | — | Data governance evidence |
| **Power Platform (future)** | Automation hooks | OAuth 2.0 | Bi | Flow run status | Webhook events | Integration, Notification | Future spec | Low-code automation |

---

## 7.3 Remote Monitoring & Management

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **NinjaOne** | RMM inventory and monitoring | API key / OAuth | In | Devices, OS, patch status, alerts | Ticket refs (Out optional) | Assessment, Profile, Dashboard, Managed Program | Stale-data flag; last-sync timestamp | Live endpoint and patch evidence |
| **N-able (future)** | RMM | API key | In | Devices, alerts, patch status | — | Assessment, Dashboard | Planned connector | Vendor choice for MSP |
| **Datto RMM (future)** | RMM | API key | In | Devices, monitoring | — | Assessment | Planned connector | Vendor choice for MSP |

---

## 7.4 Network Infrastructure

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **Ubiquiti UniFi** | Network device and WLAN health | API key | In RO | APs, switches, gateways, firmware, uptime | — | Assessment, Profile | Site-level error isolation | Infrastructure assessment evidence |
| **Cisco Meraki** | Cloud network posture | API key | In RO | Org/network/device status, firmware | — | Assessment | Rate-limit backoff | Enterprise network visibility |
| **Aruba Central** | WLAN and switch management | OAuth / API key | In RO | Device inventory, alerts | — | Assessment | — | Wireless and switching evidence |
| **Cisco DNA / Catalyst Center (future)** | Enterprise campus | Service account | In RO | Device health, templates | — | Assessment | Future | Large campus clients |

---

## 7.5 Backup & Disaster Recovery

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **Veeam** | Backup job status | API key | In RO | Jobs, success/fail, last run, protected workloads | — | Assessment, BCDR recommendations | Job-level skip | Business continuity evidence |
| **Acronis** | Backup and cyber protect | API key | In RO | Protection status, alerts | — | Assessment | — | Backup coverage proof |
| **Cove Data Protection** | MSP backup | API key | In RO | Device backup status | — | Assessment, Managed Program | — | MSP-standard backup visibility |
| **Synology Active Backup** | NAS / endpoint backup | API key | In RO | Task results, devices | — | Assessment | — | SMB backup evidence |
| **Microsoft 365 Backup** | M365 backup vendors (generic) | Vendor API | In RO | Protected mailboxes/sites, last backup | — | Assessment | Map per vendor adapter | M365 BCDR category |

---

## 7.6 Security Platforms

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **Microsoft Defender** | M365 / endpoint defender | Graph / Defender API | In RO | Threat summary, device compliance | — | Assessment, Security recommendations | — | Security score evidence |
| **Huntress** | MDR and EDR summary | API key | In RO | Incidents, agent coverage | — | Assessment, Dashboard | — | Managed security evidence |
| **SentinelOne** | EDR posture | API key | In RO | Agent count, threat summary | — | Assessment | — | Endpoint protection proof |
| **CrowdStrike** | Falcon posture | OAuth / API key | In RO | Hosts, detections (summary) | — | Assessment | — | Enterprise EDR evidence |
| **Bitdefender** | GravityZone summary | API key | In RO | Endpoint status, policies | — | Assessment | — | Alternative EDR vendor |

---

## 7.7 Ticketing / PSA

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **HaloPSA** | Tickets and projects | OAuth / API key | Bi RW | Tickets, clients, project status | StackScore projects, time notes | Project, Client, Notification | Conflict queue; manual merge | Align delivery with PSA |
| **Autotask** | PSA sync | API key | Bi RW | Companies, tickets, contracts | Projects, milestones | Project, Client | Idempotent ticket mapping | Operational workflow continuity |
| **ConnectWise Manage** | PSA sync | API key | Bi RW | Companies, agreements, tickets | Projects, activities | Project, Managed Program | Board-level error report | MSP standard PSA |
| **Jira Service Management** | ITSM tickets | API key / OAuth | Bi | Issues, assets (summary) | Project links | Project, Task | — | Enterprise service desk |

---

## 7.8 Documentation Platforms

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **Hudu** | IT documentation | API key | In RO | Asset docs, passwords (refs only), checklists | Links to StackScore client | Document, Assessment | Never import secrets into StackScore | Documentation maturity evidence |
| **IT Glue** | IT documentation | API key | In RO | Configurations, documents (metadata) | Client mapping | Document, Assessment | — | Documentation category scoring input |

---

## 7.9 Accounting

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **QuickBooks Online** | Invoicing and revenue | OAuth 2.0 | In / Out | Invoices, payments (admin) | TIP line export (optional) | Pricing, Admin Dashboard | Admin-only; no client UI | Revenue snapshot and proposal reconciliation |
| **Zoho Books** | Accounting | OAuth 2.0 | In / Out | Invoices, customers | — | Pricing (admin) | — | Alternative accounting |
| **Xero** | Accounting | OAuth 2.0 | In / Out | Invoices, contacts | — | Pricing (admin) | — | Alternative accounting |

---

## 7.10 CRM

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **HubSpot** | CRM and deals | OAuth 2.0 | Bi | Companies, contacts, deals | Assessment completed events | Client, Contact, Notification | Field mapping config | Sales-to-delivery handoff |
| **Microsoft Dynamics 365** | CRM | OAuth Entra | Bi | Accounts, contacts, opportunities | Profile summary (Out optional) | Client, Contact | — | Microsoft-centric CRM |
| **Salesforce** | CRM | OAuth 2.0 | Bi | Accounts, contacts, opportunities | Engagement milestones | Client, Contact | — | Enterprise CRM sync |

---

## 7.11 Communications

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **Microsoft Teams** | Notifications and meetings | Graph OAuth | Out / In | Calendar (In) | Alerts, report links (Out) | Notification, Calendar | Queue notifications | Client communication channel |
| **Slack** | Internal alerts | OAuth 2.0 | Out | — | Workflow notifications | Notification | Retry queue | Team alerting |
| **Email** | SMTP / Graph mail send | SMTP / Graph | Out | — | TIP, reports, QBR, notifications | Notification, Document | Dead-letter queue | Client deliverables |
| **SMS (future)** | Urgent alerts | Provider API | Out | — | Approval reminders | Notification | Future | Mobile urgency |

---

## 7.12 Storage

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **SharePoint** | See Microsoft Ecosystem | Graph OAuth | In / Out | Files | PDFs | Document | — | — |
| **OneDrive** | File pick/import | Graph OAuth | In | Selected files | — | Document | — | Ad-hoc client files |
| **Google Drive** | File import | OAuth 2.0 | In | Files, metadata | — | Document | — | Google-centric clients |
| **Dropbox Business** | File import | OAuth 2.0 | In | Files | — | Document | — | Alternative storage |

---

## 7.13 Monitoring

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **Uptime Kuma** | Uptime checks | API key | In RO | Monitor status, uptime % | — | Assessment, Dashboard | Stale monitor flag | Availability evidence |
| **LibreNMS** | Network monitoring | API token | In RO | Devices, alerts, uptime | — | Assessment | — | Open monitoring option |
| **PRTG** | Infrastructure monitoring | API key | In RO | Sensors, status, alerts | — | Assessment, Dashboard | — | Sensor-level proof |
| **Wazuh** | SIEM / security monitoring | API key | In RO | Agents, alerts (summary) | — | Assessment, Security | — | Security operations evidence |

---

## 7.14 Asset Discovery

| Integration | Purpose | Auth | Dir | Imported | Exported | Modules | Failure | Business value |
| ----------- | ------- | ---- | --- | -------- | -------- | ------- | ------- | -------------- |
| **Lansweeper** | Asset inventory | API key | In RO | Hardware, software, warranties | — | Assessment, Profile | Asset dedup by serial | Endpoint & asset management evidence |
| **PDQ Inventory** | Windows inventory | API key | In RO | Computers, software, patches | — | Assessment | — | Patch and software evidence |
| **Microsoft Intune** | MDM posture | Graph OAuth | In RO | Devices, compliance, policies | — | Assessment, Security | — | Endpoint compliance proof |
| **NinjaOne Inventory** | Via Ninja RMM | API key | In RO | Devices (dedup with RMM) | — | Assessment | Single canonical source rule | Avoid duplicate device counts |
| **GLPI** | Open asset CMDB | API token | In RO | Assets, tickets link | — | Assessment | — | Open-source asset tracking |
| **Open-AudIT** | Network discovery | API key | In RO | Discovered devices, software | — | Assessment | — | Discovery scan evidence |

**Asset deduplication rule:** When multiple discovery sources exist, Integration Service marks a **canonical source** per client; others attach as supplemental evidence — device counts do not stack naively.

---

# 8. Integration Data Ownership

| Data domain | Authoritative system | Integration role |
| ----------- | -------------------- | ---------------- |
| Technology Profile & StackScore | **StackScore** | Enrich only — never overwrite scores from import |
| Client master record | **StackScore** (CRM may seed create) | Bi-directional contact sync with conflict rules |
| Assessment responses | **StackScore** | External data = evidence attachments or suggested pre-fill |
| Recommendations | **StackScore** (Recommendation Engine) | External alerts → signals, not direct recommendation rows |
| Projects & tasks | **StackScore** (PSA may mirror) | Optional status sync with StackScore as engagement truth |
| Documents | **StackScore** (storage may be source file) | Import copies; StackScore owns metadata and visibility |
| Financial / pricing | **StackScore + accounting** | Admin-only; accounting may be invoice authority |
| Device inventory | **External RMM/discovery** | Import as evidence; consultant validates for assessment |

---

# 9. Synchronization Rules

| Mode | Description | When to use |
| ---- | ----------- | ----------- |
| **Manual** | User triggers sync from admin or client hub | Initial connect, troubleshooting, pre-assessment refresh |
| **Scheduled** | Cron-based (hourly, daily, weekly) | RMM, backup, monitoring, documentation |
| **Event-driven** | Webhooks or Graph subscriptions | PSA ticket updates, backup job failures, Entra signals |
| **Read-only** | Import only — no write-back | Most security, network, backup, monitoring connectors |
| **Read/Write** | Bi-directional with conflict policy | PSA, CRM (limited fields), optional SharePoint export |

**Sync history** records: `integrationId`, `startedAt`, `completedAt`, `status`, `recordsProcessed`, `errors[]`, `actorUserId` (if manual).

**Conflict policy:** External change vs StackScore change → flag for consultant review; automatic merge only for non-scoring metadata (e.g. contact phone).

---

# 10. Integration Security

* Credentials stored in encrypted secrets vault — never in database plaintext.
* OAuth tokens rotated on refresh; revoke on integration disconnect.
* API keys scoped per organization; admin configure only.
* Integration traffic over TLS 1.2+.
* Imported payloads validated and size-limited.
* PII minimized — import only fields required for assessment evidence.
* Integration actions audit-logged per DOC-122.
* Technicians and clients **cannot** configure integrations.
* Penetration of vendor compromise: disconnect integration invalidates tokens without affecting core StackScore data.

---

# 11. Error Handling

| Failure type | Behavior |
| ------------ | -------- |
| Auth / token expired | Mark integration `degraded`; admin notification; no data delete |
| Rate limit | Exponential backoff; partial sync resume |
| Vendor API outage | Retry per schedule; dashboard shows last successful sync time |
| Schema / mapping error | Skip record; log error; continue batch |
| Duplicate detection | Merge or skip per dedup rules |
| Write-back failure | Queue outbound; never roll back successful StackScore commit |
| Catastrophic connector bug | Disable connector; preserve last good snapshot |

**Rule:** Failed synchronizations shall **never corrupt** StackScore data. Imports are staging → validate → commit.

---

# 12. Future Integration Framework

| Capability | Description |
| ---------- | ----------- |
| **Open REST API** | Public StackScore API for partners (DOC-302 extension) |
| **Webhooks** | Outbound events: assessment completed, TIP approved, project closed |
| **Public SDK** | TypeScript/Python client libraries for partners |
| **Marketplace** | Certified connector directory with version pinning |
| **Partner integrations** | Third-party published connectors with review process |
| **AI connectors** | LLM tools read redacted profile summaries with consent |
| **Low-code automation** | Power Platform, Zapier, Make.com trigger/action sets |

Framework principles carry forward from Section 3: optional, auditable, profile-authoritative.

---

# 13. Related Documents

* [DOC-120 – Domain Model Specification](DOC-120%20%E2%80%93%20Domain%20Model%20Specification.md)
* [DOC-122 – Roles & Permissions Specification](DOC-122%20%E2%80%93%20Roles%20&%20Permissions%20Specification.md)
* [DOC-123 – Application Workflow Specification](DOC-123%20%E2%80%93%20Application%20Workflow%20Specification.md)
* [DOC-124 – Service Layer Specification](DOC-124%20%E2%80%93%20Service%20Layer%20Specification.md)
* [DOC-127 – Dashboard Specification](DOC-127%20%E2%80%93%20Dashboard%20Specification.md)
* [DOC-302 – API Specification](DOC-302%20%E2%80%93%20API%20Specification.md)
* [DOC-303 – RBAC & Security Specification](DOC-303%20RBAC%20&%20Security%20Specification.md)

---

# 14. Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 1.0 | 2026-06-25 | BobKat IT | Initial integration architecture — connector model, fourteen categories, authentication, sync rules, and vendor catalog |
