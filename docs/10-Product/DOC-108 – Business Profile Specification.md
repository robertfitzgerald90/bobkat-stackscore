Create DOC-108 – Business Profile Specification Version 1.0.

Purpose:

DOC-108 defines the Business Profile for every StackScore client.

The Business Profile captures the essential business context required to produce more relevant assessments, recommendations, Technology Improvement Plans, and Technology Roadmaps.

The Business Profile is intentionally lightweight.

It is not intended to replace a CRM or become a repository for excessive company information.

Its purpose is to provide enough business context to make better technology consulting decisions.

Important:

* Do not generate application code.
* Do not modify database schema.
* This is a business architecture specification only.

---

## Core Philosophy

Technology should always be evaluated in the context of the business it supports.

The Business Profile provides that context.

The Business Profile should be completable during an initial client meeting in less than five minutes.

Every field in the Business Profile must directly influence one or more of the following:

* Assessments
* Recommendations
* Technology Improvement Plans
* Technology Roadmaps
* Quarterly Business Reviews
* Technology Profile

If a field does not improve consulting decisions, it should not exist.

---

## Business Profile Sections

### Company

Collect:

* Company Name
* Industry
* Employee Count
* Number of Locations

---

### Business

Collect:

Primary Business Goal

Suggested values:

* Improve Cybersecurity
* Reduce Downtime
* Support Growth
* Increase Productivity
* Improve Compliance
* Standardize Technology
* Reduce IT Costs
* Modernize Infrastructure
* Other

Highest Technology Priority

Technology Vision

Technology Vision should be limited to a short free-text statement answering:

"Where does this organization want its technology to be within the next three to five years?"

Examples:

* Cloud-first infrastructure
* Achieve CMMC compliance
* Eliminate legacy servers
* Improve operational resilience
* Support expansion
* Standardize infrastructure

---

### Compliance

Collect:

Compliance Framework

Suggested values:

* None
* CMMC
* NIST 800-171
* ISO 27001
* HIPAA
* PCI DSS
* SOX
* Other

The interface should dynamically present additional fields based on the selected framework.

Examples:

For CMMC / NIST:

* Current Controls Implemented
* Target Compliance
* Notes

For ISO 27001:

* Certified (Yes/No)
* Certification Date (optional)

For HIPAA:

* HIPAA Program Implemented (Yes/No)

For PCI:

* PCI Compliant (Yes/No)

The Business Profile should remain concise by displaying only relevant compliance fields.

---

### Technology Context

Collect:

* IT Support Model

  * Internal
  * MSP
  * Hybrid
  * None

* Environment Type

  * Cloud
  * Hybrid
  * On-Premises

* Approximate Endpoint Count

These fields provide assessment context but do not replace detailed inventory.

---

### Primary Contact

Collect:

* Name
* Title
* Email
* Phone

---

## Business Rules

The Business Profile is relatively static.

Technology changes belong in the Technology Profile.

Assessment responses belong in Assessments.

Business Profile information should enhance recommendations but should never directly influence StackScore calculations.

Business Goals may influence recommendation prioritization but shall never override objective assessment results.

---

## Relationship to Other Documents

Business Profile provides context for:

* DOC-110 Assessment Framework
* DOC-112 Recommendation Engine
* DOC-113 Technology Profile
* DOC-103 Technology Improvement Plan
* DOC-104 Technology Roadmap
* DOC-107 Technology Completion Report

---

## Future Enhancements

Future versions may include:

* Multi-site business profiles
* Business critical applications
* Vendor relationships
* Insurance requirements
* Strategic initiatives
* AI-generated business summaries

These features should only be introduced when they provide measurable consulting value.

---

## Revision History

Version 1.0

Initial Business Profile architecture.
