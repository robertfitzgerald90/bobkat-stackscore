# SS-CONTENT-005 — Recommendation Catalog Completion (Batch 3)

| Field | Value |
| --- | --- |
| Status | **Content proposed — awaiting approval (not published)** |
| Date | 2026-10-27 |
| Branch | `staging` |
| Scope | Network & Connectivity (10) + Productivity & Collaboration (10) |
| Catalog file | `data/RecommendationCatalogV2.json` |
| Constraints | Stub flags retained; impact points / priorities / IDs / mappings unchanged; scoring untouched; no production deploy; **catalog JSON not modified in this release** |

---

## 1. Phase 1 — Catalog inventory

### Schema (per template)

| Field | Notes |
| --- | --- |
| `id` | Stable `REC-{pillar}-{nnn}` |
| `questionId` | 1:1 DOC-151 question (`NW-###` / `PC-###`) |
| `pillarCode` / `pillarName` | Eight Technology Maturity pillars |
| `title`, `description`, `businessImpact` | Customer-facing copy when `isStub: false` |
| `suggestedService` | Service label for delivery planning |
| `priority`, `estimatedImpactPoints` | **Do not change in this batch** |
| `triggerAnswers`, `alsoTriggerOnPartial` | No / Partially |
| `isStub` | Fail-closed customer gate (SS-OPT-003 / visibility filter) |

Approved description structure (IA/SO/DK/TS/EP/DP pattern):

`Finding:` → `Recommended action:` → `Expected outcome:` → `Implementation considerations:`

### Inventory summary (current staging catalog after SS-CONTENT-004)

| Pillar | Approved (`isStub: false`) | Unfinished stubs |
| --- | --- | --- |
| Identity & Access | **10** | 0 |
| Security Operations | **10** | 0 |
| Documentation & Knowledge | **10** | 0 |
| Technology Strategy | **10** | 0 |
| Endpoint Management | **10** | 0 |
| Data Protection & Recovery | **10** | 0 |
| Network & Connectivity | 0 | **10** ← Batch 3 |
| Productivity & Collaboration | 0 | **10** ← Batch 3 |
| **Total** | **60** | **20** |

### Stub visibility

Clients never receive `isStub: true` rows (`filterClientDeliverableRecommendations`). Titles starting with `Improve ` are also fail-closed. **This batch does not clear `isStub`.**

### Approved recommendations

All previously published pillars (IA, SO, DK, TS, EP, DP) were left untouched. Catalog JSON was **not edited** for this proposal.

### Question mappings (Batch 3)

| Template | Question | Current stub title pattern |
| --- | --- | --- |
| REC-NW-001 | NW-001 Is business-grade networking equipment used? | Improve Network & Connectivity: … |
| REC-NW-002 | NW-002 Is a properly configured firewall protecting the network? | … |
| REC-NW-003 | NW-003 Is wireless reliable and secure? | … |
| REC-NW-004 | NW-004 Is the network segmented appropriately? | … |
| REC-NW-005 | NW-005 Is remote connectivity secure? | … |
| REC-NW-006 | NW-006 Is there an appropriate internet resilience strategy? | … |
| REC-NW-007 | NW-007 Are DNS, DHCP and core services maintained? | … |
| REC-NW-008 | NW-008 Is the network monitored proactively? | … |
| REC-NW-009 | NW-009 Is physical infrastructure maintained? | … |
| REC-NW-010 | NW-010 Is network documentation current? | … |
| REC-PC-001 | PC-001 Is a centralized productivity platform used? | Improve Productivity & Collaboration: … |
| REC-PC-002 | PC-002 Can employees securely access required files? | … |
| REC-PC-003 | PC-003 Is document organization standardized? | … |
| REC-PC-004 | PC-004 Are collaboration tools standardized? | … |
| REC-PC-005 | PC-005 Is secure mobile work supported? | … |
| REC-PC-006 | PC-006 Are business applications standardized? | … |
| REC-PC-007 | PC-007 Are software licenses managed? | … |
| REC-PC-008 | PC-008 Have manual workflows been improved through technology? | … |
| REC-PC-009 | PC-009 Do employees have the technology needed to succeed? | … |
| REC-PC-010 | PC-010 Has responsibility for productivity improvements been assigned? | … |

