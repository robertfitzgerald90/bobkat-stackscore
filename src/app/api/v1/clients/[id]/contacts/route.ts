import { NextResponse } from "next/server";
import type { Prisma } from "@/generated/prisma/client";
import {
  getSessionUser,
  requireConsultantOrAdmin,
  unauthorized,
  badRequest,
} from "@/lib/api/helpers";
import { CLIENT_CONTACT_ROLES } from "@/lib/communications/contacts/types";
import { listClientContacts } from "@/lib/communications/contacts/service";
import { prisma } from "@/lib/db";
import { normalizePurchaserEmail } from "@/lib/stripe/fulfillment/helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await context.params;
  const contacts = await listClientContacts(clientId);
  return NextResponse.json({ contacts });
}

export async function POST(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();
  const denied = requireConsultantOrAdmin(user);
  if (denied) return denied;

  const { id: clientId } = await context.params;
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    phone?: string | null;
    title?: string | null;
    roles?: string[];
    communicationPreferences?: Record<string, boolean>;
  };

  if (!body.name?.trim() || !body.email?.trim()) {
    return badRequest("Name and email are required");
  }

  const roles = (body.roles ?? ["primary"]).filter((role) =>
    CLIENT_CONTACT_ROLES.includes(role as (typeof CLIENT_CONTACT_ROLES)[number]),
  );

  try {
    const contact = await prisma.clientContact.create({
      data: {
        clientId,
        name: body.name.trim(),
        email: normalizePurchaserEmail(body.email),
        phone: body.phone?.trim() || null,
        title: body.title?.trim() || null,
        rolesJson: roles as Prisma.InputJsonValue,
        communicationPreferencesJson: (body.communicationPreferences ?? {
          assessments: true,
          roadmaps: true,
          proposals: true,
          projects: true,
          quarterly_reviews: true,
        }) as Prisma.InputJsonValue,
      },
    });
    return NextResponse.json({ contact }, { status: 201 });
  } catch (error) {
    return badRequest(error instanceof Error ? error.message : "Unable to create contact");
  }
}
