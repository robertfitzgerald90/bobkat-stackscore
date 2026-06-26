# DOC-105 – Project Generation Specification

**Document ID:** DOC-105
**Version:** 0.1
**Status:** Draft (Stage A stub)
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

Project Generation defines how approved items from a Technology Improvement Plan or Roadmap become trackable **Projects** in StackScore during the BTIL **Implement** phase.

The v1 application supports manual project creation from recommendations. This specification will define automated and bulk generation rules for v2.

---

# Project Generation Rules (minimum)

* One primary project per approved improvement opportunity (consolidated recommendations may map to one project)
* Project inherits: title, priority, suggested service, linked recommendation(s), estimated impact
* Project status workflow: `proposed` → `approved` → `scheduled` → `in_progress` → `completed` / `cancelled`
* Completing a project marks linked recommendation `completed` and prompts reassessment
* `actualImpactPoints` measured only via reassessment (per DOC-111A Appendix A)

---

# v1 Implementation Note

Current app: manual project creation from assessment results UI. See [MVP_PRD.md](MVP_PRD.md) PJ-01–04.

---

# Related Documents

* [DOC-103 – Technology Improvement Plan Specification](DOC-103%20%E2%80%93%20Technology%20Improvement%20Plan%20Specification.md)
* [DOC-104 – Technology Roadmap Specification](DOC-104%20%E2%80%93%20Technology%20Roadmap%20Specification.md)
* [DOC-113 – Technology Profile Specification](DOC-113%20%E2%80%93%20Technology%20Profile%20Specification.md)
* [DOC-301 – Database Schema Specification](DOC-301%20%E2%80%93%20Database%20Schema%20Specification.md)

---

# Revision History

| Version | Date | Author | Changes |
| ------- | ---- | ------ | ------- |
| 0.1 | 2026-06-25 | BobKat IT | Stage A stub — full spec pending |