Preserved metadata (unchanged in proposal):

| ID | Priority | Impact pts |
| --- | --- | --- |
| REC-NW-001 | medium | 6 |
| REC-NW-002 | critical | 10 |
| REC-NW-003 | high | 8 |
| REC-NW-004 | critical | 10 |
| REC-NW-005 | high | 8 |
| REC-NW-006 | medium | 6 |
| REC-NW-007 | high | 8 |
| REC-NW-008 | high | 8 |
| REC-NW-009 | low | 4 |
| REC-NW-010 | low | 4 |
| REC-PC-001 | critical | 10 |
| REC-PC-002 | critical | 10 |
| REC-PC-003 | medium | 6 |
| REC-PC-004 | high | 8 |
| REC-PC-005 | medium | 6 |
| REC-PC-006 | high | 8 |
| REC-PC-007 | low | 4 |
| REC-PC-008 | high | 8 |
| REC-PC-009 | low | 4 |
| REC-PC-010 | low | 3 |

Proposed `suggestedService` labels (for approval with publish):

- Network & Connectivity → **Network & Connectivity Improvement**
- Productivity & Collaboration → **Productivity & Collaboration Improvement**

---

## 2. Phase 2 — Proposed Batch 3 content

> **Publication rule:** Apply to `RecommendationCatalogV2.json` and set `isStub: false` **only after explicit approval**. Until then, catalog stubs remain as-is so customers cannot see unfinished copy.

Partial vs absent: each Finding notes that “No” implies missing or negligible practice and “Partially” implies incomplete coverage.

---

### Network & Connectivity

#### REC-NW-001 — Use business-grade networking equipment for critical paths

**Proposed title:** Use business-grade networking equipment for critical paths

**businessImpact:** Consumer-grade routers, switches, or wireless gear on critical business paths increase outage risk, limit supportability, and make security controls harder to apply consistently. Hardware that cannot be managed or replaced quickly also extends downtime during failures.

**description:**

Finding: Business-grade networking equipment is missing or only partially in place based on the assessment response. “No” typically means consumer or unmanaged gear sits on critical paths; “Partially” usually means some sites or segments use business-class equipment while others do not.

Recommended action: Identify networking devices that carry business traffic (internet edge, core switching, wireless controllers/APs serving offices, and site-to-site links). Replace or isolate consumer-grade devices on those paths with manageable business-class equipment appropriate to size and risk. Record make/model, support contacts, and warranty or subscription status for the in-scope fleet.

Expected outcome: Core connectivity is more reliable and supportable, with clearer paths for configuration, monitoring, and replacement when devices fail.

Implementation considerations: Prioritize the internet edge and shared office infrastructure before specialty closets. Reuse existing cabling and rack space where practical. Coordinate cutovers outside peak business hours. Complements Technology Strategy hardware lifecycle planning without duplicating endpoint device refresh work.

---

#### REC-NW-002 — Protect the network with a properly configured firewall

**Proposed title:** Protect the network with a properly configured firewall

**businessImpact:** Without a properly configured firewall at the network edge, unauthorized inbound access and poorly controlled outbound paths increase breach and ransomware risk. Misconfigured or unused firewalls create a false sense of protection while leaving business systems exposed.

**description:**

Finding: Firewall protection is missing, unmanaged, or incompletely configured. “No” typically means no business firewall is in place or rules are effectively open; “Partially” usually means a firewall exists but defaults, unused rules, or unmanaged changes leave material gaps.

Recommended action: Place a managed firewall at the primary internet edge (and secondary edges where separate circuits exist). Define allow rules based on business need, remove unused or overly broad permits, enable logging for security-relevant events, and assign who reviews rule changes. Confirm remote-access and published services are intentional rather than accidental.

Expected outcome: Inbound and outbound traffic follow known business needs, reducing exposure from open ports and unmanaged edge devices.

