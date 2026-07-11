export const CLIENT_CONTACT_ROLES = [
  "primary",
  "executive",
  "billing",
  "technical",
  "assessment_participant",
  "proposal_approver",
] as const;

export type ClientContactRole = (typeof CLIENT_CONTACT_ROLES)[number];

export const COMMUNICATION_AUDIENCES = [
  "assessments",
  "roadmaps",
  "proposals",
  "projects",
  "quarterly_reviews",
] as const;

export type CommunicationAudience = (typeof COMMUNICATION_AUDIENCES)[number];

export type ClientContactCommunicationPreferences = Partial<
  Record<CommunicationAudience, boolean>
>;

export type ClientContactRecord = {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  roles: ClientContactRole[];
  communicationPreferences: ClientContactCommunicationPreferences;
  isActive: boolean;
  userId: string | null;
};

export const CONTACT_ROLE_LABELS: Record<ClientContactRole, string> = {
  primary: "Primary Contact",
  executive: "Executive Contact",
  billing: "Billing Contact",
  technical: "Technical Contact",
  assessment_participant: "Assessment Participant",
  proposal_approver: "Proposal Approver",
};
