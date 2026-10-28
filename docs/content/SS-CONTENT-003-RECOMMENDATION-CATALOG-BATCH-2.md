# SS-CONTENT-003 — Recommendation Catalog Completion (Batch 2)

| Field | Value |
| --- | --- |
| Status | **Content proposed — awaiting approval (not published)** |
| Date | 2026-10-27 |
| Branch | `staging` |
| Scope | Endpoint Management (10) + Data Protection & Recovery (10) |
| Catalog file | `data/RecommendationCatalogV2.json` |
| Constraints | Stub flags retained; impact points / priorities / IDs / mappings unchanged; scoring untouched; no production deploy; **catalog JSON not modified in this release** |

---

## 1. Phase 1 — Catalog inventory

### Schema (per template)

| Field | Notes |
| --- | --- |
| `id` | Stable `REC-{pillar}-{nnn}` |
| `questionId` | 1:1 DOC-151 question (`EP-###` / `DP-###`) |
| `pillarCode` / `pillarName` | Eight Technology Maturity pillars |
| `title`, `description`, `businessImpact` | Customer-facing copy when `isStub: false` |
| `suggestedService` | Service label for delivery planning |
| `priority`, `estimatedImpactPoints` | **Do not change in this batch** |
| `triggerAnswers`, `alsoTriggerOnPartial` | No / Partially |
| `isStub` | Fail-closed customer gate (SS-OPT-003 / visibility filter) |

Approved description structure (IA/SO/DK/TS pattern):

`Finding:` → `Recommended action:` → `Expected outcome:` → `Implementation considerations:`

### Inventory summary (current staging catalog after SS-CONTENT-002)

| Pillar | Approved (`isStub: false`) | Unfinished stubs |
| --- | --- | --- |
| Identity & Access | **10** | 0 |
| Security Operations | **10** | 0 |
| Documentation & Knowledge | **10** | 0 |
| Technology Strategy | **10** | 0 |
| Endpoint Management | 0 | **10** ← Batch 2 |
| Data Protection & Recovery | 0 | **10** ← Batch 2 |
| Network & Connectivity | 0 | 10 |
| Productivity & Collaboration | 0 | 10 |
| **Total** | **40** | **40** |

### Stub visibility

Clients never receive `isStub: true` rows (`filterClientDeliverableRecommendations`). Titles starting with `Improve ` are also fail-closed. **This batch does not clear `isStub`.**

### Approved recommendations

All `REC-IA-*`, `REC-SO-*`, `REC-DK-*`, and `REC-TS-*` rows were left untouched. Catalog JSON was **not edited** for this proposal.

### Question mappings (Batch 2)

| Template | Question | Current stub title pattern |
| --- | --- | --- |
| REC-EP-001 | EP-001 Is there an accurate inventory of company-owned devices? | Improve Endpoint Management: … |
| REC-EP-002 | EP-002 Is there a documented device lifecycle? | … |
| REC-EP-003 | EP-003 Are operating systems and applications patched consistently? | … |
| REC-EP-004 | EP-004 Are endpoints protected by centrally managed security software? | … |
| REC-EP-005 | EP-005 Are portable devices encrypted? | … |
| REC-EP-006 | EP-006 Can devices be remotely managed? | … |
| REC-EP-007 | EP-007 Are standard device configurations used? | … |
| REC-EP-008 | EP-008 Is hardware health monitored? | … |
| REC-EP-009 | EP-009 Are operating systems vendor supported? | … |
| REC-EP-010 | EP-010 Has endpoint management ownership been assigned? | … |
| REC-DP-001 | DP-001 Are all critical systems included in backups? | Improve Data Protection & Recovery: … |
| REC-DP-002 | DP-002 Are backups monitored? | … |
| REC-DP-003 | DP-003 Are restore tests performed regularly? | … |
| REC-DP-004 | DP-004 Is there a disaster recovery plan? | … |
| REC-DP-005 | DP-005 Is there a business continuity plan? | … |
| REC-DP-006 | DP-006 Are recovery objectives defined? | … |
| REC-DP-007 | DP-007 Are backups protected from compromise? | … |
| REC-DP-008 | DP-008 Has critical data been identified? | … |
| REC-DP-009 | DP-009 Are retention requirements documented? | … |
| REC-DP-010 | DP-010 Has recovery ownership been assigned? | … |