Implementation considerations: Schedule rule reviews after major application or VPN changes. Coordinate with Security Operations monitoring so firewall logs are watched. Avoid vendor lock-in language—focus on configuration ownership and change control. Do not equate “firewall appliance present” with “rules are appropriate.”

---

#### REC-NW-003 — Make wireless connectivity reliable and secure

**Proposed title:** Make wireless connectivity reliable and secure

**businessImpact:** Unreliable or weakly secured wireless slows staff, invites guest/device sprawl onto business networks, and creates a common path for unauthorized access. Dead zones and shared passwords also drive shadow hotspots that bypass intended controls.

**description:**

Finding: Wireless is not reliably secure or performant across business locations. “No” typically means coverage, capacity, or security basics are absent; “Partially” usually means some areas work well while guest networks, shared credentials, or weak encryption remain.

Recommended action: Assess coverage for primary work areas and meeting spaces, separate guest from business SSIDs, and require modern encryption with unique or directory-backed access rather than a single shared password for staff networks. Remediate dead zones and interference that block business work. Document SSID purpose and who may join each network.

Expected outcome: Staff can connect productively while guest and unknown devices stay off business segments, reducing both downtime friction and wireless-borne risk.

Implementation considerations: Survey before buying denser hardware. Align guest access with acceptable-use expectations. Coordinate with network segmentation so wireless gains are not undermined by flat LAN design (NW-004).

---

#### REC-NW-004 — Segment the network to limit unnecessary access

**Proposed title:** Segment the network to limit unnecessary access

**businessImpact:** Flat networks let a single compromised device or guest reach servers, backups, and line-of-business systems. Appropriate segmentation contains incidents and reduces accidental access to sensitive systems.

**description:**

Finding: Network segmentation is missing or incomplete. “No” typically means a flat LAN where most devices share broad reachability; “Partially” usually means some VLANs or zones exist without consistent enforcement for guests, IoT, servers, or remote-access entry points.

Recommended action: Define practical zones for at least business workstations, servers/line-of-business systems, guests, and any IoT or specialty devices in scope. Enforce separation with firewall or switch controls so zones only exchange traffic required for business functions. Document allowed paths and revisit when new systems are added.

Expected outcome: Compromise or misbehavior in one zone is less likely to reach critical systems immediately, improving containment and support clarity.

Implementation considerations: Start with high-value separations (guest vs business, workstations vs servers/backups) rather than an elaborate microsegmentation program. Test print, VoIP, and application paths after changes. Align with firewall rule hygiene (NW-002) and remote-access design (NW-005).

---

#### REC-NW-005 — Secure remote connectivity for offsite access

**Proposed title:** Secure remote connectivity for offsite access

**businessImpact:** Insecure remote access (shared credentials, exposed remote desktop, or unmanaged tunnels) is a frequent entry point for account takeover and ransomware. Weak remote design also makes support and offboarding unreliable.

**description:**

Finding: Remote connectivity is not securely designed or consistently applied. “No” typically means ad hoc remote access without a managed standard; “Partially” usually means some staff use secure methods while others rely on exposed services or shared access paths.

Recommended action: Standardize on a managed remote-access approach (for example VPN or equivalent brokered access) with unique user authentication and MFA where the identity platform supports it. Disable unused direct remote-desktop exposure to the internet. Define who may grant remote access and how access is removed at offboarding.

Expected outcome: Offsite work uses a known, controlled path, reducing exposure from open remote services and shared remote credentials.

Implementation considerations: Coordinate with Identity & Access for MFA and joiner/mover/leaver processes—this recommendation focuses on the network remote-access path, not full identity redesign. Test performance for common business apps. Document break-glass access for IT support.

---

#### REC-NW-006 — Establish an internet resilience strategy for business continuity

**Proposed title:** Establish an internet resilience strategy for business continuity

**businessImpact:** Single-circuit internet failure stops cloud apps, payments, VoIP, and remote work for many SMBs. Without a resilience plan, outages become all-or-nothing events with no agreed temporary path.

**description:**

Finding: An appropriate internet resilience strategy is missing or incomplete. “No” typically means a single circuit with no failover plan; “Partially” usually means a backup path exists but is untested, undersized, or unknown to staff who would use it.

