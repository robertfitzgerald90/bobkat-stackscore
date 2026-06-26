# DOC-106 – Solution Playbook Specification

**Document ID:** DOC-106
**Version:** 0.1
**Status:** Draft (Stage A stub)
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

Solution Playbooks are reusable remediation packages that bridge **assessment capabilities** to **BobKat IT services**. They standardize how improvement opportunities are described, scoped, and priced.

Playbooks are referenced by [DOC-112 – Recommendation Engine](DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md), [DOC-114 – Assessment Library](DOC-114%20%E2%80%93%20Assessment%20Library%20Specification.md), and category libraries DOC-114A–G.

---

# Playbook Components (minimum)

| Field | Description |
| ----- | ----------- |
| Playbook ID | Unique identifier (e.g. `PB-M365-SECURITY`) |
| Title | Client-facing name |
| Capability | Linked assessment capability |
| Technology Category | One of seven v2 categories |
| Executive Summary | Business outcome description |
| Services | One or more [DOC-100](DOC-100%20%E2%80%93%20Service%20Catalog.md) services |
| Technologies | Optional [DOC-101](DOC-101%20%E2%80%93%20Approved%20Technology%20Cat.md) references |
| Estimated Effort | Hours range |
| Estimated Impact | Technology Profile / StackScore improvement |
| Default Priority | critical / high / medium / low / informational |

---

# v1 Interim

Until playbooks are implemented, `RecommendationRuleCatalog.json` templates and consolidation groups act as playbook proxies.

---

# Related Documents

* [DOC-100 – Service Catalog Specification](DOC-100%20%E2%80%93%20Service%20Catalog.md)
* [DOC-101 – Approved Technology Catalog Specification](DOC-101%20%E2%80%93%20Approved%20Technology%20Cat.md)
* [DOC-112 – Recommendation Engine Specification](DOC-112%20%E2%80%93%20Recommendation%20Engine%20Specification.md)
* [DOC-114 – Assessment Library Specification](DOC-114%20%E2%80%93%20Assessment%20Library%20Specification.md)
* [DOC-102 – Pricing Engine Specification](DOC-102%20%E2%80%93%20Pricing%20Engine%20Specific.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 0.1 | 2026-06-25 | BobKat IT | Stage A stub — full spec pending |
