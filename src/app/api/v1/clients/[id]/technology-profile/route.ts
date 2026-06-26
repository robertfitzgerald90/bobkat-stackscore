import { NextResponse } from "next/server";
import { getSessionUser, notFound, unauthorized } from "@/lib/api/helpers";
import { getTechnologyProfileDetail } from "@/lib/technology-profile";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const user = await getSessionUser();
  if (!user) return unauthorized();

  const { id: clientId } = await context.params;
  const detail = await getTechnologyProfileDetail(clientId, user.role);
  if (!detail) return notFound("Client not found");

  return NextResponse.json(detail);
}
