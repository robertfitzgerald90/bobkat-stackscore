import { PrismaClient, RiskLevel } from "../src/generated/prisma/client";

export type SeedAnswer = {
  text: string;
  scoreValue: number;
  triggersCriticalFlag?: boolean;
  triggersRecommendation?: boolean;
  templateCode?: string;
};

export type SeedQuestion = {
  code: string;
  questionText: string;
  weight: number;
  displayOrder: number;
  riskLevel: RiskLevel;
  answers: SeedAnswer[];
};

export const CATEGORIES = [
  {
    code: "security",
    name: "Security & Protection",
    description: "Measures the organization's ability to protect systems, users, and data from cybersecurity threats.",
    maxPoints: 20,
    displayOrder: 1,
  },
  {
    code: "backup",
    name: "Backup & Recovery",
    description: "Measures the organization's ability to recover from data loss, ransomware, and hardware failure.",
    maxPoints: 20,
    displayOrder: 2,
  },
  {
    code: "infrastructure",
    name: "Infrastructure & Network Health",
    description: "Measures the reliability and lifecycle health of core technology infrastructure.",
    maxPoints: 15,
    displayOrder: 3,
  },
  {
    code: "endpoint",
    name: "Endpoint & Asset Management",
    description: "Measures visibility and management of company-owned devices.",
    maxPoints: 15,
    displayOrder: 4,
  },
  {
    code: "documentation",
    name: "Documentation & Operational Readiness",
    description: "Measures how well technology knowledge is documented and maintained.",
    maxPoints: 10,
    displayOrder: 5,
  },
  {
    code: "bcdr",
    name: "Business Continuity & Disaster Recovery",
    description: "Measures preparedness for major business disruptions.",
    maxPoints: 10,
    displayOrder: 6,
  },
  {
    code: "strategic",
    name: "Strategic Technology Management",
    description: "Measures whether technology is managed proactively rather than reactively.",
    maxPoints: 10,
    displayOrder: 7,
  },
] as const;

function lifecycleMiddle(weight: number) {
  return Math.round(weight * 0.67);
}

