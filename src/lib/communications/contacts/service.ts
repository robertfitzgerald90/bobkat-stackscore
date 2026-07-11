import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import {
  CLIENT_CONTACT_ROLES,
  type ClientContactCommunicationPreferences,
  type ClientContactRecord,
  type ClientContactRole,
  type CommunicationAudience,
} from "@/lib/communications/contacts/types";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

function parseRoles(value: Prisma.JsonValue): ClientContactRole[] {
  if (!Array.isArray(value)) return [];
  return value.filter((role): role is ClientContactRole =>
    CLIENT_CONTACT_ROLES.includes(role as ClientContactRole),
  );
}

function parsePreferences(value: Prisma.JsonValue): ClientContactCommunicationPreferences {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as ClientContactCommunicationPreferences;
}

function mapContact(record: {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string | null;
  title: string | null;
  rolesJson: Prisma.JsonValue;
  communicationPreferencesJson: Prisma.JsonValue;
  isActive: boolean;
  userId: string | null;
}): ClientContactRecord {
  return {
    id: record.id,
    clientId: record.clientId,
    name: record.name,
    email: record.email,
    phone: record.phone,
    title: record.title,
    roles: parseRoles(record.rolesJson),
    communicationPreferences: parsePreferences(record.communicationPreferencesJson),
    isActive: record.isActive,
    userId: record.userId,
  };
}

export async function listClientContacts(clientId: string): Promise<ClientContactRecord[]> {
  const records = await prisma.clientContact.findMany({
    where: { clientId, isActive: true },
    orderBy: [{ name: "asc" }],
  });
  return records.map(mapContact);
}

export async function ensurePrimaryContactFromClient(clientId: string): Promise<void> {
  const client = await prisma.client.findUnique({ where: { id: clientId } });
  if (!client) return;

  await prisma.clientContact.upsert({
    where: {
      clientId_email: {
        clientId,
        email: normalizePurchaserEmail(client.primaryContactEmail),
      },
    },
    create: {
      clientId,
      name: client.primaryContactName,
      email: normalizePurchaserEmail(client.primaryContactEmail),
      phone: client.primaryContactPhone,
      title: client.primaryContactTitle,
      rolesJson: ["primary"],
      communicationPreferencesJson: {
        assessments: true,
        roadmaps: true,
        proposals: true,
        projects: true,
        quarterly_reviews: true,
      },
    },
    update: {
      name: client.primaryContactName,
      phone: client.primaryContactPhone,
      title: client.primaryContactTitle,
    },
  });
}

export function contactEligibleForAudience(
  contact: ClientContactRecord,
  audience: CommunicationAudience,
): boolean {
  if (!contact.isActive) return false;
  const pref = contact.communicationPreferences[audience];
  return pref !== false;
}

export function contactHasRole(contact: ClientContactRecord, role: ClientContactRole): boolean {
  return contact.roles.includes(role);
}
