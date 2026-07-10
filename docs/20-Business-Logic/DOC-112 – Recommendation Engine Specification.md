# DOC-112 – Recommendation Engine Specification

**Document ID:** DOC-112
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

The Recommendation Engine converts assessment findings into prioritized business recommendations.

Its purpose is to ensure every Technology Improvement Plan is objective, repeatable, and aligned with BobKat IT's consulting methodology.

Recommendations shall be generated automatically based on assessment results and Technology Profile calculations.

---

# Philosophy

StackScore does not recommend products.

StackScore recommends improvements.

Products and technologies are implementation options selected after the appropriate business outcome has been identified.

---

# Recommendation Flow

Assessment

then

Scoring Engine

then

Technology Profile

then

Improvement Opportunities

then

Recommendations

then

Solution Playbooks

then

Services

then

Products

then

Technology Improvement Plan

---

# Recommendation Priorities

Every recommendation shall be assigned one of the following priorities.

Critical

High

Medium

Low

Informational

Priority is determined by:

* Business Risk
* Operational Impact
* Security Impact
* Business Continuity Impact
* Technology Dependency

---

# Recommendation Types

Recommendations may include:

* Infrastructure Improvements
* Security Improvements
* Business Continuity Improvements
* Productivity Improvements
* Documentation Improvements
* Strategic IT Improvements
* Operational Improvements

---

# Recommendation Components

Every recommendation shall contain:

* Recommendation ID
* Title
* Executive Summary
* Business Justification
* Technology Category
* Related Capability
* Related Service
* Related Solution Playbook
* Expected Technology Profile Improvement
* Estimated Effort
* Estimated Timeline
* Estimated Investment
* Business Benefits

---

# Recommendation Generation Rules

Recommendations shall be generated automatically when predefined scoring thresholds or capability deficiencies are identified.

Recommendations shall be deterministic.

The same assessment results shall always produce the same recommendations.

---

# Recommendation Prioritization

Recommendations shall be sorted using:

1. Business Risk
2. Security Risk
3. Business Continuity Impact
4. Operational Impact
5. Strategic Value
6. Estimated Business Benefit

---

# Business Rules

* Recommendations shall remain vendor-neutral.
* Recommendations shall focus on business outcomes.
* Recommendations shall reference one or more BobKat IT services.
* Recommendations may reference one or more Solution Playbooks.
* Recommendations shall never directly recommend a specific manufacturer unless required by implementation.

---

# Related Documents

* DOC-111 â€“ Scoring Engine
* DOC-113 â€“ Technology Profile
* DOC-106 â€“ Solution Playbook Specification
* DOC-103 â€“ Technology Improvement Plan Specification

---

# Revision History

| Version | Date       | Author    | Changes                                     |
| ------- | ---------- | --------- | ------------------------------------------- |
| 1.0     | 2026-06-25 | BobKat IT | Initial Recommendation Engine Specification |

---

# Appendix C – Detailed Rule Examples (v1 Implementation)

> **Note:** Merged from former DOC112. Machine-readable v1 rules: data/RecommendationRuleCatalog.json. See DOC-118.

# BobKat StackScore - Recommendation Engine

## Purpose

The Recommendation Engine converts assessment findings into actionable business recommendations.

The goal is to:

1. Identify technology risks
2. Explain business impact
3. Prioritize remediation efforts
4. Estimate score improvement
5. Align recommendations with BobKat IT services

---

# Recommendation Generation Process

Assessment Answer

then

Risk Evaluation

then

Priority Assignment

then

Business Impact Statement

then

Recommended Action

then

Estimated Score Improvement

then

Project Creation

---

# Priority Levels

## Critical

Immediate action required.

Potential impact:

* Data loss
* Security breach
* Significant downtime
* Regulatory exposure

Expected remediation timeline:

0-30 days

---

## High

Significant business risk exists.

Potential impact:

* Reduced security
* Reduced reliability
* Recovery challenges

Expected remediation timeline:

30-90 days

---

## Medium

Improves resilience and operational maturity.

Potential impact:

* Operational inefficiency
* Increased support burden
* Reduced visibility

Expected remediation timeline:

90-180 days

---

## Low

Optimization opportunity.

Potential impact:

* Improved efficiency
* Better reporting
* Long-term planning

Expected remediation timeline:

180+ days

---

# Security Recommendation Rules

## MFA Not Enabled

Trigger:

MFA = No

Priority:

Critical

Business Impact:

User accounts can be compromised through phishing, password reuse, or credential theft.

Recommendation:

Enable Multi-Factor Authentication for all users.

Suggested Service:

Microsoft 365 Security Hardening

Estimated Score Improvement:

+8

---

## Endpoint Protection Missing

Trigger:

Endpoint Protection = No

Priority:

Critical

Business Impact:

Devices are vulnerable to malware, ransomware, and unauthorized software execution.

Recommendation:

Deploy centrally managed endpoint protection.

Suggested Service:

Managed Endpoint Security

Estimated Score Improvement:

+10

---

## Patch Management Missing

Trigger:

Patch Management = No

Priority:

High

Business Impact:

Unpatched systems remain vulnerable to known security exploits.

Recommendation:

Implement centralized patch management.

Suggested Service:

Managed IT Services

Estimated Score Improvement:

+6

---

# Backup Recommendation Rules

## No Backups

Trigger:

Server Backups = No

Priority:

Critical

Business Impact:

Data loss may be permanent following hardware failure, ransomware, or accidental deletion.

Recommendation:

Deploy automated backup solution.

Suggested Service:

Backup & Disaster Recovery

Estimated Score Improvement:

+12

---

## Backups Not Tested

Trigger:

Backup Testing = Never

Priority:

High

Business Impact:

Successful backups do not guarantee successful recovery.