Recommended action: Document primary and backup internet options (secondary circuit, LTE/5G failover, or temporary hotspot policy for critical roles). Define what must stay online first (payments, email/collaboration, phone, line-of-business apps). Test failover at a defined cadence and record who declares and communicates an outage.

Expected outcome: Internet disruptions become manageable degradations with a known temporary path, rather than complete business freezes.

Implementation considerations: Match investment to downtime tolerance—resilience can be a tested process before a second dedicated circuit. Align with Data Protection business continuity planning for non-network workarounds. Avoid overpromising carrier SLAs the organization does not purchase.

---

#### REC-NW-007 — Maintain DNS, DHCP, and other core network services

**Proposed title:** Maintain DNS, DHCP, and other core network services

**businessImpact:** When DNS, DHCP, or related core services are unstable or undocumented, users lose connectivity even when circuits and firewalls are healthy. Informal “someone’s PC is the DHCP server” patterns create fragile single points of failure.

**description:**

Finding: DNS, DHCP, and related core services are not consistently maintained. “No” typically means unmanaged or unknown ownership of these services; “Partially” usually means they work day-to-day without backups, documentation, or clear change control.

Recommended action: Identify where DNS and DHCP (and any other critical name/address services in scope) run today. Place them on supported infrastructure with configuration backups, define who may change scopes and records, and document recovery steps if the service host fails. Eliminate temporary or desktop-hosted core services on business networks.

Expected outcome: Address and name resolution remain available and recoverable, reducing unexplained “network is down” incidents that are actually core-service failures.

Implementation considerations: Coordinate changes carefully—DHCP/DNS mistakes can outage an entire site. Keep reverse/forward DNS aligned for key servers. Pair with monitoring (NW-008) so service failures alert before users flood the help desk.

---

#### REC-NW-008 — Monitor the network for availability and performance issues

**Proposed title:** Monitor the network for availability and performance issues

**businessImpact:** Without proactive network monitoring, outages and degraded circuits are discovered only when users complain. Late detection extends downtime and makes root-cause analysis harder after the fact.

**description:**

Finding: Proactive network monitoring is missing or limited. “No” typically means no availability or performance monitoring for critical network paths; “Partially” usually means some devices are watched while circuits, wireless controllers, or remote sites are not.

Recommended action: Monitor critical network devices and internet/edge availability with alerting to an accountable responder. Include basic signals such as device down, high utilization, or circuit loss for in-scope sites. Review recurring alerts and close noisy or orphaned monitors.

Expected outcome: Network problems are noticed earlier, shortening outages and reducing reliance on user reports as the primary detection method.

Implementation considerations: Start with a small set of high-value monitors to avoid alert fatigue. This recommendation focuses on network health/availability—not full security-event detection covered under Security Operations. Align after-hours expectations with business risk.

---

#### REC-NW-009 — Maintain physical network infrastructure in workable condition

**Proposed title:** Maintain physical network infrastructure in workable condition

**businessImpact:** Neglected cabling, power, cooling, or closet organization causes intermittent faults that are expensive to diagnose. Physical neglect also raises accidental disconnect and environmental failure risk.

**description:**

Finding: Physical network infrastructure maintenance is missing or inconsistent. “No” typically means closets, cabling, or power for network gear are neglected; “Partially” usually means some sites are orderly while others have unlabeled patching, UPS gaps, or environmental issues.

Recommended action: Inspect primary network closets and racks for safe power, reasonable airflow, labeled patching, and clear access. Remediate damaged cabling and unsupported mounting. Establish a light periodic check (for example quarterly) for critical sites and after moves or renovations.

Expected outcome: Physical faults and accidental outages decline, and support staff can work in closets without guesswork.

Implementation considerations: Keep scope proportional—focus on rooms that house edge and core gear. Coordinate electrical or HVAC work with facilities. Low priority relative to firewall and segmentation gaps, but often cheap to improve.

---

#### REC-NW-010 — Keep network documentation current after changes

**Proposed title:** Keep network documentation current after changes

