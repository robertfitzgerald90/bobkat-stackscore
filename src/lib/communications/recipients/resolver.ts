import { prisma } from "@/lib/db";
import {
  contactEligibleForAudience,
  contactHasRole,
  ensurePrimaryContactFromClient,
  listClientContacts,
} from "@/lib/communications/contacts/service";
import type { CommunicationAudience } from "@/lib/communications/contacts/types";
import { getCommunicationWorkflowSettings } from "@/lib/communications/settings/workflow-settings";
import type { RecipientSelection, ResolvedRecipient } from "@/lib/communications/recipients/types";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

function dedupeRecipients(recipients: ResolvedRecipient[]): ResolvedRecipient[] {
  const seen = new Set<string>();
  const result: ResolvedRecipient[] = [];
  for (const recipient of recipients) {
    const key = normalizePurchaserEmail(recipient.email);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ ...recipient, email: key });
  }
  return result;
}

export async function resolveRecipients(input: {
  clientId: string;
  audience: CommunicationAudience;
  templateKey: string;
  selection?: RecipientSelection;
  assessmentId?: string | null;
  consultantUserId?: string | null;
}): Promise<ResolvedRecipient[]> {
  const settings = await getCommunicationWorkflowSettings();
  const defaults = settings.recipientDefaults[input.templateKey] ?? {};
  const selection: RecipientSelection = {
    primaryContact: input.selection?.primaryContact ?? defaults.primaryContact ?? true,
    assessmentOwner: input.selection?.assessmentOwner ?? defaults.assessmentOwner ?? false,
    organizationUsers: input.selection?.organizationUsers ?? defaults.organizationUsers ?? false,
    executiveContacts: input.selection?.executiveContacts ?? defaults.executiveContacts ?? false,
    consultant: input.selection?.consultant ?? defaults.consultant ?? false,
    additionalEmails: input.selection?.additionalEmails ?? defaults.additionalEmails ?? [],
    contactIds: input.selection?.contactIds ?? [],
  };

  await ensurePrimaryContactFromClient(input.clientId);
  const [client, contacts, orgUsers, assessment, consultant] = await Promise.all([
    prisma.client.findUnique({ where: { id: input.clientId } }),
    listClientContacts(input.clientId),
    selection.organizationUsers
      ? prisma.user.findMany({
          where: { clientId: input.clientId, role: "client", isActive: true },
        })
      : Promise.resolve([]),
    input.assessmentId
      ? prisma.assessment.findUnique({
          where: { id: input.assessmentId },
          include: { assessor: true },
        })
      : Promise.resolve(null),
    selection.consultant && input.consultantUserId
      ? prisma.user.findUnique({ where: { id: input.consultantUserId } })
      : Promise.resolve(null),
  ]);

  if (!client) return [];

  const recipients: ResolvedRecipient[] = [];

  if (selection.primaryContact) {
    recipients.push({
      email: normalizePurchaserEmail(client.primaryContactEmail),
      name: client.primaryContactName,
      source: "primary_contact",
    });
  }

  if (selection.assessmentOwner && assessment?.assessor) {
    recipients.push({
      email: normalizePurchaserEmail(assessment.assessor.email),
      name: assessment.assessor.name,
      userId: assessment.assessor.id,
      source: "assessment_owner",
    });
  }

  if (selection.organizationUsers) {
    for (const user of orgUsers) {
      recipients.push({
        email: normalizePurchaserEmail(user.email),
        name: user.name,
        userId: user.id,
        source: "organization_users",
      });
    }
  }

  if (selection.executiveContacts) {
    for (const contact of contacts) {
      if (
        contactHasRole(contact, "executive") &&
        contactEligibleForAudience(contact, input.audience)
      ) {
        recipients.push({
          email: normalizePurchaserEmail(contact.email),
          name: contact.name,
          userId: contact.userId,
          contactId: contact.id,
          source: "executive_contacts",
        });
      }
    }
  }

  if (selection.contactIds?.length) {
    for (const contact of contacts) {
      if (
        selection.contactIds.includes(contact.id) &&
        contactEligibleForAudience(contact, input.audience)
      ) {
        recipients.push({
          email: normalizePurchaserEmail(contact.email),
          name: contact.name,
          userId: contact.userId,
          contactId: contact.id,
          source: "contact_ids",
        });
      }
    }
  }

  for (const email of selection.additionalEmails ?? []) {
    if (!email.trim()) continue;
    recipients.push({
      email: normalizePurchaserEmail(email),
      source: "additional_emails",
    });
  }

  if (selection.consultant && consultant) {
    recipients.push({
      email: normalizePurchaserEmail(consultant.email),
      name: consultant.name,
      userId: consultant.id,
      source: "consultant",
    });
  }

  return dedupeRecipients(recipients);
}

export async function resolveProspectRecipient(input: {
  email: string;
  name?: string;
}): Promise<ResolvedRecipient[]> {
  return [
    {
      email: normalizePurchaserEmail(input.email),
      name: input.name,
      source: "primary_contact",
    },
  ];
}
