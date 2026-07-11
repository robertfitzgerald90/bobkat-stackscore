# TECH-UNI-001 — Ubiquiti UniFi

**Vendor:** Ubiquiti  
**Category:** Network Infrastructure  
**Standard Status:** Preferred  
**Lifecycle Status:** Current  
**Stack Layer:** Network and Physical Infrastructure

## Summary

Ubiquiti UniFi is the preferred Bobkat IT platform for centrally managed network infrastructure in small and midsize business environments.

## Primary Purpose

Provide an integrated platform for gateway security, routing, switching, wireless networking, cameras, access control, and centralized infrastructure management.

## Why Bobkat IT Selected It

- Strong price-to-capability ratio
- Centralized management experience
- Broad hardware ecosystem
- No recurring licensing requirement for core network management
- Suitable for repeatable small-business deployments
- Supports standardized configurations and implementation playbooks
- Provides a consistent administrative interface across gateways, switches, access points, cameras, and access control

## Business Value

- Reduces infrastructure complexity
- Improves visibility into network condition
- Simplifies remote support
- Creates a scalable foundation for business growth
- Improves wireless reliability
- Supports segmentation between business, guest, voice, IoT, and security devices
- Makes network documentation and lifecycle planning easier

## Core Capabilities

- Internet gateway and firewall
- Routing and VLANs
- Managed switching
- Power over Ethernet
- Wireless networking
- Site-to-site VPN
- Remote-user VPN
- IDS/IPS capabilities
- Guest wireless
- Network topology
- Device health and client visibility
- Camera management through UniFi Protect
- Door access through UniFi Access

## Standard Product Examples

### Gateways

| Product | Preferred Use |
|---|---|
| Cloud Gateway Ultra | Very small office with modest performance requirements |
| Cloud Gateway Max | Small office requiring greater performance and application support |
| Dream Machine Pro | Standard rack-mounted small-business deployment |
| Dream Machine Pro Max | Larger or more demanding small-business deployment |

### Switching

| Product Family | Preferred Use |
|---|---|
| Standard PoE | Cost-conscious access switching |
| Pro Max PoE | Standard managed deployment requiring PoE and stronger feature depth |
| Enterprise Switching | Higher-density, higher-throughput, or specialized environments |

### Wireless

| Product | Preferred Use |
|---|---|
| U7 Pro | Standard indoor business wireless |
| U7 Pro Max | Higher-density or higher-performance areas |
| U7 Outdoor | Exterior or semi-exterior wireless coverage |

### Physical Security

- UniFi Protect cameras
- CloudKey or supported UniFi console where required
- UNVR for larger camera deployments
- UniFi Access for supported door access use cases

## Standard Deployment

A standard UniFi deployment should include:

- Documented WAN configuration
- Documented network and VLAN plan
- Separate business and guest wireless networks
- Segmentation for cameras, IoT, voice, and management where applicable
- Secure administrator access
- MFA where supported
- Configuration backup
- Device naming standard
- Firmware management process
- Network diagram
- UPS protection for critical network equipment
- Uptime Kuma monitoring for gateways, switches, access points, and critical services

## StackScore Pillar Mappings

### Primary

- Network and Wi-Fi
- Security and Risk
- Monitoring and Visibility

### Supporting

- Identity and Access
- Backup and Disaster Recovery
- Cloud and Collaboration

## Common StackScore Recommendations

- Replace unmanaged switching
- Implement business-class firewall
- Standardize wireless access points
- Segment guest and internal traffic
- Create dedicated IoT or camera VLAN
- Improve network documentation
- Implement configuration backup
- Add UPS protection
- Implement availability monitoring

## Related Playbooks

- UniFi Small Office Deployment
- UniFi Gateway Replacement
- UniFi Wireless Standardization
- UniFi VLAN and Segmentation
- UniFi Protect Deployment
- Network Documentation and Handoff
