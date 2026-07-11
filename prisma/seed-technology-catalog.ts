import type { PrismaClient } from "../src/generated/prisma/client";
import type {
  TechnologyLifecycleStatus,
  TechnologyPillarRelationshipType,
  TechnologyStandardStatus,
} from "../src/generated/prisma/client";

const LAST_REVIEWED = new Date("2026-01-15T00:00:00.000Z");
const NEXT_REVIEW = new Date("2026-07-15T00:00:00.000Z");

type CategorySeed = {
  slug: string;
  name: string;
  description: string;
  icon: string;
  displayOrder: number;
};

const CATEGORIES: CategorySeed[] = [
  {
    slug: "network-infrastructure",
    name: "Network Infrastructure",
    description: "Gateways, switching, wireless, and physical network platforms.",
    icon: "network",
    displayOrder: 1,
  },
  {
    slug: "endpoint-management",
    name: "Endpoint Management",
    description: "RMM, patching, automation, and endpoint operations.",
    icon: "monitor",
    displayOrder: 2,
  },
  {
    slug: "monitoring-visibility",
    name: "Monitoring and Visibility",
    description: "Availability monitoring and operational visibility.",
    icon: "activity",
    displayOrder: 3,
  },
  {
    slug: "technology-governance",
    name: "Technology Governance",
    description: "Assessment, planning, reporting, and improvement tracking.",
    icon: "compass",
    displayOrder: 4,
  },
  {
    slug: "identity-access",
    name: "Identity and Access",
    description: "Identity, authentication, and access control technologies.",
    icon: "key",
    displayOrder: 5,
  },
  {
    slug: "backup-recovery",
    name: "Backup and Recovery",
    description: "Backup, disaster recovery, and business continuity.",
    icon: "archive",
    displayOrder: 6,
  },
  {
    slug: "security",
    name: "Security",
    description: "Security platforms and risk reduction technologies.",
    icon: "shield",
    displayOrder: 7,
  },
  {
    slug: "cloud-collaboration",
    name: "Cloud and Collaboration",
    description: "Cloud services and productivity platforms.",
    icon: "cloud",
    displayOrder: 8,
  },
];

type PillarMappingSeed = {
  pillarCode: string;
  relationshipType: TechnologyPillarRelationshipType;
  explanation?: string;
};

type CapabilitySeed = {
  name: string;
  description?: string;
  capabilityType?: string;
};

type OutcomeSeed = {
  name: string;
  description?: string;
};

type ProductSeed = {
  name: string;
  modelNumber?: string;
  productType: string;
  summary?: string;
  recommendedUseCase?: string;
  environmentSize?: string;
  isPreferred?: boolean;
  notes?: string;
};

type TechnologySeed = {
  slug: string;
  name: string;
  vendor: string;
  productFamily: string;
  categorySlug: string;
  summary: string;
  purpose: string;
  whySelected?: string;
  businessValue?: string;
  technicalOverview?: string;
  standardDeployment?: string;
  supportScope?: string;
  limitations?: string;
  licensingNotes?: string;
  securityNotes?: string;
  operationalNotes?: string;
  stackLayer?: string;
  standardStatus: TechnologyStandardStatus;
  lifecycleStatus: TechnologyLifecycleStatus;
  isFeatured: boolean;
  websiteUrl?: string;
  documentationUrl?: string;
  relatedPlaybookCount: number;
  capabilities: CapabilitySeed[];
  outcomes: OutcomeSeed[];
  products: ProductSeed[];
  pillarMappings: PillarMappingSeed[];
};

