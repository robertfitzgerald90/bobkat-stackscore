import {
  badRequest,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  deleteWebsiteLead,
  getWebsiteLeadById,
  recordWebsiteLeadViewed,
  updateWebsiteLead,
  updateWebsiteLeadSchema,
} from "@/lib/website-leads";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;
  const lead = await getWebsiteLeadById(id);
  if (!lead) return notFound("Lead not found");

  await recordWebsiteLeadViewed(id, {
    id: user.id,
    name: user.name,
    email: user.email,
  });

  return Response.json({ data: lead });
}

export async function PATCH(request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Invalid JSON body");
  }

  const parsed = updateWebsiteLeadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid update");
  }

  const updated = await updateWebsiteLead(id, parsed.data, {
    id: user.id,
    name: user.name,
    email: user.email,
  });

  if (!updated) return notFound("Lead not found");

  return Response.json({ data: updated });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;
  const result = await deleteWebsiteLead(id, {
    id: user.id,
    name: user.name,
    email: user.email,
  });

  if (!result.ok) return notFound("Lead not found");

  return Response.json({ deletedLeadId: result.deletedLeadId });
}