**businessImpact:** Stale network diagrams and inventories slow incident response and make vendor handoffs unreliable. Documentation that exists but is never updated after changes recreates tribal-knowledge risk.

**description:**

Finding: Network documentation is not kept current. “No” typically means usable network docs are absent or abandoned; “Partially” usually means initial diagrams exist but are outdated after moves, circuit changes, or equipment swaps.

Recommended action: Maintain a practical network package (sites, circuits, edge devices, major VLANs/zones, and critical paths) and update it after material changes. Assign who updates the package and where the current version is stored. Spot-check currency during planned maintenance windows.

Expected outcome: Support staff and providers can orient quickly during outages and changes without reconstructing the network from memory.

Implementation considerations: Complements Documentation & Knowledge network documentation recommendations by focusing on *currency after change*, not the first-time creation of a full documentation program. Prefer simple living diagrams over elaborate unused tools. Protect docs that reveal addressing or credentials.

---

### Productivity & Collaboration

#### REC-PC-001 — Adopt a centralized productivity platform for core work

**Proposed title:** Adopt a centralized productivity platform for core work

**businessImpact:** Fragmented email, files, and calendars across personal or one-off tools create support chaos, weak offboarding, and inconsistent security controls. A centralized productivity platform gives leadership a manageable baseline for day-to-day work.

**description:**

Finding: A centralized productivity platform is missing or only partially adopted. “No” typically means core collaboration still relies on personal accounts or disconnected tools; “Partially” usually means a platform exists but material teams remain outside it.

Recommended action: Select or complete rollout of a primary productivity suite for email, calendar, and core file collaboration for in-scope staff. Migrate remaining holdouts with a cutover plan, and retire personal-account use for business communication where policy requires. Confirm identity join/leave processes cover the platform.

Expected outcome: Employees work in a common, administrable environment, improving supportability and making security and retention controls practical.

Implementation considerations: Plan migration waves by department. Confirm licensing and mailbox/file size needs before forced cutover. Coordinate with Identity & Access for sign-in standards. Remain vendor-agnostic in delivery—focus on centralization and ownership.

---

#### REC-PC-002 — Enable secure employee access to required business files

**Proposed title:** Enable secure employee access to required business files

**businessImpact:** When staff cannot reliably and securely reach the files they need, work shifts to email attachments, USB drives, and unsanctioned sharing. That slows execution and increases data-leak and version-chaos risk.

**description:**

Finding: Secure access to required files is incomplete. “No” typically means no dependable shared file approach for core roles; “Partially” usually means some teams have structured access while others rely on insecure workarounds.

Recommended action: Provide a standard, permissioned way for employees to reach the business files they need (cloud file platform and/or secured file shares in scope). Define access by role, enable secure remote access paths, and reduce reliance on emailed attachments for living documents. Review permissions when people change roles.

Expected outcome: Staff find and update authoritative files without unsafe sharing shortcuts, improving both productivity and control.

Implementation considerations: Start with the highest-friction teams (remote workers, multi-site groups). Align permissions with least privilege. Complements Data Protection backup scope once file locations are known. Avoid promising a full records-management program in the first pass.

---

#### REC-PC-003 — Standardize how business documents are organized

**Proposed title:** Standardize how business documents are organized

**businessImpact:** Ad hoc folder sprawl and inconsistent naming waste time and cause version errors. Standardization reduces search friction and makes onboarding and audits far simpler.

**description:**

Finding: Document organization is not standardized. “No” typically means no agreed structure for shared business files; “Partially” usually means some departments follow conventions while others do not.

Recommended action: Define a simple organization standard for shared workspaces (top-level structure, naming conventions, and ownership of key libraries). Migrate or map high-value content into that structure, and publish brief guidance for staff. Assign library owners who keep structures from re-fragmenting.

Expected outcome: Employees spend less time hunting for files, and shared content remains navigable as the organization grows.

Implementation considerations: Keep the standard lightweight—overdesigned taxonomies fail. Do not boil the ocean; prioritize active business libraries first. Pair with PC-002 so organization work lands in the approved access platform.

---

#### REC-PC-004 — Standardize collaboration tools for teams