const TECHNOLOGIES: TechnologySeed[] = [
  {
    slug: "ubiquiti-unifi",
    name: "Ubiquiti UniFi",
    vendor: "Ubiquiti",
    productFamily: "UniFi",
    categorySlug: "network-infrastructure",
    summary:
      "Ubiquiti UniFi is the preferred Bobkat IT platform for centrally managed network infrastructure in small and midsize business environments.",
    purpose:
      "Provide an integrated platform for gateway security, routing, switching, wireless networking, cameras, access control, and centralized infrastructure management.",
    whySelected: [
      "Strong price-to-capability ratio",
      "Centralized management experience",
      "Broad hardware ecosystem",
      "No recurring licensing requirement for core network management",
      "Suitable for repeatable small-business deployments",
      "Supports standardized configurations and implementation playbooks",
      "Provides a consistent administrative interface across gateways, switches, access points, cameras, and access control",
    ].join("\n"),
    businessValue: [
      "Reduces infrastructure complexity",
      "Improves visibility into network condition",
      "Simplifies remote support",
      "Creates a scalable foundation for business growth",
      "Improves wireless reliability",
      "Supports segmentation between business, guest, voice, IoT, and security devices",
      "Makes network documentation and lifecycle planning easier",
    ].join("\n"),
    technicalOverview: [
      "Internet gateway and firewall",
      "Routing and VLANs",
      "Managed switching with Power over Ethernet",
      "Wireless networking",
      "Site-to-site VPN and remote-user VPN",
      "IDS/IPS capabilities",
      "Guest wireless",
      "Network topology and device health visibility",
      "Camera management through UniFi Protect",
      "Door access through UniFi Access",
    ].join("\n"),
    standardDeployment: [
      "Documented WAN configuration",
      "Documented network and VLAN plan",
      "Separate business and guest wireless networks",
      "Segmentation for cameras, IoT, voice, and management where applicable",
      "Secure administrator access with MFA where supported",
      "Configuration backup",
      "Device naming standard",
      "Firmware management process",
      "Network diagram",
      "UPS protection for critical network equipment",
      "Uptime Kuma monitoring for gateways, switches, access points, and critical services",
    ].join("\n"),
    stackLayer: "Network and Physical Infrastructure",
    standardStatus: "preferred",
    lifecycleStatus: "current",
    isFeatured: true,
    websiteUrl: "https://www.ui.com",
    relatedPlaybookCount: 6,
    capabilities: [
      { name: "Internet Gateway and Firewall", capabilityType: "network" },
      { name: "Routing and VLANs", capabilityType: "network" },
      { name: "Managed Switching", capabilityType: "network" },
      { name: "Wireless Networking", capabilityType: "network" },
      { name: "Site-to-Site VPN", capabilityType: "network" },
      { name: "Remote-User VPN", capabilityType: "network" },
      { name: "IDS/IPS", capabilityType: "security" },
      { name: "Guest Wireless", capabilityType: "network" },
      { name: "Network Topology", capabilityType: "visibility" },
      { name: "Device Health and Client Visibility", capabilityType: "visibility" },
      { name: "UniFi Protect", capabilityType: "physical_security", description: "Camera management" },
      { name: "UniFi Access", capabilityType: "physical_security", description: "Door access control" },
    ],
    outcomes: [
      { name: "Reduced infrastructure complexity" },
      { name: "Improved network visibility" },
      { name: "Scalable foundation for growth" },
      { name: "Improved wireless reliability" },
      { name: "Easier network documentation and lifecycle planning" },
    ],
    products: [
      {
        name: "Cloud Gateway Ultra",
        modelNumber: "UCG-Ultra",
        productType: "hardware",
        recommendedUseCase: "Very small office with modest performance requirements",
        environmentSize: "small",
        isPreferred: true,
      },
      {
        name: "Cloud Gateway Max",
        modelNumber: "UCG-Max",
        productType: "hardware",
        recommendedUseCase: "Small office requiring greater performance and application support",
        environmentSize: "small",
        isPreferred: true,
      },
      {
        name: "Dream Machine Pro",
        modelNumber: "UDM-Pro",
        productType: "hardware",
        recommendedUseCase: "Standard rack-mounted small-business deployment",
        environmentSize: "small",
        isPreferred: true,
      },
      {
        name: "Dream Machine Pro Max",
        modelNumber: "UDM-Pro-Max",
        productType: "hardware",
        recommendedUseCase: "Larger or more demanding small-business deployment",
        environmentSize: "medium",
        isPreferred: true,
      },
      {
        name: "Standard PoE Switching",
        productType: "hardware",
        recommendedUseCase: "Cost-conscious access switching",
        environmentSize: "small",
      },
      {
        name: "Pro Max PoE Switching",
        productType: "hardware",
        recommendedUseCase: "Standard managed deployment requiring PoE and stronger feature depth",
        environmentSize: "small",
        isPreferred: true,
      },
      {
        name: "Enterprise Switching",
        productType: "hardware",
        recommendedUseCase: "Higher-density, higher-throughput, or specialized environments",
        environmentSize: "medium",
      },
      {
        name: "U7 Pro",
        modelNumber: "U7-Pro",
        productType: "hardware",
        recommendedUseCase: "Standard indoor business wireless",
        environmentSize: "small",
        isPreferred: true,
      },
      {
        name: "U7 Pro Max",
        modelNumber: "U7-Pro-Max",
        productType: "hardware",
        recommendedUseCase: "Higher-density or higher-performance areas",
        environmentSize: "medium",
        isPreferred: true,
      },
      {
        name: "U7 Outdoor",
        modelNumber: "U7-Outdoor",
        productType: "hardware",
        recommendedUseCase: "Exterior or semi-exterior wireless coverage",
        environmentSize: "small",
        isPreferred: true,
      },
      {
        name: "UniFi Protect Cameras",
        productType: "hardware",
        recommendedUseCase: "Physical security camera deployments",
        environmentSize: "small",
      },
      {
        name: "CloudKey or Supported UniFi Console",
        productType: "hardware",
        recommendedUseCase: "Local management console where required",
        environmentSize: "small",
      },
      {
        name: "UNVR",
        productType: "hardware",
        recommendedUseCase: "Larger camera deployments",
        environmentSize: "medium",
        isPreferred: true,
      },
      {
        name: "UniFi Access",
        productType: "hardware",
        recommendedUseCase: "Supported door access use cases",
        environmentSize: "small",
      },
    ],
    pillarMappings: [
      { pillarCode: "network_connectivity", relationshipType: "primary" },
      { pillarCode: "security_operations", relationshipType: "primary" },
      { pillarCode: "identity_access", relationshipType: "supporting" },
      { pillarCode: "data_protection_recovery", relationshipType: "supporting" },
      { pillarCode: "productivity_collaboration", relationshipType: "supporting" },
    ],
  },
  {
    slug: "ninjaone",
    name: "NinjaOne",
    vendor: "NinjaOne",
    productFamily: "NinjaOne",
    categorySlug: "endpoint-management",
    summary:
      "NinjaOne is the preferred Bobkat IT platform for remote monitoring, endpoint administration, patching, automation, backup, remote support, and operational visibility.",
    purpose: "Provide a consistent operational platform for managing supported workstations, laptops, and servers.",
    whySelected: [
      "Centralized endpoint visibility",
      "Strong remote administration tools",
      "Practical automation capabilities",
      "Integrated patch management",
      "Device inventory and health monitoring",
      "Backup options for endpoints, servers, and Microsoft 365",
      "Suitable for repeatable managed service delivery",
      "Reduces the need for multiple disconnected support tools",
    ].join("\n"),
    businessValue: [
      "Reduces support response time",
      "Improves patch compliance",
      "Detects endpoint problems earlier",
      "Supports proactive maintenance",
      "Improves remote workforce support",
      "Strengthens backup visibility",
      "Creates consistent endpoint reporting",
      "Reduces manual administrative effort",
    ].join("\n"),
    standardDeployment: [
      "NinjaOne agent on every managed endpoint",
      "Assigned organization and location",
      "Correct device role",
      "Standard naming and metadata",
      "Patch policy",
      "Monitoring policy",
      "Approved automation policy",
      "Remote access configuration",
      "Backup policy where included",
      "Alert-routing configuration",
      "Documented exception handling",
    ].join("\n"),
    stackLayer: "Endpoint Operations and Service Delivery",
    standardStatus: "preferred",
    lifecycleStatus: "current",
    isFeatured: true,
    websiteUrl: "https://www.ninjaone.com",
    relatedPlaybookCount: 9,
    capabilities: [
      {
        name: "Remote Monitoring and Management",
        capabilityType: "core",
        description:
          "Device online/offline status, CPU, memory, disk, and service health; Windows event monitoring; hardware and software inventory; alerting and ticket generation.",
      },
      {
        name: "Patch Management",
        capabilityType: "core",
        description:
          "Windows operating system updates, third-party application patching, approval policies, maintenance windows, and compliance reporting.",
      },
      {
        name: "Remote Access",
        capabilityType: "core",
        description:
          "Interactive remote access, background command prompt, PowerShell, service management, registry access, file browser, event viewer, and process management.",
      },
      {
        name: "Automation",
        capabilityType: "automation",
        description:
          "Device health checks, disk cleanup, temporary-file cleanup, DNS and DHCP validation, approved service restarts, and basic diagnostic collection.",
      },
      {
        name: "Vulnerability Management",
        capabilityType: "security",
        description:
          "Missing patch identification, vulnerability scanning, software inventory, unsupported software visibility, and endpoint configuration checks.",
      },
    ],
    outcomes: [
      { name: "Reduced support response time" },
      { name: "Improved patch compliance" },
      { name: "Earlier endpoint problem detection" },
      { name: "Proactive maintenance support" },
      { name: "Reduced manual administrative effort" },
    ],
    products: [],
    pillarMappings: [
      { pillarCode: "endpoint_management", relationshipType: "primary" },
      { pillarCode: "security_operations", relationshipType: "primary" },
      { pillarCode: "data_protection_recovery", relationshipType: "primary" },
      { pillarCode: "identity_access", relationshipType: "supporting" },
      { pillarCode: "documentation_knowledge", relationshipType: "supporting" },
    ],
  },
  {
    slug: "stackscore",
    name: "StackScore",
    vendor: "Bobkat IT",
    productFamily: "StackScore",
    categorySlug: "technology-governance",
    summary:
      "StackScore is the strategic technology management platform used to assess environments, document maturity, identify risks, create recommendations, prioritize improvements, generate roadmaps, and communicate technology condition to business leadership.",
    purpose: "Translate technical findings into a measurable, prioritized technology improvement program.",
    whySelected:
      "StackScore is purpose-built around the Bobkat IT consulting and managed service model. It connects assessments, recommendations, projects, roadmaps, reporting, and approved technologies in one platform.",
    businessValue: [
      "Provides leadership with a clear picture of technology condition",
      "Prioritizes the most important improvements",
      "Connects technical gaps to business risk",
      "Creates realistic implementation roadmaps",
      "Tracks improvement over time",
      "Supports repeatable consulting engagements",
      "Makes recommendations more transparent",
      "Improves accountability for technology projects",
    ].join("\n"),
    standardDeployment: [
      "Organization record with primary contacts",
      "Assessment history",
      "Current maturity score and category scores",
      "Active recommendations",
      "Approved roadmap and related projects",
      "Technology Catalog mappings",
      "Review cadence",
      "Executive reporting access where included",
    ].join("\n"),
    stackLayer: "Strategy and Improvement",
    standardStatus: "preferred",
    lifecycleStatus: "current",
    isFeatured: true,
    relatedPlaybookCount: 7,
    capabilities: [
      { name: "Technology Maturity Assessments", capabilityType: "core" },
      { name: "Health Scores", capabilityType: "core" },
      { name: "Recommendations", capabilityType: "core" },
      { name: "Roadmaps", capabilityType: "core" },
      { name: "Projects", capabilityType: "core" },
      { name: "Improvement Plans", capabilityType: "core" },
      { name: "Executive Reporting", capabilityType: "reporting" },
      { name: "Technology Catalog", capabilityType: "core" },
      { name: "Playbooks", capabilityType: "core" },
      { name: "Proposal Support", capabilityType: "core" },
    ],
    outcomes: [
      { name: "Clear executive visibility into technology condition" },
      { name: "Prioritized improvement program" },
      { name: "Realistic implementation roadmaps" },
      { name: "Improved accountability for technology projects" },
    ],
    products: [],
    pillarMappings: [
      { pillarCode: "security_operations", relationshipType: "primary" },
      { pillarCode: "identity_access", relationshipType: "primary" },
      { pillarCode: "endpoint_management", relationshipType: "primary" },
      { pillarCode: "data_protection_recovery", relationshipType: "primary" },
      { pillarCode: "network_connectivity", relationshipType: "primary" },
      { pillarCode: "productivity_collaboration", relationshipType: "primary" },
      { pillarCode: "documentation_knowledge", relationshipType: "primary" },
      { pillarCode: "technology_strategy", relationshipType: "primary" },
    ],
  },
  {
    slug: "uptime-kuma",
    name: "Uptime Kuma",
    vendor: "Open-source project",
    productFamily: "Uptime Kuma",
    categorySlug: "monitoring-visibility",
    summary:
      "Uptime Kuma is the preferred lightweight availability-monitoring platform for Bobkat IT small-business deployments.",
    purpose:
      "Continuously verify that critical network devices, servers, and services with stable IP addresses are reachable.",
    whySelected: [
      "Lightweight deployment",
      "No per-device licensing cost",
      "Simple interface",
      "Suitable for deployment on a small PC, server, virtual machine, or container host",
      "Provides clear uptime history",
      "Complements endpoint-focused monitoring in NinjaOne",
      "Supports repeatable monitoring templates",
    ].join("\n"),
    businessValue: [
      "Detects outages faster",
      "Reduces time between failure and response",
      "Provides visibility into recurring instability",
      "Confirms whether critical services are available",
      "Supports uptime reporting",
      "Improves confidence in network and server condition",
      "Provides a practical monitoring layer for devices that do not run an RMM agent",
    ].join("\n"),
    standardDeployment: [
      "Dedicated or approved host",
      "Docker or supported application deployment",
      "Persistent storage",
      "Secure administrator credentials",
      "Documented monitoring targets",
      "Naming standard and logical monitor groups",
      "Backup of application data",
      "Monthly review of monitor health and stale targets",
    ].join("\n"),
    operationalNotes:
      "NinjaOne monitors managed endpoints from the operating system and agent perspective. Uptime Kuma monitors infrastructure from the network availability perspective. The two platforms are complementary.",
    stackLayer: "Infrastructure and Service Availability",
    standardStatus: "preferred",
    lifecycleStatus: "current",
    isFeatured: true,
    websiteUrl: "https://github.com/louislam/uptime-kuma",
    relatedPlaybookCount: 6,
    capabilities: [
      {
        name: "Ping Monitoring",
        capabilityType: "monitoring",
        description:
          "Standard use cases: gateways, switches, wireless access points, servers, NAS devices, and other critical devices with stable IP addresses.",
      },
    ],
    outcomes: [
      { name: "Faster outage detection" },
      { name: "Reduced time between failure and response" },
      { name: "Visibility into recurring instability" },
      { name: "Practical monitoring for non-agent devices" },
    ],
    products: [],
    pillarMappings: [
      { pillarCode: "security_operations", relationshipType: "primary" },
      { pillarCode: "network_connectivity", relationshipType: "primary" },
      { pillarCode: "data_protection_recovery", relationshipType: "supporting" },
      { pillarCode: "productivity_collaboration", relationshipType: "supporting" },
    ],
  },
];