Preserved metadata (unchanged in proposal):

| ID | Priority | Impact pts |
| --- | --- | --- |
| REC-EP-001 | medium | 6 |
| REC-EP-002 | medium | 6 |
| REC-EP-003 | critical | 10 |
| REC-EP-004 | critical | 10 |
| REC-EP-005 | high | 8 |
| REC-EP-006 | high | 8 |
| REC-EP-007 | high | 8 |
| REC-EP-008 | low | 4 |
| REC-EP-009 | critical | 10 |
| REC-EP-010 | low | 3 |
| REC-DP-001 | critical | 10 |
| REC-DP-002 | medium | 6 |
| REC-DP-003 | critical | 10 |
| REC-DP-004 | critical | 10 |
| REC-DP-005 | high | 8 |
| REC-DP-006 | high | 8 |
| REC-DP-007 | high | 8 |
| REC-DP-008 | medium | 6 |
| REC-DP-009 | low | 4 |
| REC-DP-010 | low | 3 |

Proposed `suggestedService` labels (for approval with publish):

- Endpoint Management → **Endpoint Management Improvement**
- Data Protection & Recovery → **Data Protection & Recovery Improvement**

---

## 2. Phase 2 — Proposed Batch 2 content

> **Publication rule:** Apply to `RecommendationCatalogV2.json` and set `isStub: false` **only after explicit approval**. Until then, catalog stubs remain as-is so customers cannot see unfinished copy.

Partial vs absent: each Finding notes that “No” implies missing or negligible practice and “Partially” implies incomplete coverage.

---

### Endpoint Management

#### REC-EP-001 — Maintain an accurate company-owned device inventory

**Proposed title:** Maintain an accurate company-owned device inventory

**businessImpact:** When company-owned workstations, laptops, and related devices are not inventoried accurately, patching, encryption, support, and retirement work miss systems. Lost or forgotten devices also raise data-exposure risk after departure or theft.

**description:**

Finding: An accurate inventory of company-owned devices is missing or incomplete based on the assessment response. “No” typically means no reliable device list; “Partially” usually means lists exist but omit sites, remote workers, or recently issued hardware.

Recommended action: Build a living inventory of company-owned endpoints in scope (workstations, laptops, tablets, and other managed portable devices). Capture identifier, assigned user or role, site or remote status, OS, and warranty or purchase date where known. Reconcile against procurement, directory, and support tooling on a defined cadence and after hire, transfer, or offboarding events.

Expected outcome: Security and support coverage decisions are based on what the organization actually owns, reducing blind spots in patching, encryption, and retirement.

Implementation considerations: Focus first on devices that access business email, line-of-business apps, or customer data. Reuse existing management or directory sources where available rather than maintaining a disconnected spreadsheet. Distinguish company-owned from BYOD if personal devices are in use. Complements broader technology inventory work (Documentation & Knowledge) by staying endpoint-specific.

---

#### REC-EP-002 — Document and run a device lifecycle process

**Proposed title:** Document and run a device lifecycle process

**businessImpact:** Without a clear device lifecycle, organizations overpay for aging hardware, rush emergency replacements, and leave retired devices with residual data or accounts. Lifecycle gaps also make warranty, imaging, and redeployment inconsistent.

**description:**

Finding: A documented device lifecycle is missing or only partially defined. “No” suggests procurement, deployment, refresh, and retirement are ad hoc; “Partially” suggests some steps exist without end-to-end ownership or consistent execution.

Recommended action: Document the endpoint lifecycle from request and procurement through imaging, assignment, refresh, redeployment, and secure retirement. Define target ages or warranty triggers for replacement classes, and a checklist for wiping, reclaiming licenses, and removing accounts when devices leave service. Publish the process to IT support and business requestors.

