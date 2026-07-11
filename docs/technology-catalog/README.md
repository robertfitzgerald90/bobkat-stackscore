# StackScore Technology Catalog Documentation

This documentation pack defines the initial **Bobkat IT Standard** used by the StackScore Technology Catalog.

## Purpose

The Technology Catalog is not intended to be a generic software directory. It is the operational source of truth for the technologies Bobkat IT recommends, deploys, manages, and evaluates through StackScore.

The catalog should help users understand:

- What each technology does
- Why Bobkat IT selected it
- Where it fits in the broader technology stack
- Which business risks it addresses
- How it is normally implemented
- Which StackScore pillars and recommendations it supports
- Which implementation playbooks are available

## Initial Standard Technologies

| Technology | Role |
|---|---|
| Ubiquiti UniFi | Network infrastructure and physical technology platform |
| NinjaOne | Endpoint operations, RMM, patching, backup, automation, and remote support |
| StackScore | Technology maturity assessment, planning, roadmaps, reporting, and improvement tracking |
| Uptime Kuma | Lightweight network and service availability monitoring |

## Recommended File Structure

```text
/docs/technology-catalog/
├── README.md
├── DOC-101-BOBKAT-IT-TECHNOLOGY-STANDARD.md
├── CAT-001-CATALOG-DATA-MODEL.md
├── CAT-002-UI-AND-MODULE-REQUIREMENTS.md
├── TECH-UNI-001-UBIQUITI-UNIFI.md
├── TECH-NINJA-001-NINJAONE.md
├── TECH-STACK-001-STACKSCORE.md
└── TECH-KUMA-001-UPTIME-KUMA.md
```

## Source-of-Truth Rule

The Markdown files in this directory define the approved catalog content and expected application behavior.

The application database may store editable catalog records, but seeded records should originate from these standards. Future changes to approved technologies should be reflected in both the Markdown documentation and the application catalog.