async function upsertCategory(prisma: PrismaClient, category: CategorySeed) {
  return prisma.technologyCategory.upsert({
    where: { slug: category.slug },
    update: {
      name: category.name,
      description: category.description,
      icon: category.icon,
      displayOrder: category.displayOrder,
      isActive: true,
    },
    create: category,
  });
}

async function syncCapabilities(
  prisma: PrismaClient,
  technologyId: string,
  capabilities: CapabilitySeed[],
) {
  await prisma.technologyCapability.deleteMany({ where: { technologyId } });
  if (capabilities.length === 0) return;

  await prisma.technologyCapability.createMany({
    data: capabilities.map((capability, index) => ({
      technologyId,
      name: capability.name,
      description: capability.description ?? null,
      capabilityType: capability.capabilityType ?? null,
      displayOrder: index + 1,
    })),
  });
}

async function syncOutcomes(
  prisma: PrismaClient,
  technologyId: string,
  outcomes: OutcomeSeed[],
) {
  await prisma.technologyBusinessOutcome.deleteMany({ where: { technologyId } });
  if (outcomes.length === 0) return;

  await prisma.technologyBusinessOutcome.createMany({
    data: outcomes.map((outcome, index) => ({
      technologyId,
      name: outcome.name,
      description: outcome.description ?? null,
      displayOrder: index + 1,
    })),
  });
}