Expected outcome: Device spend and risk become more predictable, and retired hardware is less likely to retain business data or active access.

Implementation considerations: Align refresh windows with budget planning. Keep the document practical—flowcharts and checklists beat unused policy prose. Coordinate with hardware lifecycle planning in Technology Strategy so endpoint practice and capital planning do not diverge.

---

#### REC-EP-003 — Patch operating systems and applications consistently

**Proposed title:** Patch operating systems and applications consistently

**businessImpact:** Inconsistent endpoint patching leaves known defects available longer and creates uneven risk across users. Unpatched browsers, office suites, and operating systems are frequent entry paths for malware and account compromise in SMB environments.

**description:**

Finding: Operating systems and applications are not patched consistently across endpoints. “No” typically means patching is reactive or absent; “Partially” usually means some devices or products are updated while others lag, including remote or infrequently connected machines.

Recommended action: Define patch expectations by device class and product set (OS plus common business applications). Use centralized update or management tooling where available, report compliance, and remediate chronic exceptions. Include a path for emergency updates when actively exploited issues affect in-scope software.

Expected outcome: Exposure windows shrink for known endpoint vulnerabilities, and update practice becomes measurable rather than dependent on individual user habits.

Implementation considerations: Balance speed with change risk for specialty apps. Plan maintenance windows for shared or production-adjacent workstations. Complements Security Operations vulnerability assessment and critical-system update recommendations by focusing on endpoint OS/application consistency rather than full environment scanning.

---

#### REC-EP-004 — Protect endpoints with centrally managed security software

**Proposed title:** Protect endpoints with centrally managed security software

**businessImpact:** Endpoints without centrally managed security software are harder to protect consistently and harder to investigate when something goes wrong. Local-only or missing protection increases the chance that malware or unauthorized tools persist unnoticed.

**description:**

Finding: Endpoints are not fully covered by centrally managed security software. “No” suggests protection is missing or unmanaged; “Partially” suggests some devices have agents while others—often remotes, specialty machines, or newly issued hardware—do not report to a central console.

Recommended action: Deploy or complete rollout of centrally managed endpoint protection for in-scope company devices. Confirm agents report health and detections to a monitored console, define who triages alerts, and remediate offline or unprotected devices. Cover common Windows and, where used, macOS business fleets in scope.

Expected outcome: Malware and suspicious endpoint activity are more likely to be detected and contained with consistent policy, rather than relying on unmonitored local tools.

Implementation considerations: Validate licensing and OS compatibility before forced rollout. Exclude only intentional exceptions with owners and review dates. Align alert routing with existing security monitoring ownership so detections are not orphaned.

---

#### REC-EP-005 — Encrypt portable devices that hold business data

**Proposed title:** Encrypt portable devices that hold business data

**businessImpact:** Unencrypted laptops and other portable devices turn loss or theft into a likely data-exposure event. Encryption reduces the chance that stored business files remain readable if hardware leaves organizational control.

**description:**

Finding: Portable device encryption is missing or incomplete. “No” typically means full-disk or equivalent encryption is not required; “Partially” usually means some devices are encrypted while others—or recovery key escrow—are inconsistent.

Recommended action: Require encryption on company-owned portable devices that store or cache business data. Prefer platform-native full-disk encryption managed centrally where practical, verify compliance, and escrow recovery keys with authorized administrators. Remediate exceptions before those devices travel or leave the premises routinely.

Expected outcome: Lost or stolen portable hardware is far less likely to expose readable business data.

Implementation considerations: Confirm performance and compatibility on older hardware. Document recovery-key access for support without sharing keys broadly. Clarify BYOD expectations separately if personal devices access company data.

---

#### REC-EP-006 — Enable remote management for company devices

**Proposed title:** Enable remote management for company devices

**businessImpact:** Without remote management, routine support, patching, and emergency response depend on physical access or user-driven steps. That slows incident response and increases downtime when staff work remotely or across sites.

**description:**

Finding: Devices cannot be reliably managed remotely, or remote management covers only part of the fleet. “No” suggests no remote tooling; “Partially” suggests coverage gaps for remotes, specialty roles, or devices that never check in.