export const QUESTIONS_BY_CATEGORY: Record<string, SeedQuestion[]> = {
  security: [
    {
      code: "Q01",
      questionText: "Is MFA enabled for all Microsoft 365 users?",
      weight: 3,
      displayOrder: 1,
      riskLevel: "critical",
      answers: [
        { text: "Yes", scoreValue: 3 },
        { text: "Partial", scoreValue: 1 },
        { text: "No", scoreValue: 0, triggersCriticalFlag: true, triggersRecommendation: true, templateCode: "SEC-MFA-ALL" },
      ],
    },
    {
      code: "Q02",
      questionText: "Is MFA required for all administrative accounts?",
      weight: 2,
      displayOrder: 2,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Partial", scoreValue: 1, triggersRecommendation: true, templateCode: "SEC-MFA-ADMIN" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-MFA-ADMIN" },
      ],
    },
    {
      code: "Q03",
      questionText: "Is endpoint protection installed on all devices?",
      weight: 3,
      displayOrder: 3,
      riskLevel: "critical",
      answers: [
        { text: "Yes", scoreValue: 3 },
        { text: "Most Devices", scoreValue: 1 },
        { text: "No", scoreValue: 0, triggersCriticalFlag: true, triggersRecommendation: true, templateCode: "SEC-ENDPOINT-DEPLOY" },
      ],
    },
    {
      code: "Q04",
      questionText: "Is endpoint protection actively monitored?",
      weight: 2,
      displayOrder: 4,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Limited Monitoring", scoreValue: 1, triggersRecommendation: true, templateCode: "SEC-ENDPOINT-MONITOR" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-ENDPOINT-MONITOR" },
      ],
    },
    {
      code: "Q05",
      questionText: "Are operating system updates managed centrally?",
      weight: 2,
      displayOrder: 5,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Partially", scoreValue: 1, triggersRecommendation: true, templateCode: "SEC-PATCH-CENTRAL" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-PATCH-CENTRAL" },
      ],
    },
    {
      code: "Q06",
      questionText: "Are critical security patches installed within 30 days?",
      weight: 2,
      displayOrder: 6,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Sometimes", scoreValue: 1, triggersRecommendation: true, templateCode: "SEC-PATCH-TIMELY" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-PATCH-TIMELY" },
      ],
    },
    {
      code: "Q07",
      questionText: "Is advanced email filtering in place?",
      weight: 2,
      displayOrder: 7,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Basic Spam Filtering", scoreValue: 1, triggersRecommendation: true, templateCode: "SEC-EMAIL-FILTER" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-EMAIL-FILTER" },
      ],
    },
    {
      code: "Q08",
      questionText: "Has phishing awareness training been conducted within the last year?",
      weight: 1,
      displayOrder: 8,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "More than 1 Year Ago", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-PHISHING-TRAIN" },
        { text: "Never", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-PHISHING-TRAIN" },
      ],
    },
    {
      code: "Q09",
      questionText: "Are user accounts reviewed regularly?",
      weight: 1,
      displayOrder: 9,
      riskLevel: "medium",
      answers: [
        { text: "Quarterly", scoreValue: 1 },
        { text: "Annually", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-ACCOUNT-REVIEW" },
        { text: "Never", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-ACCOUNT-REVIEW" },
      ],
    },
    {
      code: "Q10",
      questionText: "Are former employee accounts disabled immediately upon termination?",
      weight: 2,
      displayOrder: 10,
      riskLevel: "high",
      answers: [
        { text: "Always", scoreValue: 2 },
        { text: "Usually", scoreValue: 1, triggersRecommendation: true, templateCode: "SEC-OFFBOARD-ACCOUNTS" },
        { text: "No Formal Process", scoreValue: 0, triggersRecommendation: true, templateCode: "SEC-OFFBOARD-ACCOUNTS" },
      ],
    },
  ],
  backup: [
    {
      code: "Q11",
      questionText: "Are servers backed up?",
      weight: 4,
      displayOrder: 11,
      riskLevel: "critical",
      answers: [
        { text: "Yes", scoreValue: 4 },
        { text: "Some Systems", scoreValue: 2, triggersRecommendation: true, templateCode: "BKP-SERVER" },
        { text: "No", scoreValue: 0, triggersCriticalFlag: true, triggersRecommendation: true, templateCode: "BKP-SERVER" },
      ],
    },
    {
      code: "Q12",
      questionText: "Are critical workstations backed up?",
      weight: 2,
      displayOrder: 12,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Some Systems", scoreValue: 1, triggersRecommendation: true, templateCode: "BKP-WORKSTATION" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "BKP-WORKSTATION" },
      ],
    },
    {
      code: "Q13",
      questionText: "Is Microsoft 365 data backed up separately?",
      weight: 3,
      displayOrder: 13,
      riskLevel: "critical",
      answers: [
        { text: "Yes", scoreValue: 3 },
        { text: "Partial", scoreValue: 1, triggersRecommendation: true, templateCode: "BKP-M365" },
        { text: "No", scoreValue: 0, triggersCriticalFlag: true, triggersRecommendation: true, templateCode: "BKP-M365" },
      ],
    },
    {
      code: "Q14",
      questionText: "Have backups been tested within the last 90 days?",
      weight: 3,
      displayOrder: 14,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 3 },
        { text: "Within Last Year", scoreValue: 1, triggersRecommendation: true, templateCode: "BKP-TEST-90" },
        { text: "Never", scoreValue: 0, triggersRecommendation: true, templateCode: "BKP-TEST-90" },
      ],
    },
    {
      code: "Q15",
      questionText: "Has a full restore been successfully performed?",
      weight: 2,
      displayOrder: 15,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Unsure", scoreValue: 1, triggersRecommendation: true, templateCode: "BKP-RESTORE-VALIDATE" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "BKP-RESTORE-VALIDATE" },
      ],
    },
    {
      code: "Q16",
      questionText: "Are backups stored offsite?",
      weight: 2,
      displayOrder: 16,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Partial", scoreValue: 1, triggersRecommendation: true, templateCode: "BKP-OFFSITE" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "BKP-OFFSITE" },
      ],
    },
    {
      code: "Q17",
      questionText: "Are backups protected from ransomware or deletion?",
      weight: 3,
      displayOrder: 17,
      riskLevel: "critical",
      answers: [
        { text: "Yes", scoreValue: 3 },
        { text: "Partial Protection", scoreValue: 1, triggersRecommendation: true, templateCode: "BKP-RANSOMWARE" },
        { text: "No", scoreValue: 0, triggersCriticalFlag: true, triggersRecommendation: true, templateCode: "BKP-RANSOMWARE" },
      ],
    },
    {
      code: "Q18",
      questionText: "Are backup failures monitored and reviewed?",
      weight: 1,
      displayOrder: 18,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "Occasionally", scoreValue: 0, triggersRecommendation: true, templateCode: "BKP-MONITOR" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "BKP-MONITOR" },
      ],
    },
  ],
  infrastructure: [
    {
      code: "Q19",
      questionText: "How old is the primary firewall?",
      weight: 3,
      displayOrder: 19,
      riskLevel: "critical",
      answers: [
        { text: "Less than 5 Years", scoreValue: 3 },
        { text: "5-8 Years", scoreValue: lifecycleMiddle(3), triggersRecommendation: true, templateCode: "INF-FIREWALL-AGE" },
        { text: "More than 8 Years", scoreValue: 0, triggersCriticalFlag: true, triggersRecommendation: true, templateCode: "INF-FIREWALL-AGE" },
      ],
    },
    {
      code: "Q20",
      questionText: "How old are the primary switches?",
      weight: 2,
      displayOrder: 20,
      riskLevel: "high",
      answers: [
        { text: "Less than 5 Years", scoreValue: 2 },
        { text: "5-8 Years", scoreValue: lifecycleMiddle(2), triggersRecommendation: true, templateCode: "INF-SWITCH-AGE" },
        { text: "More than 8 Years", scoreValue: 0, triggersRecommendation: true, templateCode: "INF-SWITCH-AGE" },
      ],
    },
    {
      code: "Q21",
      questionText: "Is wireless coverage adequate throughout the facility?",
      weight: 2,
      displayOrder: 21,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Some Coverage Issues", scoreValue: 1, triggersRecommendation: true, templateCode: "INF-WIRELESS" },
        { text: "Significant Issues", scoreValue: 0, triggersRecommendation: true, templateCode: "INF-WIRELESS" },
      ],
    },
    {
      code: "Q22",
      questionText: "Is there a UPS protecting critical systems?",
      weight: 2,
      displayOrder: 22,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Partial Coverage", scoreValue: 1, triggersRecommendation: true, templateCode: "INF-UPS" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "INF-UPS" },
      ],
    },
    {
      code: "Q23",
      questionText: "Is there internet redundancy?",
      weight: 2,
      displayOrder: 23,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Limited Redundancy", scoreValue: 1, triggersRecommendation: true, templateCode: "INF-ISP-REDUNDANCY" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "INF-ISP-REDUNDANCY" },
      ],
    },
    {
      code: "Q24",
      questionText: "Is network equipment actively monitored?",
      weight: 2,
      displayOrder: 24,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Partial Monitoring", scoreValue: 1, triggersRecommendation: true, templateCode: "INF-NETWORK-MONITOR" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "INF-NETWORK-MONITOR" },
      ],
    },
    {
      code: "Q25",
      questionText: "Are guest and business networks separated?",
      weight: 2,
      displayOrder: 25,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Partial Separation", scoreValue: 1, triggersRecommendation: true, templateCode: "INF-SEGMENTATION" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "INF-SEGMENTATION" },
      ],
    },
  ],
  endpoint: [
    {
      code: "Q26",
      questionText: "Is there a complete inventory of company devices?",
      weight: 2,
      displayOrder: 26,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Partial Inventory", scoreValue: 1, triggersRecommendation: true, templateCode: "END-INVENTORY" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "END-INVENTORY" },
      ],
    },
    {
      code: "Q27",
      questionText: "Are endpoints centrally managed?",
      weight: 3,
      displayOrder: 27,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 3 },
        { text: "Some Devices", scoreValue: 1, triggersRecommendation: true, templateCode: "END-CENTRAL-MGMT" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "END-CENTRAL-MGMT" },
      ],
    },
    {
      code: "Q28",
      questionText: "Is remote support capability available?",
      weight: 2,
      displayOrder: 28,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Limited", scoreValue: 1, triggersRecommendation: true, templateCode: "END-REMOTE-SUPPORT" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "END-REMOTE-SUPPORT" },
      ],
    },
    {
      code: "Q29",
      questionText: "Are device warranties tracked?",
      weight: 1,
      displayOrder: 29,
      riskLevel: "low",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "Some Devices", scoreValue: 0, triggersRecommendation: true, templateCode: "END-WARRANTY" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "END-WARRANTY" },
      ],
    },
    {
      code: "Q30",
      questionText: "Is there a defined hardware replacement cycle?",
      weight: 2,
      displayOrder: 30,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Informal", scoreValue: 1, triggersRecommendation: true, templateCode: "END-LIFECYCLE" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "END-LIFECYCLE" },
      ],
    },
    {
      code: "Q31",
      questionText: "Are unsupported operating systems present?",
      weight: 3,
      displayOrder: 31,
      riskLevel: "critical",
      answers: [
        { text: "None", scoreValue: 3 },
        { text: "Some", scoreValue: 1, triggersRecommendation: true, templateCode: "END-UNSUPPORTED-OS" },
        { text: "Many", scoreValue: 0, triggersCriticalFlag: true, triggersRecommendation: true, templateCode: "END-UNSUPPORTED-OS" },
      ],
    },
    {
      code: "Q32",
      questionText: "Are devices monitored for health and performance?",
      weight: 2,
      displayOrder: 32,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Limited Monitoring", scoreValue: 1, triggersRecommendation: true, templateCode: "END-HEALTH-MONITOR" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "END-HEALTH-MONITOR" },
      ],
    },
  ],
  documentation: [
    {
      code: "Q33",
      questionText: "Is there a current network diagram?",
      weight: 2,
      displayOrder: 33,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Outdated", scoreValue: 1, triggersRecommendation: true, templateCode: "DOC-NETWORK-DIAGRAM" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-NETWORK-DIAGRAM" },
      ],
    },
    {
      code: "Q34",
      questionText: "Are vendor contacts documented?",
      weight: 1,
      displayOrder: 34,
      riskLevel: "low",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "Partial", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-VENDOR-CONTACTS" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-VENDOR-CONTACTS" },
      ],
    },
    {
      code: "Q35",
      questionText: "Are administrative credentials securely stored?",
      weight: 2,
      displayOrder: 35,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Partial", scoreValue: 1, triggersRecommendation: true, templateCode: "DOC-CREDENTIAL-VAULT" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-CREDENTIAL-VAULT" },
      ],
    },
    {
      code: "Q36",
      questionText: "Are critical IT procedures documented?",
      weight: 2,
      displayOrder: 36,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Partial", scoreValue: 1, triggersRecommendation: true, templateCode: "DOC-IT-PROCEDURES" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-IT-PROCEDURES" },
      ],
    },
    {
      code: "Q37",
      questionText: "Is there an employee onboarding procedure?",
      weight: 1,
      displayOrder: 37,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "Informal", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-ONBOARDING" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-ONBOARDING" },
      ],
    },
    {
      code: "Q38",
      questionText: "Is there an employee offboarding procedure?",
      weight: 1,
      displayOrder: 38,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "Informal", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-OFFBOARDING" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-OFFBOARDING" },
      ],
    },
    {
      code: "Q39",
      questionText: "Is software licensing tracked?",
      weight: 1,
      displayOrder: 39,
      riskLevel: "low",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "Partial", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-LICENSING" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "DOC-LICENSING" },
      ],
    },
  ],
  bcdr: [
    {
      code: "Q40",
      questionText: "Is there a documented disaster recovery plan?",
      weight: 3,
      displayOrder: 40,
      riskLevel: "high",
      answers: [
        { text: "Yes", scoreValue: 3 },
        { text: "Draft Exists", scoreValue: 1, triggersRecommendation: true, templateCode: "BCDR-DR-PLAN" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "BCDR-DR-PLAN" },
      ],
    },
    {
      code: "Q41",
      questionText: "Has the disaster recovery plan been tested?",
      weight: 2,
      displayOrder: 41,
      riskLevel: "high",
      answers: [
        { text: "Within Last Year", scoreValue: 2 },
        { text: "More than 1 Year Ago", scoreValue: 1, triggersRecommendation: true, templateCode: "BCDR-DR-TEST" },
        { text: "Never", scoreValue: 0, triggersRecommendation: true, templateCode: "BCDR-DR-TEST" },
      ],
    },
    {
      code: "Q42",
      questionText: "Can employees work remotely during a facility outage?",
      weight: 2,
      displayOrder: 42,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Limited Capability", scoreValue: 1, triggersRecommendation: true, templateCode: "BCDR-REMOTE-WORK" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "BCDR-REMOTE-WORK" },
      ],
    },
    {
      code: "Q43",
      questionText: "Are emergency contact procedures documented?",
      weight: 1,
      displayOrder: 43,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "Partial", scoreValue: 0, triggersRecommendation: true, templateCode: "BCDR-EMERGENCY-CONTACTS" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "BCDR-EMERGENCY-CONTACTS" },
      ],
    },
    {
      code: "Q44",
      questionText: "Is critical equipment protected from flooding or environmental hazards?",
      weight: 1,
      displayOrder: 44,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "Partial", scoreValue: 0, triggersRecommendation: true, templateCode: "BCDR-ENVIRONMENTAL" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "BCDR-ENVIRONMENTAL" },
      ],
    },
    {
      code: "Q45",
      questionText: "Is generator power available for critical systems?",
      weight: 1,
      displayOrder: 45,
      riskLevel: "low",
      answers: [
        { text: "Yes", scoreValue: 1 },
        { text: "Limited", scoreValue: 0, triggersRecommendation: true, templateCode: "BCDR-GENERATOR" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "BCDR-GENERATOR" },
      ],
    },
  ],
  strategic: [
    {
      code: "Q46",
      questionText: "Is there a documented technology roadmap?",
      weight: 2,
      displayOrder: 46,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Informal", scoreValue: 1, triggersRecommendation: true, templateCode: "STR-ROADMAP" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "STR-ROADMAP" },
      ],
    },
    {
      code: "Q47",
      questionText: "Is technology spending budgeted annually?",
      weight: 2,
      displayOrder: 47,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Sometimes", scoreValue: 1, triggersRecommendation: true, templateCode: "STR-BUDGET" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "STR-BUDGET" },
      ],
    },
    {
      code: "Q48",
      questionText: "Are technology risks reviewed with leadership?",
      weight: 2,
      displayOrder: 48,
      riskLevel: "medium",
      answers: [
        { text: "Quarterly", scoreValue: 2 },
        { text: "Annually", scoreValue: 1, triggersRecommendation: true, templateCode: "STR-LEADERSHIP-REVIEW" },
        { text: "Never", scoreValue: 0, triggersRecommendation: true, templateCode: "STR-LEADERSHIP-REVIEW" },
      ],
    },
    {
      code: "Q49",
      questionText: "Are hardware refreshes planned proactively?",
      weight: 2,
      displayOrder: 49,
      riskLevel: "medium",
      answers: [
        { text: "Yes", scoreValue: 2 },
        { text: "Sometimes", scoreValue: 1, triggersRecommendation: true, templateCode: "STR-HARDWARE-REFRESH" },
        { text: "No", scoreValue: 0, triggersRecommendation: true, templateCode: "STR-HARDWARE-REFRESH" },
      ],
    },
    {
      code: "Q50",
      questionText: "Does leadership receive regular technology status reports?",
      weight: 2,
      displayOrder: 50,
      riskLevel: "low",
      answers: [
        { text: "Monthly", scoreValue: 2 },
        { text: "Occasionally", scoreValue: 1, triggersRecommendation: true, templateCode: "STR-STATUS-REPORTS" },
        { text: "Never", scoreValue: 0, triggersRecommendation: true, templateCode: "STR-STATUS-REPORTS" },
      ],
    },
  ],
};
