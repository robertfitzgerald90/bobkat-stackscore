# DOC-114B – Security Assessment Library

**Document ID:** DOC-114B
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

The Security Assessment Library defines every assessment question used to evaluate the organization's cybersecurity posture and operational security maturity.

The objective is to identify weaknesses that increase business risk while providing objective, measurable recommendations for improvement.

This document should be read in conjunction with:

* DOC-110 – Assessment Framework
* DOC-111 – Scoring Engine Specification
* DOC-112 – Recommendation Engine Specification
* DOC-114 – Assessment Library Specification

---

# Assessment Objective

The Security Assessment measures the organization's ability to protect systems, users, identities, data, and business operations from security threats.

Areas evaluated include:

* Identity & Access Management
* Endpoint Security
* Email Security
* Patch & Vulnerability Management
* Network Security
* Data Protection
* Security Monitoring
* Security Awareness
* Privileged Access
* Incident Response
* Remote Access Security
* Policy & Governance

---

# Technology Category

Security

Maximum Technology Maturity Points

100

Technology Profile Weight

Defined by DOC-110 – Assessment Framework.

---

# Security Maturity Philosophy

A mature security program should be:

* Proactive
* Layered
* Continuously monitored
* Properly documented
* Consistently enforced
* Designed around business risk

Security is measured by implemented capabilities rather than individual products or vendors.

---

# Assessment Question Standard

Every assessment question shall include:

* Question ID
* Assessment Question
* Purpose
* Capability
* Response Type
* Allowed Answers
* Technology Maturity Points
* Recommendation Trigger
* Related BobKat IT Service
* Related Solution Playbook
* Related Technologies
* Evidence Required
* Business Impact
* Administrative Notes

---

# Assessment Questions

Security assessment questions shall be organized into the following capability groups.

## Identity & Access Management

Examples

* Multi-Factor Authentication
* Password Policy
* Privileged Account Protection
* Conditional Access
* Single Sign-On
* User Lifecycle Management

---

## Endpoint Protection

Examples

* Endpoint Detection & Response (EDR)
* Antivirus / Anti-Malware
* Device Encryption
* USB Device Control
* Device Compliance

---

## Email Security

Examples

* Spam Filtering
* Phishing Protection
* SPF
* DKIM
* DMARC
* Attachment Protection
* URL Protection

---

## Patch & Vulnerability Management

Examples

* Operating System Patching
* Third-Party Application Patching
* Vulnerability Scanning
* Critical Patch Response Time
* Unsupported Software Detection

---

## Network Security

Examples

* Firewall Management
* VPN Security
* Network Segmentation
* Guest Network Isolation
* Secure DNS
* Intrusion Detection / Prevention

---

## Data Protection

Examples

* Data Encryption
* Microsoft 365 Protection
* Backup Security
* Data Loss Prevention
* Sensitive Data Management

---

## Security Monitoring

Examples

* Centralized Monitoring
* Alerting
* Log Retention
* Security Dashboards
* Threat Visibility

---

## Security Awareness

Examples

* Employee Security Training
* Phishing Simulations
* Security Policy Acknowledgement
* Password Education

---

## Incident Response

Examples

* Incident Response Plan
* Security Contacts
* Escalation Procedures
* Recovery Procedures
* Post-Incident Review

---

## Policy & Governance

Examples

* Acceptable Use Policy
* Password Policy
* Security Standards
* Device Standards
* Vendor Access Policy

---

# Capability Coverage

This category measures capabilities including:

* Identity Protection
* Endpoint Security
* Email Protection
* Network Defense
* Data Protection
* Vulnerability Management
* Security Visibility
* User Awareness
* Incident Preparedness
* Governance & Compliance

---

# Recommendation Mapping

Security findings may generate recommendations including:

* MFA Deployment
* Endpoint Protection Deployment
* Email Security Hardening
* Vulnerability Management Program
* Security Awareness Training
* Microsoft 365 Security Hardening
* Firewall Security Review
* Conditional Access Implementation
* Security Policy Development
* Incident Response Planning

---

# Related BobKat IT Services

Examples include:

* Security Assessment
* Identity & Access Management
* Endpoint Security Deployment
* Microsoft 365 Security Hardening
* Email Security Configuration
* Vulnerability Management
* Security Awareness Training
* Incident Response Planning

---

# Related Solution Playbooks

Security recommendations commonly map to:

* Cybersecurity
* Managed Technology Program
* Business Continuity
* Technology Foundation

---

# Future Automation Opportunities

Future integrations may automatically validate security maturity using:

* Microsoft Entra ID
* Microsoft Defender
* Microsoft Graph
* NinjaOne
* Huntress
* SentinelOne
* Cisco Secure
* CrowdStrike
* Sophos
* Ubiquiti Identity
* Vulnerability Management Platforms

---

# Business Rules

* Security questions shall evaluate capabilities rather than vendors.
* Every question shall map to a measurable security capability.
* Security recommendations shall prioritize business risk reduction.
* Critical security deficiencies may generate mandatory recommendations regardless of overall Technology Profile score.
* All scoring shall be governed by DOC-111 – Scoring Engine Specification.

---

# Revision History

| Version | Date       | Author    | Changes                             |
| ------- | ---------- | --------- | ----------------------------------- |
| 1.0     | 2026-06-25 | BobKat IT | Initial Security Assessment Library |