Recommended action: Place in-scope company endpoints under a remote management capability that supports inventory, scripted or policy-based maintenance, and guided support. Ensure devices check in regularly, including remote workers, and define how offline devices are brought back into management. Use remote actions only through authorized support roles.

Expected outcome: Support and security maintenance can proceed without waiting for devices to return on-site, improving response time for common issues and urgent updates.

Implementation considerations: Respect privacy and change-control expectations—document what remote actions are allowed. Confirm network and identity prerequisites for agent installation. Pair with ownership so unmanaged devices are escalated rather than ignored.

---

#### REC-EP-007 — Standardize endpoint configurations

**Proposed title:** Standardize endpoint configurations

**businessImpact:** One-off device builds create support variation, weaken security baselines, and make onboarding slower. Standard configurations reduce “works on my machine” failures and make policy enforcement practical.

**description:**

Finding: Standard device configurations are not used consistently. “No” typically means each device is built uniquely; “Partially” usually means a baseline exists but is frequently bypassed or not applied to remotes and specialty roles.

Recommended action: Define a small set of approved endpoint baselines (for example, standard workstation and remote laptop) covering OS build, core applications, security agents, and local policy. Image or provision new devices from those baselines, and remediate drift on existing devices where practical. Document justified exceptions with owners.

Expected outcome: New devices are ready faster, support is more predictable, and security settings are applied uniformly rather than negotiated per machine.

Implementation considerations: Keep baseline count small. Involve application owners for specialty software so the standard is usable. Revisit baselines when major OS versions change.

---

#### REC-EP-008 — Monitor endpoint hardware health

**Proposed title:** Monitor endpoint hardware health

**businessImpact:** Undetected disk, battery, or hardware faults lead to surprise downtime and data-loss risk when devices fail mid-work. Light health monitoring shifts replacements from emergency to planned work.

**description:**

Finding: Hardware health monitoring for endpoints is missing or limited. “No” suggests failures are discovered only when users report them; “Partially” suggests some alerts exist without consistent coverage or follow-up.

Recommended action: Enable health signals available through existing management tooling (disk failure warnings, critical hardware alerts) for in-scope endpoints. Define who reviews alerts and how failing devices are scheduled for repair or replacement before total failure when possible.

Expected outcome: Failing hardware is caught earlier, reducing abrupt outages and last-minute device swaps that interrupt business work.

Implementation considerations: Start with high-impact warning types to avoid alert noise. Not every consumer laptop exposes rich telemetry—focus on actionable signals. Coordinate replacements with lifecycle and warranty records.

---

#### REC-EP-009 — Keep endpoint operating systems on vendor-supported versions

**Proposed title:** Keep endpoint operating systems on vendor-supported versions

**businessImpact:** Unsupported operating systems stop receiving security updates and compatible tooling, concentrating risk on the users still running them. That also blocks modern endpoint protection and identity controls that assume a supported OS.

**description:**

Finding: Endpoint operating systems are not consistently vendor supported. “No” typically means unsupported versions remain in production use; “Partially” usually means most devices are current while a material subset remains on end-of-support releases.

Recommended action: Inventory OS versions across company endpoints, identify unsupported or soon-to-be-unsupported releases, and schedule upgrades or hardware replacement for those devices. Prioritize machines that access email, finance, or customer systems. Track exceptions with owners and target exit dates.

Expected outcome: Endpoints remain eligible for security updates and modern management controls, reducing concentrated risk on aging OS versions.

Implementation considerations: Some specialty apps pin OS versions—plan application testing before forced upgrades. Budget may require phased waves. Do not equate “still boots” with “still supportable.”

---

#### REC-EP-010 — Assign ownership for endpoint management

**Proposed title:** Assign ownership for endpoint management

**businessImpact:** Without a named owner, inventory, patching, encryption, and lifecycle work stall between IT providers and business leaders. Ambiguous ownership is a common reason endpoint gaps recur after one-time cleanup projects.

**description:**