async function syncProducts(prisma: PrismaClient, technologyId: string, products: ProductSeed[]) {
  const existing = await prisma.technologyProduct.findMany({ where: { technologyId } });
  const seedNames = new Set(products.map((product) => product.name));

  for (const [index, product] of products.entries()) {
    const data = {
      name: product.name,
      modelNumber: product.modelNumber ?? null,
      productType: product.productType,
      summary: product.summary ?? null,
      recommendedUseCase: product.recommendedUseCase ?? null,
      environmentSize: product.environmentSize ?? null,
      lifecycleStatus: "current" as TechnologyLifecycleStatus,
      isPreferred: product.isPreferred ?? false,
      notes: product.notes ?? null,
      displayOrder: index + 1,
      isActive: true,
    };

    const match = existing.find((record) => record.name === product.name);
    if (match) {
      await prisma.technologyProduct.update({ where: { id: match.id }, data });
    } else {
      await prisma.technologyProduct.create({ data: { technologyId, ...data } });
    }
  }

  for (const product of existing) {
    if (seedNames.has(product.name)) continue;
    const referenceCount = await prisma.clientTechnology.count({
      where: { technologyProductId: product.id },
    });
    if (referenceCount === 0) {
      await prisma.technologyProduct.delete({ where: { id: product.id } });
    }
  }
}