**Proposed title:** Standardize collaboration tools for teams

**businessImpact:** Multiple chat, meeting, and whiteboard tools fragment conversations and complicate security and retention. Standardization reduces tool sprawl and makes support and training feasible.

**description:**

Finding: Collaboration tools are not standardized. “No” typically means teams pick tools independently; “Partially” usually means a preferred stack exists but unsanctioned alternatives remain common for day-to-day work.

Recommended action: Designate approved collaboration tools for messaging, meetings, and team workspaces. Communicate the standard, migrate high-traffic teams, and retire redundant tools where practical. Define how exceptions are requested and reviewed.

Expected outcome: Teams collaborate in fewer, supported channels, improving findability of decisions and reducing shadow-IT sprawl.

Implementation considerations: Choose tools that integrate with the productivity platform where possible. Address cultural adoption—mandate without enablement fails. Distinct from PC-001 (core productivity suite) by focusing on team collaboration channels and meeting norms.

---

#### REC-PC-005 — Support secure mobile and on-the-go work

**Proposed title:** Support secure mobile and on-the-go work

**businessImpact:** Mobile work without a supported pattern pushes staff toward personal email, unsecured apps, and local copies of business data. A clear secure-mobile approach protects productivity for field and traveling roles.

**description:**

Finding: Secure mobile work is not adequately supported. “No” typically means no approved way to work from phones/tablets; “Partially” usually means some apps work while others force insecure workarounds.

Recommended action: Define which business functions must work on mobile (email, files, line-of-business apps in scope) and enable them through approved apps or secure browser access. Set expectations for device PIN/biometrics and lost-device reporting. Limit download of sensitive files to unmanaged personal devices where policy requires.

Expected outcome: Mobile and traveling staff can complete essential work through supported channels instead of unsafe improvisation.

Implementation considerations: Complements Endpoint encryption recommendations by focusing on *how work is done on mobile*, not solely full-disk encryption of company laptops. Clarify BYOD vs company-owned device rules. Start with the roles that travel most.

---

#### REC-PC-006 — Standardize core business applications

**Proposed title:** Standardize core business applications

**businessImpact:** Uncontrolled application variety increases license cost, training burden, and integration failures. Standardization improves supportability and makes security reviews practical.

**description:**

Finding: Business applications are not standardized. “No” typically means teams adopt tools independently for the same job; “Partially” usually means preferred applications exist without consistent enforcement or retirement of duplicates.

Recommended action: Inventory applications used for major business functions, designate preferred standards where duplication exists, and plan consolidation or controlled exceptions. Publish an approved application list for common roles and review additions through a lightweight intake process.

Expected outcome: Support, training, and security effort concentrate on a manageable application set rather than an ever-growing shadow portfolio.

Implementation considerations: Distinct from Technology Strategy application *review cadence* (strategy/governance)—this recommendation focuses on operational standardization for day-to-day productivity. Involve department owners so standards are usable. Do not force specialty tools into a one-size-fits-all suite.

---

#### REC-PC-007 — Manage software licenses intentionally

**Proposed title:** Manage software licenses intentionally

**businessImpact:** Unmanaged licenses cause overspending, surprise true-ups, and compliance exposure—or leave staff without seats they need. Intentional license management ties spend to actual use.

**description:**

Finding: Software license management is missing or incomplete. “No” typically means no clear inventory of entitlements and assignments; “Partially” usually means some major suites are tracked while others are purchased ad hoc.

Recommended action: Maintain a living view of major software entitlements, assigned users, and renewal dates for productivity and line-of-business tools in scope. Reclaim unused seats during offboarding and before renewals. Align purchases to the approved application standards where practical.

Expected outcome: License spend better matches real usage, and renewal surprises decline.

Implementation considerations: Complements Documentation & Knowledge licensing/warranty *recordkeeping* by focusing on active assignment and renewal management for software seats. Start with the highest-cost suites. Avoid legal certification claims—capture known entitlements and escalate unclear obligations.

---

#### REC-PC-008 — Improve high-friction manual workflows with technology

**Proposed title:** Improve high-friction manual workflows with technology