Recommendation:

Implement quarterly backup validation testing.

Suggested Service:

Backup & Disaster Recovery

Estimated Score Improvement:

+5

---

## No Microsoft 365 Backup

Trigger:

Microsoft 365 Backup = No

Priority:

High

Business Impact:

Deleted emails and files may not be recoverable.

Recommendation:

Implement Microsoft 365 backup platform.

Suggested Service:

Microsoft 365 Protection

Estimated Score Improvement:

+8

---

# Infrastructure Recommendation Rules

## Firewall Older Than 8 Years

Trigger:

Firewall Age > 8 Years

Priority:

High

Business Impact:

Aging infrastructure may lack security updates, support, and modern protections.

Recommendation:

Perform firewall replacement assessment.

Suggested Service:

Network Infrastructure Deployment

Estimated Score Improvement:

+6

---

## No Internet Redundancy

Trigger:

Internet Redundancy = No

Priority:

Medium

Business Impact:

A single ISP outage can halt operations.

Recommendation:

Evaluate secondary internet connection.

Suggested Service:

Network Consulting

Estimated Score Improvement:

+4

---

## No UPS Protection

Trigger:

UPS Protection = No

Priority:

Medium

Business Impact:

Unexpected power interruptions may damage equipment and cause outages.

Recommendation:

Deploy UPS protection for critical infrastructure.

Suggested Service:

Infrastructure Modernization

Estimated Score Improvement:

+4

---

# Endpoint Management Recommendation Rules

## No Asset Inventory

Trigger:

Asset Inventory = No

Priority:

Medium

Business Impact:

Devices cannot be effectively tracked, managed, or secured.

Recommendation:

Create centralized asset inventory.

Suggested Service:

Managed IT Services

Estimated Score Improvement:

+4

---

## Unsupported Operating Systems Present

Trigger:

Unsupported Operating Systems = Yes

Priority:

High

Business Impact:

Unsupported devices no longer receive security updates.

Recommendation:

Replace or upgrade unsupported devices.

Suggested Service:

Lifecycle Management

Estimated Score Improvement:

+6

---

# Documentation Recommendation Rules

## No Network Diagram

Trigger:

Network Diagram = No

Priority:

Medium

Business Impact:

Troubleshooting and recovery efforts are slowed during outages.

Recommendation:

Create network documentation package.

Suggested Service:

Documentation & Assessment Services

Estimated Score Improvement:

+3

---

## No Vendor Documentation

Trigger:

Vendor Contacts = No

Priority:

Low

Business Impact:

Response times increase during critical incidents.

Recommendation:

Document vendor support contacts and contracts.

Suggested Service:

Documentation Services

Estimated Score Improvement:

+2

---

# Business Continuity Recommendation Rules

## No Disaster Recovery Plan

Trigger:

Disaster Recovery Plan = No

Priority:

High

Business Impact:

The business lacks a documented recovery process following a disaster.

Recommendation:

Develop and document disaster recovery procedures.

Suggested Service:

Business Continuity Planning

Estimated Score Improvement:

+8

---

## Recovery Plan Never Tested

Trigger:

Recovery Testing = Never

Priority:

High

Business Impact:

Recovery assumptions have not been validated.

Recommendation:

Conduct annual disaster recovery testing.

Suggested Service:

Business Continuity Planning

Estimated Score Improvement:

+5

---

## No Remote Work Capability

Trigger:

Remote Work Capability = No

Priority:

Medium

Business Impact:

Operations may stop entirely during facility outages.

Recommendation:

Implement remote access strategy.

Suggested Service:

Modern Workplace Services

Estimated Score Improvement:

+4

---

# Strategic Technology Recommendation Rules

## No Technology Roadmap

Trigger:

Technology Roadmap = No

Priority:

Medium

Business Impact:

Technology investments become reactive rather than strategic.

Recommendation:

Develop a three-year technology roadmap.

Suggested Service:

vCIO Consulting

Estimated Score Improvement:

+3

---

## No Annual Technology Budget

Trigger:

Technology Budget = No

Priority:

Medium

Business Impact:

Unexpected expenses become more likely.

Recommendation:

Create annual technology budget planning process.

Suggested Service:

vCIO Consulting

Estimated Score Improvement:

+2

---

# Recommendation Consolidation Logic

Multiple recommendations should be grouped when appropriate.

Example:

Individual Findings:

* No MFA
* No Conditional Access
* Weak Password Policy

Consolidated Recommendation:

Microsoft 365 Security Hardening

Priority:

Critical

Estimated Impact:

+15

This prevents recommendation overload.

---

# Executive Report Logic

Reports should always show:

## Top 5 Risks

Highest-priority recommendations.

---

## Quick Wins

Recommendations with:

* High impact
* Low effort

---

## Strategic Improvements

Long-term recommendations.

---

## Projected Future Score

Current Score:

63

Recommended Improvements:

+22

Projected Score:

85

Rating:

Strong

---

# BobKat IT Service Mapping

Every recommendation should align with a service offering.

## Services

* Managed IT Services
* Backup & Disaster Recovery
* Microsoft 365 Protection
* Network Infrastructure & Deployment
* Documentation Services
* Business Continuity Planning
* vCIO Consulting
* Security Hardening

This allows StackScore to naturally generate proposals and project opportunities.

---

# Future Enhancements

Future versions may support:

* Industry-specific recommendations
* Compliance-based recommendations
* AI-generated recommendations
* Insurance readiness recommendations
* Automated recommendation validation
* Cost estimation engine
* Proposal generation engine

---

# Guiding Principle

Every recommendation should answer three questions:

1. What is the risk?
2. Why does it matter to the business?
3. What should be done next?

If a recommendation does not clearly answer all three questions, it should not be presented to the client.

