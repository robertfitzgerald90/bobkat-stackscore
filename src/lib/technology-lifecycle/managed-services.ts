import type { LifecycleManagedServiceLink } from "./types";

export const BOBKAT_MANAGED_SERVICE_CATALOG: Array<{
  serviceKey: string;
  serviceName: string;
  description: string;
  objectiveKeywords: string[];
}> = [
  {
    serviceKey: "managed_it",
    serviceName: "Managed IT Services",
    description: "Day-to-day operations, monitoring, and support for the technology environment.",
    objectiveKeywords: ["endpoint", "support", "operations", "monitoring", "help desk"],
  },
  {
    serviceKey: "strategic_consulting",
    serviceName: "Strategic IT Consulting",
    description: "Ongoing technology planning aligned to business priorities.",
    objectiveKeywords: ["strategy", "roadmap", "planning", "governance"],
  },
  {
    serviceKey: "digital_presence",
    serviceName: "Digital Presence",
    description: "Website, collaboration, and customer-facing technology presence.",
    objectiveKeywords: ["website", "collaboration", "microsoft 365", "email"],
  },
  {
    serviceKey: "technology_assessments",
    serviceName: "Technology Assessments",
    description: "Structured maturity assessments and reassessment cadence.",
    objectiveKeywords: ["assessment", "maturity", "score", "baseline"],
  },
  {
    serviceKey: "virtual_cio",
    serviceName: "Virtual CIO",
    description: "Executive technology leadership and lifecycle stewardship.",
    objectiveKeywords: ["vcio", "executive", "leadership", "board"],
  },
  {
    serviceKey: "quarterly_reviews",
    serviceName: "Quarterly Reviews",
    description: "Structured QBR cadence measuring progress and next priorities.",
    objectiveKeywords: ["qbr", "review", "quarterly", "progress"],
  },
  {
    serviceKey: "business_continuity",
    serviceName: "Business Continuity Planning",
    description: "Backup, recovery, and continuity readiness programs.",
    objectiveKeywords: ["backup", "recovery", "continuity", "disaster", "bcdr"],
  },
];

export function linkManagedServicesToObjectives(
  objectives: string[],
  activeServiceKeys: Set<string>,
): LifecycleManagedServiceLink[] {
  const normalizedObjectives = objectives.map((item) => item.toLowerCase());

  return BOBKAT_MANAGED_SERVICE_CATALOG.map((service) => {
    const supportsObjectives = normalizedObjectives.filter((objective) =>
      service.objectiveKeywords.some((keyword) => objective.includes(keyword)),
    );

    return {
      serviceKey: service.serviceKey,
      serviceName: service.serviceName,
      description: service.description,
      supportsObjectives:
        supportsObjectives.length > 0
          ? objectives.filter((objective) =>
              service.objectiveKeywords.some((keyword) =>
                objective.toLowerCase().includes(keyword),
              ),
            )
          : [],
      active: activeServiceKeys.has(service.serviceKey),
    };
  });
}

export function inferServiceKeyFromName(serviceName: string): string | null {
  const value = serviceName.toLowerCase();
  for (const service of BOBKAT_MANAGED_SERVICE_CATALOG) {
    if (value.includes(service.serviceName.toLowerCase()) || value.includes(service.serviceKey)) {
      return service.serviceKey;
    }
    if (service.objectiveKeywords.some((keyword) => value.includes(keyword))) {
      return service.serviceKey;
    }
  }
  return null;
}