**businessImpact:** Manual, repetitive workflows consume staff time and introduce errors that technology can often reduce. Leaving known friction unaddressed caps productivity gains from platforms the organization already owns.

**description:**

Finding: Manual workflows have not been systematically improved with technology. “No” typically means known paper/email-heavy processes remain untouched; “Partially” usually means a few automations exist without a prioritized pipeline of improvements.

Recommended action: Identify a short list of high-friction manual processes (for example intake, approvals, status tracking, or handoffs). Select one or two to improve using existing productivity/collaboration capabilities or lightweight workflow tools. Measure whether handoff time or error rates improve, then iterate.

Expected outcome: Staff reclaim time from repetitive work, and process quality becomes less dependent on heroic manual effort.

Implementation considerations: Prefer improving processes the business already owns over buying new platforms first. Avoid automation theater—pick workflows with clear owners and measurable pain. Do not promise enterprise-wide transformation in a single engagement.

---

#### REC-PC-009 — Ensure employees have the technology needed to succeed

**Proposed title:** Ensure employees have the technology needed to succeed

**businessImpact:** Underpowered devices, missing peripherals, or lack of required software create quiet productivity losses and workarounds. Equipping roles appropriately is foundational to every other productivity investment.

**description:**

Finding: Employees do not consistently have the technology needed to succeed. “No” typically means material role gaps in devices or required tools; “Partially” usually means some teams are well equipped while others operate with chronic deficits.

Recommended action: Define role-based technology baselines (device class, core apps, and peripherals) for major job families. Survey or sample gaps against that baseline, and remediate the highest-impact shortages first. Revisit baselines when roles or software standards change.

Expected outcome: Staff can perform expected work without fighting inadequate tools, improving throughput and reducing shadow purchases.

Implementation considerations: Coordinate with Endpoint lifecycle and Technology Strategy refresh planning for hardware. Keep baselines realistic for SMB budgets. Capture exceptions intentionally rather than letting gaps linger silently.

---

#### REC-PC-010 — Assign ownership for productivity and collaboration improvements

**Proposed title:** Assign ownership for productivity and collaboration improvements

**businessImpact:** Without a named owner, platform sprawl, license waste, and workflow friction recur after one-time cleanups. Durable ownership keeps productivity standards current as teams and tools change.

**description:**

Finding: Responsibility for productivity improvements is missing or unclear. “No” suggests no accountable owner; “Partially” suggests informal interest without authority, cadence, or coverage across departments.

Recommended action: Assign a primary owner (internal lead and/or provider counterpart) accountable for productivity platform standards, collaboration tool governance, and the improvement backlog for high-friction workflows. Define a simple review cadence with business stakeholders. Communicate the owner to department managers who request new tools.

Expected outcome: Productivity gaps have a durable owner, so standards and improvements persist between assessment cycles.

Implementation considerations: Ownership can combine an operations or office lead with IT/provider support. Authority to set standards matters more than deep technical skill. Align with overall technology leadership so tool decisions are not orphaned.

---

## 3. Phase 3 — Quality validation results

| Check | Result |
| --- | --- |
| Matches triggering question | Pass — each template maps 1:1 to NW/PC DOC-151 question above |
| Actionable steps | Pass — Recommended action is concrete SMB-scale work |
| Findings do not overstate assessment | Pass — assessment-response based; No vs Partially distinguished |
| No raw question text in proposed titles | Pass — titles are imperative business language |
| No speculative $ / guaranteed score gains | Pass — explicitly avoided |
| No vendor lock-in | Pass — no required product brands |
| Priority/impact unchanged | Pass — proposal preserves catalog metadata |
| Duplicate/contradiction review | Pass — see notes below |
| Executive readability | Pass — written for business owners and technology leaders |
| Approved IA/SO/DK/TS/EP/DP untouched | Pass — catalog file not edited in this change set |

Editorial notes for approvers:

