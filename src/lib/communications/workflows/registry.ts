export const COMMUNICATION_WORKFLOWS = {
  assessment_complete: {
    templateKey: "EMAIL-002",
    audience: "assessments" as const,
    reviewRequired: true,
    autoSend: false,
  },
  roadmap_published: {
    templateKey: "EMAIL-003",
    audience: "roadmaps" as const,
    reviewRequired: true,
    autoSend: false,
  },
  proposal_published: {
    templateKey: "EMAIL-004",
    audience: "proposals" as const,
    reviewRequired: true,
    autoSend: false,
  },
  project_batch_created: {
    templateKey: "EMAIL-007",
    audience: "projects" as const,
    reviewRequired: true,
    autoSend: false,
  },
  project_completed: {
    templateKey: "EMAIL-008",
    audience: "projects" as const,
    reviewRequired: false,
    autoSend: true,
  },
  quarterly_review: {
    templateKey: "EMAIL-006",
    audience: "quarterly_reviews" as const,
    reviewRequired: true,
    autoSend: false,
  },
  password_reset: {
    templateKey: "EMAIL-005",
    audience: "assessments" as const,
    reviewRequired: false,
    autoSend: true,
  },
  assessment_invitation: {
    templateKey: "EMAIL-009",
    audience: "assessments" as const,
    reviewRequired: false,
    autoSend: true,
  },
} as const;

export type CommunicationWorkflowKey = keyof typeof COMMUNICATION_WORKFLOWS;

export function getWorkflowDefinition(workflowKey: CommunicationWorkflowKey) {
  return COMMUNICATION_WORKFLOWS[workflowKey];
}