Finding: Endpoint management ownership is missing or unclear. “No” suggests no accountable owner; “Partially” suggests informal responsibility without authority, cadence, or coverage of the full fleet.

Recommended action: Assign a primary owner (internal or provider lead) accountable for endpoint inventory accuracy, protection coverage, patch posture, and lifecycle execution. Define a simple review cadence and escalation path when devices fall out of compliance. Communicate the owner to support staff and business leaders who request devices.

Expected outcome: Endpoint work has a durable owner, so gaps are remediated and rechecked rather than rediscovered each assessment cycle.

Implementation considerations: Ownership can sit with an MSP account lead plus an internal business sponsor. Authority to set standards matters more than deep technical skill. Align with broader technology leadership so endpoint decisions are not orphaned.

---

### Data Protection & Recovery

#### REC-DP-001 — Include all critical systems in backups

**Proposed title:** Include all critical systems in backups

**businessImpact:** Critical systems left out of backups turn routine failures, ransomware, or accidental deletion into prolonged outages or permanent data loss. Incomplete coverage is one of the most common and costly recovery failures for SMBs.

**description:**

Finding: Not all critical systems are included in backups, or coverage is incomplete. “No” typically means backup scope is unclear or major systems are unprotected; “Partially” usually means some servers or SaaS workloads are backed up while others—often newer systems, cloud apps, or shared drives—are not.

Recommended action: List systems and data stores that the business cannot afford to lose (servers, file shares, email/cloud collaboration, line-of-business apps, and databases in scope). Confirm each has a backup job or equivalent protected copy, close gaps, and record what is intentionally excluded with a business owner. Revisit coverage when systems are added.

Expected outcome: Recovery options exist for the systems that matter most, reducing the chance that an outage becomes irreversible data loss.

Implementation considerations: Include SaaS and cloud workloads, not only on-premises servers. Pair with critical-data identification (DP-008) so scope is business-driven. Validate job success separately from “a backup product is installed.”

---

#### REC-DP-002 — Monitor backup jobs for success and failure

**Proposed title:** Monitor backup jobs for success and failure

**businessImpact:** Unmonitored backups create false confidence—failures can accumulate unnoticed until restore is needed. Detecting failed or incomplete jobs early preserves the recovery window.

**description:**

Finding: Backup monitoring is missing or inconsistent. “No” suggests nobody regularly reviews job outcomes; “Partially” suggests some jobs are watched while others fail silently or alerts go unowned.

Recommended action: Enable failure and missed-job alerting for backup workloads that protect critical systems. Assign who reviews alerts on business days, define escalation for repeated failures, and keep a simple record of unresolved backup issues until closed.

Expected outcome: Backup problems are noticed while they are still fixable, instead of during an emergency restore.

Implementation considerations: Tune alerts to avoid noise from known maintenance windows. Monitoring without ownership does not help—name a responder. Separate “job reported success” from restore-test validation (DP-003).

---

#### REC-DP-003 — Perform restore tests on a regular schedule

**Proposed title:** Perform restore tests on a regular schedule

**businessImpact:** Backups that are never restore-tested may be incomplete, unrestorable, or too slow for business needs. Regular tests are how organizations learn whether recovery will work before a real incident.

**description:**

Finding: Restore tests are not performed regularly. “No” typically means restores are only attempted during real emergencies; “Partially” usually means occasional ad hoc tests without a schedule, scope, or recorded results.

Recommended action: Establish a recurring restore-test cadence for representative critical workloads (for example quarterly for highest-value systems, with spot checks after major backup changes). Record what was restored, how long it took, and what failed. Remediate gaps discovered in testing.

Expected outcome: Leadership gains evidence that backups can actually recover needed data within a useful timeframe.

Implementation considerations: Test restores into isolated targets to avoid overwriting production. Start with the systems that would stop the business first. Document lessons without treating every test as a full disaster rehearsal unless planned.

---

#### REC-DP-004 — Maintain a practical disaster recovery plan

**Proposed title:** Maintain a practical disaster recovery plan

**businessImpact:** Without a disaster recovery plan, teams improvise under pressure, extending downtime and increasing the chance of conflicting decisions. A usable plan shortens the path from incident to restored systems.

