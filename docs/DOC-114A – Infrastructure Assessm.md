# DOC-114A – Infrastructure Assessment Library

**Document ID:** DOC-114A
**Version:** 1.0
**Status:** Draft
**Owner:** BobKat IT
**Last Updated:** June 25, 2026

---

# Purpose

The Infrastructure Assessment Library defines every assessment question used to evaluate the health, maturity, resilience, and scalability of a client's technology infrastructure.

Infrastructure serves as the foundation of every technology environment. The goal of this assessment is to identify weaknesses that may impact reliability, security, performance, growth, or long-term supportability.

This document should be read in conjunction with:

* DOC-110 – Assessment Framework
* DOC-111 – Scoring Engine Specification
* DOC-112 – Recommendation Engine Specification
* DOC-114 – Assessment Library Specification

---

# Assessment Objective

The Infrastructure Assessment measures how effectively the organization's core technology infrastructure supports business operations.

Areas evaluated include:

* Network Infrastructure
* Wireless Infrastructure
* Internet Connectivity
* Firewall & Edge Security
* Server Infrastructure
* Virtualization
* Storage
* Power Protection
* Physical Infrastructure
* Network Documentation
* Hardware Lifecycle
* Standardization
* Monitoring

---

# Technology Category

Infrastructure

Maximum Technology Maturity Points

100

Technology Profile Weight

Defined by DOC-110 – Assessment Framework.

---

# Infrastructure Maturity Philosophy

A mature infrastructure environment should be:

* Reliable
* Secure
* Documented
* Redundant where appropriate
* Easy to support
* Scalable
* Properly monitored
* Built using standardized technologies whenever practical

Infrastructure recommendations should prioritize stability before expansion.

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

Infrastructure assessment questions shall be organized into the following sections.

## Network Infrastructure

Examples

* Firewall
* Core Switching
* Access Switching
* VLAN Design
* Network Segmentation
* Internet Redundancy

---

## Wireless Infrastructure

Examples

* Wireless Coverage
* Controller Management
* Guest Network
* Roaming
* Wireless Security

---

## Server Infrastructure

Examples

* Physical Servers
* Virtualization
* Hypervisor Health
* Hardware Lifecycle

---

## Storage

Examples

* SAN
* NAS
* Storage Redundancy
* Capacity Planning

---

## Power Protection

Examples

* UPS
* Generator Integration
* Battery Monitoring

---

## Physical Infrastructure

Examples

* Rack Organization
* Cable Management
* Environmental Monitoring
* Server Room Security

---

## Standardization

Examples

* Hardware Consistency
* Vendor Standardization
* Firmware Currency
* Configuration Standards

---

## Monitoring

Examples

* Device Monitoring
* Alerting
* Capacity Monitoring
* Availability Monitoring

---

# Capability Coverage

This category measures capabilities including:

* Network Reliability
* Wireless Reliability
* Infrastructure Resilience
* Hardware Lifecycle Management
* Physical Infrastructure
* Monitoring & Visibility
* Standardization
* Scalability

---

# Recommendation Mapping

Infrastructure findings may generate recommendations including:

* Firewall Modernization
* Network Infrastructure Refresh
* Wireless Modernization
* Server Modernization
* UPS Deployment
* Rack Organization
* Infrastructure Documentation
* Monitoring Improvements

---

# Related BobKat IT Services

Examples include:

* Firewall Modernization
* Network Deployment
* Wireless Deployment
* Server Deployment
* Rack Organization
* UPS Deployment
* Infrastructure Documentation

---

# Related Solution Playbooks

Infrastructure recommendations commonly map to:

* Technology Foundation
* Network Expansion
* Server Modernization
* Managed Technology Program

---

# Future Automation Opportunities

Future integrations may automatically evaluate infrastructure maturity using:

* Ubiquiti UniFi
* Cisco Meraki
* Aruba Central
* NinjaOne
* Lansweeper
* SNMP Monitoring
* Hyper-V
* VMware
* Microsoft Graph

---

# Business Rules

* Infrastructure questions shall remain vendor-agnostic whenever practical.
* Questions shall measure capabilities rather than individual hardware models.
* Infrastructure recommendations shall prioritize business reliability over technology preference.
* Every question shall map to a measurable infrastructure capability.
* All scoring shall be governed by DOC-111 – Scoring Engine Specification.

---

# Revision History

| Version | Date       | Author    | Changes                                   |
| ------- | ---------- | --------- | ----------------------------------------- |
| 1.0     | 2026-06-25 | BobKat IT | Initial Infrastructure Assessment Library |
