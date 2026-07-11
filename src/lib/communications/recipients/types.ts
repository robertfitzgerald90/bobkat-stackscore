export const RECIPIENT_SELECTION_TYPES = [
  "primary_contact",
  "assessment_owner",
  "organization_users",
  "executive_contacts",
  "additional_emails",
  "consultant",
  "contact_ids",
] as const;

export type RecipientSelectionType = (typeof RECIPIENT_SELECTION_TYPES)[number];

export type RecipientSelection = {
  primaryContact?: boolean;
  assessmentOwner?: boolean;
  organizationUsers?: boolean;
  executiveContacts?: boolean;
  consultant?: boolean;
  additionalEmails?: string[];
  contactIds?: string[];
};

export type ResolvedRecipient = {
  email: string;
  name?: string;
  userId?: string | null;
  contactId?: string | null;
  source: RecipientSelectionType | "contact_ids";
};