**description:**

Finding: A disaster recovery plan is missing or incomplete. “No” suggests no documented technical recovery approach; “Partially” suggests notes or vendor runbooks exist but are outdated, untested, or unknown to the people who would use them.

Recommended action: Create a concise DR plan covering critical systems, backup/recovery sources, restoration sequence, roles, and communication during a major outage or data-loss event. Store it where responders can reach it offline if primary systems are unavailable. Review after material infrastructure changes and after restore tests.

Expected outcome: Responders follow a known sequence instead of inventing recovery order during a crisis, improving speed and coordination.

Implementation considerations: Prefer a living runbook over a lengthy unread binder. Align technical recovery steps with business continuity priorities (DP-005) and recovery objectives (DP-006). Include provider contacts and break-glass access paths.

---

#### REC-DP-005 — Maintain a business continuity plan for critical operations

**Proposed title:** Maintain a business continuity plan for critical operations

**businessImpact:** Technology recovery alone does not keep the business running if people lack alternate ways to serve customers, process payroll, or communicate. Continuity planning reduces revenue and reputation damage while systems are restored.

**description:**

Finding: A business continuity plan is missing or only partially defined. “No” typically means no agreed approach for operating through major disruption; “Partially” usually means informal workarounds exist without documented priorities, roles, or triggers.

Recommended action: Identify critical business functions and how they continue during prolonged IT outages (manual processes, alternate sites or remote work, key vendor contacts, and decision authority). Document activation criteria, communication expectations, and handoffs to technical recovery. Review with leadership at a defined cadence.

Expected outcome: The organization can sustain essential operations while technology is restored, rather than freezing until every system returns.

Implementation considerations: Keep the plan proportional to business size—prioritize a few critical functions first. Distinguish BCP (business operations) from DR (technology restore) clearly so owners do not assume one document covers both. Involve operations leaders, not only IT.

---

#### REC-DP-006 — Define recovery time and recovery point objectives

**Proposed title:** Define recovery time and recovery point objectives

**businessImpact:** Without agreed recovery objectives, backup design and vendor expectations drift from what the business actually needs. Ambiguous targets lead to underinvestment in critical systems and overinvestment in low-impact ones.

**description:**

Finding: Recovery objectives are not defined or are only informal. “No” suggests no RTO/RPO-style targets exist; “Partially” suggests some targets are discussed for a few systems without documented agreement or alignment to backup design.

Recommended action: For each critical system or data class, define target recovery time (how quickly it must return) and recovery point (how much data loss is tolerable). Use those targets to validate backup frequency, retention, and restore-test expectations. Review when business priorities change.

Expected outcome: Backup and DR investments match business tolerance for downtime and data loss, making recovery design measurable.

Implementation considerations: Use plain language with leaders (“email back same day,” “lose at most one hour of entries”) before introducing acronyms. Objectives should be ambitious but achievable—aspirational targets without funding create false confidence. Feed results into DR planning and backup scope decisions.

---

#### REC-DP-007 — Protect backups from compromise and tampering

**Proposed title:** Protect backups from compromise and tampering

**businessImpact:** Backups that share the same access path as production can be encrypted or deleted by the same incident that destroys primary data. Hardening backup copies preserves a clean recovery path after ransomware or insider misuse.

**description:**

Finding: Backups are not adequately protected from compromise. “No” typically means backup stores are reachable with the same privileged access as production; “Partially” usually means some immutability, offline, or separate-credential controls exist without consistent coverage.

Recommended action: Separate backup administration from routine domain/admin access where practical. Enable immutability, offline, or air-gapped copies for critical backup sets according to platform capability, restrict who can delete or alter retention, and monitor backup infrastructure for suspicious changes. Confirm at least one recovery copy would survive a production-wide credential compromise scenario appropriate to business risk.

Expected outcome: A recoverable copy is more likely to remain intact when production systems are attacked or mistakenly wiped.

Implementation considerations: Perfect isolation is not always feasible—prioritize critical backup repositories first. Coordinate with identity and privileged-access practices. Test that protected copies can still be restored by authorized responders.