async function syncPillarMappings(
  prisma: PrismaClient,
  technologyId: string,
  mappings: PillarMappingSeed[],
) {
  await prisma.technologyPillarMapping.deleteMany({ where: { technologyId } });
  if (mappings.length === 0) return;

  await prisma.technologyPillarMapping.createMany({
    data: mappings.map((mapping) => ({
      technologyId,
      pillarCode: mapping.pillarCode,
      relationshipType: mapping.relationshipType,
      explanation: mapping.explanation ?? null,
    })),
  });
}

async function upsertTechnology(
  prisma: PrismaClient,
  seed: TechnologySeed,
  categoryId: string,
) {
  const technology = await prisma.technology.upsert({
    where: { slug: seed.slug },
    update: {
      name: seed.name,
      vendor: seed.vendor,
      productFamily: seed.productFamily,
      categoryId,
      summary: seed.summary,
      purpose: seed.purpose,
      whySelected: seed.whySelected ?? null,
      businessValue: seed.businessValue ?? null,
      technicalOverview: seed.technicalOverview ?? null,
      standardDeployment: seed.standardDeployment ?? null,
      supportScope: seed.supportScope ?? null,
      limitations: seed.limitations ?? null,
      licensingNotes: seed.licensingNotes ?? null,
      securityNotes: seed.securityNotes ?? null,
      operationalNotes: seed.operationalNotes ?? null,
      stackLayer: seed.stackLayer ?? null,
      standardStatus: seed.standardStatus,
      lifecycleStatus: seed.lifecycleStatus,
      isFeatured: seed.isFeatured,
      isActive: true,
      websiteUrl: seed.websiteUrl ?? null,
      documentationUrl: seed.documentationUrl ?? null,
      relatedPlaybookCount: seed.relatedPlaybookCount,
      lastReviewedAt: LAST_REVIEWED,
      nextReviewAt: NEXT_REVIEW,
    },
    create: {
      slug: seed.slug,
      name: seed.name,
      vendor: seed.vendor,
      productFamily: seed.productFamily,
      categoryId,
      summary: seed.summary,
      purpose: seed.purpose,
      whySelected: seed.whySelected ?? null,
      businessValue: seed.businessValue ?? null,
      technicalOverview: seed.technicalOverview ?? null,
      standardDeployment: seed.standardDeployment ?? null,
      supportScope: seed.supportScope ?? null,
      limitations: seed.limitations ?? null,
      licensingNotes: seed.licensingNotes ?? null,
      securityNotes: seed.securityNotes ?? null,
      operationalNotes: seed.operationalNotes ?? null,
      stackLayer: seed.stackLayer ?? null,
      standardStatus: seed.standardStatus,
      lifecycleStatus: seed.lifecycleStatus,
      isFeatured: seed.isFeatured,
      isActive: true,
      websiteUrl: seed.websiteUrl ?? null,
      documentationUrl: seed.documentationUrl ?? null,
      relatedPlaybookCount: seed.relatedPlaybookCount,
      lastReviewedAt: LAST_REVIEWED,
      nextReviewAt: NEXT_REVIEW,
    },
  });

  await Promise.all([
    syncCapabilities(prisma, technology.id, seed.capabilities),
    syncOutcomes(prisma, technology.id, seed.outcomes),
    syncProducts(prisma, technology.id, seed.products),
    syncPillarMappings(prisma, technology.id, seed.pillarMappings),
  ]);

  return technology;
}

export async function seedTechnologyCatalog(prisma: PrismaClient) {
  console.log("Seeding Technology Catalog...");

  const categoryIdBySlug = new Map<string, string>();
  for (const category of CATEGORIES) {
    const record = await upsertCategory(prisma, category);
    categoryIdBySlug.set(category.slug, record.id);
  }

  for (const technology of TECHNOLOGIES) {
    const categoryId = categoryIdBySlug.get(technology.categorySlug);
    if (!categoryId) {
      console.warn(`Skipping ${technology.slug}: category ${technology.categorySlug} not found`);
      continue;
    }
    await upsertTechnology(prisma, technology, categoryId);
    console.log(`  ✓ ${technology.name}`);
  }

  console.log("Technology Catalog seed complete.");
}
