# DOC-101 – Approved Technology Catalog Specification

**Document ID:** DOC-101
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 24, 2026

---

# Purpose

The Approved Technology Catalog defines the hardware, software, cloud services, and technology vendors that BobKat IT recommends, deploys, and supports.

The catalog serves as the organization's internal technology standard.

Its purpose is to promote consistency across client environments, simplify proposal generation, streamline project implementation, and improve long-term supportability.

This document intentionally excludes pricing, which is managed separately by the Pricing Engine Specification (DOC-102).

---

# Objectives

The Approved Technology Catalog exists to:

* Standardize BobKat IT technology recommendations.
* Reduce variation across client environments.
* Improve implementation consistency.
* Support automatic proposal generation.
* Support future lifecycle planning.
* Provide a curated list of supported technologies.

---

# Guiding Principles

## Standardization Before Customization

Whenever practical, BobKat IT should deploy standardized technologies.

Standardization reduces operational complexity, improves documentation, simplifies troubleshooting, and creates a more predictable client experience.

---

## Vendor Agnostic Services

Services remain vendor-independent.

Technology recommendations are selected from the Approved Technology Catalog.

Example

Service

Firewall Modernization

Recommended Technologies

* Ubiquiti Dream Machine Pro Max
* Meraki MX Series
* Fortinet FortiGate Series

The Service Catalog defines *what* BobKat IT delivers.

The Approved Technology Catalog defines *what technologies are used to deliver it.*

---

## Technology Lifecycle Awareness

Every technology recommendation should consider:

* Expected lifespan
* Warranty
* Vendor support
* Scalability
* Ease of management
* Compatibility with the BobKat IT service stack

---

## Supportability

BobKat IT should only recommend technologies that can be confidently deployed, managed, documented, and supported.

---

# Technology Categories

---

## Network Infrastructure

Examples

* Firewalls
* Network Switches
* Wireless Access Points
* Routers
* Gateways
* SFP Modules
* Network Racks
* Patch Panels

---

## Servers

Examples

* Physical Servers
* Virtualization Hosts
* Storage Appliances
* UPS Systems

---

## Workstations

Examples

* Business Laptops
* Desktop PCs
* Mini PCs
* Docking Stations
* Monitors

---

## Backup & Disaster Recovery

Examples

* Synology NAS
* Backup Appliances
* External Storage
* Cloud Backup Platforms
* Microsoft 365 Backup Solutions

---

## Security

Examples

* Endpoint Protection
* Email Security
* MFA Platforms
* Password Managers
* DNS Filtering
* Security Awareness Platforms

---

## Cloud Services

Examples

* Microsoft 365
* Microsoft Entra ID
* Azure
* Cloud Backup
* Remote Access Platforms

---

## Management Platforms

Examples

* RMM Platforms
* Documentation Platforms
* Monitoring Platforms
* Asset Management Platforms

---

## Residential Technologies

Examples

* Consumer Wi-Fi
* Home NAS
* Printers
* Smart Home Devices
* Home Office Equipment

---

# Technology Definition

Every technology entry shall include the following information.

---

## General

* Product Name
* Manufacturer
* Technology Category
* Technology Type
* Description
* Active Status

---

## Operational

* Typical Use Case
* Recommended Client Size
* Deployment Complexity
* Standard Deployment Notes
* Required Skills

---

## Lifecycle

* Warranty Period
* Expected Lifecycle
* Replacement Recommendation
* Vendor Support Status
* End-of-Life Date (when known)

---

## StackScore Integration

* Related Services
* Related Improvement Opportunities
* Technology Categories Improved
* Default Recommendation Priority

---

## Internal

* Internal Notes
* Version
* Date Added
* Last Updated

---

# Recommendation Levels

Every technology should include a recommendation level.

Primary Standard

Preferred technology deployed whenever practical.

---

Approved Alternative

Supported technology when the Primary Standard is not appropriate.

---

Legacy Support

Technology BobKat IT continues to support but does not actively recommend for new deployments.

---

Retired

Technology no longer recommended for deployment.

Retired technologies may remain documented for historical purposes.

---

# Relationship to Other Modules

Technology Profile

↓

Improvement Opportunities

↓

Service Catalog

↓

Approved Technology Catalog

↓

Pricing Engine

↓

Proposal Engine

↓

Projects

↓

Lifecycle Tracking

The Approved Technology Catalog provides the implementation recommendations that support each professional service.

---

# Business Rules

* Technologies shall belong to one primary category.
* Technologies may support multiple services.
* Technologies may support multiple Improvement Opportunities.
* Technologies shall not contain pricing information.
* Technologies should include lifecycle information whenever practical.
* Technologies should identify a preferred deployment standard.
* Technologies should support future lifecycle reporting.

---

# Future Enhancements

Future versions may support:

* Vendor integrations
* Automated warranty lookups
* Firmware tracking
* Software version tracking
* Security advisories
* Lifecycle forecasting
* AI-assisted technology recommendations
* Approved configuration templates

---

# Acceptance Criteria

The Approved Technology Catalog Specification is considered successful when:

* BobKat IT maintains a standardized technology stack.
* Services consistently reference approved technologies.
* Proposal generation can recommend standardized deployments.
* Project generation includes preferred technologies.
* Technology lifecycle planning becomes possible.
* Client environments become increasingly standardized over time.

---

# Related Documents

* DOC-001 – Product Vision
* DOC-002 – Product Philosophy
* DOC-003 – BobKat Technology Improvement Lifecycle
* DOC-100 – Service Catalog Specification
* DOC-102 – Pricing Engine Specification

---

# Revision History

| Version | Date       | Author    | Changes                                           |
| ------- | ---------- | --------- | ------------------------------------------------- |
| 1.0     | 2026-06-24 | BobKat IT | Initial Approved Technology Catalog Specification |