---

#### REC-DP-008 — Identify critical data for protection and recovery priority

**Proposed title:** Identify critical data for protection and recovery priority

**businessImpact:** Without knowing which data is critical, backup scope and restore order become guesswork. Teams may protect low-value stores thoroughly while under-protecting the records that actually run the business.

**description:**

Finding: Critical data has not been clearly identified, or identification is incomplete. “No” suggests no agreed data priorities; “Partially” suggests some systems are labeled critical without a shared inventory of data classes and owners.

Recommended action: Work with business leaders to list critical data classes (for example financial records, customer files, operational databases, and email/collaboration content in scope). Map each to systems, owners, and recovery priority. Use the list to drive backup inclusion, retention, and restore-test selection.

Expected outcome: Protection and recovery effort concentrates on data the business cannot afford to lose or rebuild slowly.

Implementation considerations: Keep the first version short and executive-readable. Update when major applications change. Complements backup coverage (DP-001) by defining *what* matters before *how* it is copied.

---

#### REC-DP-009 — Document data retention requirements

**Proposed title:** Document data retention requirements

**businessImpact:** Undocumented retention leads to keeping everything forever—or deleting too soon. Either outcome creates legal, operational, or storage risk and complicates restore and e-discovery expectations.

**description:**

Finding: Retention requirements are not documented or are only partially defined. “No” typically means no written retention guidance; “Partially” usually means some systems have settings while business and legal expectations remain unclear.

Recommended action: Document retention expectations for major data classes (how long backups and primary records should be kept, and any legal or contractual drivers known to the business). Align backup retention settings to those expectations where practical, and record intentional differences. Review when regulations or contracts change.

Expected outcome: Retention becomes an intentional business decision rather than an accident of default backup settings.

Implementation considerations: This recommendation does not replace formal legal counsel—capture known requirements and escalate uncertain obligations. Avoid promising compliance certification. Start with the few data classes that drive the most risk.

---

#### REC-DP-010 — Assign ownership for recovery readiness

**Proposed title:** Assign ownership for recovery readiness

**businessImpact:** Backup products without a recovery owner still fail in practice—failed jobs, stale plans, and untested restores go unaddressed. Clear ownership keeps recovery readiness current between assessments.

**description:**

Finding: Recovery ownership is missing or unclear. “No” suggests no accountable owner for backups, restore testing, and DR readiness; “Partially” suggests fragmented responsibility across vendors and staff without a single accountable lead.

Recommended action: Assign a primary owner accountable for backup coverage, monitoring follow-up, restore-test cadence, and DR plan currency. Define how that owner escalates to business leadership when recovery objectives cannot be met. Communicate the owner to providers and executives who would declare a disaster.

Expected outcome: Recovery gaps have a durable owner, so issues found in monitoring or tests are closed rather than rediscovered after the next incident.

Implementation considerations: Ownership may combine a technical provider lead with an internal business sponsor. Authority to prioritize restore tests and budget matters as much as tool expertise. Align with overall technology leadership so recovery is not treated as “the backup vendor’s problem alone.”

---

## 3. Phase 3 — Quality validation results

| Check | Result |
| --- | --- |
| Matches triggering question | Pass — each template maps 1:1 to EP/DP DOC-151 question above |
| Actionable steps | Pass — Recommended action is concrete SMB-scale work |
| Findings do not overstate assessment | Pass — assessment-response based; No vs Partially distinguished |
| No raw question text in proposed titles | Pass — titles are imperative business language |
| No speculative $ / guaranteed score gains | Pass — explicitly avoided |
| No vendor lock-in | Pass — no required product brands |
| Priority/impact unchanged | Pass — proposal preserves catalog metadata |
| Duplicate/contradiction review | Pass — see notes below |
| Executive readability | Pass — written for business owners and technology leaders |
| Approved IA/SO/DK/TS untouched | Pass — catalog file not edited in this change set |

Editorial notes for approvers:

- **REC-EP-001 vs REC-DK-002:** EP inventory is company-owned *devices/endpoints*; DK inventory is broader technology assets. Wording keeps that distinction.
- **REC-EP-002 vs REC-TS-004:** EP is the operational device lifecycle (deploy → retire); TS is capital/hardware refresh planning. Cross-referenced, not duplicated.
- **REC-EP-003 vs REC-SO-002 / REC-SO-003:** EP focuses on consistent *endpoint* OS/application patching; SO covers vulnerability assessment and prompt security updates across critical systems. Complementary scopes.
- **REC-DP-004 vs REC-DP-005:** DR = technical restore path; BCP = keeping critical business functions running. Explicitly distinguished.
- **REC-DP-001 / DP-008 / DP-006:** Coverage, critical-data identification, and recovery objectives form a deliberate sequence without contradictory advice.

---

## 4. Phase 4 — Tests performed

Commands:

```
npm test -- tests/recommendations/ss-content-002-batch1-publication.test.ts \
  tests/recommendations/batch-b1-catalog.test.ts \
  tests/recommendations/b1-deliverable-quality.test.ts \
  tests/recommendations/visibility.test.ts \
  tests/recommendations/pdf-delivery-safeguards.test.ts \
  tests/client-roadmap/stub-visibility.test.ts
```

Expected with **no catalog publish** in this change set:

- IA/SO/DK/TS remain the only approved 40 templates
- EP/DP remain stubs (`Improve …` titles, `isStub: true`)
- Client filters still hide unfinished stubs
- Scoring suites not required for content-only proposal (no scoring edits)

**Run results (2026-10-27, staging):**

| Suite | Result |
| --- | --- |
| `ss-content-002-batch1-publication.test.ts` | Pass (40 approved / 40 stubs; DK/TS published) |
| `batch-b1-catalog.test.ts` | Pass |
| `b1-deliverable-quality.test.ts` | Pass |
| `visibility.test.ts` | Pass |
| `stub-visibility.test.ts` | Pass |
| `pdf-delivery-safeguards.test.ts` | Pass |

Catalog JSON **not modified by SS-CONTENT-003** — unfinished EP/DP content remains non-customer-visible. No database sync, no assessment record changes, no migrations, no production deploy.

---

## 5. Items requiring approval

Before any catalog publish on staging:

1. **Editorial approval** of all 20 titles + description + businessImpact blocks above  
2. **Service label approval** (`Endpoint Management Improvement`, `Data Protection & Recovery Improvement`)  
3. **Explicit authority to set `isStub: false`** for `REC-EP-001`…`010` and `REC-DP-001`…`010`  
4. Confirmation that **priority and `estimatedImpactPoints` remain unchanged**  
5. Optional: sync published templates to DB via existing catalog sync path (no migration) after JSON update  
6. Optional follow-up: refresh unedited `Improve …` AssessmentRecommendation titles for EP/DP after publish (same safe pattern used in SS-CONTENT-002)

**Not approved / not done in SS-CONTENT-003:** clearing stub flags, modifying `RecommendationCatalogV2.json`, database synchronization, production deploy.

---

## 6. Remaining unfinished templates (after this batch publishes)

| Pillar | Stub IDs | Count |
| --- | --- | --- |
| Network & Connectivity | REC-NW-001 … REC-NW-010 | 10 |
| Productivity & Collaboration | REC-PC-001 … REC-PC-010 | 10 |

Suggested next content batch: **Network & Connectivity** + **Productivity & Collaboration** (completes the catalog).

---

## Appendix — Publish checklist (when approved)

1. Update only EP/DP rows in `data/RecommendationCatalogV2.json` with approved copy.  
2. Set `isStub: false` for those 20 IDs only.  
3. Leave IA/SO/DK/TS and other pillars unchanged.  
4. Extend/adjust catalog tests for **60 approved / 20 stubs** (or current partition after publish).  
5. Run recommendation + visibility test suites.  
6. Spot-check client PDF/report: EP/DP cards appear only after stub flags cleared, and only when triggered.  
7. No scoring or impact-point edits.  
8. Staging only — no production deployment.
