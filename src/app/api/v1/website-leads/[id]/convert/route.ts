import {
  badRequest,
  getSessionUser,
  notFound,
  requireAdmin,
  unauthorized,
} from "@/lib/api/helpers";
import {
  convertWebsiteLead,
  convertWebsiteLeadSchema,
  getWebsiteLeadById,
} from "@/lib/website-leads";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
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

  const parsed = convertWebsiteLeadSchema.safeParse(body);
  if (!parsed.success) {
    return badRequest(parsed.error.issues[0]?.message ?? "Invalid conversion request");
  }

  const result = await convertWebsiteLead(id, parsed.data, {
    id: user.id,
    name: user.name,
    email: user.email,
  });

  if (result.ok === false) {
    if (result.code === "NOT_FOUND") return notFound("Lead not found");
    if (result.code === "CLIENT_NOT_FOUND") return badRequest("Client not found");
    if (result.code === "ASSESSMENT_NOT_FOUND") {
      return badRequest("Assessment not found for this client");
    }
    if (result.code === "ALREADY_CONVERTED") {
      return badRequest("Lead is already converted");
    }
    return badRequest("Unable to convert lead");
  }

  return Response.json({ data: result.lead });
}

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const forbidden = requireAdmin(user);
  if (forbidden) return forbidden;

  const { id } = await context.params;
  const lead = await getWebsiteLeadById(id);
  if (!lead) return notFound("Lead not found");

  return Response.json({
    data: {
      lead,
      suggestedConversion: {
        companyName: lead.company ?? lead.name,
        primaryContactName: lead.name,
        primaryContactEmail: lead.email,
        primaryContactPhone: lead.phone,
      },
    },
  });
}
