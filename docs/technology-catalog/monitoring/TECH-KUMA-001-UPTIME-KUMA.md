# TECH-KUMA-001 — Uptime Kuma

**Vendor:** Open-source project  
**Category:** Monitoring and Visibility  
**Standard Status:** Preferred  
**Lifecycle Status:** Current  
**Stack Layer:** Infrastructure and Service Availability

## Summary

Uptime Kuma is the preferred lightweight availability-monitoring platform for Bobkat IT small-business deployments.

## Primary Purpose

Continuously verify that critical network devices, servers, websites, and services are reachable and responding as expected.

## Why Bobkat IT Selected It

- Lightweight deployment
- No per-device licensing cost
- Simple interface
- Broad support for common monitor types
- Suitable for deployment on a small PC, server, virtual machine, or container host
- Provides clear uptime history
- Complements endpoint-focused monitoring in NinjaOne
- Supports repeatable monitoring templates

## Business Value

- Detects outages faster
- Reduces time between failure and response
- Provides visibility into recurring instability
- Confirms whether critical services are available
- Supports uptime reporting
- Improves confidence in network and server condition
- Provides a practical monitoring layer for devices that do not run an RMM agent

## Standard Monitoring Targets

- Internet gateway
- Primary and secondary internet circuits
- Managed switches
- Wireless access points
- Servers
- Hypervisors
- NAS devices
- Printers where operationally important
- Websites
- VPN endpoints
- DNS services
- DHCP services where practical
- SMTP endpoints
- HTTP and HTTPS services
- TCP services
- Public application endpoints

## Common Monitor Types

- Ping
- HTTP
- HTTPS
- TCP port
- DNS
- Keyword response
- Push monitor
- Certificate expiration

## Standard Deployment

A standard deployment should include:

- Dedicated or approved host
- Docker or supported application deployment
- Persistent storage
- Secure administrator credentials
- HTTPS access where practical
- Documented monitoring targets
- Naming standard
- Logical monitor groups
- Notification channels
- Backup of application data
- Maintenance-window configuration
- Escalation procedure
- Monthly review of monitor health and stale targets

## Relationship to NinjaOne

NinjaOne monitors managed endpoints from the operating system and agent perspective.

Uptime Kuma monitors infrastructure and services from the network availability perspective.

The two platforms are complementary and should not be treated as replacements for one another.

## StackScore Pillar Mappings

### Primary

- Monitoring and Visibility
- Network and Wi-Fi

### Supporting

- Backup and Disaster Recovery
- Security and Risk
- Cloud and Collaboration

## Common StackScore Recommendations

- Implement centralized availability monitoring
- Monitor critical network devices
- Monitor internet connectivity
- Monitor externally accessible services
- Configure outage notifications
- Establish uptime history
- Document critical services
- Review certificate expiration

## Related Playbooks

- Uptime Kuma Docker Deployment
- Uptime Kuma Windows or Linux Host Deployment
- Standard Network Monitoring Template
- Website and Certificate Monitoring
- Alerting and Escalation Setup
- Monitoring Documentation and Handoff