- **REC-NW-010 vs REC-DK-001:** DK establishes practical network documentation; NW-010 focuses on keeping network documentation *current after changes*.
- **REC-NW-008 vs REC-SO-001:** SO covers security-event monitoring; NW-008 covers network availability/performance monitoring.
- **REC-NW-005 vs Identity recommendations:** NW focuses on the remote-access *network path*; MFA/identity lifecycle remain IA-scoped.
- **REC-PC-007 vs REC-DK-007:** DK covers licensing/warranty *records*; PC covers active software seat assignment and renewals.
- **REC-PC-006 vs REC-TS-005:** TS is strategic application review cadence; PC is operational standardization of day-to-day business apps.
- **REC-PC-005 vs REC-EP-005:** EP is portable-device encryption; PC is secure mobile work patterns and approved access.

---

## 4. Phase 4 — Tests performed

Commands:

```
npm test -- tests/recommendations/ss-content-004-batch2-publication.test.ts \
  tests/recommendations/batch-b1-catalog.test.ts \
  tests/recommendations/b1-deliverable-quality.test.ts \
  tests/recommendations/visibility.test.ts \
  tests/recommendations/pdf-delivery-safeguards.test.ts \
  tests/client-roadmap/stub-visibility.test.ts
```

Expected with **no catalog publish** in this change set:

- IA/SO/DK/TS/EP/DP remain the only approved **60** templates
- NW/PC remain stubs (`Improve …` titles, `isStub: true`)
- Client filters still hide unfinished stubs
- Scoring suites not required for content-only proposal (no scoring edits)

**Run results (2026-10-27, staging):**

| Suite | Result |
| --- | --- |
| `ss-content-004-batch2-publication.test.ts` | Pass (60 approved / 20 stubs; EP/DP published) |
| `batch-b1-catalog.test.ts` | Pass |
| `b1-deliverable-quality.test.ts` | Pass |
| `visibility.test.ts` | Pass |
| `stub-visibility.test.ts` | Pass |
| `pdf-delivery-safeguards.test.ts` | Pass |

Catalog JSON **not modified by SS-CONTENT-005** — unfinished NW/PC content remains non-customer-visible. No database sync, no assessment record changes, no migrations, no production deploy.

Verified at proposal time: all 20 NW/PC rows still `isStub: true` with mechanical Improve titles; overall partition remains **60 approved / 20 stubs**.

---

## 5. Items requiring approval

Before any catalog publish on staging:

1. **Editorial approval** of all 20 titles + description + businessImpact blocks above  
2. **Service label approval** (`Network & Connectivity Improvement`, `Productivity & Collaboration Improvement`)  
3. **Explicit authority to set `isStub: false`** for `REC-NW-001`…`010` and `REC-PC-001`…`010`  
4. Confirmation that **priority and `estimatedImpactPoints` remain unchanged**  
5. Optional: sync published templates to DB via existing catalog sync path (no migration) after JSON update  
6. Optional follow-up: refresh unedited `Improve …` AssessmentRecommendation titles for NW/PC after publish (same safe pattern used in SS-CONTENT-002/004)

**Not approved / not done in SS-CONTENT-005:** clearing stub flags, modifying `RecommendationCatalogV2.json`, database synchronization, production deploy.

---

## 6. Remaining unfinished templates (after this batch publishes)

| Pillar | Stub IDs | Count |
| --- | --- | --- |
| *(none)* | — | **0** |

Publishing Batch 3 completes the v2 recommendation catalog (**80 approved / 0 stubs**).

---

## Appendix — Final catalog publication checklist (when approved)

1. Update only NW/PC rows in `data/RecommendationCatalogV2.json` with approved copy.  
2. Set `isStub: false` for those 20 IDs only.  
3. Leave IA/SO/DK/TS/EP/DP unchanged.  
4. Extend/adjust catalog tests for **80 approved / 0 stubs**.  
5. Retarget any remaining stub-exemplar fixtures that still assume unfinished templates.  
6. Run recommendation + visibility + projection + PDF safeguard suites.  
7. Sync staging DB with existing catalog sync + Improve-title refresh for NW/PC only.  
8. Spot-check ABC LLC: score remains **39**; NW/PC appear only when triggered; dashboard and PDF counts agree.  
9. No scoring or impact-point edits.  
10. Staging only — no production deployment.
